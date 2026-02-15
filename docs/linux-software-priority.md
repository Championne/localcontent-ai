# Linux-software: prioriteiten (naar aanleiding van Windows-installatie)

## Hoge prioriteit (eerst installeren)

| Windows-app      | Linux-equivalent        | Opmerking |
|------------------|-------------------------|-----------|
| **Git**          | `sudo apt install git`  | Voor repos (GeoSpark, etc.). |
| **Node.js**      | `sudo apt install nodejs npm` of nvm | Voor Next.js/GeoSpark. |
| **Python**       | `python3` (vaak al aanwezig), `sudo apt install python3-pip python3-venv` | Scripts, tooling. |
| **KeePassXC**    | `sudo apt install keepassxc` | Wachtwoorden;zelfde app. |
| **DB Browser for SQLite** | `sudo apt install sqlitebrowser` | Sticky Notes / SQLite (plum.sqlite). |
| **VLC**          | `sudo apt install vlc`  | Video/audio. |
| **Proton Drive** | rclone (zie migration plan) | Al gepland; nog configureren. |

## Middelhoge prioriteit (handig voor dagelijks gebruik)

| Windows-app        | Linux-equivalent              | Opmerking |
|--------------------|-------------------------------|-----------|
| **Brave**          | Firefox Flatpak (aanbevolen) of Brave voor Linux | Browser; privacy. |
| **Microsoft Office** | `sudo apt install libreoffice-writer libreoffice-calc libreoffice-impress` | Documenten, spreadsheets, presentaties. |
| **Adobe Acrobat (PDF)** | `sudo apt install okular` of Evince (standaard) | PDF lezen/annoteren. |
| **qBittorrent**    | `sudo apt install qbittorrent` | Torrents. |
| **calibre**        | `sudo apt install calibre`   | E-books. |
| **Tailscale**      | Zie https://tailscale.com/download/linux | VPN/mesh; officiële Linux-client. |
| **Gpg4win / GPG**  | `sudo apt install gnupg seahorse` of Kleopatra | Versleuteling, sleutels. |

## Optioneel (naar behoefte)

| Windows-app     | Linux-equivalent        | Opmerking |
|-----------------|--------------------------|-----------|
| **Sublime Text**| `sudo apt install sublime-text` of alleen Cursor | Teksteditor; Cursor dekt veel. |
| **DaVinci Resolve** | DaVinci Resolve (Linux-versie van Blackmagic) | Video-editing;zelfde product. |
| **Haveno**      | Controleren op haveno.org of Linux-build beschikbaar is | DEX. |
| **Citrix Workspace** | Citrix Workspace-app voor Linux (citrix.com) | Alleen als je voor werk op Citrix moet. |

## Niet nodig / Anders op Linux

| Windows-app              | Opmerking |
|--------------------------|-----------|
| Malwarebytes             | Niet dezelfde behoefte; eventueel ClamAV. |
| Lenovo System Update      | Update Manager + `fwupd` voor firmware. |
| Rufus                     | Al gebruikt; voor later: Ventoy of `dd`. |
| Apple Mobile Device Support | Bij iPhone-sync: `libimobiledevice` of alleen cloud. |
| EaseUS MobiMover         | KDE Connect of MTP in bestandsbeheer. |
| Alle Citrix-onderdelen    | Alleen Citrix Workspace-app indien werk. |
| Visual C++ / .NET runtimes | Niet van toepassing. |

---

## Snelle installatie (copy-paste)

**Stap 1 – Basis (hoge prioriteit):**
```bash
sudo apt update
sudo apt install -y git nodejs npm python3 python3-pip python3-venv keepassxc sqlitebrowser vlc
```

**Stap 2 – Kantoor + PDF + torrents + calibre:**
```bash
sudo apt install -y libreoffice-writer libreoffice-calc libreoffice-impress okular qbittorrent calibre
```

**Stap 3 – GPG (Seahorse voor sleutelbeheer):**
```bash
sudo apt install -y gnupg seahorse
```

**Stap 4 – Tailscale (als gewenst):**
- https://tailscale.com/download/linux → instructies voor je distro volgen.

**Stap 5 – Proton Drive:**
- Zie MIGRATION-PLAN.md: rclone configureren en eventueel mounten.

**Stap 6 – Browser:**
```bash
flatpak install flathub org.mozilla.firefox
```

---

## Volgorde aanbevolen

1. Git, Node.js, Python, KeePassXC, DB Browser, VLC (stap 1).  
2. Proton Drive (rclone) als je cloudbestanden lokaal wilt.  
3. LibreOffice, Okular, qBittorrent, calibre (stap 2).  
4. Firefox Flatpak (+ uBlock).  
5. Tailscale als je dat netwerk gebruikt.  
6. Overige optioneel (Sublime, DaVinci, Citrix) alleen indien nodig.
