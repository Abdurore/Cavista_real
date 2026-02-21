$envFile = ".env"
Add-Type -AssemblyName System.Net.Http

if (!(Test-Path $envFile)) {
  Write-Error "Missing .env file in frontend/Prevent_AI."
  exit 1
}

$line = Get-Content $envFile | Where-Object { $_ -match '^VITE_GROK_API_KEY=' } | Select-Object -First 1
if (-not $line) {
  Write-Error "Missing VITE_GROK_API_KEY in .env."
  exit 1
}

$apiKey = $line -replace '^VITE_GROK_API_KEY=', ''
if ([string]::IsNullOrWhiteSpace($apiKey)) {
  Write-Error "VITE_GROK_API_KEY is empty."
  exit 1
}

try {
  $client = New-Object System.Net.Http.HttpClient
  $client.DefaultRequestHeaders.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", $apiKey)

  $httpResponse = $client.GetAsync("https://api.x.ai/v1/models").Result
  $responseBody = $httpResponse.Content.ReadAsStringAsync().Result

  if (-not $httpResponse.IsSuccessStatusCode) {
    Write-Error "xAI request failed ($([int]$httpResponse.StatusCode) $($httpResponse.ReasonPhrase)).`n$responseBody"
    exit 1
  }

  $response = $responseBody | ConvertFrom-Json
  $models = $response.data | Select-Object -ExpandProperty id
  if (-not $models) {
    Write-Output "No models returned."
    exit 0
  }

  Write-Output "Accessible xAI models:"
  $models | ForEach-Object { Write-Output " - $_" }
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
