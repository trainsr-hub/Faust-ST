#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Tests Faust's voice synthesis with configured parameters (AF_Bella, speed 0.84, pitch_shift -0.3)
.DESCRIPTION
    Sends a request to the Faust backend voice synthesis endpoint and plays the resulting audio.
    Default text: "Faust online. Awaiting your directive, Manager."
.PARAMETER Text
    The text to synthesize. If not provided, uses default Faust greeting.
.EXAMPLE
    .\test-faust-voice.ps1
    .\test-faust-voice.ps1 -Text "Testing Faust's vocal parameters"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Text = "Faust online. Awaiting your directive, Manager."
)

# Backend endpoint
$endpoint = "http://localhost:8080/api/v1/voice/tune"

# Voice parameters as configured for Faust
$payload = @{
    text = $Text
    voice = "af_bella"
    speed = 0.84
    language = "en-us"
    pitch_shift = -0.3
} | ConvertTo-Json -Depth 5

try {
    Write-Host "Synthesizing Faust's voice..." -ForegroundColor Cyan
    Write-Host "Text: $Text" -ForegroundColor Yellow
    Write-Host "Voice: af_bella | Speed: 0.84x | Pitch Shift: -0.3st" -ForegroundColor Yellow

    # Call the backend API
    $response = Invoke-WebRequest -Method Post -Uri $endpoint -ContentType "application/json" -Body $payload -UseBasicParsing

    # Save audio to temporary file
    $tempFile = [IO.Path]::GetTempFileName().Replace(".tmp", ".wav")
    [IO.File]::WriteAllBytes($tempFile, $response.Content)

    Write-Host "Audio generated successfully!" -ForegroundColor Green

    # Play the audio
    Add-Type -AssemblyName presentationCore
    $audioPlayer = New-Object System.Media.SoundPlayer($tempFile)
    $audioPlayer.PlaySync()

    # Clean up
    Remove-Item $tempFile -ErrorAction SilentlyContinue

    Write-Host "Playback complete." -ForegroundColor Green
}
catch {
    Write-Error "Failed to synthesize or play voice: $_"
    if ($_.Exception.Response) {
        Write-Error "Status Code: $($_.Exception.Response.StatusCode)"
        Write-Error "Response: $($_.Exception.Response.GetResponseStream() | Select-Object -First 1)"
    }
}