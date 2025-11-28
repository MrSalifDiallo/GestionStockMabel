import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportColumn, exportToExcel, exportToPDF } from "@/lib/utils.export";
import { formatCurrency } from "@/lib/utils.format";
import { createClient, fetchClients } from "@/services/services.clients";
import { fetchProducts } from "@/services/services.products";
import { addPaymentToSale, createSale, deleteSale, fetchSales, Sale } from "@/services/services.sales";
import { fetchDiscountSettings } from "@/services/services.settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, FileText, Plus, Printer, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const Sales = () => {
  const queryClient = useQueryClient();
  
  // Fonction pour charger les données du formulaire depuis localStorage
  const loadDraftSale = () => {
    try {
      const draft = localStorage.getItem('draft_sale');
      if (draft) {
        return JSON.parse(draft);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du brouillon:', error);
    }
    return null;
  };

  const initialDraft = loadDraftSale();
  
  const [saleLines, setSaleLines] = useState(initialDraft?.saleLines || [
    { id: 1, product_id: 0, quantity: 0, price: 0, discount: 0 },
  ]);
  const [selectedClient, setSelectedClient] = useState(initialDraft?.selectedClient || "");
  const [clientName, setClientName] = useState(initialDraft?.clientName || "");
  const [amountPaid, setAmountPaid] = useState(initialDraft?.amountPaid || "");
  const [notes, setNotes] = useState(initialDraft?.notes || "");
  const [hasDraft, setHasDraft] = useState(!!initialDraft);
  const [applyAutoDiscount, setApplyAutoDiscount] = useState(initialDraft?.applyAutoDiscount ?? true);
  const [manualDiscountPercent, setManualDiscountPercent] = useState(initialDraft?.manualDiscountPercent || 0);
  const [isManualDiscountSet, setIsManualDiscountSet] = useState(initialDraft?.manualDiscountPercent > 0);
  const [deleteDraftDialogOpen, setDeleteDraftDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<number | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [saleForPayment, setSaleForPayment] = useState<Sale | null>(null);
  const [additionalPayment, setAdditionalPayment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<"PDF" | "Excel">("PDF");
  const [exportComplete, setExportComplete] = useState(false);
  const [exportCancelled, setExportCancelled] = useState(false);

  // Récupérer les clients et produits
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
  });
  
  // Extraire les clients du tableau ou de la pagination
  const clients = useMemo(() => {
    if (!clientsData) return [];
    if (Array.isArray(clientsData)) return clientsData;
    if (clientsData && typeof clientsData === 'object' && 'data' in clientsData && Array.isArray(clientsData.data)) {
      return clientsData.data;
    }
    return [];
  }, [clientsData]) as any[];

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });

  // Récupérer les paramètres de remise automatique
  const { data: discountSettings } = useQuery({
    queryKey: ['discountSettings'],
    queryFn: fetchDiscountSettings,
  });

  // Vérifier si la remise est toujours active et réinitialiser si nécessaire
  useEffect(() => {
    if (discountSettings) {
      // Si la remise automatique n'est pas activée côté backend
      if (!discountSettings.auto_discount_enabled) {
        // Désactiver le switch et réinitialiser la remise manuelle
        setApplyAutoDiscount(false);
        setManualDiscountPercent(0);
        setIsManualDiscountSet(false);
      }
    }
  }, [discountSettings]);

  // Nettoyer le brouillon lors de la déconnexion ou fermeture
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Vérifier si l'utilisateur se déconnecte (pas de token)
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('draft_sale');
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Si le token est supprimé (déconnexion), effacer le brouillon
      if (e.key === 'token' && e.newValue === null) {
        localStorage.removeItem('draft_sale');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sauvegarder automatiquement le brouillon dans localStorage avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Ne sauvegarder que si au moins un champ est rempli
      const hasData = saleLines.some(line => line.product_id > 0 || line.quantity > 0) || 
                      selectedClient || 
                      clientName || 
                      amountPaid || 
                      notes;
      
      if (hasData) {
        const draft = {
          saleLines,
          selectedClient,
          clientName,
          amountPaid,
          notes,
          applyAutoDiscount,
          manualDiscountPercent,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('draft_sale', JSON.stringify(draft));
        setHasDraft(true);
      } else {
        // Si plus de données, effacer le brouillon
        localStorage.removeItem('draft_sale');
        setHasDraft(false);
      }
    }, 500); // Attendre 500ms avant de sauvegarder

    return () => clearTimeout(timeoutId);
  }, [saleLines, selectedClient, clientName, amountPaid, notes, applyAutoDiscount, manualDiscountPercent]);

  // Récupérer les ventes avec filtres
  const { data: salesResponse, isLoading } = useQuery({
    queryKey: ['sales', statusFilter, dateFrom, dateTo],
    queryFn: () => fetchSales({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }),
  });

  const allSales = salesResponse?.data || [];

  // Filtrer les ventes localement (recherche, statut)
  const filteredSales = useMemo(() => {
    let filtered = [...allSales];

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((sale) => {
        return (
          sale.invoice_number.toLowerCase().includes(searchLower) ||
          (sale.client?.name || sale.client_name || "").toLowerCase().includes(searchLower)
        );
      });
    }

    // Filtre par statut (déjà fait côté API, mais on peut aussi filtrer localement)
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.payment_status === statusFilter);
    }

    return filtered;
  }, [allSales, searchTerm, statusFilter]);

  // Paginer les ventes filtrées
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredSales.slice(start, end);
  }, [filteredSales, currentPage, perPage]);

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredSales.length / perPage);

  // Mutation pour créer une vente
  const createMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Refresh products to update stock
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Refresh dashboard
      toast.success("Vente enregistrée avec succès !");
      // Effacer le brouillon sauvegardé
      localStorage.removeItem('draft_sale');
      setHasDraft(false);
      setSaleLines([{ id: 1, product_id: 0, quantity: 0, price: 0, discount: 0 }]);
      setSelectedClient("");
      setClientName("");
      setAmountPaid("");
      setNotes("");
      setApplyAutoDiscount(true);
      setManualDiscountPercent(0);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de l'enregistrement");
    },
  });

  // Mutation pour créer un client
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client créé avec succès !");
      setSelectedClient(newClient.id.toString());
      setIsClientDialogOpen(false);
      setClientFormData({ name: "", phone: "", email: "", address: "" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la création du client");
    },
  });

  // Mutation pour supprimer une vente
  const deleteSaleMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success("Vente supprimée avec succès !");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  // Mutation pour ajouter un paiement
  const addPaymentMutation = useMutation({
    mutationFn: ({ saleId, amount }: { saleId: number; amount: number }) => 
      addPaymentToSale(saleId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success("Paiement ajouté avec succès !");
      setPaymentDialogOpen(false);
      setSaleForPayment(null);
      setAdditionalPayment("");
    },
    onError: (error: any) => {
      console.error("Erreur ajout paiement:", error);
      const errorMessage = error?.response?.data?.message || "Erreur lors de l'ajout du paiement";
      toast.error(errorMessage);
    },
  });

  const handleCreateClient = () => {
    if (!clientFormData.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    createClientMutation.mutate(clientFormData);
  };

  const simulateProgress = (callback: () => void) => {
    setExportProgress(0);
    setExportComplete(false);
    setExportCancelled(false);
    
    let progress = 0;
    const interval = setInterval(() => {
      if (exportCancelled) {
        clearInterval(interval);
        return;
      }
      
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        setExportProgress(100);
        clearInterval(interval);
        
        setTimeout(() => {
          if (!exportCancelled) {
            callback();
            setExportComplete(true);
            setTimeout(() => {
              setExportDialogOpen(false);
              setTimeout(() => {
                setExportProgress(0);
                setExportComplete(false);
              }, 300);
            }, 1500);
          }
        }, 300);
      } else {
        setExportProgress(progress);
      }
    }, 200);
  };

  const handleCancelExport = () => {
    setExportCancelled(true);
    setExportDialogOpen(false);
    toast.info("Export annulé");
    setTimeout(() => {
      setExportProgress(0);
      setExportComplete(false);
      setExportCancelled(false);
    }, 300);
  };

  const handleDeleteSale = (id: number) => {
    setSaleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSale = () => {
    if (saleToDelete) {
      deleteSaleMutation.mutate(saleToDelete);
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  };

  const addLine = () => {
    setSaleLines([...saleLines, { id: Date.now(), product_id: 0, quantity: 0, price: 0, discount: 0 }]);
  };

  const removeLine = (id: number) => {
    setSaleLines(saleLines.filter((line) => line.id !== id));
  };

  const updateLine = (id: number, field: string, value: any) => {
    setSaleLines(
      saleLines.map((line) => {
        if (line.id === id) {
          const updated = { ...line, [field]: value };
          // Si on change le produit, mettre à jour le prix
          if (field === 'product_id' && value) {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
              updated.price = product.prix_vente || 0;
            }
          }
          return updated;
        }
        return line;
      })
    );
  };

  // Memoize all calculated values
  const { subtotal, totalItems, autoDiscount, discountAmount, total, paid, remaining, appliedDiscount } = useMemo(() => {
    const calcSubtotal = saleLines.reduce((sum, line) => {
      const lineTotal = line.quantity * line.price;
      const discountAmount = (lineTotal * line.discount) / 100;
      return sum + (lineTotal - discountAmount);
    }, 0);
    
    const calcTotalItems = saleLines.reduce((sum, line) => sum + line.quantity, 0);
    
    // Calculer la remise automatique selon les paramètres
    let calcAutoDiscount = 0;
    if (discountSettings?.auto_discount_enabled && applyAutoDiscount) {
      if (calcTotalItems >= discountSettings.discount_tier_2_qty) {
        calcAutoDiscount = discountSettings.discount_tier_2_percent;
      } else if (calcTotalItems >= discountSettings.discount_tier_1_qty) {
        calcAutoDiscount = discountSettings.discount_tier_1_percent;
      }
    }
    
    // Si une remise manuelle est définie ET le switch est activé, utiliser la remise manuelle
    // Sinon, utiliser la remise automatique si le switch est activé
    // Sinon, pas de remise
    const finalDiscount = applyAutoDiscount 
      ? (manualDiscountPercent > 0 ? manualDiscountPercent : calcAutoDiscount)
      : 0;
    
    const calcDiscountAmount = (calcSubtotal * finalDiscount) / 100;
    const calcTotal = calcSubtotal - calcDiscountAmount;
    const calcPaid = parseFloat(amountPaid) || 0;
    const calcRemaining = calcTotal - calcPaid;
    
    return {
      subtotal: calcSubtotal,
      totalItems: calcTotalItems,
      autoDiscount: calcAutoDiscount,
      appliedDiscount: finalDiscount,
      discountAmount: calcDiscountAmount,
      total: calcTotal,
      paid: calcPaid,
      remaining: calcRemaining,
    };
  }, [saleLines, amountPaid, discountSettings, applyAutoDiscount, manualDiscountPercent]);

  const handleSave = () => {
    if (!selectedClient && !clientName) {
      toast.error("Veuillez sélectionner un client ou entrer un nom");
      return;
    }
    const validLines = saleLines.filter(line => line.product_id > 0);
    if (validLines.length === 0) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }
    
    // Vérifier le stock pour chaque ligne
    for (const line of validLines) {
      const product = products.find(p => p.id === line.product_id);
      if (!product) {
        toast.error(`Produit introuvable pour la ligne ${line.id}`);
        return;
      }
      if (line.quantity > product.stock) {
        toast.error(`Stock insuffisant pour ${product.name}. Stock disponible: ${product.stock}`);
        return;
      }
      if (line.quantity <= 0) {
        toast.error(`Quantité invalide pour ${product.name}`);
        return;
      }
    }
    
    createMutation.mutate({
      client_id: selectedClient ? parseInt(selectedClient) : undefined,
      client_name: !selectedClient ? clientName : undefined,
      items: validLines.map(line => ({
        product_id: line.product_id,
        quantity: line.quantity,
        unit_price: line.price,
        discount_percent: line.discount,
      })),
      amount_paid: parseFloat(amountPaid) || 0,
      notes: notes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      paid: { variant: "default", label: "Payé" },
      partial: { variant: "secondary", label: "Partiellement" },
      pending: { variant: "destructive", label: "En attente" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Ventes</h2>
        </div>

        <Tabs defaultValue="new" className="space-y-6">
          <TabsList>
            <TabsTrigger value="new">Nouvelle Vente</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          {/* Nouvelle Vente */}
          <TabsContent value="new" className="space-y-6">
            {hasDraft && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <span className="font-medium">Sauvegarde automatique active</span> - Les modifications sont enregistrées
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDraftDialogOpen(true)}
                >
                  Effacer le brouillon
                </Button>
              </div>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Informations Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Client</Label>
                      <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Nouveau Client
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Créer un Nouveau Client</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Nom Complet *</Label>
                              <Input
                                placeholder="Ex: Fatou Sall"
                                value={clientFormData.name}
                                onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Téléphone</Label>
                                <Input
                                  placeholder="77 123 45 67"
                                  value={clientFormData.phone}
                                  onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  type="email"
                                  placeholder="email@exemple.com"
                                  value={clientFormData.email}
                                  onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Adresse</Label>
                              <Input
                                placeholder="Quartier, Ville"
                                value={clientFormData.address}
                                onChange={(e) => setClientFormData({ ...clientFormData, address: e.target.value })}
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button
                                onClick={handleCreateClient}
                                className="flex-1"
                                disabled={createClientMutation.isPending}
                              >
                                {createClientMutation.isPending ? "Création..." : "Créer"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsClientDialogOpen(false);
                                  setClientFormData({ name: "", phone: "", email: "", address: "" });
                                }}
                                className="flex-1"
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Combobox
                      options={[
                        { value: "walkin", label: "Client Ponctuel" },
                        ...clients.map((client) => ({
                          value: client.id.toString(),
                          label: client.name,
                        })),
                      ]}
                      value={selectedClient || ""}
                      onValueChange={setSelectedClient}
                      placeholder="Sélectionner un client"
                      searchPlaceholder="Rechercher un client..."
                      maxInitialDisplay={5}
                    />
                  </div>
                  {selectedClient && selectedClient !== "walkin" && (
                    <div className="flex items-end">
                      <div className="p-3 rounded-lg bg-warning/10 text-sm">
                        <span className="font-medium">Client sélectionné</span>
                      </div>
                    </div>
                  )}
                  {selectedClient === "walkin" && (
                    <div className="space-y-2">
                      <Label>Nom du client</Label>
                      <Input
                        placeholder="Nom du client ponctuel"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Articles</CardTitle>
                  <Button onClick={addLine} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter ligne
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {saleLines.map((line) => (
                    <div key={line.id} className="flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Produit</Label>
                        <Combobox
                          options={products.map((product) => ({
                            value: product.id.toString(),
                            label: `${product.name} - ${formatCurrency(product.prix_vente)} (Stock: ${product.stock})${product.stock <= 0 ? ' - Rupture' : ''}`,
                          }))}
                          value={line.product_id > 0 ? line.product_id.toString() : ""}
                          onValueChange={(value) => {
                            updateLine(line.id, "product_id", parseInt(value));
                          }}
                          placeholder="Choisir un produit"
                          searchPlaceholder="Rechercher un produit..."
                          maxInitialDisplay={5}
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Qté</Label>
                          {line.product_id > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Stock: {products.find(p => p.id === line.product_id)?.stock || 0}
                            </span>
                          )}
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={line.quantity === 0 ? "" : line.quantity}
                          placeholder="Qté"
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 0;
                            updateLine(line.id, "quantity", newQuantity);
                          }}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Prix Unit.</Label>
                        <Input
                          type="number"
                          value={line.price}
                          onChange={(e) =>
                            updateLine(line.id, "price", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>Remise %</Label>
                        <Input
                          type="text"
                          value={line.discount === 0 ? "" : line.discount}
                          placeholder="0-100"
                          onChange={(e) => {
                            const value = e.target.value;
                            // Permettre seulement les chiffres et un point ou une virgule
                            if (value === "" || value === "0") {
                              updateLine(line.id, "discount", 0);
                              return;
                            }
                            // Remplacer la virgule par un point
                            const normalizedValue = value.replace(",", ".");
                            // Vérifier que c'est un nombre valide
                            const numValue = parseFloat(normalizedValue);
                            if (!isNaN(numValue)) {
                              // Limiter entre 0 et 100
                              if (numValue < 0) {
                                updateLine(line.id, "discount", 0);
                              } else if (numValue > 100) {
                                updateLine(line.id, "discount", 100);
                                toast.error("La remise ne peut pas dépasser 100%");
                              } else {
                                updateLine(line.id, "discount", numValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // S'assurer que la valeur est valide au blur
                            const value = parseFloat(e.target.value.replace(",", "."));
                            if (isNaN(value) || value < 0) {
                              updateLine(line.id, "discount", 0);
                            } else if (value > 100) {
                              updateLine(line.id, "discount", 100);
                            }
                          }}
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Total</Label>
                        <div className="h-10 flex items-center font-semibold text-foreground">
                          {formatCurrency(
                            line.quantity * line.price -
                            (line.quantity * line.price * line.discount) / 100
                          )}
                        </div>
                      </div>
                      {saleLines.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(line.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé & Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Configuration de la remise */}
                {discountSettings?.auto_discount_enabled && (
                  <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="apply-auto-discount" className="text-base font-medium">
                          Remise automatique
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {autoDiscount > 0 
                            ? `Remise de ${autoDiscount}% (≥ ${totalItems} articles)`
                            : `Aucune remise disponible (conditions non remplies)`
                          }
                        </p>
                      </div>
                      <Switch
                        id="apply-auto-discount"
                        checked={applyAutoDiscount}
                        onCheckedChange={(checked) => {
                          setApplyAutoDiscount(checked);
                          // Ne plus effacer manualDiscountPercent pour permettre de réactiver avec la même valeur
                        }}
                        disabled={autoDiscount === 0 && manualDiscountPercent === 0}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="manual-discount">
                        Ajuster la remise (%)
                      </Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="manual-discount"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder={autoDiscount.toString()}
                          value={manualDiscountPercent || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 && value <= 100) {
                              setManualDiscountPercent(value || 0);
                            }
                          }}
                          disabled={!applyAutoDiscount}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setManualDiscountPercent(0);
                            toast.info("Remise réinitialisée");
                          }}
                          disabled={!applyAutoDiscount}
                        >
                          Réinitialiser
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Laissez vide pour utiliser la remise automatique ({autoDiscount}%)
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-muted-foreground">Sous-total:</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg text-success">
                      <span>Remise ({appliedDiscount}%):</span>
                      <span className="font-semibold">
                        {discountAmount > 0 ? `-${formatCurrency(discountAmount)}` : formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold border-t pt-3">
                      <span>Total à payer:</span>
                      <span className="text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Montant payé</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        placeholder="Notes optionnelles"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    {remaining > 0 && (
                      <div className="p-3 rounded-lg bg-warning/10">
                        <span className="font-medium">Restant dû:</span>{" "}
                        <span className="text-warning font-bold text-lg">
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    className="gap-2"
                    disabled={createMutation.isPending}
                  >
                    <Printer className="w-4 h-4" />
                    {createMutation.isPending ? "Enregistrement..." : "Enregistrer & Imprimer"}
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    variant="secondary"
                    disabled={createMutation.isPending}
                  >
                    Enregistrer
                  </Button>
                  <Button variant="outline">Annuler</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <CardTitle>Historique des Ventes</CardTitle>
                  <div className="flex gap-2 w-full md:w-auto flex-wrap">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Rechercher..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="partial">Partiel</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      placeholder="De"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-40"
                    />
                    <Input
                      type="date"
                      placeholder="À"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40"
                    />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setExportType("PDF");
                        setExportDialogOpen(true);
                        
                        simulateProgress(() => {
                          try {
                            const columns: ExportColumn[] = [
                              { header: "N° Facture", accessor: "invoice_number" },
                              { header: "Client", accessor: (sale) => sale.client?.name || sale.client_name || "Client Ponctuel" },
                              { header: "Date", accessor: (sale) => new Date(sale.sale_date).toLocaleDateString("fr-FR") },
                              { header: "Articles", accessor: (sale) => sale.items?.map(item => `${item.quantity}x ${item.product?.name || 'Produit'}`).join(", ") || "Aucun" },
                              { header: "Total", accessor: (sale) => formatCurrency(sale.total) },
                              { header: "Payé", accessor: (sale) => formatCurrency(sale.amount_paid) },
                              { header: "Restant", accessor: (sale) => formatCurrency(sale.amount_due) },
                              { header: "Statut", accessor: (sale) => sale.payment_status === 'paid' ? 'Payé' : sale.payment_status === 'partial' ? 'Partiel' : 'En attente' },
                            ];
                            exportToPDF({
                              title: "Historique des Ventes",
                              columns,
                              data: filteredSales,
                            });
                            toast.success("Historique exporté en PDF avec succès");
                          } catch (error) {
                            toast.error("Erreur lors de l'export PDF");
                            console.error(error);
                          }
                        });
                      }}
                      disabled={exportDialogOpen || isLoading}
                    >
                      Exporter PDF
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setExportType("Excel");
                        setExportDialogOpen(true);
                        
                        simulateProgress(() => {
                          try {
                            const columns: ExportColumn[] = [
                              { header: "N° Facture", accessor: "invoice_number" },
                              { header: "Client", accessor: (sale) => sale.client?.name || sale.client_name || "Client Ponctuel" },
                              { header: "Date", accessor: (sale) => new Date(sale.sale_date).toLocaleDateString("fr-FR") },
                              { header: "Articles", accessor: (sale) => sale.items?.map(item => `${item.quantity}x ${item.product?.name || 'Produit'}`).join(", ") || "Aucun" },
                              { header: "Total", accessor: (sale) => formatCurrency(sale.total) },
                              { header: "Payé", accessor: (sale) => formatCurrency(sale.amount_paid) },
                              { header: "Restant", accessor: (sale) => formatCurrency(sale.amount_due) },
                              { header: "Statut", accessor: (sale) => sale.payment_status === 'paid' ? 'Payé' : sale.payment_status === 'partial' ? 'Partiel' : 'En attente' },
                            ];
                            exportToExcel({
                              title: "Historique des Ventes",
                              columns,
                              data: filteredSales,
                            });
                            toast.success("Historique exporté en Excel avec succès");
                          } catch (error) {
                            toast.error("Erreur lors de l'export Excel");
                            console.error(error);
                          }
                        });
                      }}
                      disabled={exportDialogOpen || isLoading}
                    >
                      Exporter Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payé</TableHead>
                      <TableHead>Restant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredSales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Aucune vente trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSales.map((sale) => {
                          const articles = sale.items?.map(item => 
                            `${item.quantity}x ${item.product?.name || 'Produit'}`
                          ).join(", ") || "Aucun article";
                          return (
                            <TableRow key={sale.id}>
                              <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                              <TableCell>{sale.client?.name || sale.client_name || "Client ponctuel"}</TableCell>
                              <TableCell>{new Date(sale.sale_date).toLocaleDateString("fr-FR")}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {articles}
                              </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(sale.total)}
                        </TableCell>
                        <TableCell>{formatCurrency(sale.amount_paid)}</TableCell>
                        <TableCell
                          className={Number(sale.amount_due) > 0 ? "text-destructive font-semibold" : ""}
                        >
                          {formatCurrency(sale.amount_due)}
                        </TableCell>
                              <TableCell>{getStatusBadge(sale.payment_status)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {Number(sale.amount_due) > 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setSaleForPayment(sale);
                                        setPaymentDialogOpen(true);
                                      }}
                                    >
                                      Ajouter paiement
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteSale(sale.id)}
                                    disabled={deleteSaleMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
                {filteredSales.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      lastPage={totalPages}
                      perPage={perPage}
                      total={filteredSales.length}
                      onPageChange={setCurrentPage}
                      onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette vente ? Cette action est irréversible et affectera les statistiques.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteSale}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteSaleMutation.isPending}
              >
                {deleteSaleMutation.isPending ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un paiement</DialogTitle>
            </DialogHeader>
            {saleForPayment && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Facture #{saleForPayment.invoice_number}</Label>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(parseFloat(saleForPayment.total))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Déjà payé: {formatCurrency(parseFloat(saleForPayment.amount_paid))}
                  </p>
                  <p className="text-sm font-semibold text-destructive">
                    Reste à payer: {formatCurrency(parseFloat(saleForPayment.amount_due))}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional-payment">Montant à ajouter</Label>
                  <Input
                    id="additional-payment"
                    type="text"
                    value={additionalPayment}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                      if (value === "" || value === "0") {
                        setAdditionalPayment("");
                        return;
                      }
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        const maxAmount = parseFloat(saleForPayment.amount_due);
                        if (numValue > maxAmount) {
                          setAdditionalPayment(maxAmount.toString());
                          toast.error(`Le montant ne peut pas dépasser ${formatCurrency(maxAmount)}`);
                        } else {
                          setAdditionalPayment(value);
                        }
                      }
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPaymentDialogOpen(false);
                      setSaleForPayment(null);
                      setAdditionalPayment("");
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      const amount = parseFloat(additionalPayment.replace(',', '.')) || 0;
                      if (amount <= 0) {
                        toast.error("Veuillez entrer un montant valide");
                        return;
                      }
                      if (amount > parseFloat(saleForPayment.amount_due)) {
                        toast.error("Le montant ne peut pas dépasser le reste à payer");
                        return;
                      }
                      addPaymentMutation.mutate({
                        saleId: saleForPayment.id,
                        amount: amount,
                      });
                    }}
                    disabled={addPaymentMutation.isPending || !additionalPayment || parseFloat(additionalPayment.replace(',', '.')) <= 0}
                    className="flex-1"
                  >
                    {addPaymentMutation.isPending ? "Ajout..." : "Ajouter le paiement"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression de brouillon */}
        <AlertDialog open={deleteDraftDialogOpen} onOpenChange={setDeleteDraftDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Effacer le brouillon ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action effacera toutes les données du formulaire sauvegardées. 
                Voulez-vous vraiment continuer ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  localStorage.removeItem('draft_sale');
                  setHasDraft(false);
                  setSaleLines([{ id: 1, product_id: 0, quantity: 0, price: 0, discount: 0 }]);
                  setSelectedClient("");
                  setClientName("");
                  setAmountPaid("");
                  setNotes("");
                  setApplyAutoDiscount(true);
                  setManualDiscountPercent(0);
                  toast.success("Brouillon effacé");
                }}
              >
                Effacer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Export Progress Dialog */}
        <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {exportComplete ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Export terminé !
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Export {exportType} en cours...
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {exportComplete
                  ? `Votre fichier ${exportType} a été téléchargé avec succès.`
                  : `Génération de votre historique ${exportType}. Veuillez patienter...`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{Math.round(exportProgress)}%</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
              {!exportComplete && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelExport}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default Sales;
