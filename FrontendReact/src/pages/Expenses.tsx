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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ExportColumn, exportToExcel, exportToPDF } from "@/lib/utils.export";
import { formatCurrency } from "@/lib/utils.format";
import { fetchExpenseCategories } from "@/services/services.expenseCategories";
import { createExpense, deleteExpense, Expense, fetchExpenses, updateExpense } from "@/services/services.expenses";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Edit, FileText, Plus, Trash2, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

const categoryColors = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted))",
];

const Expenses = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<"PDF" | "Excel">("PDF");
  const [exportComplete, setExportComplete] = useState(false);
  const [exportCancelled, setExportCancelled] = useState(false);

  // Récupérer les catégories
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
  });

  // Récupérer les dépenses avec filtres
  const { data: expensesResponse, isLoading } = useQuery({
    queryKey: ['expenses', filterCategory],
    queryFn: () => fetchExpenses({
      category: filterCategory !== 'all' ? parseInt(filterCategory) : undefined,
    }),
  });

  const allExpenses = expensesResponse?.data || [];

  // Filtrer les dépenses localement (par catégorie si nécessaire)
  const filteredExpenses = useMemo(() => {
    let filtered = [...allExpenses];
    
    // Le filtre par catégorie est déjà fait côté API, mais on peut ajouter d'autres filtres ici
    return filtered;
  }, [allExpenses]);

  // Paginer les dépenses filtrées
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredExpenses.slice(start, end);
  }, [filteredExpenses, currentPage, perPage]);

  // Réinitialiser à la page 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory]);

  const totalPages = Math.ceil(filteredExpenses.length / perPage);

  // Mutation pour créer une dépense
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Dépense enregistrée avec succès !");
      setSelectedCategory("");
      setAmount("");
      setReference("");
      setDescription("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la dépense");
    },
  });

  // Mutation pour mettre à jour une dépense
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Dépense modifiée avec succès !");
      setIsEditDialogOpen(false);
      setEditingExpense(null);
      resetEditForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la modification");
    },
  });

  // Mutation pour supprimer une dépense
  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Dépense supprimée avec succès !");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const resetEditForm = () => {
    setAmount("");
    setDescription("");
    setReference("");
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setSelectedCategory("");
  };

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

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount);
    setDescription(expense.description || "");
    setReference(expense.reference || "");
    setExpenseDate(expense.expense_date);
    setSelectedCategory(expense.category_id.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    if (!editingExpense) return;

    updateMutation.mutate({
      id: editingExpense.id,
      data: {
        amount: parseFloat(amount),
        description: description || undefined,
      },
    });
  };

  const handleSave = () => {
    if (!selectedCategory) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    createMutation.mutate({
      category_id: parseInt(selectedCategory),
      amount: parseFloat(amount),
      expense_date: expenseDate,
      description: description || undefined,
      reference: reference || undefined,
    });
  };

  const handleDelete = (id: number) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Calculs (utiliser allExpenses pour les statistiques complètes)
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const todayExpenses = allExpenses
    .filter((exp) => new Date(exp.expense_date).toDateString() === new Date().toDateString())
    .reduce((sum, exp) => sum + Number(exp.amount), 0);

  const expensesByCategory = useMemo(() => {
    const grouped = allExpenses.reduce((acc, exp) => {
      const catName = exp.category?.name || "Non catégorisé";
      if (!acc[catName]) {
        acc[catName] = 0;
      }
      acc[catName] += Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value], index) => ({
      name,
      value,
      color: categoryColors[index % categoryColors.length],
    }));
  }, [allExpenses]);

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground">Gestion des Dépenses</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
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
                      <p className="text-sm text-muted-foreground">Dépenses du Jour</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(todayExpenses)}
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
                        {formatCurrency(totalExpenses)}
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
            </>
          )}
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
                      <Combobox
                        options={categories.map((cat) => ({
                          value: cat.id.toString(),
                          label: cat.name,
                        }))}
                        value={selectedCategory || ""}
                        onValueChange={setSelectedCategory}
                        placeholder="Sélectionner une catégorie"
                        searchPlaceholder="Rechercher une catégorie..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Montant (FCFA) *</Label>
                      <Input 
                        type="number" 
                        placeholder="50000" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input 
                        type="date" 
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Référence / N° Facture</Label>
                      <Input 
                        placeholder="Ex: FACT-2025-001" 
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description / Notes</Label>
                    <Textarea 
                      placeholder="Détails de la dépense..." 
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSave} 
                      className="gap-2"
                      disabled={createMutation.isPending}
                    >
                      <Plus className="w-4 h-4" />
                      {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
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
                    <Select value={filterCategory || "all"} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id.toString()} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
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
                              { header: "Date", accessor: (exp) => new Date(exp.expense_date).toLocaleDateString("fr-FR") },
                              { header: "Catégorie", accessor: (exp) => exp.category?.name || "Non catégorisé" },
                              { header: "Montant", accessor: (exp) => formatCurrency(exp.amount) },
                              { header: "Description", accessor: (exp) => exp.description || "-" },
                            ];
                            exportToPDF({
                              title: "Historique des Dépenses",
                              columns,
                              data: filteredExpenses,
                            });
                            toast.success("Dépenses exportées en PDF avec succès");
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
                              { header: "Date", accessor: (exp) => new Date(exp.expense_date).toLocaleDateString("fr-FR") },
                              { header: "Catégorie", accessor: (exp) => exp.category?.name || "Non catégorisé" },
                              { header: "Montant", accessor: (exp) => formatCurrency(exp.amount) },
                              { header: "Description", accessor: (exp) => exp.description || "-" },
                            ];
                            exportToExcel({
                              title: "Historique des Dépenses",
                              columns,
                              data: filteredExpenses,
                            });
                            toast.success("Dépenses exportées en Excel avec succès");
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
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucune dépense trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedExpenses.map((expense) => {
                        const categoryIndex = categories.findIndex(c => c.id === expense.category_id);
                        const color = categoryIndex >= 0 ? categoryColors[categoryIndex % categoryColors.length] : "hsl(var(--muted))";
                        return (
                          <TableRow key={expense.id}>
                            <TableCell>
                              {new Date(expense.expense_date).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell>
                              <Badge
                                style={{
                                  backgroundColor: color,
                                  color: "white",
                                }}
                              >
                                {expense.category?.name || "Non catégorisé"}
                              </Badge>
                            </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {expense.description || "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenEdit(expense)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDelete(expense.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                {filteredExpenses.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      lastPage={totalPages}
                      perPage={perPage}
                      total={filteredExpenses.length}
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
                        data={expensesByCategory.length > 0 ? expensesByCategory : [{ name: "Aucune donnée", value: 0, color: "hsl(var(--muted))" }]}
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
                            {formatCurrency(item.value)}
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
                            <span className="font-semibold">{formatCurrency(value)}</span>
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
                            <span className="font-semibold">{formatCurrency(value)}</span>
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la Dépense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Montant (FCFA) *</Label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Détails de la dépense..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleUpdate}
                  className="flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Modification..." : "Modifier"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingExpense(null);
                    resetEditForm();
                  }}
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
                Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
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
                  : `Génération de vos dépenses ${exportType}. Veuillez patienter...`}
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

export default Expenses;
