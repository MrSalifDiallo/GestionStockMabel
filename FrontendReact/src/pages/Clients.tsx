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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/config/config.axios";
import { formatCurrency } from "@/lib/utils.format";
import { Client, createClient, deleteClient, fetchClients, updateClient } from "@/services/services.clients";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, DollarSign, Edit, Plus, Search, Trash2, Users, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const Clients = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [paymentClient, setPaymentClient] = useState<Client | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [filterDue, setFilterDue] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    measurements: "",
  });

  // Fetch clients (sans searchTerm dans queryKey pour éviter le reload)
  const { data: clientsResponse, isLoading } = useQuery({
    queryKey: ['clients', filterDue],
    queryFn: () => fetchClients({
      with_due: filterDue,
    }),
  });

  // Extraire les clients de la pagination ou du tableau
  const allClients = useMemo<Client[]>(() => {
    if (!clientsResponse) return [];
    if (Array.isArray(clientsResponse)) return clientsResponse;
    if (clientsResponse.data && Array.isArray(clientsResponse.data)) return clientsResponse.data;
    return [];
  }, [clientsResponse]);

  // Filtrer localement par searchTerm et filterDue
  const filteredClients = useMemo(() => {
    let filtered = [...allClients];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((client: Client) =>
        client.name.toLowerCase().includes(searchLower) ||
        client.phone?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterDue) {
      filtered = filtered.filter((client: Client) => {
        const due = typeof client.total_due === 'string' ? parseFloat(client.total_due) : (client.total_due || 0);
        return due > 0;
      });
    }
    
    return filtered;
  }, [allClients, searchTerm, filterDue]);

  // Paginer les clients filtrés
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredClients.slice(start, end);
  }, [filteredClients, currentPage, perPage]);

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDue]);

  const totalPages = Math.ceil(filteredClients.length / perPage);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client enregistré avec succès !");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de l'enregistrement");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client modifié avec succès !");
      setIsEditDialogOpen(false);
      setEditingClient(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la modification");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Client supprimé avec succès !");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      measurements: "",
    });
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      measurements: client.measurements || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleOpenPayment = (client: Client) => {
    setPaymentClient(client);
    setPaymentAmount("");
    setIsPaymentDialogOpen(true);
  };

  const handlePayment = async () => {
    if (!paymentClient) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Montant invalide");
      return;
    }

    const due = typeof paymentClient.total_due === 'string' ? parseFloat(paymentClient.total_due) : (paymentClient.total_due || 0);
    if (amount > due) {
      toast.error(`Le montant ne peut pas dépasser ${formatCurrency(due)}`);
      return;
    }

    try {
      await axiosInstance.post(`/clients/${paymentClient.id}/payments`, {
        amount: amount
      });
      
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("Paiement enregistré avec succès !");
      setIsPaymentDialogOpen(false);
      setPaymentClient(null);
      setPaymentAmount("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'enregistrement du paiement");
    }
  };

  const totalClients = allClients.length;
  const clientsWithDue = filteredClients.filter((c) => {
    const due = typeof c.total_due === 'string' ? parseFloat(c.total_due) : (c.total_due || 0);
    return due > 0;
    }).length;
  const totalCreances = allClients.reduce((sum, c) => {
    const due = typeof c.total_due === 'string' ? parseFloat(c.total_due) : (c.total_due || 0);
    return sum + due;
  }, 0);

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Clients</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="w-4 h-4" />
                Nouveau Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Ajouter un Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nom Complet *</Label>
                  <Input 
                    placeholder="Ex: Fatou Sall" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input 
                      placeholder="77 123 45 67" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      placeholder="email@exemple.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Adresse / Localité</Label>
                  <Input 
                    placeholder="Quartier, Ville" 
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mesures / Tailles (Notes)</Label>
                  <Textarea 
                    placeholder="Informations sur les tailles ou mesures du client..." 
                    value={formData.measurements}
                    onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSave} 
                    className="flex-1"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  {isLoading ? (
                    <>
                      <Skeleton className="w-24 h-4 mb-2" /> 
                      <Skeleton className="w-32 h-8" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-3xl font-bold text-foreground">{totalClients}</p>
                    </>
                  )}
                </div>

                <div>
                  {isLoading ? (
                    <Skeleton className="w-10 h-10" />
                  ) : (
                    <Users className="w-10 h-10 text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  {isLoading ? (
                    <Skeleton className="w-24 h-4 mb-2" /> 
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Clients avec Créances</p>
                      <p className="text-3xl font-bold text-warning">{clientsWithDue}</p>
                    </>
                  )}
                </div>
                {isLoading ? (
                  <Skeleton className="w-10 h-10" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-warning" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  {isLoading ? (
                    <Skeleton className="w-24 h-4 mb-2" /> 
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Total Créances</p>
                      <p className="text-3xl font-bold text-destructive">
                        {formatCurrency(totalCreances)}
                      </p>
                    </>
                  )}
                </div>
                {isLoading ? (
                  <Skeleton className="w-10 h-10" />
                ) : (
                  <DollarSign className="w-10 h-10 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Liste des Clients</CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Rechercher..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant={filterDue ? "default" : "outline"}
                  onClick={() => setFilterDue(!filterDue)}
                >
                  {filterDue ? "Tous" : "Créances uniquement"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Total Commandé</TableHead>
                  <TableHead>Total Payé</TableHead>
                  <TableHead>Montant Dû</TableHead>
                  <TableHead>Dernier Achat</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">#{client.id}</TableCell>
                      <TableCell className="font-semibold">{client.name}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.address || "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(client.total_orders || 0)}
                      </TableCell>
                      <TableCell className="text-success">
                        {formatCurrency(client.total_paid || 0)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const due = typeof client.total_due === 'string' ? parseFloat(client.total_due) : (client.total_due || 0);
                          return due > 0 ? (
                            <Badge variant="destructive">
                              {formatCurrency(due)}
                            </Badge>
                          ) : (
                            <Badge variant="default">0 FCFA</Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {client.last_purchase 
                          ? new Date(client.last_purchase).toLocaleDateString("fr-FR")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenEdit(client)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(client.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                          {(() => {
                            const due = typeof client.total_due === 'string' ? parseFloat(client.total_due) : (client.total_due || 0);
                            return due > 0 ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleOpenPayment(client)}
                                title="Ajouter un paiement"
                              >
                                <Wallet className="w-4 h-4 text-success" />
                              </Button>
                            ) : null;
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filteredClients.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  lastPage={totalPages}
                  perPage={perPage}
                  total={filteredClients.length}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Modifier le Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nom Complet *</Label>
                <Input 
                  placeholder="Ex: Fatou Sall" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input 
                    placeholder="77 123 45 67" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="email@exemple.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse / Localité</Label>
                <Input 
                  placeholder="Quartier, Ville" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mesures / Tailles (Notes)</Label>
                <Textarea 
                  placeholder="Informations sur les tailles ou mesures du client..." 
                  value={formData.measurements}
                  onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  className="flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Modification..." : "Modifier"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Top créances */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Créances à Recouvrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allClients
                .filter((c) => {
                  const due = typeof c.total_due === 'string' ? parseFloat(c.total_due) : (c.total_due || 0);
                  return due > 0;
                })
                .sort((a, b) => {
                  const dueA = typeof a.total_due === 'string' ? parseFloat(a.total_due) : (a.total_due || 0);
                  const dueB = typeof b.total_due === 'string' ? parseFloat(b.total_due) : (b.total_due || 0);
                  return dueB - dueA;
                })
                .slice(0, 5)
                .map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.phone || "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-destructive">
                        {formatCurrency(typeof client.total_due === 'string' ? parseFloat(client.total_due) : (client.total_due || 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.last_purchase 
                          ? `depuis ${new Date(client.last_purchase).toLocaleDateString("fr-FR")}`
                          : "Aucun achat"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Paiement</DialogTitle>
            </DialogHeader>
            {paymentClient && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={paymentClient.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Montant Dû</Label>
                  <Input 
                    value={formatCurrency(typeof paymentClient.total_due === 'string' ? parseFloat(paymentClient.total_due) : (paymentClient.total_due || 0))} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Montant du Paiement *</Label>
                  <Input 
                    type="number"
                    placeholder="Montant en FCFA" 
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    min="0"
                    max={typeof paymentClient.total_due === 'string' ? parseFloat(paymentClient.total_due) : (paymentClient.total_due || 0)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handlePayment} 
                    className="flex-1"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPaymentDialogOpen(false);
                      setPaymentClient(null);
                      setPaymentAmount("");
                    }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default Clients;
