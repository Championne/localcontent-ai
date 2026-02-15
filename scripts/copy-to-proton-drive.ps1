# Copy important data to Proton Drive (syncs to cloud).
# Run in PowerShell: .\copy-to-proton-drive.ps1
# Keep Proton Drive app open so it syncs after copy.

$date = Get-Date -Format "yyyy-MM-dd"
$dest = "C:\Users\Gert Jan\Proton Drive\Migration-backup-$date"
$destDoc = "$dest\Documents"
$destPics = "$dest\Pictures"
$destDown = "$dest\Downloads"
$destCursor = "$dest\Cursor-backup"

# Exclude dev/build folders to reduce size and file count
$robocopyExclude = "/XD", "node_modules", ".next", ".git", "__pycache__", ".venv", "venv", "dist", "build", ".turbo", ".cache"

New-Item -ItemType Directory -Force -Path $dest | Out-Null
Write-Host "Destination: $dest" -ForegroundColor Cyan
Write-Host ""

# 1. Documents (excluding node_modules etc.)
Write-Host "[1/4] Copying OneDrive\Documents (excluding node_modules, .git, .next)..." -ForegroundColor Yellow
robocopy "C:\Users\Gert Jan\OneDrive\Documents" $destDoc /E /COPY:DAT /R:2 /W:5 /MT:8 $robocopyExclude /NFL /NDL /NP
if ($LASTEXITCODE -ge 8) { Write-Host "Robocopy reported errors (code $LASTEXITCODE). Check destination." }
else { Write-Host "Documents done." -ForegroundColor Green }

# 2. Pictures
Write-Host "[2/4] Copying OneDrive\Pictures..." -ForegroundColor Yellow
robocopy "C:\Users\Gert Jan\OneDrive\Pictures" $destPics /E /COPY:DAT /R:2 /W:5 /MT:8 /NFL /NDL /NP
if ($LASTEXITCODE -ge 8) { Write-Host "Robocopy reported errors." }
else { Write-Host "Pictures done." -ForegroundColor Green }

# 3. Downloads
Write-Host "[3/4] Copying Downloads..." -ForegroundColor Yellow
robocopy "C:\Users\Gert Jan\Downloads" $destDown /E /COPY:DAT /R:2 /W:5 /MT:8 /NFL /NDL /NP
if ($LASTEXITCODE -ge 8) { Write-Host "Robocopy reported errors." }
else { Write-Host "Downloads done." -ForegroundColor Green }

# 4. Cursor backup (workspaceStorage + globalStorage + settings)
Write-Host "[4/4] Copying Cursor User data..." -ForegroundColor Yellow
$cursorUser = "C:\Users\Gert Jan\AppData\Roaming\Cursor\User"
New-Item -ItemType Directory -Force -Path $destCursor | Out-Null
robocopy "$cursorUser\workspaceStorage" "$destCursor\workspaceStorage" /E /COPY:DAT /R:2 /W:5 /NFL /NDL /NP
robocopy "$cursorUser\globalStorage" "$destCursor\globalStorage" /E /COPY:DAT /R:2 /W:5 /NFL /NDL /NP
Copy-Item "$cursorUser\settings.json" "$destCursor\" -ErrorAction SilentlyContinue
Copy-Item "$cursorUser\keybindings.json" "$destCursor\" -ErrorAction SilentlyContinue
Write-Host "Cursor backup done." -ForegroundColor Green

Write-Host ""
Write-Host "Done. Data is in: $dest" -ForegroundColor Cyan
Write-Host "Proton Drive will sync to the cloud. Keep the Proton Drive app open and wait for sync to finish." -ForegroundColor Gray
