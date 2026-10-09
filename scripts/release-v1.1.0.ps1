# ==============================================================================
# WanderWise Continuous Deployment Demonstration Script (v1.0.0 -> v1.1.0)
# Use this script to demonstrate automated CD pipeline execution for your professor.
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  WanderWise - Upgrading Application from v1.0.0 to v1.1.0       " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. Update root package.json
$rootPkgPath = "package.json"
$rootPkg = Get-Content $rootPkgPath -Raw | ConvertFrom-Json
$rootPkg.version = "1.1.0"
$rootPkg | ConvertTo-Json -Depth 10 | Set-Content $rootPkgPath
Write-Host "✅ Updated root package.json version to 1.1.0" -ForegroundColor Green

# 2. Update client package.json
$clientPkgPath = "client/package.json"
$clientPkg = Get-Content $clientPkgPath -Raw | ConvertFrom-Json
$clientPkg.version = "1.1.0"
$clientPkg | ConvertTo-Json -Depth 10 | Set-Content $clientPkgPath
Write-Host "✅ Updated client/package.json version to 1.1.0" -ForegroundColor Green

# 3. Update server package.json & health endpoint
$serverPkgPath = "server/package.json"
$serverPkg = Get-Content $serverPkgPath -Raw | ConvertFrom-Json
$serverPkg.version = "1.1.0"
$serverPkg | ConvertTo-Json -Depth 10 | Set-Content $serverPkgPath
Write-Host "✅ Updated server/package.json version to 1.1.0" -ForegroundColor Green

# 4. Update server health endpoint version string
$serverIndexPath = "server/src/index.js"
(Get-Content $serverIndexPath) -replace "version: '1.0.0'", "version: '1.1.0'" | Set-Content $serverIndexPath
Write-Host "✅ Updated server/src/index.js healthcheck version to 1.1.0" -ForegroundColor Green

# 5. Update Sidebar badge
$sidebarPath = "client/src/components/Sidebar.jsx"
(Get-Content $sidebarPath) -replace "v1.0.0", "v1.1.0" | Set-Content $sidebarPath
Write-Host "✅ Updated client/src/components/Sidebar.jsx badge to v1.1.0" -ForegroundColor Green

# 6. Update Settings badge
$settingsPath = "client/src/pages/SettingsPage.jsx"
(Get-Content $settingsPath) -replace "v1.0.0", "v1.1.0" | Set-Content $settingsPath
Write-Host "✅ Updated client/src/pages/SettingsPage.jsx badge to v1.1.0" -ForegroundColor Green

# 7. Update backend test expectation for healthcheck
$serverTestPath = "server/src/tests/server.test.js"
(Get-Content $serverTestPath) -replace "assert.strictEqual\(data.version, '1.0.0'\);", "assert.strictEqual(data.version, '1.1.0');" | Set-Content $serverTestPath
Write-Host "✅ Updated test suite expectation to 1.1.0" -ForegroundColor Green

Write-Host "`nRunning automated test suite to verify release readiness..." -ForegroundColor Cyan
npm run test:server
npm run test:client

Write-Host "`nGit Status:" -ForegroundColor Yellow
git status --short

Write-Host "`nTo commit and trigger your CI/CD Continuous Deployment demonstration:" -ForegroundColor Cyan
Write-Host '  git add .' -ForegroundColor White
Write-Host '  git commit -m "feat(release): upgrade application to v1.1.0 with enhanced UI"' -ForegroundColor White
Write-Host '  git push origin main' -ForegroundColor White
Write-Host "`nWatch GitHub Actions deploy your v1.1.0 release live on Render!" -ForegroundColor Green
