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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Printer, Eye, Search } from "lucide-react";
import { toast } from "sonner";

// Données de démonstration
const salesHistory = [
  {
    id: "250127-0001",
    client: "Fatou Sall",
    date: "2025-01-27",
    articles: "2x Robe Ankara, 1x Tunique",
    total: 285000,
    paid: 285000,
    remaining: 0,
    status: "paid",
  },
  {
    id: "250127-0002",
    client: "Aminata Diop",
    date: "2025-01-27",
    articles: "1x Boubou Bazin",
    total: 180000,
    paid: 100000,
    remaining: 80000,
    status: "partial",
  },
  {
    id: "250126-0015",
    client: "Khadija Ndiaye",
    date: "2025-01-26",
    articles: "3x Chemise, 2x Accessoires",
    total: 145000,
    paid: 0,
    remaining: 145000,
    status: "pending",
  },
];

const clients = ["Fatou Sall", "Aminata Diop", "Khadija Ndiaye", "Marième Fall", "Client Ponctuel"];
const products = [
  { name: "Robe Ankara", price: 85000 },
  { name: "Boubou Bazin", price: 120000 },
  { name: "Tunique Wax", price: 65000 },
  { name: "Chemise Homme", price: 35000 },
  { name: "Accessoires", price: 15000 },
];

const Sales = () => {
  const [saleLines, setSaleLines] = useState([
    { id: 1, product: "", quantity: 1, price: 0, discount: 0 },
  ]);
  const [selectedClient, setSelectedClient] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [amountPaid, setAmountPaid] = useState("");

  const addLine = () => {
    setSaleLines([...saleLines, { id: Date.now(), product: "", quantity: 1, price: 0, discount: 0 }]);
  };

  const removeLine = (id: number) => {
    setSaleLines(saleLines.filter((line) => line.id !== id));
  };

  const updateLine = (id: number, field: string, value: any) => {
    setSaleLines(
      saleLines.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    );
  };

  const calculateSubtotal = () => {
    return saleLines.reduce((sum, line) => {
      const lineTotal = line.quantity * line.price;
      const discountAmount = (lineTotal * line.discount) / 100;
      return sum + (lineTotal - discountAmount);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalItems = saleLines.reduce((sum, line) => sum + line.quantity, 0);
  const autoDiscount = totalItems >= 10 ? 10 : totalItems >= 6 ? 5 : 0;
  const discountAmount = (subtotal * autoDiscount) / 100;
  const total = subtotal - discountAmount;
  const paid = parseFloat(amountPaid) || 0;
  const remaining = total - paid;

  const handleSave = () => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    if (saleLines.every((line) => !line.product)) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }
    toast.success("Vente enregistrée avec succès !");
    // Reset form
    setSaleLines([{ id: 1, product: "", quantity: 1, price: 0, discount: 0 }]);
    setSelectedClient("");
    setAmountPaid("");
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
    <DashboardLayout>
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
            <Card>
              <CardHeader>
                <CardTitle>Informations Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client} value={client}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedClient && selectedClient !== "Client Ponctuel" && (
                    <div className="flex items-end">
                      <div className="p-3 rounded-lg bg-warning/10 text-sm">
                        <span className="font-medium">Créance actuelle:</span>{" "}
                        <span className="text-warning font-bold">150,000 FCFA</span>
                      </div>
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
                        <Select
                          value={line.product}
                          onValueChange={(value) => {
                            const product = products.find((p) => p.name === value);
                            updateLine(line.id, "product", value);
                            updateLine(line.id, "price", product?.price || 0);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.name} value={product.name}>
                                {product.name} - {product.price.toLocaleString()} FCFA
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>Qté</Label>
                        <Input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.id, "quantity", parseInt(e.target.value) || 1)
                          }
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
                          type="number"
                          min="0"
                          max="100"
                          value={line.discount}
                          onChange={(e) =>
                            updateLine(line.id, "discount", parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Total</Label>
                        <div className="h-10 flex items-center font-semibold text-foreground">
                          {(
                            line.quantity * line.price -
                            (line.quantity * line.price * line.discount) / 100
                          ).toLocaleString()}{" "}
                          FCFA
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-muted-foreground">Sous-total:</span>
                      <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    {autoDiscount > 0 && (
                      <div className="flex justify-between text-lg text-success">
                        <span>Remise automatique ({autoDiscount}%):</span>
                        <span className="font-semibold">-{discountAmount.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold border-t pt-3">
                      <span>Total à payer:</span>
                      <span className="text-primary">{total.toLocaleString()} FCFA</span>
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
                      <Label>Statut</Label>
                      <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Payé</SelectItem>
                          <SelectItem value="partial">Partiellement Payé</SelectItem>
                          <SelectItem value="pending">Créance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {remaining > 0 && (
                      <div className="p-3 rounded-lg bg-warning/10">
                        <span className="font-medium">Restant dû:</span>{" "}
                        <span className="text-warning font-bold text-lg">
                          {remaining.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="gap-2">
                    <Printer className="w-4 h-4" />
                    Enregistrer & Imprimer
                  </Button>
                  <Button onClick={handleSave} variant="secondary">
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
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Rechercher..." className="pl-9" />
                    </div>
                    <Button variant="outline">Exporter</Button>
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
                    {salesHistory.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{sale.client}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sale.articles}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {sale.total.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>{sale.paid.toLocaleString()} FCFA</TableCell>
                        <TableCell
                          className={sale.remaining > 0 ? "text-destructive font-semibold" : ""}
                        >
                          {sale.remaining.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Sales;
