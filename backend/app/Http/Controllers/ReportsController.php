<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Expense;
use App\Models\SaleItem;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'month'); // week, month, year, custom
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        // Calculer les dates selon la période
        [$startDate, $endDate] = $this->getDateRange($period, $dateFrom, $dateTo);

        // Ventes
        $sales = Sale::whereBetween('sale_date', [$startDate, $endDate])->get();
        $totalSales = $sales->sum('total');
        $totalBenefits = $sales->sum('total'); // Simplifié, devrait être total - coût des produits
        $totalExpenses = Expense::whereBetween('expense_date', [$startDate, $endDate])->sum('amount');
        $netProfit = $totalBenefits - $totalExpenses;
        $profitMargin = $totalSales > 0 ? ($netProfit / $totalSales) * 100 : 0;

        // Évolution des ventes par jour - garder la date originale pour le matching
        $salesByDayRaw = Sale::whereBetween('sale_date', [$startDate, $endDate])
            ->selectRaw('DATE(sale_date) as date, SUM(total) as ventes')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Ajouter les dépenses par jour
        $expensesByDay = Expense::whereBetween('expense_date', [$startDate, $endDate])
            ->selectRaw('DATE(expense_date) as date, SUM(amount) as depenses')
            ->groupBy('date')
            ->get()
            ->keyBy(function ($item) {
                return $item->date; // Garder le format DATE() de MySQL
            });

        // Fusionner les données
        $salesTrend = $salesByDayRaw->map(function ($item) use ($expensesByDay) {
            $dateKey = $item->date; // Format YYYY-MM-DD de MySQL
            $depenses = isset($expensesByDay[$dateKey]) ? (float) $expensesByDay[$dateKey]->depenses : 0;
            $ventes = (float) $item->ventes;
            
            return [
                'date' => Carbon::parse($item->date)->format('d M'),
                'ventes' => $ventes,
                'benefices' => $ventes - $depenses, // Bénéfices = ventes - dépenses
                'depenses' => $depenses,
            ];
        });

        // Top produits par revenus
        $topProductsRevenue = SaleItem::with('product')
            ->whereHas('sale', function ($query) use ($startDate, $endDate) {
                $query->whereBetween('sale_date', [$startDate, $endDate]);
            })
            ->select('product_id')
            ->selectRaw('SUM(line_total) as revenue, SUM(quantity) as quantity')
            ->groupBy('product_id')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->product ? $item->product->name : 'Produit inconnu',
                    'revenue' => (float) $item->revenue,
                    'quantity' => (int) $item->quantity,
                ];
            });

        // Créances en attente
        $dueAmounts = Sale::where('amount_due', '>', 0)
            ->with('client')
            ->orderBy('sale_date', 'asc')
            ->get()
            ->map(function ($sale) {
                $daysSince = (int) round(Carbon::parse($sale->sale_date)->diffInDays(now()));
                return [
                    'client' => $sale->client ? $sale->client->name : $sale->client_name,
                    'montant' => (float) $sale->amount_due,
                    'jours' => $daysSince,
                    'urgent' => $daysSince > 10,
                ];
            });

        return response()->json([
            'period' => $period,
            'date_from' => $startDate->format('Y-m-d'),
            'date_to' => $endDate->format('Y-m-d'),
            'stats' => [
                'total_sales' => (float) $totalSales,
                'total_benefits' => (float) $totalBenefits,
                'total_expenses' => (float) $totalExpenses,
                'net_profit' => (float) $netProfit,
                'profit_margin' => round($profitMargin, 2),
            ],
            'sales_trend' => $salesTrend->values(),
            'top_products_revenue' => $topProductsRevenue,
            'due_amounts' => $dueAmounts,
        ]);
    }

    private function getDateRange($period, $dateFrom = null, $dateTo = null)
    {
        if ($period === 'custom' && $dateFrom && $dateTo) {
            return [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay(),
            ];
        }

        $now = Carbon::now();
        
        switch ($period) {
            case 'week':
                return [
                    $now->copy()->startOfWeek(),
                    $now->copy()->endOfWeek(),
                ];
            case 'month':
                return [
                    $now->copy()->startOfMonth(),
                    $now->copy()->endOfMonth(),
                ];
            case 'year':
                return [
                    $now->copy()->startOfYear(),
                    $now->copy()->endOfYear(),
                ];
            default:
                return [
                    $now->copy()->startOfMonth(),
                    $now->copy()->endOfMonth(),
                ];
        }
    }
}

