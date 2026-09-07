[CmdletBinding()]
param(
    [string]$RepositoryRoot = "C:\Users\emart\Dropbox\GitHubData\global-slack-irf-plotter",
    [switch]$SkipTests
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Refresh-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = @($machinePath, $userPath) -join ";"
}

function Find-Executable {
    param([Parameter(Mandatory = $true)][string[]]$Names)
    foreach ($name in $Names) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($cmd) { return $cmd.Source }
    }
    return $null
}

Refresh-ProcessPath
$node = Find-Executable @("node.exe", "node")
$npm = Find-Executable @("npm.cmd", "npm")

if (-not $node -or -not $npm) {
    $winget = Find-Executable @("winget.exe", "winget")
    if (-not $winget) {
        throw @"
Node.js and npm are not installed or are not on PATH, and Windows Package Manager (winget) was not found.
Install the current Node.js LTS Windows installer from the official Node.js download page, close every PowerShell window, open a new PowerShell window, and rerun this script.
"@
    }

    Write-Host "Node.js/npm were not found. Installing the current Node.js LTS package with winget..."
    & $winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "winget could not install OpenJS.NodeJS.LTS (exit code $LASTEXITCODE)."
    }

    Refresh-ProcessPath
    $node = Find-Executable @("node.exe", "node")
    $npm = Find-Executable @("npm.cmd", "npm")

    if (-not $node -and (Test-Path "C:\Program Files\nodejs\node.exe")) {
        $node = "C:\Program Files\nodejs\node.exe"
    }
    if (-not $npm -and (Test-Path "C:\Program Files\nodejs\npm.cmd")) {
        $npm = "C:\Program Files\nodejs\npm.cmd"
    }
}

if (-not $node -or -not $npm) {
    throw "Node.js was installed, but the current process still cannot locate node.exe and npm.cmd. Close PowerShell, open a new window, and rerun the script."
}

Write-Host "Node executable: $node"
& $node --version
Write-Host "npm executable: $npm"
& $npm --version

if (-not (Test-Path -LiteralPath (Join-Path $RepositoryRoot ".git"))) {
    throw "Repository not found at $RepositoryRoot."
}

if (-not $SkipTests) {
    Push-Location $RepositoryRoot
    try {
        Write-Host "Running the repository validation suite..."
        & $npm test
        if ($LASTEXITCODE -ne 0) {
            throw "npm test failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

Write-Host "Node.js/npm setup is complete."
Write-Host "Next: run scripts\bootstrap_codex_workspace.ps1, then scripts\import_legacy.ps1 -Mode Inventory."
