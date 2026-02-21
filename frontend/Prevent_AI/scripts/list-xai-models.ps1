$envFile = ".env"

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
  $response = Invoke-RestMethod -Method GET -Uri "https://api.x.ai/v1/models" -Headers @{
    Authorization = "Bearer $apiKey"
  }

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
