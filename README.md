
```
██████╗ ███████╗██╗   ██╗███████╗██╗  ██╗ █████╗ ██╗  ██╗████████╗██╗
██╔══██╗██╔════╝██║   ██║██╔════╝██║  ██║██╔══██╗██║ ██╔╝╚══██╔══╝██║
██║  ██║█████╗  ██║   ██║███████╗███████║███████║█████╔╝    ██║   ██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██╔══██║██╔══██║██╔═██╗    ██║   ██║
██████╔╝███████╗ ╚████╔╝ ███████║██║  ██║██║  ██║██║  ██╗   ██║   ██║
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝
```

# DevShakti OS

> **A custom Arch Linux-based operating system built for power, beauty, and universal compatibility.**

DevShakti is a custom Linux distribution specifically optimized for the **HP Victus 15** laptop with **AMD Ryzen 7 7445HS**, featuring a stunning macOS-inspired desktop environment with seamless Windows and Linux application support.

---

## ✨ Key Features

### 🖥️ Beautiful Desktop
- **macOS-inspired GUI** with frosted glass effects, rounded corners, and a floating dock
- **Light blue monotone** color palette — calming, professional, and unique
- **Smooth animations** and micro-interactions throughout the desktop
- **KDE Plasma 6** with custom DevShakti theme, Kvantum translucency, and blur effects

### 🎮 Universal App & Game Compatibility
- **Linux apps** — Run natively with full performance
- **Windows apps** — Drag-and-drop `.exe` files to run them instantly via Wine
- **Windows games** — Full DirectX 9/10/11/12 support through DXVK + VKD3D-Proton
- **Steam + Proton** — Play your entire Steam library
- **Lutris** — Manage games from GOG, Epic, and more

### ⚡ Hardware-Optimized
- **AMD Ryzen 7 7445HS** — Zen 4 architecture, full performance unlocked
- **AMD Radeon 740M (iGPU)** — RDNA 3, Mesa/RADV Vulkan driver
- **NVIDIA RTX 4050 (dGPU)** — Proprietary driver with PRIME offloading
- **Vulkan 1.3 + OpenGL 3.2+** — Full graphics API support
- **16GB DDR5 RAM** — Optimized memory management

### 🔋 Intelligent Power Management
- **AC Mode**: Full performance — CPU boost enabled, GPU performance mode, maximum clocks
- **Battery Mode**: Optimized for 75Wh battery — CPU powersave, GPU low-power, WiFi power save
- **TLP Integration** — Automatic switching between power profiles
- **Battery longevity** — Charge threshold at 80% to extend battery lifespan

### 🔧 Flexible Installation
- **Full Disk** — Wipe and install on the entire drive
- **Dual Boot** — Install alongside Windows with automatic OS detection
- **Custom Partition (Advanced)** — Manual partitioning for power users

---

## 🛠️ System Specifications

| Component | Detail |
|---|---|
| **Base** | Arch Linux (Rolling Release) |
| **Kernel** | `linux-zen` (optimized for desktop/gaming) |
| **Desktop** | KDE Plasma 6 (Wayland) |
| **Display Manager** | SDDM with DevShakti theme |
| **Boot Splash** | Plymouth with DevShakti animation |
| **Shell** | Zsh + Fish |
| **Package Manager** | pacman + Flatpak |
| **Audio** | PipeWire |
| **Networking** | NetworkManager |
| **File System** | ext4 / Btrfs / XFS (user choice) |

---

## 📦 Pre-Installed Software

### Productivity
- **Firefox** — Web browser
- **Kate** — Text editor
- **Dolphin** — File manager
- **Konsole** — Terminal emulator
- **Okular** — Document viewer
- **Gwenview** — Image viewer
- **LibreOffice** (via Flatpak)

### Gaming
- **Steam** — Game store + Proton
- **Lutris** — Universal game launcher
- **MangoHud** — Performance overlay
- **GameMode** — Performance optimizer
- **ProtonUp-Qt** — Proton version manager

### Development
- **Git** — Version control
- **Python 3** — Programming language
- **Node.js + npm** — JavaScript runtime
- **GCC / Make / CMake** — Build tools
- **VS Code** (via Flatpak)

### Multimedia
- **VLC** — Media player
- **Elisa** — Music player
- **FFmpeg** — Media toolkit

### System
- **GParted** — Partition editor
- **Timeshift** — System snapshots
- **btop** — System monitor
- **Fastfetch** — System info

---

## 🏗️ Building DevShakti OS

### Prerequisites

You need a **running Arch Linux system** (or any Linux with archiso installed) to build the ISO.

```bash
# Install archiso
sudo pacman -S archiso

# Install dependencies for AUR packages
sudo pacman -S git base-devel
```

### Build the ISO

