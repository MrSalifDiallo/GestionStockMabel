import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";
import { KPICardSkeleton } from "@/components/dashboard/KPICardSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportColumn, exportToExcel, exportToPDF } from "@/lib/utils.export";
import { formatCurrency, formatNumber } from "@/lib/utils.format";
import { fetchReports } from "@/services/services.reports";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, DollarSign, Download, FileText, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const Reports = () => {
  const [period, setPeriod] = useState<"week" | "month" | "year" | "custom">("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<"PDF" | "Excel">("PDF");
  const [exportComplete, setExportComplete] = useState(false);
  const [exportCancelled, setExportCancelled] = useState(false);

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['reports', period, dateFrom, dateTo],
    queryFn: () => fetchReports({
      period: period === 'custom' ? 'custom' : period,
      date_from: period === 'custom' ? dateFrom : undefined,
      date_to: period === 'custom' ? dateTo : undefined,
    }),
  });

  const totalSales = reportData?.stats?.total_sales ?? 0;
  const totalBenefits = reportData?.stats?.total_benefits ?? 0;
  const totalExpenses = reportData?.stats?.total_expenses ?? 0;
  const netProfit = reportData?.stats?.net_profit ?? 0;
  const profitMargin = reportData?.stats?.profit_margin ?? 0;
  const salesTrendData = reportData?.sales_trend ?? [];
  const topProductsRevenue = reportData?.top_products_revenue ?? [];
  const dueAmounts = reportData?.due_amounts ?? [];

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
        
        // Exécuter l'export réel
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

  const handleExportPDF = () => {
    setExportType("PDF");
    setExportDialogOpen(true);
    
    simulateProgress(() => {
      try {
        const columns: ExportColumn[] = [
          { header: "Métrique", accessor: "metric" },
          { header: "Valeur", accessor: "value" },
        ];

        const data = [
          { metric: "Ventes Totales", value: formatCurrency(totalSales) },
          { metric: "Bénéfice Total", value: formatCurrency(totalBenefits) },
          { metric: "Dépenses Totales", value: formatCurrency(totalExpenses) },
          { metric: "Profit Net", value: formatCurrency(netProfit) },
          { metric: "Marge de Profit", value: `${profitMargin}%` },
        ];

        exportToPDF({ title: "Rapport Financier", columns, data });
        toast.success("Rapport exporté en PDF avec succès");
      } catch (error) {
        toast.error("Erreur lors de l'export PDF");
        console.error(error);
      }
    });
  };

  const handleExportExcel = () => {
    setExportType("Excel");
    setExportDialogOpen(true);
    
    simulateProgress(() => {
      try {
        const columns: ExportColumn[] = [
          { header: "Métrique", accessor: "metric" },
          { header: "Valeur", accessor: "value" },
        ];

        const data = [
          { metric: "Ventes Totales", value: totalSales },
          { metric: "Bénéfice Total", value: totalBenefits },
          { metric: "Dépenses Totales", value: totalExpenses },
          { metric: "Profit Net", value: netProfit },
          { metric: "Marge de Profit (%)", value: profitMargin },
        ];

        exportToExcel({ title: "Rapport Financier", columns, data });
        toast.success("Rapport exporté en Excel avec succès");
      } catch (error) {
        toast.error("Erreur lors de l'export Excel");
        console.error(error);
      }
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Rapports & Analytics</h2>
          <div className="flex gap-2">
            <Select value={period || "month"} onValueChange={(value: "week" | "month" | "year" | "custom") => setPeriod(value)}>
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
            {period === 'custom' && (
              <>
                <div className="flex items-center gap-2">
                  <Label htmlFor="date-from" className="text-sm">De</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="date-to" className="text-sm">À</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-40"
                  />
                </div>
              </>
            )}
            <Button variant="outline" className="gap-2" onClick={handleExportPDF} disabled={exportDialogOpen || isLoading}>
              <Download className="w-4 h-4" />
              Exporter PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportExcel} disabled={exportDialogOpen || isLoading}>
              <FileText className="w-4 h-4" />
              Exporter Excel
            </Button>
          </div>
        </div>

        {/* KPI Globaux */}
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
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ventes Totales</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalSales)}
                      </p>
                      <p className="text-xs text-success mt-1">Période sélectionnée</p>
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
                        {formatCurrency(totalBenefits)}
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
                        {formatCurrency(totalExpenses)}
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
                        {formatCurrency(netProfit)}
                      </p>
                      <p className="text-xs text-success mt-1">Marge: {profitMargin.toFixed(1)}%</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">₦</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Graphiques principaux */}
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Évolution Financière</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesTrendData.length > 0 ? salesTrendData : [{ date: "Aucune donnée", ventes: 0, benefices: 0, depenses: 0 }]}>
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
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Produits par Revenu */}
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produits par Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topProductsRevenue.length > 0 ? topProductsRevenue : [{ name: "Aucune donnée", revenue: 0, quantity: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
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
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Tableau récapitulatif */}
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
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
                        {formatCurrency(totalSales)}
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
                        {formatCurrency(totalBenefits)}
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
                        {formatCurrency(totalExpenses)}
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
                        {formatCurrency(netProfit)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Marge nette: {profitMargin}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Créances & Statistiques */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Créances en Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dueAmounts.length > 0 ? (
                  dueAmounts.map((item, index) => (
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
                      {formatCurrency(item.montant)}
                    </p>
                  </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Aucune créance en attente</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de progression d'export */}
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
                : `Génération de votre rapport ${exportType}. Veuillez patienter...`}
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
    </>
  );
};

export default Reports;
