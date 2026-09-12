<#
.SYNOPSIS
    Script to initialize git, commit, and push this repository to GitHub automatically.
#>

param (
    [string]$RepoName = "my-github-project",
    [string]$CommitMessage = "Update code files"
)

# Load token from ~/.env
$envPath = Join-Path $HOME '.env'
$token = $env:GITHUB_TOKEN

if (-not $token -and (Test-Path $envPath)) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match "^GITHUB_TOKEN=(.+)$") {
            $token = $Matches[1].Trim()
        }
    }
}

if (-not $token) {
    Write-Host "Error: GITHUB_TOKEN not found in environment or ~/.env file." -ForegroundColor Red
    exit 1
}

# Ensure Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 1. Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing local git repository..." -ForegroundColor Cyan
    git init
    git branch -M main
}

# 2. Stage and commit files
Write-Host "Staging files..." -ForegroundColor Cyan
git add .

$status = git status --porcelain
if ($status) {
    Write-Host "Creating commit..." -ForegroundColor Cyan
    git commit -m "$CommitMessage"
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# 3. Check remote or ask for remote URL / user GitHub username
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host ""
    Write-Host "To link this repository to GitHub:" -ForegroundColor Green
    Write-Host "1. Create a repository named '$RepoName' on GitHub (https://github.com/new)." -ForegroundColor Yellow
    Write-Host "2. Run this command in PowerShell (replace YOUR_GITHUB_USERNAME):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/$RepoName.git" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "Pushing to remote repository..." -ForegroundColor Cyan
    git push -u origin main
}
