<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    protected $apiKey;
    protected $model;
    
    public function __construct()
    {
        $this->apiKey = env('GROQ_API_KEY');
        $this->model = env('GROQ_MODEL', 'llama-3.1-8b-instant');
    }
    
    public function analyzeHealthData($data)
    {
        try {
            $prompt = "Assess adult health risk from this data:\n" .
                json_encode($data) . "\n" .
                "Return JSON with keys: risk_score (0-100 number), risk_level (Low|Moderate|High), risk_factors (array of short strings), recommendations (array of short actionable strings).";

            return $this->callGroq($prompt);
        } catch (\Exception $e) {
            Log::error('Groq API error: ' . $e->getMessage());
            
            return $this->ruleBasedFallback($data);
        }
    }

    public function analyzePregnancyData($data)
    {
        try {
            $prompt = "Assess maternal health risk from this pregnancy data:\n" .
                json_encode($data) . "\n" .
                "Return JSON with keys: risk_score (0-100 number), risk_level (Low|Moderate|High), risk_factors (array of short strings), recommendations (array of short actionable strings).";

            return $this->callGroq($prompt);
        } catch (\Exception $e) {
            Log::error('Groq API error (pregnancy): ' . $e->getMessage());

            return $this->pregnancyFallback($data);
        }
    }

    private function callGroq($prompt)
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Missing GROQ_API_KEY');
        }

        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->connectTimeout(10)
            ->timeout(30)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
            'model' => $this->model,
            'temperature' => 0.2,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a clinical risk assistant. Output ONLY valid JSON.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ]
        ]);

        if (!$response->successful()) {
            throw new \Exception('Groq request failed with status ' . $response->status());
        }

        $content = data_get($response->json(), 'choices.0.message.content', '');
        $parsed = $this->extractJsonPayload($content);

        if (!is_array($parsed)) {
            throw new \Exception('Groq response did not contain parseable JSON payload');
        }

        $score = (int) ($parsed['risk_score'] ?? 0);
        $score = max(0, min(100, $score));

        $level = $parsed['risk_level'] ?? null;
        if (!in_array($level, ['Low', 'Moderate', 'High'], true)) {
            $level = $score >= 60 ? 'High' : ($score >= 30 ? 'Moderate' : 'Low');
        }

        $risks = $parsed['risk_factors'] ?? [];
        if (!is_array($risks) || empty($risks)) {
            $risks = ['No specific risks detected'];
        }

        $advice = $parsed['recommendations'] ?? [];
        if (!is_array($advice) || empty($advice)) {
            $advice = ['Maintain healthy lifestyle'];
        }

        Log::info('Groq API call succeeded', [
            'status' => $response->status(),
            'model' => $this->model
        ]);

        return [
            'score' => $score,
            'level' => $level,
            'risks' => $risks,
            'advice' => $advice,
            'source' => 'ai',
            'model' => $this->model
        ];
    }

    private function extractJsonPayload($content)
    {
        if (!is_string($content) || trim($content) === '') {
            return null;
        }

        $clean = trim($content);
        $clean = preg_replace('/^```json\s*/i', '', $clean);
        $clean = preg_replace('/^```\s*/', '', $clean);
        $clean = preg_replace('/\s*```$/', '', $clean);

        $decoded = json_decode($clean, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        return null;
    }
    
    private function ruleBasedFallback($data)
    {
        $age = (float) ($data['age'] ?? 0);
        $weight = (float) ($data['weight'] ?? 0);
        $height = max(1.0, (float) ($data['height'] ?? 1));
        $bloodPressure = (float) ($data['bloodPressure'] ?? 0);

        $bmi = $weight / (($height / 100) ** 2);
        $score = 5;
        $risks = [];
        $advice = [];

        if ($bmi >= 30) {
            $score += 30;
            $risks[] = 'BMI in obese range';
            $advice[] = 'Aim for gradual weight loss with a balanced calorie deficit';
        } elseif ($bmi >= 25) {
            $score += 18;
            $risks[] = 'BMI in overweight range';
            $advice[] = 'Increase weekly activity and improve meal quality';
        }

        if ($bloodPressure >= 140) {
            $score += 30;
            $risks[] = 'Systolic blood pressure is high';
            $advice[] = 'Check blood pressure regularly and reduce sodium intake';
        } elseif ($bloodPressure >= 130) {
            $score += 18;
            $risks[] = 'Systolic blood pressure is elevated';
            $advice[] = 'Prioritize daily movement and stress management';
        }

        if ($age >= 60) {
            $score += 18;
            $risks[] = 'Age-related cardiovascular risk';
            $advice[] = 'Schedule regular preventive checkups';
        } elseif ($age >= 45) {
            $score += 10;
            $risks[] = 'Midlife metabolic risk considerations';
            $advice[] = 'Monitor blood sugar and lipids routinely';
        }

        $score = max(0, min(100, $score));
        $level = $score >= 60 ? 'High' : ($score >= 30 ? 'Moderate' : 'Low');

        if (empty($risks)) {
            $risks[] = 'No high-priority risk patterns detected';
        }
        if (empty($advice)) {
            $advice[] = 'Maintain healthy lifestyle';
        }

        return [
            'score' => $score,
            'level' => $level,
            'risks' => array_values(array_unique($risks)),
            'advice' => array_values(array_unique($advice)),
            'source' => 'fallback',
            'model' => 'rule-based-v2'
        ];
    }

    private function pregnancyFallback($data)
    {
        $age = (float) ($data['age'] ?? 0);
        $weight = (float) ($data['weight'] ?? 0);
        $weeks = (float) ($data['weeks'] ?? 0);

        $score = 8;
        $risks = [];
        $advice = [];

        if ($age >= 35) {
            $score += 18;
            $risks[] = 'Advanced maternal age';
            $advice[] = 'Follow high-risk prenatal screening schedule';
        }

        if ($weeks < 12) {
            $score += 8;
            $risks[] = 'Early pregnancy requires close symptom monitoring';
            $advice[] = 'Keep regular first-trimester prenatal visits';
        } elseif ($weeks >= 28) {
            $score += 10;
            $risks[] = 'Third trimester monitoring needed';
            $advice[] = 'Track fetal movement and blood pressure regularly';
        }

        if ($weight >= 95) {
            $score += 14;
            $risks[] = 'Higher weight may increase pregnancy complications';
            $advice[] = 'Work with your clinician on nutrition and activity plan';
        }

        $score = max(0, min(100, $score));
        $level = $score >= 60 ? 'High' : ($score >= 30 ? 'Moderate' : 'Low');

        if (empty($risks)) {
            $risks[] = 'No high-priority maternal risk patterns detected';
        }
        if (empty($advice)) {
            $advice[] = 'Continue routine prenatal care';
        }

        return [
            'score' => $score,
            'level' => $level,
            'risks' => array_values(array_unique($risks)),
            'advice' => array_values(array_unique($advice)),
            'source' => 'fallback',
            'model' => 'rule-based-pregnancy-v1'
        ];
    }
}
