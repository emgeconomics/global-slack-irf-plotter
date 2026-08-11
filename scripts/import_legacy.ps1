[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateSet("Inventory", "Source", "ReferenceOutputs", "All")]
    [string]$Mode = "Inventory",

    [string]$Source = "C:\Users\emart\Dropbox\R\2025_LAJCB_STAFF_PAPER_ON_GLOBAL_SLACK",

    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,

    [int64]$MaximumReferenceOutputBytes = 25MB,

    [switch]$IncludeData,

    [switch]$Commit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$requiredBranch = "codex/lajcb-r2-smm"
$inventoryDir = Join-Path $RepoRoot "legacy_import"
$sourceTarget = Join-Path $inventoryDir "source"
$outputTarget = Join-Path $inventoryDir "reference_outputs"
$inventoryPath = Join-Path $inventoryDir "inventory.csv"
$importManifestPath = Join-Path $inventoryDir "import_manifest.csv"

function Invoke-Git {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    $output = & git -C $RepoRoot @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed:`n$output"
    }
    return ($output | Out-String).Trim()
}

function Get-RelativePathSafe {
    param(
        [Parameter(Mandatory = $true)][string]$BasePath,
        [Parameter(Mandatory = $true)][string]$ChildPath
    )

    $baseUri = [Uri]((Resolve-Path $BasePath).Path.TrimEnd('\') + '\')
    $childUri = [Uri](Resolve-Path $ChildPath).Path
    return [Uri]::UnescapeDataString($baseUri.MakeRelativeUri($childUri).ToString()).Replace('/', '\')
}

function Get-CategoryGuess {
    param([Parameter(Mandatory = $true)][System.IO.FileInfo]$File)

    $extension = $File.Extension.ToLowerInvariant()
    $pathLower = $File.FullName.ToLowerInvariant()

    $sourceExtensions = @(
        ".r", ".rmd", ".qmd", ".m", ".mod", ".py", ".js", ".ts",
        ".do", ".ado", ".mata", ".sh", ".ps1", ".bat", ".cmd",
        ".tex", ".bib", ".sty", ".cls"
    )
    $configExtensions = @(
        ".json", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".xml",
        ".lock", ".renv", ".project", ".rproj"
    )
    $documentationExtensions = @(".md", ".rst")
    $dataExtensions = @(
        ".csv", ".xlsx", ".xls", ".dta", ".sav", ".mat", ".rds",
        ".rdata", ".parquet", ".feather"
    )
    $outputExtensions = @(".pdf", ".png", ".jpg", ".jpeg", ".svg", ".eps")
    $temporaryExtensions = @(".log", ".tmp", ".bak", ".old", ".autosave", ".lock~")

    if ($pathLower -match "\\(node_modules|renv\\library|\.rproj\.user|__pycache__|\.git)\\") {
        return "cache"
    }
    if ($temporaryExtensions -contains $extension -or $File.Name -match "^(~\$|\.DS_Store$)") {
        return "temporary"
    }
    if ($sourceExtensions -contains $extension) {
        return "source"
    }
    if ($configExtensions -contains $extension) {
        return "config"
    }
    if ($documentationExtensions -contains $extension -or $File.Name -match "^(README|LICENSE|CHANGELOG)(\.|$)") {
        return "documentation"
    }
    if ($dataExtensions -contains $extension) {
        return "data"
    }
    if ($outputExtensions -contains $extension) {
        return "reference_output"
    }
    if ($pathLower -match "\\(output|outputs|result|results|figure|figures|table|tables)\\") {
        return "generated_or_output"
    }
    return "unclassified"
}

if (-not (Test-Path -LiteralPath $Source -PathType Container)) {
    throw "Source folder does not exist: $Source"
}
if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) {
    throw "Repository root does not exist: $RepoRoot"
}

$insideWorkTree = Invoke-Git @("rev-parse", "--is-inside-work-tree")
if ($insideWorkTree -ne "true") {
    throw "RepoRoot is not a Git working tree: $RepoRoot"
}

$currentBranch = Invoke-Git @("branch", "--show-current")
if ($currentBranch -ne $requiredBranch) {
    throw "Switch to '$requiredBranch' before importing. Current branch: '$currentBranch'."
}

$statusBefore = Invoke-Git @("status", "--porcelain")
if ($statusBefore) {
    throw "The working tree is not clean. Commit, stash, or discard existing changes before importing:`n$statusBefore"
}

New-Item -ItemType Directory -Path $inventoryDir -Force | Out-Null

