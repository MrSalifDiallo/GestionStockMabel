<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request) {
        $query = Client::query();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
        }
        if ($request->has('has_due')) {
            $query->whereRaw('(SELECT SUM(amount_due) FROM sales WHERE client_id = clients.id) > 0');
        }

        return response()->json($query->get());
    }

    public function show(Client $client) {
        return response()->json($client->load('sales'));
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|string',
            'phone' => 'nullable|string',
            'email' => 'nullable|email|unique:clients',
            'address' => 'nullable|string',
            'measurements' => 'nullable|string',
        ]);

        $client = Client::create($validated);
        return response()->json($client, 201);
    }

    public function update(Request $request, Client $client) {
        $validated = $request->validate([
            'name' => 'string',
            'phone' => 'string',
            'address' => 'string',
            'measurements' => 'string',
        ]);

        $client->update($validated);
        return response()->json($client);
    }

    public function destroy(Client $client) {
        $client->delete();
        return response()->json(null, 204);
    }
}
