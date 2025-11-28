<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\Product;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request) 
    {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        // Stats avec Eloquent scopes ou where simples
        $salesToday = Sale::whereDate('sale_date', $today)->sum('total');
        $expensesToday = Expense::whereDate('expense_date', $today)->sum('amount');
        $benefitToday = $salesToday - $expensesToday;

        $salesMonth = Sale::where('sale_date', '>=', $thisMonth)->sum('total');
        $expensesMonth = Expense::where('expense_date', '>=', $thisMonth)->sum('amount');
        $benefitMonth = $salesMonth - $expensesMonth;

        $criticalStock = Product::whereColumn('stock', '<=', 'min_stock_alert')->count();
        $totalDue = Sale::sum('amount_due');

        // Relations Eloquent pour top products
        $topProductsQuery = SaleItem::with('product')
            ->select('product_id')
            ->selectRaw('SUM(quantity) as total_sold')
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->limit(5);
        
        $topProductsData = $topProductsQuery->get();
        $topProducts = [];
        foreach ($topProductsData as $item) {
            if ($item->product) {
                $topProducts[$item->product->name] = $item->total_sold;
            }
        }

        // Sales by day avec Eloquent - 7 derniers jours
        $salesByDay = Sale::where('sale_date', '>=', now()->subDays(7))
            ->selectRaw('DATE(sale_date) as date, SUM(total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => (string) $item->total,
                ];
            });

        // Expenses by category pour le graphique
        $expensesByCategory = Expense::with('category')
            ->where('expense_date', '>=', $thisMonth)
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->get()
            ->map(function ($expense) {
                return [
                    'name' => $expense->category ? $expense->category->name : 'Non catégorisé',
                    'value' => (float) $expense->total,
                ];
            });

        return response()->json([
            'stats' => [
                'sales_today' => (string) $salesToday,
                'expenses_today' => (string) $expensesToday,
                'benefit_today' => $benefitToday,
                'sales_month' => (string) $salesMonth,
                'expenses_month' => (string) $expensesMonth,
                'benefit_month' => $benefitMonth,
                'critical_stock' => $criticalStock,
                'total_due' => (string) $totalDue,
            ],
            'top_products' => $topProducts,
            'sales_by_day' => $salesByDay,
            'expenses_by_category' => $expensesByCategory,
        ]);
    }
}
