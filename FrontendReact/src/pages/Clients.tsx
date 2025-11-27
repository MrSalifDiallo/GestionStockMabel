import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2, Search, Eye, DollarSign, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const clientsData = [
  {
    id: 1,
    name: "Fatou Sall",
    phone: "77 123 45 67",
    address: "Médina, Dakar",
    totalOrders: 850000,
    totalPaid: 700000,
    totalDue: 150000,
    lastPurchase: "2025-01-27",
  },
  {
    id: 2,
    name: "Aminata Diop",
    phone: "78 234 56 78",
    address: "Plateau, Dakar",
    totalOrders: 420000,
    totalPaid: 335000,
    totalDue: 85000,
    lastPurchase: "2025-01-27",
  },
  {
    id: 3,
    name: "Khadija Ndiaye",
    phone: "76 345 67 89",
    address: "Ouakam, Dakar",
    totalOrders: 680000,
    totalPaid: 560000,
    totalDue: 120000,
    lastPurchase: "2025-01-26",
  },
  {
    id: 4,
    name: "Marième Fall",
    phone: "77 456 78 90",
    address: "Almadies, Dakar",
    totalOrders: 1250000,
    totalPaid: 1185000,
    totalDue: 65000,
    lastPurchase: "2025-01-25",
  },
  {
    id: 5,
    name: "Awa Sow",
    phone: "78 567 89 01",
    address: "Sacré-Cœur, Dakar",
    totalOrders: 320000,
    totalPaid: 320000,
    totalDue: 0,
    lastPurchase: "2025-01-24",
  },
];

const Clients = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterDue, setFilterDue] = useState(false);

  const totalClients = clientsData.length;
  const clientsWithDue = clientsData.filter((c) => c.totalDue > 0).length;
  const totalCreances = clientsData.reduce((sum, c) => sum + c.totalDue, 0);

  const handleSave = () => {
    toast.success("Client enregistré avec succès !");
    setIsDialogOpen(false);
  };

  const filteredClients = filterDue
    ? clientsData.filter((c) => c.totalDue > 0)
    : clientsData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Clients</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
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
                  <Input placeholder="Ex: Fatou Sall" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone *</Label>
                    <Input placeholder="77 123 45 67" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@exemple.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Adresse / Localité</Label>
                  <Input placeholder="Quartier, Ville" />
                </div>
                <div className="space-y-2">
                  <Label>Mesures / Tailles (Notes)</Label>
                  <Textarea placeholder="Informations sur les tailles ou mesures du client..." />
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-3xl font-bold text-foreground">{totalClients}</p>
                </div>
                <Users className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients avec Créances</p>
                  <p className="text-3xl font-bold text-warning">{clientsWithDue}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Créances</p>
                  <p className="text-3xl font-bold text-destructive">
                    {totalCreances.toLocaleString()} FCFA
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-destructive" />
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
                  <Input placeholder="Rechercher..." className="pl-9" />
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
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">#{client.id}</TableCell>
                    <TableCell className="font-semibold">{client.name}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.address}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {client.totalOrders.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell className="text-success">
                      {client.totalPaid.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {client.totalDue > 0 ? (
                        <Badge variant="destructive">
                          {client.totalDue.toLocaleString()} FCFA
                        </Badge>
                      ) : (
                        <Badge variant="default">0 FCFA</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(client.lastPurchase).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {client.totalDue > 0 && (
                          <Button variant="ghost" size="icon">
                            <DollarSign className="w-4 h-4 text-success" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top créances */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Créances à Recouvrer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientsData
                .filter((c) => c.totalDue > 0)
                .sort((a, b) => b.totalDue - a.totalDue)
                .slice(0, 5)
                .map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-destructive">
                        {client.totalDue.toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        depuis {new Date(client.lastPurchase).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;