$files = Get-ChildItem -LiteralPath $Source -File -Recurse -Force | Where-Object {
    $_.FullName -notmatch "\\(\.git|node_modules|renv\\library|\.Rproj\.user|__pycache__)\\"
}

$inventory = foreach ($file in $files) {
    $relativePath = Get-RelativePathSafe -BasePath $Source -ChildPath $file.FullName
    $category = Get-CategoryGuess -File $file
    $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()

    $selected = switch ($Mode) {
        "Inventory" { $false }
        "Source" { $category -in @("source", "config", "documentation") }
        "ReferenceOutputs" { $category -eq "reference_output" -and $file.Length -le $MaximumReferenceOutputBytes }
        "All" {
            ($category -in @("source", "config", "documentation")) -or
            ($category -eq "reference_output" -and $file.Length -le $MaximumReferenceOutputBytes) -or
            ($IncludeData -and $category -eq "data")
        }
    }

    $targetRoot = if ($category -in @("reference_output", "generated_or_output")) {
        $outputTarget
    } else {
        $sourceTarget
    }

    [pscustomobject]@{
        RelativePath       = $relativePath
        CategoryGuess      = $category
        SizeBytes          = $file.Length
        LastWriteTimeUtc   = $file.LastWriteTimeUtc.ToString("o")
        Sha256             = $hash
        SelectedForImport  = [bool]$selected
        TargetRelativePath = if ($selected) {
            (Join-Path (Split-Path -Leaf $targetRoot) $relativePath).Replace('\', '/')
        } else {
            ""
        }
    }
}

$inventory | Sort-Object RelativePath | Export-Csv -LiteralPath $inventoryPath -NoTypeInformation -Encoding UTF8
Write-Host "Inventory written to: $inventoryPath"
Write-Host "Files scanned: $($inventory.Count)"
Write-Host "Files selected for mode '$Mode': $(($inventory | Where-Object SelectedForImport).Count)"

if ($Mode -eq "Inventory") {
    Write-Host "Inventory mode made no copies. Review legacy_import/inventory.csv, then rerun with -Mode Source, ReferenceOutputs, or All."
    exit 0
}

$imported = New-Object System.Collections.Generic.List[object]
foreach ($row in ($inventory | Where-Object SelectedForImport | Sort-Object RelativePath)) {
    $sourcePath = Join-Path $Source $row.RelativePath
    $targetRoot = if ($row.CategoryGuess -in @("reference_output", "generated_or_output")) {
        $outputTarget
    } else {
        $sourceTarget
    }
    $targetPath = Join-Path $targetRoot $row.RelativePath
    $targetDirectory = Split-Path -Parent $targetPath

    if ($PSCmdlet.ShouldProcess($sourcePath, "Copy to $targetPath")) {
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
        Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force

        $copiedHash = (Get-FileHash -LiteralPath $targetPath -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($copiedHash -ne $row.Sha256) {
            throw "Checksum mismatch after copying '$($row.RelativePath)'."
        }

        $imported.Add([pscustomobject]@{
            RelativePath       = $row.RelativePath
            CategoryGuess      = $row.CategoryGuess
            SizeBytes          = $row.SizeBytes
            LastWriteTimeUtc   = $row.LastWriteTimeUtc
            Sha256             = $row.Sha256
            ImportedUtc        = [DateTime]::UtcNow.ToString("o")
            SourceRoot         = $Source
            TargetRelativePath = (Resolve-Path $targetPath).Path.Substring($RepoRoot.Length).TrimStart('\').Replace('\', '/')
        })
    }
}

$imported | Export-Csv -LiteralPath $importManifestPath -NoTypeInformation -Encoding UTF8
Write-Host "Import manifest written to: $importManifestPath"
Write-Host "Files copied: $($imported.Count)"

$statusAfter = Invoke-Git @("status", "--short")
Write-Host "Git status after import:"
Write-Host $statusAfter

if ($Commit) {
    if (-not $statusAfter) {
        throw "No files changed; there is nothing to commit."
    }

    Invoke-Git @("add", "legacy_import") | Out-Null
    $commitMessage = "legacy: import audited Global Slack source checkpoint"
    Invoke-Git @("commit", "-m", $commitMessage) | Out-Null
    Invoke-Git @("push", "origin", $requiredBranch) | Out-Null
    Write-Host "Committed and pushed the audited import."
} else {
    Write-Host "Review the copied files and manifest before committing. Rerun with -Commit only after review, or commit manually."
}
