# Script PowerShell pour créer les 7 GitHub Issues
# SuperNovaFit - Audit 29 Octobre 2025

Write-Host "=== Creation des 7 GitHub Issues - SuperNovaFit ===" -ForegroundColor Green
Write-Host ""

# Configuration - MODIFIER AVEC TON USERNAME/REPO
$GITHUB_USER = "Zyclope"
$GITHUB_REPO = "SuperNovaFit"

Write-Host "Repository: https://github.com/$GITHUB_USER/$GITHUB_REPO" -ForegroundColor Cyan
Write-Host ""
Write-Host "Je vais ouvrir 7 onglets dans ton navigateur avec les issues pre-remplies." -ForegroundColor Yellow
Write-Host "Tu n'auras qu'a cliquer sur 'Submit new issue' pour chacune!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuie sur ENTREE pour continuer..." -ForegroundColor White
Read-Host

# Issue #1 - Mode Coach Programmes
$title1 = "[Feature] Mode Coach - Creation et assignation programmes entrainement"
$body1 = @"
Permettre aux coaches de creer des programmes d'entrainement personnalises et les assigner a leurs athletes.

**Fonctionnalites**:
- Creation templates programmes
- Assignation athletes
- Suivi progression
- Historique programmes

**Fichiers concernes**:
- app/coach/athlete/[id]/page.tsx

**Priorite**: Medium
**Labels**: enhancement, coach-mode, feature
"@

$url1 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title1))&body=$([uri]::EscapeDataString($body1))&labels=enhancement,coach-mode,feature"

# Issue #2 - Mode Coach Rapports
$title2 = "[Feature] Mode Coach - Generation rapports PDF/Excel pour athletes"
$body2 = @"
Generer des rapports detailles d'analyse pour les athletes au format PDF ou Excel.

**Fonctionnalites**:
- Export PDF complet (stats + graphiques)
- Export Excel (donnees brutes)
- Templates personnalisables
- Envoi par email

**Fichiers concernes**:
- app/coach/athlete/[id]/page.tsx

**Priorite**: Medium
**Labels**: enhancement, coach-mode, export
"@

$url2 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title2))&body=$([uri]::EscapeDataString($body2))&labels=enhancement,coach-mode,export"

# Issue #3 - Galerie Photos
$title3 = "[Feature] Galerie photos de progression athlete"
$body3 = @"
Interface dediee pour visualiser et comparer toutes les photos de progression d'un athlete.

**Fonctionnalites**:
- Galerie chronologique
- Comparaison avant/apres
- Annotations coach
- Filtres par periode

**Fichiers concernes**:
- app/coach/athlete/[id]/page.tsx

**Priorite**: Low
**Labels**: enhancement, ui, media
"@

$url3 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title3))&body=$([uri]::EscapeDataString($body3))&labels=enhancement,ui,media"

# Issue #4 - Journal Integration (HIGH PRIORITY)
$title4 = "[Feature] Journal - Integration automatique des donnees"
$body4 = @"
Integrer automatiquement les donnees de nutrition, entrainements et mesures dans les calculs du journal.

**Fonctionnalites**:
- Correlation humeur/calories
- Impact entrainements sur sommeil
- Suggestions intelligentes basees sur patterns
- Graphiques croises

**Fichiers concernes**:
- app/journal/page.tsx
- hooks/useJournal.ts

**Priorite**: HIGH
**Labels**: enhancement, data-integration, analytics
"@

$url4 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title4))&body=$([uri]::EscapeDataString($body4))&labels=enhancement,data-integration,analytics"

# Issue #5 - Templates Quick Actions
$title5 = "[Feature] Systeme templates personnalises pour Quick Actions"
$body5 = @"
Permettre aux utilisateurs de creer et utiliser des templates personnalises pour repas et entrainements.

**Fonctionnalites**:
- Creation templates repas (recettes frequentes)
- Creation templates entrainements (routines)
- Favoris/etoiles
- Categorisation

**Fichiers concernes**:
- components/layout/MainLayout.tsx
- components/mobile/QuickMealModal.tsx
- components/mobile/QuickTrainingModal.tsx

**Priorite**: Medium
**Labels**: enhancement, quick-actions, ui
"@

