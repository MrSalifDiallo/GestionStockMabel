import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Package,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Données de démonstration
const salesData = [
  { date: "Lun", ventes: 450000 },
  { date: "Mar", ventes: 520000 },
  { date: "Mer", ventes: 380000 },
  { date: "Jeu", ventes: 680000 },
  { date: "Ven", ventes: 750000 },
  { date: "Sam", ventes: 920000 },
  { date: "Dim", ventes: 650000 },
];

const topProducts = [
  { name: "Robe Ankara", ventes: 450000 },
  { name: "Boubou Bazin", ventes: 380000 },
  { name: "Tunique Wax", ventes: 320000 },
  { name: "Chemise Homme", ventes: 280000 },
  { name: "Accessoires", ventes: 220000 },
];

const expensesData = [
  { name: "Mercerie", value: 120000, color: "hsl(var(--primary))" },
  { name: "Transport", value: 45000, color: "hsl(var(--secondary))" },
  { name: "Électricité", value: 35000, color: "hsl(var(--success))" },
  { name: "Tontine", value: 50000, color: "hsl(var(--warning))" },
  { name: "Divers", value: 30000, color: "hsl(var(--muted))" },
];

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Ventes du Jour"
            value="750,000 FCFA"
            change="+15%"
            trend="up"
            icon={TrendingUp}
            variant="default"
          />
          <KPICard
            title="Bénéfice du Jour"
            value="300,000 FCFA"
            change="40%"
            trend="up"
            icon={DollarSign}
            variant="success"
          />
          <KPICard
            title="Dépenses du Jour"
            value="85,000 FCFA"
            change="-5%"
            trend="down"
            icon={AlertTriangle}
            variant="warning"
          />
          <KPICard
            title="Stock Critique"
            value="8 Articles"
            change="À réapprovisionner"
            trend="neutral"
            icon={Package}
            variant="danger"
          />
        </div>

        {/* Actions Rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle Vente
              </Button>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Produit
              </Button>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter Dépense
              </Button>
              <Button variant="secondary" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                Voir Stock
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des ventes */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Ventes (7 Derniers Jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
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
                  <Line
                    type="monotone"
                    dataKey="ventes"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 Produits */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Produits les Plus Vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="ventes" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition des Dépenses */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Dépenses par Catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesData.map((entry, index) => (
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

          {/* Créances Clients */}
          <Card>
            <CardHeader>
              <CardTitle>Créances en Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { client: "Fatou Sall", montant: "150,000 FCFA", jours: "5 jours" },
                  { client: "Aminata Diop", montant: "85,000 FCFA", jours: "12 jours" },
                  { client: "Khadija Ndiaye", montant: "120,000 FCFA", jours: "3 jours" },
                  { client: "Marième Fall", montant: "65,000 FCFA", jours: "8 jours" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.client}</p>
                      <p className="text-sm text-muted-foreground">{item.jours}</p>
                    </div>
                    <p className="font-semibold text-destructive">{item.montant}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Voir Tout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
