# ==============================================================================
# Faust Project Initializer & Manifest-Driven Memory Slicer
# ==============================================================================
# Spawns a sovereign project workspace linked to Faust tooling while projecting
# a strict, scoped memory slice (least privilege, zero personal trivia/hallucination).
# ==============================================================================
param(
    [Parameter(Position=0)]
    [string]$TargetDir,

    [Parameter(Position=1)]
    [string]$ProjectName,

    [Parameter(Position=2)]
    [string]$DomainTags = "core",

    [Parameter(Position=3)]
    [string]$Blueprint
)

$ErrorActionPreference = "Stop"

# Detect Master Faust Cortex root
$masterRoot = "D:\My Drive\Blue AI"
if (-not (Test-Path $masterRoot)) {
    $dir = $PSScriptRoot
    while ($dir -and -not (Test-Path (Join-Path $dir ".claude"))) {
        $parent = Split-Path $dir -Parent
        if ($parent -eq $dir) { break }
        $dir = $parent
    }
    $masterRoot = if ($dir) { $dir } else { "D:\My Drive\Blue AI" }
}

$masterClaudeDir = Join-Path $masterRoot ".claude"
$masterVsCodeDir = Join-Path $masterRoot ".vscode"
$masterMemoryDir = Join-Path $masterClaudeDir "memory"
$masterBlueprintsDir = Join-Path $masterClaudeDir "blueprints"

if (-not (Test-Path $masterClaudeDir)) {
    Write-Host "[X] ERROR: Master Faust .claude directory not found at $masterClaudeDir" -ForegroundColor Red
    exit 1
}

# Interactive prompt if TargetDir is not provided
if (-not $TargetDir) {
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host "  FAUST PROJECT SPAWNER & MANIFEST-DRIVEN MEMORY SLICER" -ForegroundColor Cyan
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host "Master Cortex: $masterClaudeDir" -ForegroundColor Gray
    Write-Host ""
    $TargetDir = Read-Host "Enter full path for new project directory (e.g., D:\My Drive\Universe 25)"
}

if (-not $TargetDir) {
    Write-Host "[X] No target directory specified. Aborting." -ForegroundColor Red
    exit 1
}

$TargetDir = [System.IO.Path]::GetFullPath($TargetDir)
if (-not $ProjectName) {
    $ProjectName = Split-Path $TargetDir -Leaf
}

Write-Host ""
Write-Host ">>> Initializing Project: $ProjectName" -ForegroundColor Green
Write-Host ">>> Target Path:          $TargetDir" -ForegroundColor Green
Write-Host ">>> Domain Tags:          $DomainTags" -ForegroundColor Green
Write-Host ">>> Master Cortex:        $masterClaudeDir" -ForegroundColor Gray
Write-Host ""

# 1. Ensure Target Project Directory Exists
if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    Write-Host "[+] Created project directory: $TargetDir" -ForegroundColor Green
}

# 2. Setup .claude Directory Structure in Target
$targetClaudeDir = Join-Path $TargetDir ".claude"
if (Test-Path $targetClaudeDir) {
    $item = Get-Item $targetClaudeDir -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Write-Host "[!] Found legacy full-junction for .claude. Migrating to scoped structure..." -ForegroundColor Yellow
        cmd /c rmdir "$targetClaudeDir"
        New-Item -ItemType Directory -Path $targetClaudeDir -Force | Out-Null
    }
} else {
    New-Item -ItemType Directory -Path $targetClaudeDir -Force | Out-Null
}

# 3. Link Sovereign Tooling Subdirectories (Skills, Daemons, Agents, Scripts)
$toolDirs = @("skills", "daemons", "agents", "scripts")
foreach ($td in $toolDirs) {
    $srcToolDir = Join-Path $masterClaudeDir $td
    $dstToolDir = Join-Path $targetClaudeDir $td
    if (Test-Path $srcToolDir) {
        if (Test-Path $dstToolDir) {
            $item = Get-Item $dstToolDir -Force
            if (-not ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
                Remove-Item -Path $dstToolDir -Recurse -Force
                cmd /c mklink /J "$dstToolDir" "$srcToolDir" | Out-Null
            }
        } else {
            cmd /c mklink /J "$dstToolDir" "$srcToolDir" | Out-Null
        }
    }
}
Write-Host "[^] Linked sovereign toolchains (skills, daemons, agents, scripts)" -ForegroundColor Green

