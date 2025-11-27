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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, TrendingUp, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { toast } from "sonner";

const expensesData = [
  {
    id: 1,
    date: "2025-01-27",
    category: "Mercerie",
    amount: 120000,
    description: "Tissus, fils, boutons",
  },
  {
    id: 2,
    date: "2025-01-27",
    category: "Transport",
    amount: 15000,
    description: "Livraison matières premières",
  },
  {
    id: 3,
    date: "2025-01-26",
    category: "Électricité",
    amount: 35000,
    description: "Facture mensuelle",
  },
  {
    id: 4,
    date: "2025-01-25",
    category: "Tontine",
    amount: 50000,
    description: "Cotisation mensuelle",
  },
  {
    id: 5,
    date: "2025-01-24",
    category: "Mercerie",
    amount: 85000,
    description: "Wax et tissus bazin",
  },
  {
    id: 6,
    date: "2025-01-23",
    category: "Salaires",
    amount: 150000,
    description: "Salaire vendeur",
  },
];

const categories = [
  "Mercerie",
  "Transport",
  "Électricité",
  "Eau",
  "Tontine",
  "Salaires",
  "Loyer",
  "Marketing",
  "Maintenance",
  "Divers",
];

const categoryColors: Record<string, string> = {
  Mercerie: "hsl(var(--primary))",
  Transport: "hsl(var(--secondary))",
  Électricité: "hsl(var(--success))",
  Tontine: "hsl(var(--warning))",
  Salaires: "hsl(var(--destructive))",
  Divers: "hsl(var(--muted))",
};

const Expenses = () => {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSave = () => {
    toast.success("Dépense enregistrée avec succès !");
  };

  // Calculs
  const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.amount, 0);
  const expensesByCategory = categories.map((cat) => ({
    name: cat,
    value: expensesData
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0),
    color: categoryColors[cat] || "hsl(var(--muted))",
  })).filter((item) => item.value > 0);

  const todayExpenses = expensesData
    .filter((exp) => exp.date === "2025-01-27")
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Dépenses</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dépenses du Jour</p>
                  <p className="text-3xl font-bold text-foreground">
                    {todayExpenses.toLocaleString()} FCFA
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Mois</p>
                  <p className="text-3xl font-bold text-foreground">
                    {totalExpenses.toLocaleString()} FCFA
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Catégories Actives</p>
                  <p className="text-3xl font-bold text-foreground">
                    {expensesByCategory.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-secondary font-bold text-lg">
                    {expensesByCategory.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList>
            <TabsTrigger value="add">Nouvelle Dépense</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* Ajouter Dépense */}
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Enregistrer une Dépense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie *</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
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
                      <Label>Montant (FCFA) *</Label>
                      <Input type="number" placeholder="50000" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div className="space-y-2">
                      <Label>Référence / N° Facture</Label>
                      <Input placeholder="Ex: FACT-2025-001" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description / Notes</Label>
                    <Textarea placeholder="Détails de la dépense..." rows={3} />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Enregistrer
                    </Button>
                    <Button variant="outline">Annuler</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Historique des Dépenses</CardTitle>
                  <div className="flex gap-2">
                    <Select>
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
                    <Button variant="outline">Exporter</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expensesData.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: categoryColors[expense.category] || "hsl(var(--muted))",
                              color: "white",
                            }}
                          >
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {expense.amount.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {expense.description}
                        </TableCell>
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
          </TabsContent>

          {/* Statistiques */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Détails par Catégorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expensesByCategory
                      .sort((a, b) => b.value - a.value)
                      .map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-foreground">
                            {item.value.toLocaleString()} FCFA
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Résumé Financier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Dépenses Fixes</h3>
                    <div className="space-y-2">
                      {["Salaires", "Loyer", "Électricité"].map((cat) => {
                        const value = expensesByCategory.find((e) => e.name === cat)?.value || 0;
                        return (
                          <div key={cat} className="flex justify-between">
                            <span className="text-muted-foreground">{cat}</span>
                            <span className="font-semibold">{value.toLocaleString()} FCFA</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Dépenses Variables</h3>
                    <div className="space-y-2">
                      {["Mercerie", "Transport", "Marketing"].map((cat) => {
                        const value = expensesByCategory.find((e) => e.name === cat)?.value || 0;
                        return (
                          <div key={cat} className="flex justify-between">
                            <span className="text-muted-foreground">{cat}</span>
                            <span className="font-semibold">{value.toLocaleString()} FCFA</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
