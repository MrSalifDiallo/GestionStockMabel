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
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/services/services.dashboard";
import { MetricsStats } from "@/types/types.metrics";
import { formatCurrency, formatNumber } from "@/lib/utils.format";
import { KPICardSkeleton } from "@/components/dashboard/KPICardSkeleton";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useQuery<MetricsStats>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
  });

  // All hooks must be called before any conditional returns
  // Transformer les données pour les graphiques
  const salesData = useMemo(() => {
    if (!metrics?.sales_by_day || metrics.sales_by_day.length === 0) {
      return [];
    }
    return metrics.sales_by_day.map((item) => {
      const date = new Date(item.date);
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return {
        date: dayNames[date.getDay()] || date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        ventes: Number(item.total),
      };
    });
  }, [metrics?.sales_by_day]);

  const topProductsData = useMemo(() => {
    if (!metrics?.top_products) return [];
    return Object.entries(metrics.top_products)
      .map(([name, ventes]) => ({ name, ventes: Number(ventes) }))
      .sort((a, b) => b.ventes - a.ventes)
      .slice(0, 5);
  }, [metrics?.top_products]);

  const expensesData = useMemo(() => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--destructive))",
      "hsl(var(--muted))",
    ];
    
    if (!metrics?.expenses_by_category || metrics.expenses_by_category.length === 0) {
      return [];
    }
    
    return metrics.expenses_by_category.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: colors[index % colors.length],
    }));
  }, [metrics?.expenses_by_category]);

  // Memoize all computed values from metrics
  const computedStats = useMemo(() => {
    if (!metrics?.stats) {
      return {
        todaySales: 0,
        expensesToday: 0,
        benefitToday: 0,
        criticalStock: 0,
        totalDue: 0,
      };
    }

    return {
      todaySales: typeof metrics.stats.sales_today === 'string' 
        ? parseFloat(metrics.stats.sales_today.replace(/,/g, '')) || 0
        : Number(metrics.stats.sales_today ?? 0),
      expensesToday: typeof metrics.stats.expenses_today === 'string'
        ? parseFloat(metrics.stats.expenses_today.replace(/,/g, '')) || 0
        : Number(metrics.stats.expenses_today ?? 0),
      benefitToday: Number(metrics.stats.benefit_today ?? 0),
      criticalStock: metrics.stats.critical_stock ?? 0,
      totalDue: typeof metrics.stats.total_due === 'string'
        ? parseFloat(metrics.stats.total_due.replace(/,/g, '')) || 0
        : Number(metrics.stats.total_due ?? 0),
    };
  }, [metrics?.stats]);

  const { todaySales, expensesToday, benefitToday, criticalStock, totalDue } = computedStats;

  return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <KPICard
                title="Ventes du Jour"
                value={formatCurrency(todaySales)}
                change="+15%"
                trend="up"
                icon={TrendingUp}
                variant="default"
              />
              <KPICard
                title="Bénéfice du Jour"
                value={formatCurrency(benefitToday)}
                change="40%"
                trend="up"
                icon={DollarSign}
                variant="success"
              />
              <KPICard
                title="Dépenses du Jour"
                value={formatCurrency(expensesToday)}
                change="-5%"
                trend="down"
                icon={AlertTriangle}
                variant="warning"
              />
              <KPICard
                title="Stock Critique"
                value={`${criticalStock} Articles`}
                change="À réapprovisionner"
                trend="neutral"
                icon={Package}
                variant="danger"
              />
            </>
          )}
        </div>

        {/* Actions Rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={() => navigate("/sales")}>
                <Plus className="w-4 h-4" />
                Nouvelle Vente
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate("/products")}>
                <Plus className="w-4 h-4" />
                Nouveau Produit
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => navigate("/expenses")}>
                <Plus className="w-4 h-4" />
                Ajouter Dépense
              </Button>
              <Button variant="secondary" className="gap-2" onClick={() => navigate("/products")}>
                <ShoppingCart className="w-4 h-4" />
                Voir Stock
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des ventes */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Ventes (7 Derniers Jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData.length > 0 ? salesData : [{ date: "Aucune donnée", ventes: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value: number) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => formatNumber(value)}
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
          )}

          {/* Top 5 Produits */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produits les Plus Vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductsData.length > 0 ? topProductsData : [{ name: "Aucune donnée", ventes: 0 }]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value: number) => formatNumber(value)}
                    />
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
                      formatter={(value: number) => formatNumber(value)}
                    />
                    <Bar dataKey="ventes" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Répartition des Dépenses */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Dépenses par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesData.length > 0 ? expensesData : [{ name: "Aucune donnée", value: 0, color: "hsl(var(--muted))" }]}
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
                      {(expensesData.length > 0 ? expensesData : [{ color: "hsl(var(--muted))" }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Créances Clients */}
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Créances en Attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {totalDue > 0 ? (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">Total des créances</p>
                      <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDue)}</p>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">Aucune créance en attente</p>
                  )}
                  <Button variant="outline" className="w-full">
                    Voir Tout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
};

export default Dashboard;
