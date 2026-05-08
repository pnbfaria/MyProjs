# ============================================
# Watson Orchestrate - AI Act Agent Chat
# ============================================
# Usage: powershell -ExecutionPolicy Bypass -File watson_chat.ps1
#        powershell -ExecutionPolicy Bypass -File watson_chat.ps1 -Question "your question here"
# ============================================

param(
    [string]$Question = "what is the ai-act?"
)

$apiKey     = "azE6dXNyXzEzNjVjZmM3LTU5NDgtM2ZlZi04MWYwLWIwOWY1NjViYzBhNDpRRWZZczIwWUdMTUJjTUtuU042QTdCZlNlS25DdEFoT3FLMGZNSTF1M0hjPTo1U0FX"
$instanceId = "20260216-2004-4534-10df-912f4874562d"
$agentId    = "3fdfb89a-7859-42b6-8f41-a0839adb05eb"
$baseUrl    = "https://api.eu-central-1.dl.watson-orchestrate.ibm.com"

# Step 1: Exchange API key for Bearer token
Write-Host "Authenticating..." -ForegroundColor Cyan
$tokenBody = @{ apikey = $apiKey } | ConvertTo-Json -Compress
$tokenResp = Invoke-RestMethod `
    -Uri "https://iam.platform.saas.ibm.com/siusermgr/api/1.0/apikeys/token" `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body $tokenBody

$token = $tokenResp.token
Write-Host "Authenticated. Token expires in $($tokenResp.expires_in)s" -ForegroundColor Green

# Step 2: Call the chat completions endpoint
Write-Host ""
Write-Host "Question: $Question" -ForegroundColor Yellow
Write-Host "Waiting for response..." -ForegroundColor Cyan
Write-Host ""

$chatBody = @{
    messages = @(@{ role = "user"; content = $Question })
    stream   = $false
} | ConvertTo-Json -Compress

$chatResp = Invoke-RestMethod `
    -Uri "$baseUrl/instances/$instanceId/v1/orchestrate/$agentId/chat/completions" `
    -Method POST `
    -Headers @{
        "Content-Type"  = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $chatBody `
    -TimeoutSec 120

# Step 3: Display the response
$answer = $chatResp.choices[0].message.content
Write-Host "=== AI Act Agent Response ===" -ForegroundColor Green
Write-Host $answer
Write-Host ""
Write-Host "Model: $($chatResp.model) | Thread: $($chatResp.thread_id)" -ForegroundColor DarkGray
