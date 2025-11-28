<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all settings
     */
    public function index()
    {
        $settings = Setting::getAll();
        return response()->json($settings);
    }

    /**
     * Get a specific setting by key
     */
    public function show(string $key)
    {
        $value = Setting::get($key);
        
        if ($value === null) {
            return response()->json([
                'message' => 'Setting not found'
            ], 404);
        }

        return response()->json([
            'key' => $key,
            'value' => $value,
        ]);
    }

    /**
     * Update settings (bulk or single)
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required',
            'settings.*.type' => 'sometimes|string|in:string,boolean,integer,decimal,float,array,json',
        ]);

        foreach ($validated['settings'] as $settingData) {
            Setting::set(
                $settingData['key'],
                $settingData['value'],
                $settingData['type'] ?? 'string'
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => Setting::getAll(),
        ]);
    }

    /**
     * Get discount settings specifically
     */
    public function getDiscountSettings()
    {
        return response()->json([
            'auto_discount_enabled' => Setting::get('auto_discount_enabled', true),
            'discount_tier_1_qty' => Setting::get('discount_tier_1_qty', 6),
            'discount_tier_1_percent' => Setting::get('discount_tier_1_percent', 5),
            'discount_tier_2_qty' => Setting::get('discount_tier_2_qty', 10),
            'discount_tier_2_percent' => Setting::get('discount_tier_2_percent', 10),
        ]);
    }

    /**
     * Update discount settings
     */
    public function updateDiscountSettings(Request $request)
    {
        $validated = $request->validate([
            'auto_discount_enabled' => 'required|boolean',
            'discount_tier_1_qty' => 'required|integer|min:1',
            'discount_tier_1_percent' => 'required|numeric|min:0|max:100',
            'discount_tier_2_qty' => 'required|integer|min:1',
            'discount_tier_2_percent' => 'required|numeric|min:0|max:100',
        ]);

        // Vérifier que tier 2 >= tier 1
        if ($validated['discount_tier_2_qty'] < $validated['discount_tier_1_qty']) {
            return response()->json([
                'message' => 'La quantité du niveau 2 doit être supérieure ou égale au niveau 1',
            ], 422);
        }

        Setting::set('auto_discount_enabled', $validated['auto_discount_enabled'], 'boolean');
        Setting::set('discount_tier_1_qty', $validated['discount_tier_1_qty'], 'integer');
        Setting::set('discount_tier_1_percent', $validated['discount_tier_1_percent'], 'decimal');
        Setting::set('discount_tier_2_qty', $validated['discount_tier_2_qty'], 'integer');
        Setting::set('discount_tier_2_percent', $validated['discount_tier_2_percent'], 'decimal');

        return response()->json([
            'message' => 'Paramètres de remise mis à jour avec succès',
            'settings' => [
                'auto_discount_enabled' => Setting::get('auto_discount_enabled'),
                'discount_tier_1_qty' => Setting::get('discount_tier_1_qty'),
                'discount_tier_1_percent' => Setting::get('discount_tier_1_percent'),
                'discount_tier_2_qty' => Setting::get('discount_tier_2_qty'),
                'discount_tier_2_percent' => Setting::get('discount_tier_2_percent'),
            ],
        ]);
    }
}
