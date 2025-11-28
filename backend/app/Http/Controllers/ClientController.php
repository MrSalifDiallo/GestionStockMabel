<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::with('sales');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('phone', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->has('with_due') && $request->with_due == 'true') {
            $query->whereHas('sales', function($q) {
                $q->where('amount_due', '>', 0);
            });
        }

        $perPage = $request->get('per_page', 20);
        $clients = $query->orderBy('name')->paginate($perPage);

        // Ajouter les attributs calculés
        $clients->getCollection()->each(function($client) {
            $client->total_orders = $client->total_purchased;
            $client->total_paid = $client->total_paid;
            $client->total_due = $client->total_due;
            $client->last_purchase = $client->sales()->latest('sale_date')->first()?->sale_date;
        });

        return response()->json($clients);
    }

    public function show(Client $client)
    {
        $client->load('sales.items.product');
        $client->total_orders = $client->total_purchased;
        $client->total_paid = $client->total_paid;
        $client->total_due = $client->total_due;
        $client->last_purchase = $client->sales()->latest('sale_date')->first()?->sale_date;
        
        return response()->json($client);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'measurements' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'measurements' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        // Vérifier si le client a des ventes
        if ($client->sales()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer ce client car il a des ventes associées'
            ], 422);
        }

        $client->delete();

        return response()->json(null, 204);
    }

    public function addPayment(Request $request, Client $client)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $paymentAmount = (float) $validated['amount'];
        
        // Calculer le total dû du client
        $totalDue = (float) $client->total_due;
        
        // Vérifier que le montant ne dépasse pas le total dû
        if ($paymentAmount > $totalDue) {
            return response()->json([
                'message' => 'Le montant ne peut pas dépasser le total dû',
                'total_due' => $totalDue,
            ], 422);
        }

        // Récupérer toutes les ventes impayées du client, triées par date
        $unpaidSales = $client->sales()
            ->where('amount_due', '>', 0)
            ->orderBy('sale_date', 'asc')
            ->get();

        $remainingPayment = $paymentAmount;

        // Distribuer le paiement sur les ventes impayées
        foreach ($unpaidSales as $sale) {
            if ($remainingPayment <= 0) {
                break;
            }

            $saleAmountDue = (float) $sale->amount_due;
            $paymentForThisSale = min($remainingPayment, $saleAmountDue);

            $newAmountPaid = (float) $sale->amount_paid + $paymentForThisSale;
            $newAmountDue = max(0, (float) $sale->total - $newAmountPaid);

            $paymentStatus = $newAmountDue <= 0 ? 'paid' 
                            : ($newAmountPaid > 0 ? 'partial' : 'pending');

            $sale->update([
                'amount_paid' => $newAmountPaid,
                'amount_due' => $newAmountDue,
                'payment_status' => $paymentStatus,
            ]);

            $remainingPayment -= $paymentForThisSale;
        }

        // Rafraîchir le client avec les nouvelles données
        $client->load('sales');
        $client->total_orders = $client->total_purchased;
        $client->total_paid = $client->total_paid;
        $client->total_due = $client->total_due;

        return response()->json([
            'message' => 'Paiement enregistré avec succès',
            'client' => $client,
            'payment_amount' => $paymentAmount,
        ]);
    }
}