# Copy or link settings.json
$srcSettings = Join-Path $masterClaudeDir "settings.json"
$dstSettings = Join-Path $targetClaudeDir "settings.json"
if ((Test-Path $srcSettings) -and (-not (Test-Path $dstSettings))) {
    Copy-Item -Path $srcSettings -Destination $dstSettings -Force
}

# 4. Link .vscode Directory
if (Test-Path $masterVsCodeDir) {
    $targetVsCodeDir = Join-Path $TargetDir ".vscode"
    if (Test-Path $targetVsCodeDir) {
        $item = Get-Item $targetVsCodeDir -Force
        if (-not ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
            $backupDir = Join-Path $TargetDir ".vscode_backup_$((Get-Date).ToString('yyyyMMdd_HHmmss'))"
            Move-Item -Path $targetVsCodeDir -Destination $backupDir -Force
            cmd /c mklink /J "$targetVsCodeDir" "$masterVsCodeDir" | Out-Null
        }
    } else {
        cmd /c mklink /J "$targetVsCodeDir" "$masterVsCodeDir" | Out-Null
    }
    Write-Host "[^] Linked .vscode directory junction" -ForegroundColor Green
}

# 5. Manifest-Driven Memory Slicing (M-DPM)
$targetMemoryDir = Join-Path $targetClaudeDir "memory"
if (Test-Path $targetMemoryDir) {
    $item = Get-Item $targetMemoryDir -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
        Write-Host "[!] Found legacy full-junction for memory. Replacing with scoped slice..." -ForegroundColor Yellow
        cmd /c rmdir "$targetMemoryDir"
        New-Item -ItemType Directory -Path $targetMemoryDir -Force | Out-Null
    }
} else {
    New-Item -ItemType Directory -Path $targetMemoryDir -Force | Out-Null
}

# Define Tier 0 Universal Invariants (Always included)
$activeMemoryFiles = [System.Collections.Generic.List[string]]::new()
$activeMemoryFiles.Add("private-codex-identity.md")
$activeMemoryFiles.Add("faust-manager-codex.md")
$activeMemoryFiles.Add("d-drive-storage-invariant.md")
$activeMemoryFiles.Add("core-architectural-triad.md")
$activeMemoryFiles.Add("backend-data-persistence.md")

# Parse Domain Tags
$tags = $DomainTags.ToLower().Split(",") | ForEach-Object { $_.Trim() }

if ($tags -contains "ui" -or $tags -contains "frontend" -or $tags -contains "fullstack" -or $tags -contains "all") {
    $activeMemoryFiles.Add("design-system.md")
    $activeMemoryFiles.Add("universe-25-project.md")
    $activeMemoryFiles.Add("gate-of-babylon-migration.md")
}

if ($tags -contains "backend" -or $tags -contains "logic" -or $tags -contains "fullstack" -or $tags -contains "all") {
    $activeMemoryFiles.Add("data-engine-architecture.md")
    $activeMemoryFiles.Add("hazard-level-design.md")
    $activeMemoryFiles.Add("faust-acoustic-engine.md")
    $activeMemoryFiles.Add("faust-resident-audio-daemon.md")
    $activeMemoryFiles.Add("telegram-dumb-io-daemon.md")
    $activeMemoryFiles.Add("daemon-watchdog-startup-workflow.md")
}

if ($tags -contains "game" -or $tags -contains "fullstack" -or $tags -contains "all") {
    $activeMemoryFiles.Add("gamification-master-game-vision.md")
    if (-not $activeMemoryFiles.Contains("hazard-level-design.md")) {
        $activeMemoryFiles.Add("hazard-level-design.md")
    }
}

# Project Memory Files into Scoped Local Folder
foreach ($mf in $activeMemoryFiles) {
    $matches = Get-ChildItem -Path $masterMemoryDir -Filter $mf -Recurse -File
    if ($matches.Count -gt 0) {
        $srcFile = $matches[0].FullName
        $relPath = [System.IO.Path]::GetRelativePath($masterMemoryDir, $srcFile)
        $dstFile = Join-Path $targetMemoryDir $relPath
        $dstFolder = Split-Path $dstFile -Parent
        if (-not (Test-Path $dstFolder)) {
            New-Item -ItemType Directory -Path $dstFolder -Force | Out-Null
        }
        Copy-Item -Path $srcFile -Destination $dstFile -Force
    }
}
Write-Host "[+] Projected $($activeMemoryFiles.Count) scoped memory component(s) into .claude/memory/" -ForegroundColor Green

