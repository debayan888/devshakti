#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                   DevShakti OS — Build Setup Script                        ║
# ║                                                                            ║
# ║  Creates required symlinks, enables essential systemd services, and        ║
# ║  performs locale configuration for the DevShakti OS live/installed image.   ║
# ║                                                                            ║
# ║  This script is intended to be run ONCE during the archiso build process   ║
# ║  (inside the chroot), or during first-boot setup.                          ║
# ║                                                                            ║
# ║  Usage:                                                                    ║
# ║    sudo ./setup-symlinks.sh [--chroot /path/to/airootfs]                   ║
# ║                                                                            ║
# ║  Copyright © 2026 DevShakti Project — MIT License                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

readonly SCRIPT_NAME="setup-symlinks.sh"
readonly VERSION="1.0.0"

# Colour helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# Logging Helpers
# ─────────────────────────────────────────────────────────────────────────────

log_info()    { echo -e "${GREEN}[INFO]${RESET}    $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${RESET}    $*" >&2; }
log_error()   { echo -e "${RED}[ERROR]${RESET}   $*" >&2; }
log_step()    { echo -e "${CYAN}  →${RESET} $*"; }
log_section() { echo -e "\n${BOLD}━━━ $* ━━━${RESET}\n"; }

# ─────────────────────────────────────────────────────────────────────────────
# Argument Parsing
# ─────────────────────────────────────────────────────────────────────────────

# Optional chroot prefix — when running outside the chroot during build,
# pass --chroot /path/to/airootfs to prefix all paths.
CHROOT_PREFIX=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --chroot)
            CHROOT_PREFIX="${2:-}"
            if [[ -z "$CHROOT_PREFIX" ]]; then
                log_error "--chroot requires a path argument."
                exit 1
            fi
            shift 2
            ;;
        --help|-h)
            echo "Usage: sudo ${SCRIPT_NAME} [--chroot /path/to/airootfs]"
            echo ""
            echo "Options:"
            echo "  --chroot PATH   Prefix all system paths with PATH (for build-time use)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# ─────────────────────────────────────────────────────────────────────────────
# Root Check
# ─────────────────────────────────────────────────────────────────────────────

if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root."
    log_error "Re-run with: sudo ./${SCRIPT_NAME}"
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Helper: safe_symlink
# Creates a symlink, removing any existing file/symlink at the target first.
# ─────────────────────────────────────────────────────────────────────────────

safe_symlink() {
    local target="$1"    # Where the symlink points TO
    local link_path="$2" # The symlink itself

    local full_link="${CHROOT_PREFIX}${link_path}"
    local link_dir
    link_dir=$(dirname "$full_link")

    # Ensure parent directory exists
    mkdir -p "$link_dir"

    # Remove existing file/symlink if present
    if [[ -e "$full_link" ]] || [[ -L "$full_link" ]]; then
        rm -f "$full_link"
    fi

    ln -sf "$target" "$full_link"
    log_step "Symlink: ${link_path} → ${target}"
}

# ─────────────────────────────────────────────────────────────────────────────
# Helper: enable_service
# Enables a systemd service by creating the appropriate symlink.
# When inside a chroot, we can't use systemctl, so we create the symlinks
# manually in the correct systemd directories.
# ─────────────────────────────────────────────────────────────────────────────

enable_service() {
    local service_name="$1"
    local wanted_by="${2:-multi-user.target}"  # Default target

    local service_file="/usr/lib/systemd/system/${service_name}"
    local wants_dir="/etc/systemd/system/${wanted_by}.wants"

    # Check if the service unit file exists (within chroot if applicable)
    if [[ ! -f "${CHROOT_PREFIX}${service_file}" ]]; then
        log_warn "Service unit '${service_name}' not found — skipping."
        return 0
    fi

    local full_wants_dir="${CHROOT_PREFIX}${wants_dir}"
    mkdir -p "$full_wants_dir"

    local full_link="${full_wants_dir}/${service_name}"
    if [[ -e "$full_link" ]] || [[ -L "$full_link" ]]; then
        rm -f "$full_link"
    fi

    ln -sf "$service_file" "$full_link"
    log_step "Enabled: ${service_name} (WantedBy=${wanted_by})"
}

# ─────────────────────────────────────────────────────────────────────────────
# Helper: enable_timer
# Enables a systemd timer by creating the appropriate symlink in timers.target.wants.
# ─────────────────────────────────────────────────────────────────────────────

enable_timer() {
    local timer_name="$1"

    local timer_file="/usr/lib/systemd/system/${timer_name}"
    local wants_dir="/etc/systemd/system/timers.target.wants"

    if [[ ! -f "${CHROOT_PREFIX}${timer_file}" ]]; then
        log_warn "Timer unit '${timer_name}' not found — skipping."
        return 0
    fi

    local full_wants_dir="${CHROOT_PREFIX}${wants_dir}"
    mkdir -p "$full_wants_dir"

    local full_link="${full_wants_dir}/${timer_name}"
    if [[ -e "$full_link" ]] || [[ -L "$full_link" ]]; then
        rm -f "$full_link"
    fi

    ln -sf "$timer_file" "$full_link"
    log_step "Enabled timer: ${timer_name}"
}