```bash
# Clone the DevShakti source
git clone <repo-url> devshakti
cd devshakti

# Set up symlinks (required — can't create on Windows)
chmod +x archiso/setup-symlinks.sh
sudo bash archiso/setup-symlinks.sh

# Build the ISO (requires root)
chmod +x build.sh
sudo ./build.sh
```

The ISO will be output to `./out/devshakti-<version>-x86_64.iso`.

### Test in a VM

```bash
# UEFI mode (recommended)
qemu-system-x86_64 -enable-kvm -m 4G -bios /usr/share/ovmf/OVMF.fd \
    -cdrom out/devshakti-*.iso

# BIOS mode
qemu-system-x86_64 -enable-kvm -m 4G -cdrom out/devshakti-*.iso
```

### Write to USB Drive

```bash
# Replace /dev/sdX with your USB drive
sudo dd bs=4M if=out/devshakti-*.iso of=/dev/sdX status=progress oflag=sync
```

---

## 💻 Installation Guide

1. **Boot from USB** — Press F9 (HP Victus) to select boot device
2. **Choose Installation Mode**:
   - **Full Disk** — Erases everything, installs DevShakti
   - **Dual Boot** — Keeps Windows, installs DevShakti alongside
   - **Custom** — Manual partitioning for advanced users
3. **Follow the prompts** — Select language, timezone, create user account
4. **Reboot** — Remove USB and enjoy DevShakti!

---

## 🪟 Running Windows Applications

### Drag and Drop
Simply **drag a `.exe` or `.msi` file** into the Dolphin file manager and double-click it. DevShakti will automatically launch it through Wine with optimal settings.

### Right-Click Menu
Right-click any `.exe` file in Dolphin and choose:
- **Run with DevShakti** — Standard execution
- **Run with DevShakti (NVIDIA GPU)** — Force RTX 4050 for games
- **Install Windows App** — Install mode for setup executables

### Command Line
```bash
# Run a Windows executable
devshakti-run-windows /path/to/app.exe

# Run on NVIDIA GPU
devshakti-run-windows --gpu=nvidia /path/to/game.exe

# Install a Windows application
devshakti-run-windows --install /path/to/setup.exe
```

---

## ⚡ Power Profiles

Switch between power modes:

```bash
# Maximum performance (AC power)
devshakti-power-mode performance

# Balanced (default)
devshakti-power-mode balanced

# Battery saver
devshakti-power-mode battery
```

Or use the system tray battery icon to switch modes graphically.

---

## 🎮 GPU Selection

```bash
# Check active GPU
devshakti-gpu-select status

# Switch to NVIDIA for a specific app
prime-run <application>

# Or use the DevShakti wrapper
devshakti-gpu-select nvidia <application>
```

---

## 📁 Project Structure

```
devshakti/
├── build.sh                    # Master ISO build script
├── README.md                   # This file
├── archiso/                    # Archiso profile
│   ├── profiledef.sh           # ISO profile definition
│   ├── packages.x86_64         # Package manifest
│   ├── pacman.conf             # Pacman configuration
│   ├── setup-symlinks.sh       # Symlink creator (run on Linux)
│   ├── airootfs/               # Root filesystem overlay
│   │   ├── etc/                # System configuration
│   │   │   ├── skel/           # Default user home template
│   │   │   ├── modprobe.d/     # GPU driver options
│   │   │   ├── sysctl.d/       # Kernel parameters
│   │   │   ├── tlp.conf        # Power management
│   │   │   └── ...
│   │   └── usr/local/          # DevShakti scripts & assets
│   ├── efiboot/                # UEFI boot config
│   ├── syslinux/               # BIOS boot config
│   └── grub/                   # GRUB config
├── installer/                  # Installation scripts
│   ├── devshakti-install.sh    # Multi-mode installer
│   └── first-boot.sh           # First boot setup
├── theme/                      # Visual theme files
│   ├── plasma/                 # KDE color scheme
│   ├── sddm/                   # Login screen theme
│   ├── plymouth/               # Boot splash theme
│   ├── kvantum/                # Qt widget theme
│   └── wallpaper/              # Default wallpaper
└── preview/                    # Web-based desktop preview
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 📄 License

DevShakti OS is open source. Individual components retain their original licenses:
- Linux kernel: GPLv2
- KDE Plasma: GPLv2/LGPLv2
- Mesa: MIT
- Wine: LGPLv2.1
- NVIDIA drivers: Proprietary

---

## 🙏 Acknowledgments

- **Arch Linux** — The rock-solid base
- **KDE Plasma** — The beautiful desktop
- **Wine & Proton** — Making Windows apps work
- **DXVK & VKD3D-Proton** — DirectX to Vulkan translation
- **Valve / SteamOS** — Proving Linux gaming is real
- **Mesa Project** — Open-source GPU drivers

---

*Built with ⚡ by DevShakti Project*