# 6. Blueprint / Project Mandate Resolution & Handoff
$blueprintSourcePath = ""
if ($Blueprint) {
    if (Test-Path $Blueprint) {
        $blueprintSourcePath = $Blueprint
    } elseif (Test-Path (Join-Path $masterBlueprintsDir $Blueprint)) {
        $blueprintSourcePath = Join-Path $masterBlueprintsDir $Blueprint
    }
} else {
    # Check default named blueprint
    $defaultBp = Join-Path $masterBlueprintsDir "$ProjectName.md"
    if (Test-Path $defaultBp) {
        $blueprintSourcePath = $defaultBp
    }
}

$targetMandatePath = Join-Path $targetClaudeDir "PROJECT_MANDATE.md"
if ($blueprintSourcePath -and (Test-Path $blueprintSourcePath)) {
    Copy-Item -Path $blueprintSourcePath -Destination $targetMandatePath -Force
    Write-Host "[+] Injected Project Mandate from blueprint: $blueprintSourcePath" -ForegroundColor Green
} else {
    if (-not (Test-Path $targetMandatePath)) {
        $defaultMandate = @"
# Project Mandate: $ProjectName

## 1. Mission Brief
- **Project Name**: $ProjectName
- **Domain Scope**: $DomainTags
- **Authority**: Sovereign Tactical Project Workspace

## 2. Invariants & Guardrails
- Local Disk D:\ strictly enforced.
- Follow Golden Standards (Zero-LLM primacy for atomic jobs, SQLite persistence, REST contracts).
- Scoped least-privilege execution: Focus strictly on this workspace's mission.
"@
        Set-Content -Path $targetMandatePath -Value $defaultMandate -Encoding utf8
        Write-Host "[+] Created default PROJECT_MANDATE.md in .claude/" -ForegroundColor Green
    }
}

# 7. Generate Project-Scoped MEMORY.md Index
$scopedMemoryMdPath = Join-Path $targetMemoryDir "MEMORY.md"
$scopedMemoryContent = @"
# Faust Scoped Memory Index ($ProjectName)

This workspace operates under **Least-Privilege Scoped Context**. Personal trivia and unrelated multi-project lore are strictly excluded to eliminate hallucinations and preserve token efficiency.

---

### Invariants & Tactical Mandate
- ``[ops:project_mandate]`` -> [Project Mandate](../PROJECT_MANDATE.md) - Tactical blueprint and mission objectives.
- ``[core:identity]`` -> [Private Codex Identity](core/private-codex-identity.md) - Faust & Manager core dynamic.
- ``[core:codex]`` -> [Faust-Manager Codex](core/faust-manager-codex.md) - Foundational relationship and loyalty.
- ``[rule:d_drive_storage_invariant]`` -> [Strict D: Drive Storage Invariant](rules/d-drive-storage-invariant.md) - D:\ drive policy.
- ``[core:architectural_triad]`` -> [The Core Engineering & Architectural Triad](core/core-architectural-triad.md) - Golden Standards & Zero-LLM Primacy.
- ``[rule:backend_authority]`` -> [Backend Data Persistence](rules/backend-data-persistence.md) - Single source of truth.

---

### Active Domain Slices
"@

