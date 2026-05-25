#!/usr/bin/env bash
# ============================================================================
# DevShakti OS — First Boot Setup Script
# ============================================================================
# Runs once on the user's first login after installation.
# Sets up Wine, validates GPU drivers, applies theme, and shows a welcome.
#
# Copyright © 2026 DevShakti Project — All rights reserved.
# ============================================================================

set -euo pipefail

readonly SCRIPT_NAME="devshakti-first-boot"
readonly LOG_FILE="${HOME}/.local/share/devshakti/first-boot.log"
readonly AUTOSTART_FILE="${HOME}/.config/autostart/devshakti-first-boot.desktop"
readonly WINE_SETUP="/usr/local/bin/devshakti-wine-setup"

# ──────────────────────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────────────────────
mkdir -p "$(dirname "${LOG_FILE}")"

log() {
    echo "[$(date '+%H:%M:%S')] $*" | tee -a "${LOG_FILE}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Desktop Notification Helper
# ──────────────────────────────────────────────────────────────────────────────
notify() {
    notify-send --urgency="${1}" --icon="devshakti" \
        --app-name="DevShakti Setup" "$2" "${3:-}" 2>/dev/null || true
}

# ──────────────────────────────────────────────────────────────────────────────
# Progress Dialog (zenity or kdialog)
# ──────────────────────────────────────────────────────────────────────────────
run_with_progress() {
    local title="$1"
    local text="$2"
    shift 2

    if command -v zenity &>/dev/null; then
        (
            "$@" 2>&1 | tee -a "${LOG_FILE}"
        ) | zenity --progress --pulsate --no-cancel --auto-close \
                   --title="${title}" --text="${text}" --width=450 2>/dev/null || true
    elif command -v kdialog &>/dev/null; then
        local dbusref
        dbusref=$(kdialog --progressbar "${text}" 0 2>/dev/null) || true
        "$@" >> "${LOG_FILE}" 2>&1 || true
        if [[ -n "${dbusref}" ]]; then
            qdbus ${dbusref} close 2>/dev/null || true
        fi
    else
        "$@" >> "${LOG_FILE}" 2>&1 || true
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 1: GPU Validation
# ──────────────────────────────────────────────────────────────────────────────
validate_gpu() {
    log "=== GPU Validation ==="

    # Check AMD GPU
    if lspci | grep -qi "amd\|radeon"; then
        log "AMD GPU detected"
        if command -v vulkaninfo &>/dev/null; then
            local amd_vulkan
            amd_vulkan=$(vulkaninfo --summary 2>/dev/null | grep -i "radeon" | head -1 || echo "")
            if [[ -n "${amd_vulkan}" ]]; then
                log "AMD Vulkan: ${amd_vulkan}"
            else
                log "WARN: AMD Vulkan not detected in vulkaninfo"
            fi
        fi
    fi

    # Check NVIDIA GPU
    if lspci | grep -qi "nvidia"; then
        log "NVIDIA GPU detected"
        if command -v nvidia-smi &>/dev/null; then
            local nvidia_info
            nvidia_info=$(nvidia-smi --query-gpu=name,driver_version --format=csv,noheader 2>/dev/null || echo "driver not loaded")
            log "NVIDIA: ${nvidia_info}"
        else
            log "WARN: nvidia-smi not found — driver may not be loaded"
        fi
    fi

    # OpenGL check
    if command -v glxinfo &>/dev/null; then
        local gl_version
        gl_version=$(glxinfo 2>/dev/null | grep "OpenGL version" | head -1 || echo "unknown")
        log "OpenGL: ${gl_version}"
    fi

    log "GPU validation complete"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 2: Wine/DXVK Setup
# ──────────────────────────────────────────────────────────────────────────────
setup_wine() {
    log "=== Wine Setup ==="

    if [[ -x "${WINE_SETUP}" ]]; then
        log "Running Wine setup script..."
        run_with_progress "DevShakti — Wine Setup" \
            "Configuring Wine and DXVK for Windows app compatibility...\nThis may take a few minutes." \
            "${WINE_SETUP}"
        log "Wine setup complete"
    else
        log "Wine setup script not found at ${WINE_SETUP}, skipping"
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 3: Apply Theme Defaults
# ──────────────────────────────────────────────────────────────────────────────
apply_theme() {
    log "=== Theme Application ==="

    # Set Kvantum as the Qt style engine
    if command -v kvantummanager &>/dev/null; then
        mkdir -p "${HOME}/.config/Kvantum"
        if [[ ! -f "${HOME}/.config/Kvantum/kvantum.kvconfig" ]]; then
            cat > "${HOME}/.config/Kvantum/kvantum.kvconfig" << 'EOF'
[General]
theme=WhiteSur-dark
EOF
            log "Kvantum theme set to WhiteSur-dark"
        fi
    fi

    # Set wallpaper via plasma-apply-wallpaperimage if available
    if command -v plasma-apply-wallpaperimage &>/dev/null; then
        local wallpaper_path="/usr/share/wallpapers/devshakti/devshakti-default.svg"
        if [[ -f "${wallpaper_path}" ]]; then
            plasma-apply-wallpaperimage "${wallpaper_path}" 2>/dev/null || true
            log "Wallpaper set to DevShakti default"
        fi
    fi

    log "Theme application complete"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 4: System Info (fastfetch)
# ──────────────────────────────────────────────────────────────────────────────
show_system_info() {
    log "=== System Information ==="

    if command -v fastfetch &>/dev/null; then
        fastfetch 2>/dev/null | tee -a "${LOG_FILE}" || true
    elif command -v neofetch &>/dev/null; then
        neofetch 2>/dev/null | tee -a "${LOG_FILE}" || true
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 5: Welcome Dialog
# ──────────────────────────────────────────────────────────────────────────────
show_welcome() {
    log "=== Welcome ==="

    local message="Welcome to DevShakti OS! ⚡\n\n"
    message+="Your system has been configured with:\n"
    message+="• KDE Plasma with DevShakti Blue theme\n"
    message+="• Wine + DXVK for Windows app compatibility\n"
    message+="• AMD + NVIDIA GPU drivers\n"
    message+="• Vulkan & OpenGL graphics support\n"
    message+="• TLP power management (auto AC/battery switching)\n\n"
    message+="Tips:\n"
    message+="• Drag & drop .exe files to run Windows apps\n"
    message+="• Right-click .exe files for GPU selection\n"
    message+="• Use 'devshakti-power-mode' to switch power profiles\n"
    message+="• Steam + Proton is pre-installed for gaming\n\n"
    message+="Enjoy your new OS!"

    if command -v kdialog &>/dev/null; then
        kdialog --title "Welcome to DevShakti OS" \
                --msgbox "${message}" 2>/dev/null || true
    elif command -v zenity &>/dev/null; then
        zenity --info --title="Welcome to DevShakti OS" \
               --text="${message}" --width=500 --height=400 2>/dev/null || true
    fi

    notify "normal" "DevShakti OS" "Setup complete! Your system is ready."
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 6: Remove Self from Autostart
# ──────────────────────────────────────────────────────────────────────────────
remove_autostart() {
    if [[ -f "${AUTOSTART_FILE}" ]]; then
        rm -f "${AUTOSTART_FILE}"
        log "Removed first-boot from autostart"
    fi
}

# ══════════════════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════════════════
main() {
    log "============================================"
    log "DevShakti OS First Boot — $(date)"
    log "============================================"

    # Small delay to let desktop fully load
    sleep 3

    validate_gpu
    setup_wine
    apply_theme
    show_system_info
    show_welcome
    remove_autostart

    log "First boot setup complete!"
}

main "$@"
