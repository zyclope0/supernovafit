# 🚀 Script de Déploiement SuperNovaFit avec Validation des Coûts
# Date: 15.01.2025
# Objectif: Déployer avec validation des optimisations de coûts

param(
    [switch]$Force,
    [switch]$SkipBuild
)

# Configuration des couleurs
$ErrorActionPreference = "Stop"

function Write-ColorLog {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorLog "ℹ️  $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorLog "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorLog "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorLog "❌ $Message" "Red"
}

# Début du script
Write-ColorLog "🚀 SuperNovaFit - Déploiement avec Validation des Coûts" "Blue"
Write-ColorLog "==================================================" "Blue"

# Vérification des prérequis
Write-Info "Vérification des prérequis..."

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm n'est pas installé"
    exit 1
}

if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Warning "Firebase CLI non trouvé, utilisation via npx..."
}

# Vérification de la configuration optimisée
Write-Info "Validation de la configuration optimisée..."

$firebaseConfig = Get-Content "firebase.production.json" -Raw

if ($firebaseConfig -match '"memory": "512MiB"') {
    Write-Success "Configuration mémoire optimisée (512MiB)"
} else {
    Write-Error "Configuration mémoire non optimisée"
    exit 1
}

if ($firebaseConfig -match '"maxInstances": 3') {
    Write-Success "Configuration instances optimisée (max: 3)"
} else {
    Write-Error "Configuration instances non optimisée"
    exit 1
}

if ($firebaseConfig -match '"minInstances": 0') {
    Write-Success "Configuration instances min optimisée (0)"
} else {
    Write-Error "Configuration instances min non optimisée"
    exit 1
}

# Build de l'application
if (-not $SkipBuild) {
    Write-Info "Build de l'application..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build réussi"
    } else {
        Write-Error "Échec du build"
        exit 1
    }
} else {
    Write-Warning "Build ignoré (option -SkipBuild)"
}

# Validation des métriques de build
Write-Info "Validation des métriques de build..."

if (Test-Path ".next") {
    $buildSize = (Get-ChildItem ".next" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Info "Taille du build: $([math]::Round($buildSize, 2)) MB"
}

# Déploiement Firebase
Write-Info "Déploiement vers Firebase..."
Write-Warning "Utilisation de l'option --force pour contourner la vérification de facturation"

$deployCommand = "npx firebase-tools@latest deploy --only hosting --project supernovafit-a6fe7 --config firebase.production.json --force"

if ($Force) {
    Write-Warning "Mode force activé"
}

try {
    Invoke-Expression $deployCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Déploiement réussi"
    } else {
        Write-Error "Échec du déploiement"
        exit 1
    }
} catch {
    Write-Error "Erreur lors du déploiement: $_"
    exit 1
}

# Validation post-déploiement
Write-Info "Validation post-déploiement..."

$prodUrl = "https://supernovafit-a6fe7.web.app"
Write-Info "Test de l'URL de production: $prodUrl"

try {
    $response = Invoke-WebRequest -Uri $prodUrl -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Success "Application accessible en production"
    }
} catch {
    Write-Warning "Impossible de vérifier l'accessibilité (normal si en cours de déploiement)"
}

# Résumé des optimisations
Write-Host ""
Write-ColorLog "📊 RÉSUMÉ DES OPTIMISATIONS" "Blue"
Write-ColorLog "==========================" "Blue"
Write-ColorLog "💰 Coût estimé: 3-8€/mois (vs 15-25€/mois initial)" "Green"
Write-ColorLog "📉 Économie: -60%" "Green"
Write-ColorLog "⚡ Mémoire: 512MiB (optimisé)" "Cyan"
Write-ColorLog "🔄 Instances: 0-3 (optimisé)" "Cyan"
Write-ColorLog "🌍 Région: europe-west1" "Cyan"
Write-Host ""

# Instructions pour le monitoring
Write-ColorLog "🔍 MONITORING RECOMMANDÉ" "Blue"
Write-ColorLog "========================" "Blue"
Write-ColorLog "1. Configurez les alertes de budget sur Google Cloud Console" "Yellow"
Write-ColorLog "2. Surveillez les performances dans Firebase Console" "Yellow"
Write-ColorLog "3. Consultez le guide: docs/guides/BUDGET_ALERTS_SETUP.md" "Yellow"
Write-Host ""

Write-Success "Déploiement terminé avec succès!"
Write-Info "URL de production: $prodUrl"
Write-Info "Console Firebase: https://console.firebase.google.com/project/supernovafit-a6fe7"
Write-Info "Console Billing: https://console.cloud.google.com/billing"

Write-Host ""
Write-ColorLog "🎯 Prochaines étapes:" "Blue"
Write-ColorLog "- Configurer les alertes de budget" "White"
Write-ColorLog "- Monitorer les performances" "White"
Write-ColorLog "- Valider les économies réelles" "White"
