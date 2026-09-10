param(
    [string]$text = "Faust online. Awaiting your directive, Manager."
)

$endpoint = "http://localhost:8080/api/v1/voice/tune"
$payload = @{
    text = $text
    voice = "af_bella"
    speed = 0.84
    language = "en-us"
    pitch_shift = -0.3
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method Post -Uri $endpoint -ContentType "application/json" -Body $payload -UseBasicParsing
    # The response is the audio data as a base64 string? Or binary?
    # Let's assume it's base64 encoded string for now.
    # Actually, from the frontend, we see they return a blob. So the backend returns the raw audio bytes.
    # In PowerShell, if we don't specify -ContentType for the response, it might try to parse as JSON.
    # We used -UseBasicParsing to get the raw response as a string? Actually, -UseBasicParsing returns the raw response as a string.
    # But we want the raw bytes.

    # Let's change approach: use Invoke-WebRequest to get the raw content.
    $response = Invoke-WebRequest -Method Post -Uri $endpoint -ContentType "application/json" -Body $payload -UseBasicParsing
    $audioBytes = $response.Content

    # If the response is base64, we need to decode.
    # But the frontend handles it as a blob, so likely the backend returns the raw bytes.
    # However, in the frontend, they do: const blob = await response.blob()
    # So the backend returns the raw audio with content-type audio/wav.

    # Therefore, $response.Content should be the raw bytes? Actually, Invoke-WebRequest by default tries to parse the content.
    # We need to get the raw byte array.

    # Let's use -OutFile to write directly to a file and then play it.
    $tempFile = [IO.Path]::GetTempFileName()
    Invoke-WebRequest -Method Post -Uri $endpoint -ContentType "application/json" -Body $payload -OutFile $tempFile

    # Play the audio file
    Add-Type -AssemblyName presentationCore
    $audioPlayer = New-Object System.Media.SoundPlayer($tempFile)
    $audioPlayer.PlaySync()
    # Clean up the temp file
    Remove-Item $tempFile
} catch {
    Write-Error "Failed to generate or play voice: $_"
}