# ═════════════════════════════════════════════════════════════════════════════
#  MAIN SETUP
# ═════════════════════════════════════════════════════════════════════════════

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║          DevShakti OS — Build Setup v${VERSION}                ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

if [[ -n "$CHROOT_PREFIX" ]]; then
    log_info "Chroot prefix: ${CHROOT_PREFIX}"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 1. Create Display Manager Symlink
# ─────────────────────────────────────────────────────────────────────────────

log_section "1. Display Manager Symlink"

# The display-manager.service symlink is what systemd uses to know which
# display manager to start. We point it to SDDM (the DevShakti default).
safe_symlink \
    "/usr/lib/systemd/system/sddm.service" \
    "/etc/systemd/system/display-manager.service"

log_info "Display manager set to SDDM."

# ─────────────────────────────────────────────────────────────────────────────
# 2. Enable Core System Services
# ─────────────────────────────────────────────────────────────────────────────

log_section "2. Core System Services"

# NetworkManager — Primary network management daemon
enable_service "NetworkManager.service" "multi-user.target"

# NetworkManager dispatcher and wait-online (for services needing network)
enable_service "NetworkManager-dispatcher.service" "multi-user.target"
enable_service "NetworkManager-wait-online.service" "network-online.target"

# Bluetooth daemon
enable_service "bluetooth.service" "multi-user.target"

# SDDM display manager (also enabled via the symlink above, but we add the
# wants link for belt-and-suspenders reliability)
enable_service "sddm.service" "graphical.target"

log_info "Core system services enabled."

# ─────────────────────────────────────────────────────────────────────────────
# 3. Enable Power Management Services
# ─────────────────────────────────────────────────────────────────────────────

log_section "3. Power Management Services"

# TLP — Advanced power management for Linux laptops
enable_service "tlp.service" "multi-user.target"

# Mask systemd-rfkill to avoid conflicts with TLP's rfkill handling
local_mask_dir="${CHROOT_PREFIX}/etc/systemd/system"
mkdir -p "$local_mask_dir"
if [[ ! -L "${local_mask_dir}/systemd-rfkill.service" ]]; then
    ln -sf /dev/null "${local_mask_dir}/systemd-rfkill.service" 2>/dev/null || true
    log_step "Masked: systemd-rfkill.service (conflicts with TLP)"
fi
if [[ ! -L "${local_mask_dir}/systemd-rfkill.socket" ]]; then
    ln -sf /dev/null "${local_mask_dir}/systemd-rfkill.socket" 2>/dev/null || true
    log_step "Masked: systemd-rfkill.socket (conflicts with TLP)"
fi

# fstrim.timer — Periodic TRIM for SSD health and performance
enable_timer "fstrim.timer"

# thermald — Intel/AMD thermal management (optional, may not exist on all systems)
if [[ -f "${CHROOT_PREFIX}/usr/lib/systemd/system/thermald.service" ]]; then
    enable_service "thermald.service" "multi-user.target"
    log_info "thermald enabled for thermal management."
else
    log_warn "thermald not found — skipping (install if needed: pacman -S thermald)."
fi

log_info "Power management services configured."

# ─────────────────────────────────────────────────────────────────────────────
# 4. Enable NVIDIA Services
# ─────────────────────────────────────────────────────────────────────────────

log_section "4. NVIDIA GPU Services"

# nvidia-persistenced — Keeps the NVIDIA driver state persistent between
# GPU operations, reducing initialization latency.
enable_service "nvidia-persistenced.service" "multi-user.target"

# nvidia-suspend / resume / hibernate hooks for proper GPU power management
enable_service "nvidia-suspend.service" "multi-user.target"
enable_service "nvidia-resume.service" "multi-user.target"
enable_service "nvidia-hibernate.service" "multi-user.target"

log_info "NVIDIA GPU services configured."

# ─────────────────────────────────────────────────────────────────────────────
# 5. Enable Printing & Network Discovery Services
# ─────────────────────────────────────────────────────────────────────────────

log_section "5. Printing & Network Discovery"

# CUPS — Common Unix Printing System
enable_service "cups.service" "multi-user.target"

# cups-browsed — Browse remote CUPS/IPP printers automatically
enable_service "cups-browsed.service" "multi-user.target"

# Avahi daemon — mDNS/DNS-SD for network service discovery (printers, etc.)
enable_service "avahi-daemon.service" "multi-user.target"

log_info "Printing and network discovery services enabled."

