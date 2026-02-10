# Linux Mint Cinnamon Setup Guide – New Machine (February 2026)

**Target version:** Linux Mint 22.x Cinnamon (based on Ubuntu 24.04 LTS)  
**Edition:** Cinnamon (most polished & Windows-like)  
**Goal:** Stable, fast, developer-friendly system with good battery life (if laptop), security defaults, and minimal bloat.

---

## Phase 0 – Before the computer arrives (do this on your current machine)

### Download the ISO

- Go to https://linuxmint.com/download.php
- Choose **Cinnamon** edition → pick a mirror close to you
- Download the `.iso` file (~2.5–3 GB)
- **Verify the SHA256 checksum** (very important):
  - **Windows:** PowerShell → `Get-FileHash path\to\linuxmint-22.x-cinnamon.iso -Algorithm SHA256`
  - **macOS/Linux:** `shasum -a 256 linuxmint-...iso`
  - Compare with value on the download page.

### Prepare bootable USB (min 8 GB, will be erased)

**Recommended tools:**

- **Windows** → [Rufus](https://rufus.ie) – DD Image mode
- **macOS** → balenaEtcher or `dd` command
- **Linux** → balenaEtcher, Ventoy, or `dd`

Create the stick → test it boots on another computer if possible.

### Decide installation choices (write down / screenshot)

- Language & keyboard layout
- **Full-disk encryption?** (LUKS + LVM recommended if laptop / sensitive data)
- **Partitioning:**
  - **Simple:** Erase disk & install Mint
  - **Advanced:** Manual → EFI (~512 MB fat32), /boot (1–2 GB ext4 if encrypted), rest encrypted LVM (/ + swap)
- Username, computer name, password (strong, remember it!)
- Will you want **Timeshift** snapshots? (yes → enable during install)
- Backup anything important from old machine (external drive / cloud).

---

## Phase 1 – Installation (30–60 min)

### Boot from USB

- Enter BIOS/UEFI (usually Del, F2, F10, F12, Esc)
- Disable Secure Boot if it causes problems (most Mint installs work with it now; disable if black screen/grub issues)
- Set USB as first boot device or use one-time boot menu
- Boot → choose **Start Linux Mint** (live session)

### Double-click **Install Linux Mint** on desktop

Follow wizard:

- Language / keyboard
- **Multimedia codecs** → Yes
- **Installation type:**
  - **Erase disk and install** (easiest & recommended for new machine)
  - Or **Something else** if manual partitioning / encryption
- If encryption: choose **Encrypt the new Linux Mint installation for security** + LVM
- **Where are you?** → timezone
- **Who are you?** → username, computer name, password
- **Install third-party software** → Yes (for Wi-Fi, graphics, MP3, etc.)

Wait for copy + install (10–25 min) → reboot → remove USB.

### First boot

- Login
- **Welcome to Linux Mint** screen → run **Driver Manager** if offered (install NVIDIA/AMD if needed)
- Connect to Wi-Fi if not already

---

## Phase 2 – First 30–60 minutes after login (must-do)

Order matters somewhat – do top-to-bottom.

### Update everything immediately

- **Update Manager** (shield icon) → Refresh → Install all Level 1–3 updates  
- Or terminal (faster):

```bash
sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove -y
sudo timeshift --create --comments "Fresh install baseline"
```

### Enable Timeshift (system snapshots – your best friend)

- Menu → **Administration** → **Timeshift**
- Choose **RSYNC** mode → select snapshot location (separate partition or external drive best)
- Schedule daily/weekly → **Create first snapshot now**

### Install basic tools & developer essentials

Copy-paste in terminal:

```bash
sudo apt install -y \
  git curl wget build-essential dkms linux-headers-$(uname -r) \
  vim nano htop neofetch lm-sensors \
  gnome-tweaks dconf-editor \
  flatpak timeshift \
  code   # if you want official VS Code .deb
```

Add Flatpak support (for more apps):

```bash
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

### Set up firewall (simple but effective)

```bash
sudo apt install gufw
sudo ufw enable
```

### Graphics / proprietary drivers (if NVIDIA / AMD / Broadcom Wi-Fi)

- Menu → **Administration** → **Driver Manager** → apply recommended

### Power / battery tweaks (laptop)

```bash
sudo apt install tlp tlp-rdw
sudo tlp start
sudo tlp-stat -s   # check status
```

### Change default browser if desired (Firefox → Chrome / Brave / Edge)

- **Software Manager** → search → install

---

## Phase 3 – Developer setup (1–3 hours)

### Node.js (nvm – recommended over apt)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# close & reopen terminal
nvm install node   # latest LTS
nvm install --lts
```

### Python (system + pyenv or conda if needed)

```bash
sudo apt install python3 python3-pip python3-venv python3-dev
```

### Docker / Podman / containers

```bash
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER   # log out & in
```

### Cursor / VS Code

- **Cursor:** download `.AppImage` or `.deb` from [cursor.sh](https://cursor.sh) → make executable or install
- **VS Code:** `sudo snap install code --classic` or official .deb

### Git config (global)

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global init.defaultBranch main
```

### Fonts & terminal look (optional but nice)

```bash
sudo apt install fonts-firacode fonts-jetbrains-mono
# Then in Terminal → Edit → Preferences → Profile → Text → Custom font
```

### Other common dev tools

```bash
sudo apt install -y \
  zsh fish \
  jq yq ripgrep fd-find bat fzf \
  httpie \
  direnv \
  exa eza   # modern ls
```

---

## Phase 4 – Final personalization & security

- **Cinnamon tweaks:** Menu → **Preferences** → Themes / Window borders / Icons / Applets
- Hot corners, panel layout, menu style
- **Night Light** / fractional scaling (if 1440p+ or HiDPI screen)
- Backup browser bookmarks / passwords / **SSH keys** from old machine
- Set up SSH key for GitHub/GitLab: `ssh-keygen -t ed25519` → add public key online
- Enable **automatic security updates** in Update Manager → Preferences

---

## Quick command cheat-sheet (save this)

```bash
# Daily update + snapshot
sudo apt update && sudo apt full-upgrade -y && sudo apt autoremove
sudo timeshift --create --comments "Daily update"

# Check battery / thermals
upower -i /org/freedesktop/UPower/devices/battery_BAT0
sensors
```

---

## If something goes wrong

If anything hardware-specific fails (Wi-Fi, suspend, brightness), search:

**"Linux Mint 22 [your hardware model] [problem]"**

or ask on [forums.linuxmint.com](https://forums.linuxmint.com).

---

**Save this document on a USB stick / phone / cloud so you have it ready when the computer arrives.**

Good luck with the new setup — Linux Mint Cinnamon is one of the smoothest transitions from Windows/macOS for developers.
