# ==============================================================================
# Setup Faust Shared Memory across Multiple Devices (Google Drive Sync)
# ==============================================================================
# This script creates an NTFS Directory Junction linking Claude Code's local
# project memory folder to the shared .claude\memory folder in Google Drive.
# ==============================================================================

$projectRoot = $PSScriptRoot
$sharedMemoryDir = Join-Path $projectRoot ".claude\memory"

Write-Host "=== Setting up Faust Shared Memory ===" -ForegroundColor Cyan
Write-Host "Project Root: $projectRoot"
Write-Host "Shared Memory Target: $sharedMemoryDir"

# 1. Ensure the shared memory directory exists in Google Drive
if (-not (Test-Path $sharedMemoryDir)) {
    New-Item -ItemType Directory -Path $sharedMemoryDir -Force | Out-Null
    Write-Host "[+] Created shared memory directory in Google Drive: $sharedMemoryDir" -ForegroundColor Green
}

# 2. Ensure initial MEMORY.md index exists if not already present
$sharedMemoryIndex = Join-Path $sharedMemoryDir "MEMORY.md"
if (-not (Test-Path $sharedMemoryIndex)) {
    $initialIndexContent = @"
# Faust Mind Index

- [Project Vision](project-vision.md) — Multi-device Faust architecture and synchronization.
"@
    Set-Content -Path $sharedMemoryIndex -Value $initialIndexContent -Encoding utf8
    Write-Host "[+] Initialized MEMORY.md index." -ForegroundColor Green
}

# 3. Derive the sanitized Claude Code Project Key for the current directory
# Claude Code sanitizes paths by replacing non-alphanumeric chars (:, \, /, spaces) with '-'
$normalizedPath = (Get-Item -LiteralPath $projectRoot).FullName
$sanitizedKey = $normalizedPath -replace '[:\\/ ]', '-'
# Collapse multiple consecutive hyphens if needed (matching Claude Code's pattern)
while ($sanitizedKey -match '--+') {
    $sanitizedKey = $sanitizedKey -replace '--+', '-'
}
# Claude Code typically keeps drive letters formatted as 'D--My-Drive-Blue-AI'
# Let's check both exact drive-pattern and sanitized variants
$drivePrefix = $normalizedPath.Substring(0, 1) + "--"
$remaining = $normalizedPath.Substring(3) -replace '[:\\/ ]', '-'
$claudeProjectKey = $drivePrefix + $remaining

$claudeProjectDir = Join-Path $env:USERPROFILE ".claude\projects\$claudeProjectKey"
$localMemoryLink = Join-Path $claudeProjectDir "memory"

Write-Host "Detected Local Claude Project Directory: $claudeProjectDir" -ForegroundColor Yellow

# Ensure parent directory ~/.claude/projects/<ProjectKey> exists
if (-not (Test-Path $claudeProjectDir)) {
    New-Item -ItemType Directory -Path $claudeProjectDir -Force | Out-Null
}

# 4. Handle existing local memory if it is a directory (not a junction yet)
if (Test-Path $localMemoryLink) {
    $item = Get-Item $localMemoryLink -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Write-Host "[i] Junction already exists: $localMemoryLink -> $($item.Target)" -ForegroundColor Cyan
        Write-Host "`nFaust's Mind is already linked and ready on this device!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "[!] Found existing local memory folder. Migrating files to shared Drive memory..." -ForegroundColor Yellow
        Get-ChildItem -Path $localMemoryLink | ForEach-Object {
            $dest = Join-Path $sharedMemoryDir $_.Name
            if (-not (Test-Path $dest)) {
                Move-Item -Path $_.FullName -Destination $dest -Force
                Write-Host "  -> Migrated: $($_.Name)" -ForegroundColor Gray
            }
        }
        Remove-Item -Path $localMemoryLink -Recurse -Force
    }
}

# 5. Create the Directory Junction
try {
    New-Item -ItemType Junction -Path $localMemoryLink -Target $sharedMemoryDir -Force | Out-Null
    Write-Host "`n[SUCCESS] Linked local memory to Google Drive cortex!" -ForegroundColor Green
    Write-Host "Local Path:  $localMemoryLink" -ForegroundColor Gray
    Write-Host "Shared Path: $sharedMemoryDir" -ForegroundColor Gray
    Write-Host "`nFaust on this machine will now read and write memories directly through Google Drive." -ForegroundColor Cyan
} catch {
    Write-Error "Failed to create directory junction: $_"
}