# ─────────────────────────────────────────────────────────────────────────────
# 6. Enable Additional Services
# ─────────────────────────────────────────────────────────────────────────────

log_section "6. Additional Services"

# systemd-timesyncd — NTP time synchronization
enable_service "systemd-timesyncd.service" "sysinit.target"

# cronie — Cron job scheduler (if installed)
if [[ -f "${CHROOT_PREFIX}/usr/lib/systemd/system/cronie.service" ]]; then
    enable_service "cronie.service" "multi-user.target"
    log_step "Cron scheduler (cronie) enabled."
fi

# earlyoom — Early OOM killer for better system responsiveness under memory pressure
if [[ -f "${CHROOT_PREFIX}/usr/lib/systemd/system/earlyoom.service" ]]; then
    enable_service "earlyoom.service" "multi-user.target"
    log_step "earlyoom enabled for OOM protection."
fi

# firewalld or ufw — Firewall (enable whichever is installed)
if [[ -f "${CHROOT_PREFIX}/usr/lib/systemd/system/firewalld.service" ]]; then
    enable_service "firewalld.service" "multi-user.target"
    log_step "firewalld enabled."
elif [[ -f "${CHROOT_PREFIX}/usr/lib/systemd/system/ufw.service" ]]; then
    enable_service "ufw.service" "multi-user.target"
    log_step "ufw enabled."
else
    log_warn "No firewall service found — consider installing firewalld or ufw."
fi

log_info "Additional services configured."

# ─────────────────────────────────────────────────────────────────────────────
# 7. Create Additional Symlinks
# ─────────────────────────────────────────────────────────────────────────────

log_section "7. Additional Symlinks"

# Ensure /etc/devshakti config directory exists
mkdir -p "${CHROOT_PREFIX}/etc/devshakti"
log_step "Created /etc/devshakti/ configuration directory."

# Default GPU mode file
if [[ ! -f "${CHROOT_PREFIX}/etc/devshakti/gpu-mode" ]]; then
    echo "hybrid" > "${CHROOT_PREFIX}/etc/devshakti/gpu-mode"
    log_step "Set default GPU mode to 'hybrid'."
fi

# Ensure devshakti-gpu-select is executable
if [[ -f "${CHROOT_PREFIX}/usr/local/bin/devshakti-gpu-select" ]]; then
    chmod +x "${CHROOT_PREFIX}/usr/local/bin/devshakti-gpu-select"
    log_step "Set executable permission on devshakti-gpu-select."
fi

# Symlink /usr/local/bin/gpu-select as a convenience alias
safe_symlink \
    "/usr/local/bin/devshakti-gpu-select" \
    "/usr/local/bin/gpu-select"

log_info "Additional symlinks created."

# ─────────────────────────────────────────────────────────────────────────────
# 8. Locale Configuration
# ─────────────────────────────────────────────────────────────────────────────

log_section "8. Locale Configuration"

locale_gen_file="${CHROOT_PREFIX}/etc/locale.gen"
locale_conf_file="${CHROOT_PREFIX}/etc/locale.conf"

# Ensure en_US.UTF-8 is uncommented in locale.gen
if [[ -f "$locale_gen_file" ]]; then
    # Uncomment en_US.UTF-8 if it's commented out
    sed -i 's/^#\s*\(en_US.UTF-8 UTF-8\)/\1/' "$locale_gen_file"
    log_step "Enabled en_US.UTF-8 in locale.gen."
else
    # Create locale.gen with the required locale
    echo "en_US.UTF-8 UTF-8" > "$locale_gen_file"
    log_step "Created locale.gen with en_US.UTF-8."
fi

# Write locale.conf
cat > "$locale_conf_file" <<'LOCALE_EOF'
# DevShakti OS — System Locale Configuration
LANG=en_US.UTF-8
LC_ALL=en_US.UTF-8
LOCALE_EOF
log_step "Written ${locale_conf_file}."

# Generate locales — only works if we're running inside the chroot
# (or on the actual system). Outside chroot, locale-gen won't be available.
if [[ -z "$CHROOT_PREFIX" ]]; then
    if command -v locale-gen &>/dev/null; then
        locale-gen
        log_step "Locales generated."
    else
        log_warn "locale-gen not found — locales will be generated on first boot."
    fi
else
    log_info "Running in chroot mode — locale-gen should be run inside the chroot."
    log_info "  arch-chroot ${CHROOT_PREFIX} locale-gen"
fi

log_info "Locale configuration complete."

# ─────────────────────────────────────────────────────────────────────────────
# Done!
# ─────────────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        DevShakti OS — Setup Complete! ✓                     ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""
log_info "All symlinks created and services enabled."
log_info "If running outside chroot, remember to:"
log_info "  1. Run locale-gen inside the chroot"
log_info "  2. Verify services with: systemctl list-unit-files --state=enabled"
echo ""