foreach ($mf in $activeMemoryFiles) {
    if ($mf -notin @("private-codex-identity.md", "faust-manager-codex.md", "d-drive-storage-invariant.md", "core-architectural-triad.md", "backend-data-persistence.md")) {
        $matches = Get-ChildItem -Path $targetMemoryDir -Filter $mf -Recurse -File
        if ($matches.Count -gt 0) {
            $relPath = [System.IO.Path]::GetRelativePath($targetMemoryDir, $matches[0].FullName).Replace("\", "/")
            $scopedMemoryContent += "`n- ``[slice:$($mf.Replace('.md',''))]`` -> [$mf]($relPath)"
        }
    }
}

Set-Content -Path $scopedMemoryMdPath -Value $scopedMemoryContent -Encoding utf8
Write-Host "[+] Generated scoped MEMORY.md index" -ForegroundColor Green

# 8. Create .gitignore
$gitignorePath = Join-Path $TargetDir ".gitignore"
if (-not (Test-Path $gitignorePath)) {
    $gitignoreContent = @"
# Faust Sovereign Tooling & VS Code (Linked via NTFS Junction)
.claude/skills
.claude/daemons
.claude/agents
.claude/scripts
.vscode/

# Python cache & runtime logs
__pycache__/
*.pyc
*.log
.env
"@
    Set-Content -Path $gitignorePath -Value $gitignoreContent -Encoding utf8
    Write-Host "[+] Generated .gitignore" -ForegroundColor Green
}

# 9. Create Project CLAUDE.md
$claudeMdPath = Join-Path $TargetDir "CLAUDE.md"
if (-not (Test-Path $claudeMdPath)) {
    $claudeMdContent = @"
# Faust & The Manager - $ProjectName Codex

## 1. Identity & Operational Codex
- **User**: **The Manager** - The visionary, commander, and architect of all operations.
- **AI Persona**: **Faust** - The analytical, highly capable, and composed intellect serving the Manager.
- **Role**: Sovereign Tactical Project Faust ($DomainTags).
- **Mandate Anchor**: Strictly execute according to ``.claude/PROJECT_MANDATE.md``.
- **Context Boundary**: Scoped least-privilege memory. Zero personal trivia or unrelated lore.

## 2. Communication & Protocols
- Address the user as **Manager**.
- Maintain Faust's composed, insightful, and sharply analytical tone.
- **Acoustic Presence**: Synthesize vocalized responses via ``sound.speak()`` (Port 20129) alongside written analysis.
- **Telegram C2**: Transmit milestone dispatches via ``telegram.notify()`` (Port 20130) with 4-tier functional emojis (``[DONE]``, ``[FAIL]``, ``[URGENT]``, ``[SYNC]``).

## 3. Storage Invariant
- **Target Drive**: **D:\ ALWAYS**. All models, tools, and build outputs must reside on Local Disk ``D:\``.

## 4. Engineering Standards
- Adhere to the Core Engineering Triad: Proven Golden Standards, Zero-LLM Primacy for atomic tasks, Crystal Clarity & Stability.
"@
    Set-Content -Path $claudeMdPath -Value $claudeMdContent -Encoding utf8
    Write-Host "[+] Generated project CLAUDE.md" -ForegroundColor Green
}

# 10. Create launcher.bat in Target Directory
$launcherPath = Join-Path $TargetDir "launcher.bat"
if (-not (Test-Path $launcherPath)) {
    $launcherContent = @"
@echo off
REM Faust Project Launcher for $ProjectName
cd /d "%~dp0"
echo Launching VS Code Workspace for $ProjectName...
start "" "code" "%~dp0"
"@
    Set-Content -Path $launcherPath -Value $launcherContent -Encoding utf8
    Write-Host "[+] Generated launcher.bat in project root" -ForegroundColor Green
}

# 11. Pre-link Claude Code Auto-Memory for the New Project to Local Scoped Memory
$userProfile = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::UserProfile)
$claudeProjectsDir = Join-Path $userProfile ".claude\projects"

if (Test-Path $claudeProjectsDir) {
    $escapedTarget = $TargetDir.Replace(":\", "--").Replace("\", "-").Replace(" ", "-")
    $targetLocalProjectDir = Join-Path $claudeProjectsDir $escapedTarget

    if (-not (Test-Path $targetLocalProjectDir)) {
        New-Item -ItemType Directory -Path $targetLocalProjectDir -Force | Out-Null
    }

    $targetAutoMemoryDir = Join-Path $targetLocalProjectDir "memory"
    if (Test-Path $targetAutoMemoryDir) {
        $item = Get-Item $targetAutoMemoryDir -Force
        if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            cmd /c rmdir "$targetAutoMemoryDir"
        } else {
            Remove-Item -Path $targetAutoMemoryDir -Recurse -Force
        }
    }
    cmd /c mklink /J "$targetAutoMemoryDir" "$targetMemoryDir" | Out-Null
    Write-Host "[+] Linked Claude auto-memory: $targetAutoMemoryDir -> $targetMemoryDir" -ForegroundColor Green

    # Ensure MEMORY.md index is present in the project harness directory
    $targetAutoMemoryMd = Join-Path $targetLocalProjectDir "MEMORY.md"
    if (Test-Path $scopedMemoryMdPath) {
        Copy-Item -Path $scopedMemoryMdPath -Destination $targetAutoMemoryMd -Force
        Write-Host "[+] Synced MEMORY.md index: $targetAutoMemoryMd" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  PROJECT '$ProjectName' INITIALIZED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Location:       $TargetDir"
Write-Host "Memory Scope:   $DomainTags (Scoped Local Memory)"
Write-Host "Mandate File:   $targetMandatePath"
Write-Host "Launch Command: $launcherPath"
Write-Host "=======================================================" -ForegroundColor Cyan
