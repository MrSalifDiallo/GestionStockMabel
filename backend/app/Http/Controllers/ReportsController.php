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

        // Créer un tableau de toutes les dates dans la plage pour avoir des données complètes
        // Mais ne pas dépasser la date actuelle
        $allDates = [];
        $currentDate = $startDate->copy();
        $today = Carbon::now();
        
        while ($currentDate->lte($endDate) && $currentDate->lte($today)) {
            $dateKey = $currentDate->format('Y-m-d');
            $allDates[$dateKey] = [
                'date' => $currentDate->format('d M'),
                'ventes' => 0,
                'benefices' => 0,
                'depenses' => 0,
            ];
            $currentDate->addDay();
        }

        // Remplir avec les données réelles
        foreach ($salesByDayRaw as $item) {
            $dateKey = $item->date;
            if (isset($allDates[$dateKey])) {
                $allDates[$dateKey]['ventes'] = (float) $item->ventes;
            }
        }

        foreach ($expensesByDay as $dateKey => $item) {
            if (isset($allDates[$dateKey])) {
                $allDates[$dateKey]['depenses'] = (float) $item->depenses;
            }
        }

        // Calculer les bénéfices et convertir en collection
        $salesTrend = collect($allDates)->map(function ($item) {
            return [
                'date' => $item['date'],
                'ventes' => $item['ventes'],
                'benefices' => $item['ventes'] - $item['depenses'],
                'depenses' => $item['depenses'],
            ];
        })->values();

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
        $now = Carbon::now();
        
        if ($period === 'custom' && $dateFrom && $dateTo) {
            $endDate = Carbon::parse($dateTo);
            // Ne pas dépasser la date actuelle
            if ($endDate->isFuture()) {
                $endDate = $now->copy();
            }
            return [
                Carbon::parse($dateFrom)->startOfDay(),
                $endDate->endOfDay(),
            ];
        }
        
        switch ($period) {
            case 'week':
                $endDate = $now->copy()->endOfWeek();
                // Ne pas dépasser la date actuelle
                if ($endDate->isFuture()) {
                    $endDate = $now->copy();
                }
                return [
                    $now->copy()->startOfWeek(),
                    $endDate,
                ];
            case 'month':
                $endDate = $now->copy()->endOfMonth();
                // Ne pas dépasser la date actuelle
                if ($endDate->isFuture()) {
                    $endDate = $now->copy();
                }
                return [
                    $now->copy()->startOfMonth(),
                    $endDate,
                ];
            case 'year':
                $endDate = $now->copy()->endOfYear();
                // Ne pas dépasser la date actuelle
                if ($endDate->isFuture()) {
                    $endDate = $now->copy();
                }
                return [
                    $now->copy()->startOfYear(),
                    $endDate,
                ];
            default:
                $endDate = $now->copy()->endOfMonth();
                // Ne pas dépasser la date actuelle
                if ($endDate->isFuture()) {
                    $endDate = $now->copy();
                }
                return [
                    $now->copy()->startOfMonth(),
                    $endDate,
                ];
        }
    }
}

