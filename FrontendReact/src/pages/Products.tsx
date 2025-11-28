import { KPICardSkeleton } from "@/components/dashboard/KPICardSkeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/config/config.axios";
import { ExportColumn, exportToExcel, exportToPDF } from "@/lib/utils.export";
import { formatCurrency } from "@/lib/utils.format";
import { fetchProductCategories } from "@/services/services.productCategories";
import { deleteProduct, fetchProducts, Product } from "@/services/services.products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Edit, FileText, ImageIcon, Package, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Helper function to get full image URL
const getImageUrl = (imageUrl?: string, imagePath?: string): string => {
  if (!imageUrl && !imagePath) return '';
  
  // Si image_url est un chemin absolu (commence par http), le retourner tel quel
  if (imageUrl?.startsWith('http')) return imageUrl;
  
  // Si image_url est un chemin relatif (commence par /), construire l'URL complète
  if (imageUrl?.startsWith('/')) {
    const baseURL = axiosInstance.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseURL}${imageUrl}`;
  }
  
  // Fallback: construire l'URL depuis le chemin de l'image
  if (imagePath) {
    const baseURL = axiosInstance.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseURL}/storage/${imagePath}`;
  }
  
  return '';
};

const Products = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageObjectFit, setImageObjectFit] = useState("contain");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [imageDeleted, setImageDeleted] = useState(false); // Pour tracker si l'image a été supprimée
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<"PDF" | "Excel">("PDF");
  const [exportComplete, setExportComplete] = useState(false);
  const [exportCancelled, setExportCancelled] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category_id: "",
    prix_achat: "",
    prix_vente: "",
    stock: "",
    min_stock_alert: "5",
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: fetchProductCategories,
  });

  // Fetch products (sans filtres dans queryKey pour éviter le reload)
  const { data: allProductsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });
  
  const allProducts = Array.isArray(allProductsData) ? allProductsData : [];

  // Filter products locally by search term, category and status
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.code?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((product: Product) => 
        product.category_id === parseInt(filterCategory)
      );
    }
    
    // Filter by stock status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((product: Product) => {
        if (filterStatus === 'ok') {
          return product.stock > product.min_stock_alert;
        } else if (filterStatus === 'warning') {
          return product.stock > 0 && product.stock <= product.min_stock_alert;
        } else if (filterStatus === 'danger') {
          return product.stock <= 0;
        }
        return true;
      });
    }
    
    return filtered;
  }, [allProducts, searchTerm, filterCategory, filterStatus]);

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, perPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);

  // Calculate stats (from all products, not filtered)
  const stats = useMemo(() => {
    const total = allProducts.length;
    const inStock = allProducts.filter((p: Product) => {
      if (p.stock <= 0) return false;
      return p.stock > p.min_stock_alert;
    }).length;
    const alert = allProducts.filter((p: Product) => {
      return p.stock > 0 && p.stock <= p.min_stock_alert;
    }).length;
    const outOfStock = allProducts.filter((p: Product) => p.stock <= 0).length;
    
    return { total, inStock, alert, outOfStock };
  }, [allProducts]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: { product: any; image?: File }) => {
      const formData = new FormData();
      
      // Ajouter tous les champs du produit
      Object.keys(data.product).forEach((key) => {
        const value = data.product[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Ajouter l'image si elle existe
      if (data.image) {
        formData.append('image', data.image);
      }
      
      const response = await axiosInstance.post("/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success("Produit enregistré avec succès !");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Erreur lors de l'enregistrement";
      toast.error(errorMessage);
      console.error("Erreur création produit:", error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data, image, deleteImage }: { id: number; data: any; image?: File; deleteImage?: boolean }) => {
      // Laravel ne supporte pas les fichiers dans PUT/PATCH avec FormData
      // On doit utiliser POST avec _method=PUT comme workaround
      const formData = new FormData();
      
      // Ajouter _method pour Laravel
      formData.append('_method', 'PUT');
      
      // Ajouter tous les champs
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value !== undefined && value !== null && value !== '') {
          // Pour les valeurs numériques, s'assurer qu'elles sont bien numériques
          if (['prix_achat', 'prix_vente', 'stock', 'min_stock_alert', 'category_id', 'supplier_id'].includes(key)) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (!isNaN(numValue)) {
              formData.append(key, numValue.toString());
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Ajouter l'image si elle existe
      if (image) {
        formData.append('image', image);
        console.log('Image added to FormData:', image.name, image.size, 'bytes');
      } else if (deleteImage) {
        // Indiquer au backend de supprimer l'image
        formData.append('delete_image', '1');
        console.log('Delete image flag added');
      } else {
        console.log('No image to send');
      }
      
      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Utiliser POST au lieu de PUT pour permettre l'upload de fichiers
      const response = await axiosInstance.post(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: async (data) => {
      console.log('Update success, received data:', data);
      console.log('Image URL from response:', data?.image_url);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.refetchQueries({ queryKey: ['products'] });
      toast.success("Produit modifié avec succès !");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      // Mettre à jour l'image preview si une nouvelle image a été uploadée
      if (data?.image_url) {
        setImagePreview(data.image_url);
      }
    },
    onError: (error: any) => {
      console.error("Erreur modification produit:", error);
      console.error("Response data:", error?.response?.data);
      
      // Afficher les erreurs de validation détaillées
      if (error?.response?.status === 422) {
        const validationErrors = error?.response?.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          toast.error(`Erreurs de validation:\n${errorMessages}`);
        } else {
          toast.error(error?.response?.data?.message || "Erreur de validation");
        }
      } else {
        const errorMessage = error?.response?.data?.message || error?.response?.data?.error || "Erreur lors de la modification";
        toast.error(errorMessage);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produit supprimé avec succès !");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
    },
  });

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

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      code: "",
      category_id: "",
      prix_achat: "",
      prix_vente: "",
      stock: "",
      min_stock_alert: "5",
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code || "",
      category_id: product.category_id.toString(),
      prix_achat: product.prix_achat.toString(),
      prix_vente: product.prix_vente.toString(),
      stock: product.stock.toString(),
      min_stock_alert: product.min_stock_alert.toString(),
    });
    // Réinitialiser l'image sélectionnée
    setSelectedImage(null);
    setImageDeleted(false); // Réinitialiser le flag de suppression
    // Afficher l'image existante en preview
    if ((product as any).image) {
      // Utiliser la fonction helper pour obtenir l'URL complète
      const imageUrl = getImageUrl((product as any).image_url, (product as any).image);
      console.log('Edit dialog - Image URL:', imageUrl);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("L'image est trop grande. Taille maximale : 2MB");
        e.target.value = ''; // Réinitialiser l'input
        return;
      }
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner un fichier image valide");
        e.target.value = ''; // Réinitialiser l'input
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        toast.error("Erreur lors de la lecture de l'image");
        e.target.value = ''; // Réinitialiser l'input
      };
      reader.readAsDataURL(file);
    } else {
      // Si aucun fichier n'est sélectionné, réinitialiser
      setSelectedImage(null);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.category_id || !formData.prix_achat || !formData.prix_vente) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const productData = {
      name: formData.name,
      code: formData.code || undefined,
      category_id: parseInt(formData.category_id),
      prix_achat: parseFloat(formData.prix_achat),
      prix_vente: parseFloat(formData.prix_vente),
      stock: parseInt(formData.stock) || 0,
      min_stock_alert: parseInt(formData.min_stock_alert) || 5,
    };

    if (editingProduct) {
      // Vérifier si une nouvelle image a été sélectionnée
      const imageToSend = selectedImage instanceof File ? selectedImage : undefined;
      console.log('Updating product with image:', imageToSend ? imageToSend.name : 'no image');
      console.log('Image deleted flag:', imageDeleted);
      updateMutation.mutate({
        id: editingProduct.id,
        data: productData,
        image: imageToSend,
        deleteImage: imageDeleted && !imageToSend, // Supprimer seulement si flag activé et pas de nouvelle image
      });
    } else {
      createMutation.mutate({
        product: productData,
        image: selectedImage || undefined,
      });
    }
  };

  const getStockBadge = (product: Product) => {
    if (product.stock <= 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }
    if (product.stock <= product.min_stock_alert) {
      return <Badge variant="warning">Alerte</Badge>;
    }
    return <Badge variant="success">En stock</Badge>;
  };

  const getStockColorClass = (product: Product) => {
    if (product.stock <= 0) {
      return "text-destructive font-bold"; // Rouge pour rupture
    }
    if (product.stock <= product.min_stock_alert) {
      return "text-warning font-bold"; // Orange pour alerte
    }
    return "text-success font-semibold"; // Vert pour en stock
  };
  
  const calculateMargin = (price: number, cost: number) => {
    if (cost === 0) return "0";
    return (((price - cost) / cost) * 100).toFixed(1);
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Produits</h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Produit
              </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un Produit</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du produit à ajouter
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Nom du Produit *</Label>
                    <Input
                      placeholder="Ex: Robe Ankara Premium"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <Combobox
                      options={categories.map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.name,
                      }))}
                      value={formData.category_id || ""}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      placeholder="Choisir une catégorie"
                      searchPlaceholder="Rechercher une catégorie..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code Produit</Label>
                    <Input
                      placeholder="Ex: R_ANK_01"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix de Vente (FCFA) *</Label>
                    <Input
                      type="number"
                      placeholder="85000"
                      value={formData.prix_vente}
                      onChange={(e) => setFormData({ ...formData, prix_vente: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coût d'Achat (FCFA) *</Label>
                    <Input
                      type="number"
                      placeholder="55000"
                      value={formData.prix_achat}
                      onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Initial</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'Alerte</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={formData.min_stock_alert}
                      onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                    <Label>Image du Produit</Label>
                      {imagePreview && (
                        <Select
                          value={imageObjectFit}
                          onValueChange={(value:"contain") => setImageObjectFit('contain')}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cover">Cover</SelectItem>
                            <SelectItem value="contain">Contain</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className={`w-full h-48 rounded object-contain bg-muted`}
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <label className="cursor-pointer">
                              <Button
                                variant="secondary"
                                size="icon"
                                type="button"
                                className="bg-background/80 hover:bg-background"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </Button>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </label>
                            <Button
                              variant="destructive"
                              size="icon"
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer min-h-[192px]">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">
                        Cliquez ou glissez une image ici
                      </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, GIF (max 2MB)
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/jpg"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
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
                    onClick={() => { setIsDialogOpen(false); resetForm(); }}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Produits</p>
                      <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En Stock</p>
                      <p className="text-2xl font-bold text-success">{stats.inStock}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-success font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alerte Stock</p>
                      <p className="text-2xl font-bold text-warning">{stats.alert}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <span className="text-warning font-bold">!</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rupture</p>
                      <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive font-bold">×</span>
                </div>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>

        {/*  Tableau*/}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Catalogue Produits</CardTitle>
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
                <Combobox
                  options={[
                    { value: "all", label: "Toutes" },
                    ...categories.map((cat) => ({
                      value: cat.id.toString(),
                      label: cat.name,
                    })),
                  ]}
                  value={filterCategory || "all"}
                  onValueChange={setFilterCategory}
                  placeholder="Catégorie"
                  searchPlaceholder="Rechercher une catégorie..."
                  className="w-40"
                />
                <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="ok">En stock</SelectItem>
                    <SelectItem value="warning">Alerte</SelectItem>
                    <SelectItem value="danger">Rupture</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setExportType("PDF");
                    setExportDialogOpen(true);
                    
                    simulateProgress(() => {
                      try {
                        const columns: ExportColumn[] = [
                          { header: "Nom", accessor: "name" },
                          { header: "Code", accessor: "code" },
                          { header: "Catégorie", accessor: (p) => categories.find(c => c.id === p.category_id)?.name || "N/A" },
                          { header: "Prix de Vente", accessor: (p) => formatCurrency(p.prix_vente) },
                          { header: "Coût d'Achat", accessor: (p) => formatCurrency(p.prix_achat) },
                          { header: "Marge", accessor: (p) => formatCurrency((p.prix_vente || 0) - (p.prix_achat || 0)) },
                          { header: "Stock", accessor: "stock" },
                          { header: "Statut", accessor: (p) => p.stock === 0 ? "Rupture" : p.stock <= p.min_stock_alert ? "Stock Faible" : "En Stock" },
                        ];
                        exportToPDF({
                          title: "Catalogue Produits",
                          columns,
                          data: filteredProducts,
                        });
                        toast.success("Catalogue exporté en PDF avec succès");
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
                          { header: "Nom", accessor: "name" },
                          { header: "Code", accessor: "code" },
                          { header: "Catégorie", accessor: (p) => categories.find(c => c.id === p.category_id)?.name || "N/A" },
                          { header: "Prix de Vente", accessor: (p) => formatCurrency(p.prix_vente) },
                          { header: "Coût d'Achat", accessor: (p) => formatCurrency(p.prix_achat) },
                          { header: "Marge", accessor: (p) => formatCurrency((p.prix_vente || 0) - (p.prix_achat || 0)) },
                          { header: "Stock", accessor: "stock" },
                          { header: "Statut", accessor: (p) => p.stock === 0 ? "Rupture" : p.stock <= p.min_stock_alert ? "Stock Faible" : "En Stock" },
                        ];
                        exportToExcel({
                          title: "Catalogue Produits",
                          columns,
                          data: filteredProducts,
                        });
                        toast.success("Catalogue exporté en Excel avec succès");
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
                  <TableHead>Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Marge</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-12 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucun produit trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product: Product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                        {(product as any).image ? (
                          <img
                            src={getImageUrl((product as any).image_url, (product as any).image)}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-muted"
                            onError={(e) => {
                              // Si l'image ne charge pas, afficher l'icône
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                              }
                            }}
                          />
                        ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                        )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{product.category?.name || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                        {formatCurrency(product.prix_vente)}
                    </TableCell>
                      <TableCell>{formatCurrency(product.prix_achat)}</TableCell>
                    <TableCell>
                      <span className="text-success font-semibold">
                          +{calculateMargin(product.prix_vente, product.prix_achat)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={getStockColorClass(product)}>
                        {product.stock}
                      </span>
                    </TableCell>
                      <TableCell>{getStockBadge(product)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(product)}
                          >
                          <Edit className="w-4 h-4" />
                        </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteMutation.isPending}
                          >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {filteredProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                lastPage={totalPages}
                perPage={perPage}
                total={filteredProducts.length}
                onPageChange={setCurrentPage}
                onPerPageChange={(newPerPage) => {
                  setPerPage(newPerPage);
                  setCurrentPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le Produit</DialogTitle>
              <DialogDescription>
                Modifiez les informations du produit
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Nom du Produit *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={formData.category_id || ""} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Code Produit</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prix de Vente (FCFA) *</Label>
                  <Input
                    type="number"
                    value={formData.prix_vente}
                    onChange={(e) => setFormData({ ...formData, prix_vente: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coût d'Achat (FCFA) *</Label>
                  <Input
                    type="number"
                    value={formData.prix_achat}
                    onChange={(e) => setFormData({ ...formData, prix_achat: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seuil d'Alerte</Label>
                  <Input
                    type="number"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Image du Produit</Label>
                    {imagePreview && (
                      <Select
                        value={imageObjectFit}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className={`w-full h-48 rounded object-contain bg-muted`}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <label className="cursor-pointer">
                            <Button
                              variant="secondary"
                              size="icon"
                              type="button"
                              className="bg-background/80 hover:bg-background"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/gif,image/jpg"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                          <Button
                            variant="destructive"
                            size="icon"
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                              setImageDeleted(true); // Marquer l'image comme supprimée
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer min-h-[192px]">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          Cliquez ou glissez une image ici
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, GIF (max 2MB)
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/jpg"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
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
                  onClick={() => { setIsEditDialogOpen(false); resetForm(); }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
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
                  : `Génération de votre catalogue ${exportType}. Veuillez patienter...`}
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

export default Products;
