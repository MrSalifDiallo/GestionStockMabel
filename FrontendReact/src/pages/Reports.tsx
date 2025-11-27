import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Calendar, TrendingUp, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const salesTrendData = [
  { date: "01 Jan", ventes: 450000, benefices: 180000, depenses: 75000 },
  { date: "05 Jan", ventes: 620000, benefices: 248000, depenses: 82000 },
  { date: "10 Jan", ventes: 580000, benefices: 232000, depenses: 68000 },
  { date: "15 Jan", ventes: 720000, benefices: 288000, depenses: 95000 },
  { date: "20 Jan", ventes: 680000, benefices: 272000, depenses: 88000 },
  { date: "25 Jan", ventes: 850000, benefices: 340000, depenses: 105000 },
  { date: "27 Jan", ventes: 750000, benefices: 300000, depenses: 85000 },
];

const topProductsRevenue = [
  { name: "Robe Ankara", revenue: 850000, quantity: 10 },
  { name: "Boubou Bazin", revenue: 720000, quantity: 6 },
  { name: "Tunique Wax", revenue: 520000, quantity: 8 },
  { name: "Chemise Homme", revenue: 350000, quantity: 10 },
  { name: "Accessoires", revenue: 300000, quantity: 20 },
];

const Reports = () => {
  const totalSales = salesTrendData.reduce((sum, d) => sum + d.ventes, 0);
  const totalBenefits = salesTrendData.reduce((sum, d) => sum + d.benefices, 0);
  const totalExpenses = salesTrendData.reduce((sum, d) => sum + d.depenses, 0);
  const netProfit = totalBenefits - totalExpenses;
  const profitMargin = ((netProfit / totalSales) * 100).toFixed(1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Rapports & Analytics</h2>
          <div className="flex gap-2">
            <Select defaultValue="month">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Cette Semaine</SelectItem>
                <SelectItem value="month">Ce Mois</SelectItem>
                <SelectItem value="year">Cette Année</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exporter PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Exporter Excel
            </Button>
          </div>
        </div>

        {/* KPI Globaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ventes Totales</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalSales.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-success mt-1">+12% vs mois précédent</p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bénéfice Total</p>
                  <p className="text-2xl font-bold text-success">
                    {totalBenefits.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-success mt-1">Marge {profitMargin}%</p>
                </div>
                <DollarSign className="w-10 h-10 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dépenses Totales</p>
                  <p className="text-2xl font-bold text-warning">
                    {totalExpenses.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Coûts opérationnels</p>
                </div>
                <Calendar className="w-10 h-10 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Net</p>
                  <p className="text-2xl font-bold text-primary">
                    {netProfit.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-success mt-1">+18% vs mois précédent</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">₦</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques principaux */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution Financière (30 Derniers Jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ventes"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="Ventes"
                />
                <Line
                  type="monotone"
                  dataKey="benefices"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  name="Bénéfices"
                />
                <Line
                  type="monotone"
                  dataKey="depenses"
                  stroke="hsl(var(--warning))"
                  strokeWidth={3}
                  name="Dépenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Produits par Revenu */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Produits par Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topProductsRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tableau récapitulatif */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé des Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Chiffre d'Affaires
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {totalSales.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: "100%" }} />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Bénéfices Bruts
                    </span>
                    <span className="text-xl font-bold text-success">
                      {totalBenefits.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="h-2 bg-success/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success"
                      style={{ width: `${(totalBenefits / totalSales) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Dépenses Totales
                    </span>
                    <span className="text-xl font-bold text-warning">
                      {totalExpenses.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="h-2 bg-warning/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning"
                      style={{ width: `${(totalExpenses / totalSales) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Résultat Net
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {netProfit.toLocaleString()} FCFA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Marge nette: {profitMargin}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Créances & Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle>Créances en Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { client: "Fatou Sall", montant: 150000, jours: 5, urgent: false },
                { client: "Aminata Diop", montant: 85000, jours: 12, urgent: true },
                { client: "Khadija Ndiaye", montant: 120000, jours: 3, urgent: false },
                { client: "Marième Fall", montant: 65000, jours: 8, urgent: false },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.client}</p>
                    <p className="text-sm text-muted-foreground">
                      En attente depuis {item.jours} jours
                      {item.urgent && (
                        <span className="ml-2 text-xs text-destructive font-semibold">
                          • URGENT
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-destructive">
                    {item.montant.toLocaleString()} FCFA
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
