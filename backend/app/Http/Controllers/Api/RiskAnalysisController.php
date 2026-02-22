<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GroqService;
use Illuminate\Http\Request;

class RiskAnalysisController extends Controller
{
    protected $aiService;
    
    public function __construct(GroqService $aiService)
    {
        $this->aiService = $aiService;
    }
    
    public function analyzeAdult(Request $request)
    {
        $data = $request->validate([
            'age' => 'required|numeric',
            'weight' => 'required|numeric',
            'height' => 'required|numeric',
            'bloodPressure' => 'required|numeric'
        ]);
        
        // Get AI analysis
        $aiResult = $this->aiService->analyzeHealthData($data);
        
        return response()->json([
            'success' => true,
            'risk_score' => $aiResult['score'],
            'risk_level' => $aiResult['level'],
            'risk_factors' => $aiResult['risks'] ?? [],
            'recommendations' => $aiResult['advice'] ?? [
                'Increase physical activity',
                'Monitor blood pressure'
            ],
            'ai_model' => $aiResult['model'] ?? 'groq',
            'analysis_source' => $aiResult['source'] ?? 'unknown'
        ]);
    }
    
    public function analyzePregnant(Request $request)
    {
        $data = $request->validate([
            'age' => 'required|numeric',
            'weight' => 'required|numeric',
            'weeks' => 'required|numeric'
        ]);

        $aiResult = $this->aiService->analyzePregnancyData($data);

        return response()->json([
            'success' => true,
            'risk_score' => $aiResult['score'],
            'risk_level' => $aiResult['level'],
            'risk_factors' => $aiResult['risks'] ?? [],
            'recommendations' => $aiResult['advice'] ?? [
                'Take prenatal vitamins',
                'Stay hydrated'
            ],
            'ai_model' => $aiResult['model'] ?? 'groq',
            'analysis_source' => $aiResult['source'] ?? 'unknown'
        ]);
    }
}
