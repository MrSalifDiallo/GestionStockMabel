import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search, Package, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const productsData = [
  {
    id: 1,
    name: "Robe Ankara",
    category: "Robes",
    price: 85000,
    cost: 55000,
    stock: 12,
    alert: 5,
    status: "ok",
    code: "R_ANK_01",
  },
  {
    id: 2,
    name: "Boubou Bazin",
    category: "Boubous",
    price: 120000,
    cost: 80000,
    stock: 8,
    alert: 5,
    status: "ok",
    code: "B_BAZ_01",
  },
  {
    id: 3,
    name: "Tunique Wax",
    category: "Tuniques",
    price: 65000,
    cost: 40000,
    stock: 3,
    alert: 5,
    status: "warning",
    code: "T_WAX_01",
  },
  {
    id: 4,
    name: "Chemise Homme",
    category: "Chemises",
    price: 35000,
    cost: 22000,
    stock: 0,
    alert: 3,
    status: "danger",
    code: "C_HOM_01",
  },
  {
    id: 5,
    name: "Accessoires Mix",
    category: "Accessoires",
    price: 15000,
    cost: 8000,
    stock: 25,
    alert: 10,
    status: "ok",
    code: "A_MIX_01",
  },
];

const categories = ["Robes", "Boubous", "Tuniques", "Chemises", "Accessoires"];

const Products = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStockBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ok: { variant: "default", label: "En stock" },
      warning: { variant: "secondary", label: "Alerte" },
      danger: { variant: "destructive", label: "Rupture" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateMargin = (price: number, cost: number) => {
    return (((price - cost) / cost) * 100).toFixed(1);
  };

  const handleSave = () => {
    toast.success("Produit enregistré avec succès !");
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Produits</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un Produit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Nom du Produit *</Label>
                    <Input placeholder="Ex: Robe Ankara Premium" />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Code Produit</Label>
                    <Input placeholder="Ex: R_ANK_01" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Description détaillée du produit..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix de Vente (FCFA) *</Label>
                    <Input type="number" placeholder="85000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Coût d'Achat (FCFA) *</Label>
                    <Input type="number" placeholder="55000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Initial</Label>
                    <Input type="number" placeholder="10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Seuil d'Alerte</Label>
                    <Input type="number" placeholder="5" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Image du Produit</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Cliquez ou glissez une image ici
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Produits</p>
                  <p className="text-2xl font-bold text-foreground">
                    {productsData.length}
                  </p>
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
                  <p className="text-2xl font-bold text-success">
                    {productsData.filter((p) => p.status === "ok").length}
                  </p>
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
                  <p className="text-2xl font-bold text-warning">
                    {productsData.filter((p) => p.status === "warning").length}
                  </p>
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
                  <p className="text-2xl font-bold text-destructive">
                    {productsData.filter((p) => p.status === "danger").length}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive font-bold">×</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <CardTitle>Catalogue Produits</CardTitle>
              <div className="flex gap-2 w-full md:w-auto flex-wrap">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Rechercher..." className="pl-9" />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                {productsData.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {product.price.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>{product.cost.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <span className="text-success font-semibold">
                        +{calculateMargin(product.price, product.cost)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          product.stock <= product.alert ? "text-destructive font-bold" : ""
                        }
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{getStockBadge(product.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Products;