$url5 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title5))&body=$([uri]::EscapeDataString($body5))&labels=enhancement,quick-actions,ui"

# Issue #6 - Intensite Training
$title6 = "[Feature] Entrainements - Ajout champ intensite (zones cardio/watts)"
$body6 = @"
Ajouter un champ intensite pour les entrainements avec zones cardio et puissance en watts.

**Fonctionnalites**:
- Zones FC (Z1-Z5)
- Puissance moyenne/max (watts)
- TSS (Training Stress Score)
- Graphiques zones temps

**Fichiers concernes**:
- types/index.ts (interface Entrainement)
- components/entrainements/*
- lib/calculations.ts

**Priorite**: Low
**Labels**: enhancement, training, data-model
"@

$url6 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title6))&body=$([uri]::EscapeDataString($body6))&labels=enhancement,training,data-model"

# Issue #7 - useQuickActions Refactoring
$title7 = "[Tech] Refactoring useQuickActions - Architecture state management"
$body7 = @"
Refactoriser le hook useQuickActions pour ameliorer la maintenabilite et reduire la complexite.

**Ameliorations**:
- Separer concerns (modals, templates, actions)
- Utiliser Context API au lieu de props drilling
- Reduire taille hook (actuellement 200+ LOC)
- Ameliorer testabilite

**Fichiers concernes**:
- hooks/useQuickActions.ts (8 TODOs actuels)
- components/layout/MainLayout.tsx

**Priorite**: Medium
**Dette Technique**: Yes
**Labels**: refactoring, tech-debt, architecture
"@

$url7 = "https://github.com/$GITHUB_USER/$GITHUB_REPO/issues/new?title=$([uri]::EscapeDataString($title7))&body=$([uri]::EscapeDataString($body7))&labels=refactoring,tech-debt,architecture"

# Ouverture des URLs
Write-Host "Ouverture de l'issue #1 - Mode Coach Programmes..." -ForegroundColor Cyan
Start-Process $url1
Start-Sleep -Seconds 2

Write-Host "Ouverture de l'issue #2 - Mode Coach Rapports..." -ForegroundColor Cyan
Start-Process $url2
Start-Sleep -Seconds 2

Write-Host "Ouverture de l'issue #3 - Galerie Photos..." -ForegroundColor Cyan
Start-Process $url3
Start-Sleep -Seconds 2

Write-Host "Ouverture de l'issue #4 - Journal Integration (HIGH PRIORITY)..." -ForegroundColor Yellow
Start-Process $url4
Start-Sleep -Seconds 2

Write-Host "Ouverture de l'issue #5 - Templates Quick Actions..." -ForegroundColor Cyan
Start-Process $url5
Start-Sleep -Seconds 2

Write-Host "Ouverture de l'issue #6 - Intensite Training..." -ForegroundColor Cyan
Start-Process $url6
Start-Sleep -Seconds 2

Write-Host "Ouverture de l'issue #7 - useQuickActions Refactoring..." -ForegroundColor Cyan
Start-Process $url7

Write-Host ""
Write-Host "=== 7 onglets ouverts! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Pour chaque onglet:" -ForegroundColor Yellow
Write-Host "1. Verifie le titre et la description" -ForegroundColor White
Write-Host "2. Ajoute les labels suggeres si pas automatiques" -ForegroundColor White
Write-Host "3. Clique sur 'Submit new issue'" -ForegroundColor White
Write-Host ""
Write-Host "Ordre de priorite recommande:" -ForegroundColor Yellow
Write-Host "  1. Issue #4 - Journal Integration (HIGH)" -ForegroundColor Red
Write-Host "  2. Issue #1 - Coach Programmes (Medium)" -ForegroundColor White
Write-Host "  3. Issue #2 - Coach Rapports (Medium)" -ForegroundColor White
Write-Host "  4. Issue #5 - Templates Quick Actions (Medium)" -ForegroundColor White
Write-Host "  5. Issue #7 - useQuickActions Refactor (Medium)" -ForegroundColor White
Write-Host "  6. Issue #6 - Intensite Training (Low)" -ForegroundColor Gray
Write-Host "  7. Issue #3 - Galerie Photos (Low)" -ForegroundColor Gray
Write-Host ""
Write-Host "Total effort estime: 13-21 jours de developpement" -ForegroundColor Cyan

