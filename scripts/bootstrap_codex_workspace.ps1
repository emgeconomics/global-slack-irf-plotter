[CmdletBinding()]
param(
    [string]$RepoParent = "C:\Users\emart\Dropbox\GitHubData",
    [string]$Repository = "https://github.com/emgeconomics/global-slack-irf-plotter.git",
    [string]$Branch = "codex/lajcb-r2-smm",
    [switch]$LaunchCodex
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Require-Command {
    param([Parameter(Mandatory = $true)][string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found on PATH: $Name"
    }
}

Require-Command git
Require-Command npm

$repoName = [System.IO.Path]::GetFileNameWithoutExtension($Repository.TrimEnd('/'))
$repoRoot = Join-Path $RepoParent $repoName
New-Item -ItemType Directory -Path $RepoParent -Force | Out-Null

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot ".git"))) {
    Write-Host "Cloning $Repository into $repoRoot"
    & git clone $Repository $repoRoot
    if ($LASTEXITCODE -ne 0) { throw "git clone failed" }
}

$dirty = & git -C $repoRoot status --porcelain
if ($LASTEXITCODE -ne 0) { throw "git status failed" }
if ($dirty) {
    throw "The repository has uncommitted changes. Review them before updating:`n$($dirty | Out-String)"
}

& git -C $repoRoot fetch origin
if ($LASTEXITCODE -ne 0) { throw "git fetch failed" }

$localBranch = & git -C $repoRoot branch --list $Branch
if ($localBranch) {
    & git -C $repoRoot switch $Branch
} else {
    & git -C $repoRoot switch --track "origin/$Branch"
}
if ($LASTEXITCODE -ne 0) { throw "Could not switch to $Branch" }

& git -C $repoRoot pull --ff-only
if ($LASTEXITCODE -ne 0) { throw "git pull --ff-only failed" }

Push-Location $repoRoot
try {
    & npm test
    if ($LASTEXITCODE -ne 0) { throw "npm test failed" }

    Write-Host ""
    Write-Host "Workspace ready: $repoRoot"
    Write-Host "Branch: $Branch"
    Write-Host "Next gate: run scripts\import_legacy.ps1 in Inventory mode."

    if ($LaunchCodex) {
        Require-Command codex
        & codex
    }
}
finally {
    Pop-Location
}
