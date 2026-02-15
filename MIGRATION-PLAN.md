# Setup and Migration: Old Windows Laptop → ThinkPad T14 Gen 4 + Linux Mint Cinnamon

Step-by-step plan with checkboxes. **Estimate:** 4–8 hours over 1–2 days.

**Current step:** Phase 1 done (upload to Proton in progress). Next: Rufus → Phase 2 on new laptop.  
Assume new laptop is out-of-box (Windows 11 Pro). Dual-boot first, then remove Windows once everything works.

---

## Phase 1: Backup and Prepare Old Laptop (1–2 hours)

### Backup important data
- [x] Copy files (documents, photos, code repos) to external USB or Proton Drive; use encrypted folders (e.g. VeraCrypt) for sensitive data
- [x] **Cursor:** Copy `C:\Users\Gert Jan\AppData\Roaming\Cursor\User\workspaceStorage` (hashed folders with `state.vscdb`) to USB
- [ ] **Browser:** Export bookmarks/passwords (Firefox/Chrome)
- [ ] **Proton:** Download offline copies if needed (already cloud-synced)
- [x] **Git repos:** Push everything to remote (GitHub/GitLab) — GeoSpark.AI pushed

### Document and test
- [ ] Note Windows configs (Citrix, software licenses, custom shortcuts)
- [ ] Test ProtonVPN / Proton Mail / Proton Drive on old laptop once more

### Migration tools
- [x] Download Linux Mint Cinnamon ISO from [linuxmint.com](https://linuxmint.com) — verify SHA256
- [x] Verify ISO: SHA256 matches `a081ab20...c459bd4`
- [ ] Create bootable USB with Rufus (16GB+ USB, DD Image mode) — upload to Proton in progress; use a *different* USB for Mint, or wait for upload to finish then use the 32GB

---

## Phase 2: Initial New Laptop Setup (30–60 min)

### Windows out-of-box
- [ ] Power on, complete Windows setup (minimal; skip Cortana/OneDrive)
- [ ] Sign in with temporary Microsoft account if required (will wipe later)
- [ ] Update Windows: Settings → Update & Security (firmware/BIOS)

### BIOS for Linux
- [ ] Restart, press **F2** (or Fn+F2) for BIOS
- [ ] **Security:** Disable Secure Boot
- [ ] **Boot:** UEFI mode, USB boot first
- [ ] Save & Exit (F10)

### Hardware check in Windows
- [ ] Verify Wi‑Fi, keyboard backlight (Fn+Space), trackpoint, audio, webcam

---

## Phase 3: Install Linux Mint Cinnamon (Dual-Boot) (1–2 hours)

### Boot and test Live
- [ ] Insert Mint USB, restart, **F12** → select USB
- [ ] Boot into Live (try without installing)
- [ ] Test: Wi‑Fi, keyboard (US layout; add PT in Settings → Keyboard if needed), trackpoint, audio
- [ ] Install Cursor (AppImage from cursor.sh): right‑click → Properties → Permissions → Allow executing → run; test AI chat

### Install Mint
- [ ] Double‑click “Install Linux Mint” on desktop
- [ ] Language: English or PT | Keyboard: US (add PT if preferred)
- [ ] Check “Install third-party software”
- [ ] **Installation type:** “Install alongside Windows” (~200GB Mint, 50GB+ Windows)
- [ ] **Encryption:** Check “Encrypt the new Linux Mint installation” (strong passphrase)
- [ ] Create user/password (auto‑login if solo)
- [ ] Reboot → remove USB → choose Mint in GRUB

### Post-install
- [ ] Terminal:
  ```bash
  sudo apt update && sudo apt upgrade -y
  sudo apt install tlp tlp-rdw
  sudo tlp start
  reboot
  ```

---

## Phase 4: Proton Services (30 min)

### ProtonVPN
- [x] Download .deb from [protonvpn.com/download](https://protonvpn.com/download)
- [x] Install (repo or .deb) + launch, log in, kill‑switch / always‑on

### Proton Mail
- [x] Install Thunderbird + Proton Mail Bridge, add to Thunderbird (IMAP/SMTP from Bridge)

### Proton Drive
- [ ] `sudo apt install rclone && rclone config` — remote `protondrive`, WebDAV, url `r.proton.me`
- [ ] Mount: `rclone mount protondrive: ~/ProtonDrive`; add to Startup Applications

---

## Phase 5: Cursor Install and Migrate (30–60 min)

### Install Cursor
- [ ] Download AppImage from [cursor.sh](https://cursor.sh)
- [ ] `chmod +x cursor-*.AppImage && ./cursor-*.AppImage` (optionally move to `/opt`)
- [ ] Right‑click AppImage → Add to Favorites

### Migrate chats/settings
- [ ] Copy old `workspaceStorage` from USB to `~/.config/Cursor/User/workspaceStorage`
- [ ] Launch Cursor; verify chats load (use DB Browser for SQLite if needed)
- [ ] Sign in, test agent/composer; disable unneeded extensions if slow

---

## Phase 6: Local AI — Ollama + Open WebUI (30–60 min)

### Ollama
- [ ] `curl -fsSL https://ollama.com/install.sh | sh`
- [ ] `ollama pull llama3.1:70b-instruct-q4_K_M` (~40GB)
- [ ] `ollama run llama3.1:70b-instruct-q4_K_M` (test in terminal)

### Open WebUI (Docker)
- [ ] `sudo apt install docker.io docker-compose -y`
- [ ] `sudo usermod -aG docker $USER` — then log out/in
- [ ] Run:
  ```bash
  docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
    -v open-webui:/app/backend/data --name open-webui --restart unless-stopped \
    ghcr.io/open-webui/open-webui:main
  ```
- [ ] Open http://localhost:3000, connect to Ollama
- [ ] Test coaching/content with system prompt: “You are my personal improvement coach…”

---

## Phase 7: Privacy/Security (30 min)

- [ ] Firewall: `sudo ufw enable` (allow ProtonVPN if needed)
- [ ] Update Manager: enable auto-updates
- [ ] Firefox via Flatpak: `flatpak install flathub org.mozilla.firefox` + privacy extensions
- [ ] Optional: `sudo apt install firejail` for app sandboxing

---

## Phase 8: Final Migration & Cleanup (30–60 min)

- [ ] Copy files from USB/Proton Drive to Mint home
- [ ] Full test: Wi‑Fi, Proton, Cursor, Ollama, Citrix (install .deb from citrix.com if needed)
- [ ] **Remove Windows (when ready):** Boot Mint → GParted → delete Windows partition → resize Mint to full disk → Apply
- [ ] `sudo update-grub`

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| Hardware quirk (e.g. backlight) | Search “ThinkPad T14 Gen 4 Mint” on forums |
| Weekly backup | `rsync -a /home/ /external/backup/` |
| Need Windows occasionally | Keep dual-boot longer or use VirtualBox VM |

---

*Track progress in Cursor by toggling the checkboxes above.*
