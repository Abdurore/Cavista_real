<?php

use App\Http\Controllers\Api\RiskAnalysisController;
use Illuminate\Support\Facades\Route;

// Test route to check if API is working
Route::get('/test', function() {
    return response()->json([
        'status' => 'success',
        'message' => 'API is working!',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Health check
Route::get('/health', function() {
    return response()->json(['healthy' => true]);
});

// Analysis routes
Route::post('/analyze/adult', [RiskAnalysisController::class, 'analyzeAdult']);
Route::post('/analyze/pregnant', [RiskAnalysisController::class, 'analyzePregnant']);
