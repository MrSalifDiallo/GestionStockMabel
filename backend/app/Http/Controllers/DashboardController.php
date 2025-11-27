<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index() {
        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $salesToday = Sale::whereDate('sale_date', $today)->sum('total');
        $expensesToday = Expense::whereDate('expense_date', $today)->sum('amount');
        $benefitToday = $salesToday - $expensesToday;

        $salesMonth = Sale::where('sale_date', '>=', $thisMonth)->sum('total');
        $expensesMonth = Expense::where('expense_date', '>=', $thisMonth)->sum('amount');
        $benefitMonth = $salesMonth - $expensesMonth;

        $criticalStock = Product::whereRaw('stock <= min_stock_alert')->count();
        $totalDue = Sale::sum('amount_due');

        $topProducts = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(sale_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        $salesByDay = DB::table('sales')
            ->select(DB::raw('DATE(sale_date) as date'), DB::raw('SUM(total) as total'))
            ->where('sale_date', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $expensesByCategory = DB::table('expenses')
            ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->select('expense_categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->where('expenses.expense_date', '>=', $thisMonth)
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'stats' => [
                'sales_today' => $salesToday,
                'expenses_today' => $expensesToday,
                'benefit_today' => $benefitToday,
                'sales_month' => $salesMonth,
                'expenses_month' => $expensesMonth,
                'benefit_month' => $benefitMonth,
                'critical_stock' => $criticalStock,
                'total_due' => $totalDue,
            ],
            'top_products' => $topProducts,
            'sales_by_day' => $salesByDay,
            'expenses_by_category' => $expensesByCategory,
        ]);
    }
}
