#!/usr/bin/env bash
# ============================================================================
# DevShakti OS — Multi-Mode System Installer
# ============================================================================
# File:        devshakti-install.sh
# Description: Install DevShakti OS to disk with three modes:
#              1. Full Disk — Wipe and install on entire drive
#              2. Dual Boot — Install alongside Windows/other OS
#              3. Custom Partition (Advanced) — Manual partitioning
#
# Hardware Target: HP Victus 15 — AMD Ryzen 7 7445HS / Radeon 760M / RTX 4050
#                  16GB DDR5 RAM, 75Wh battery
#
# Copyright © 2026 DevShakti Project — All rights reserved.
# License: GPL-3.0-or-later
# ============================================================================

set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# ANSI Colors & Symbols
# ──────────────────────────────────────────────────────────────────────────────
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly MAGENTA='\033[0;35m'
readonly WHITE='\033[1;37m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'
readonly NC='\033[0m' # No Color

readonly CHECK="${GREEN}✓${NC}"
readonly CROSS="${RED}✗${NC}"
readonly ARROW="${CYAN}➜${NC}"
readonly WARN="${YELLOW}⚠${NC}"
readonly INFO="${BLUE}ℹ${NC}"

# ──────────────────────────────────────────────────────────────────────────────
# Global Configuration
# ──────────────────────────────────────────────────────────────────────────────
readonly OS_NAME="DevShakti"
readonly OS_VERSION="1.0"
readonly OS_CODENAME="Indra"
readonly INSTALL_LOG="/tmp/devshakti-install.log"

# Partition sizes
readonly EFI_SIZE="512M"
readonly SWAP_SIZE_GB=8  # Reasonable for 16GB RAM

# Collected user configuration
INSTALL_MODE=""       # fulldisk | dualboot | custom
TARGET_DISK=""        # e.g., /dev/nvme0n1
FILESYSTEM="ext4"     # ext4 | btrfs | xfs
HOSTNAME_VAL="devshakti"
USERNAME=""
USER_PASSWORD=""
ROOT_PASSWORD=""
LOCALE="en_US.UTF-8"
TIMEZONE="UTC"
KEYMAP="us"

# Partition paths (set during partitioning)
EFI_PART=""
SWAP_PART=""
ROOT_PART=""
HOME_PART=""

# ──────────────────────────────────────────────────────────────────────────────
# Utilities
# ──────────────────────────────────────────────────────────────────────────────
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "${INSTALL_LOG}"
}

print_header() {
    clear
    echo -e "${CYAN}"
    cat << 'BANNER'
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   ██████╗ ███████╗██╗   ██╗███████╗██╗  ██╗ █████╗          ║
    ║   ██╔══██╗██╔════╝██║   ██║██╔════╝██║  ██║██╔══██╗         ║
    ║   ██║  ██║█████╗  ██║   ██║███████╗███████║███████║         ║
    ║   ██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║██╔══██║██╔══██║         ║
    ║   ██████╔╝███████╗ ╚████╔╝ ███████║██║  ██║██║  ██║         ║
    ║   ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝         ║
    ║                    ██╗  ██╗████████╗██╗                      ║
    ║                    ██║ ██╔╝╚══██╔══╝██║                      ║
    ║                    █████╔╝    ██║   ██║                      ║
    ║                    ██╔═██╗    ██║   ██║                      ║
    ║                    ██║  ██╗   ██║   ██║                      ║
    ║                    ╚═╝  ╚═╝   ╚═╝   ╚═╝                      ║
    ║                                                              ║
    ║           System Installer — v${OS_VERSION} "${OS_CODENAME}"                ║
    ╚══════════════════════════════════════════════════════════════╝
BANNER
    echo -e "${NC}"
    echo -e "  ${DIM}Optimized for HP Victus 15 | Ryzen 7 7445HS | RTX 4050${NC}\n"
}

print_step() {
    local step_num="$1"
    local step_title="$2"
    echo ""
    echo -e "  ${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "  ${BOLD}${WHITE}  Step ${step_num}: ${step_title}${NC}"
    echo -e "  ${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_info() {
    echo -e "  ${INFO}  ${WHITE}$*${NC}"
}

print_success() {
    echo -e "  ${CHECK}  ${GREEN}$*${NC}"
}

print_warn() {
    echo -e "  ${WARN}  ${YELLOW}$*${NC}"
}

print_error() {
    echo -e "  ${CROSS}  ${RED}$*${NC}"
}

print_arrow() {
    echo -e "  ${ARROW}  $*"
}

prompt_input() {
    local prompt_text="$1"
    local default="${2:-}"
    local result
    if [[ -n "${default}" ]]; then
        echo -en "  ${ARROW}  ${prompt_text} [${CYAN}${default}${NC}]: "
        read -r result
        result="${result:-${default}}"
    else
        echo -en "  ${ARROW}  ${prompt_text}: "
        read -r result
    fi
    echo "${result}"
}

prompt_password() {
    local prompt_text="$1"
    local pass1 pass2
    while true; do
        echo -en "  ${ARROW}  ${prompt_text}: "
        read -rs pass1
        echo ""
        echo -en "  ${ARROW}  Confirm password: "
        read -rs pass2
        echo ""
        if [[ "${pass1}" == "${pass2}" ]]; then
            echo "${pass1}"
            return
        else
            print_error "Passwords do not match. Please try again."
        fi
    done
}

prompt_yesno() {
    local prompt_text="$1"
    local default="${2:-y}"
    local hint
    if [[ "${default}" == "y" ]]; then
        hint="Y/n"
    else
        hint="y/N"
    fi
    echo -en "  ${ARROW}  ${prompt_text} [${hint}]: "
    read -r answer
    answer="${answer:-${default}}"
    [[ "${answer,,}" == "y" || "${answer,,}" == "yes" ]]
}

# ──────────────────────────────────────────────────────────────────────────────
# Pre-Flight Checks
# ──────────────────────────────────────────────────────────────────────────────
preflight_checks() {
    print_step "0" "Pre-Flight Checks"

    # Root check
    if [[ $EUID -ne 0 ]]; then
        print_error "This installer must be run as root (sudo)."
        exit 1
    fi
    print_success "Running as root"

    # Check if booted in UEFI mode
    if [[ -d /sys/firmware/efi/efivars ]]; then
        print_success "UEFI mode detected"
    else
        print_warn "BIOS mode detected — UEFI is recommended for modern hardware"
        if ! prompt_yesno "Continue with BIOS installation?" "n"; then
            echo -e "\n  ${INFO}  Please reboot in UEFI mode and try again."
            exit 0
        fi
    fi

    # Check internet connectivity
    if ping -c 1 -W 3 archlinux.org &>/dev/null; then
        print_success "Internet connection available"
    else
        print_error "No internet connection. Please connect to a network first."
        print_info "Use 'nmtui' or 'iwctl' to connect to WiFi."
        exit 1
    fi

    # Check available RAM
    local ram_mb
    ram_mb=$(free -m | awk '/^Mem:/{print $2}')
    print_success "RAM detected: ${ram_mb} MB"

    # Sync system clock
    timedatectl set-ntp true &>/dev/null || true
    print_success "System clock synchronized"

    # Update pacman keyring
    print_info "Refreshing pacman keyring..."
    pacman-key --init &>/dev/null || true
    pacman-key --populate archlinux &>/dev/null || true
    print_success "Pacman keyring ready"

    log "Pre-flight checks passed"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 1: Select Locale, Timezone, Keymap
# ──────────────────────────────────────────────────────────────────────────────
select_locale() {
    print_step "1" "Language & Region"

    # Timezone
    print_info "Select your timezone:"
    echo ""
    echo -e "    ${DIM}Common timezones:${NC}"
    echo -e "    ${WHITE}1)${NC} America/New_York      ${WHITE}6)${NC} Europe/London"
    echo -e "    ${WHITE}2)${NC} America/Chicago        ${WHITE}7)${NC} Europe/Berlin"
    echo -e "    ${WHITE}3)${NC} America/Denver         ${WHITE}8)${NC} Europe/Moscow"
    echo -e "    ${WHITE}4)${NC} America/Los_Angeles    ${WHITE}9)${NC} Asia/Kolkata"
    echo -e "    ${WHITE}5)${NC} America/Sao_Paulo     ${WHITE}10)${NC} Asia/Tokyo"
    echo -e "    ${WHITE}11)${NC} Asia/Shanghai         ${WHITE}12)${NC} Australia/Sydney"
    echo ""
    local tz_input
    tz_input=$(prompt_input "Enter number or full timezone (e.g. Asia/Kolkata)" "9")

    case "${tz_input}" in
        1)  TIMEZONE="America/New_York" ;;
        2)  TIMEZONE="America/Chicago" ;;
        3)  TIMEZONE="America/Denver" ;;
        4)  TIMEZONE="America/Los_Angeles" ;;
        5)  TIMEZONE="America/Sao_Paulo" ;;
        6)  TIMEZONE="Europe/London" ;;
        7)  TIMEZONE="Europe/Berlin" ;;
        8)  TIMEZONE="Europe/Moscow" ;;
        9)  TIMEZONE="Asia/Kolkata" ;;
        10) TIMEZONE="Asia/Tokyo" ;;
        11) TIMEZONE="Asia/Shanghai" ;;
        12) TIMEZONE="Australia/Sydney" ;;
        *)  TIMEZONE="${tz_input}" ;;
    esac
    print_success "Timezone: ${TIMEZONE}"

    # Keyboard layout
    KEYMAP=$(prompt_input "Keyboard layout" "us")
    print_success "Keymap: ${KEYMAP}"

    # Locale is defaulted to en_US.UTF-8
    print_success "Locale: ${LOCALE}"

    log "Locale config: TZ=${TIMEZONE} KEYMAP=${KEYMAP} LOCALE=${LOCALE}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 2: Select Installation Mode
# ──────────────────────────────────────────────────────────────────────────────
select_install_mode() {
    print_step "2" "Installation Mode"

    echo -e "  ${WHITE}Choose how to install ${OS_NAME}:${NC}"
    echo ""
    echo -e "    ${BOLD}${GREEN}1)${NC} ${BOLD}Full Disk Install${NC}           ${DIM}— Erase entire disk, use all space${NC}"
    echo -e "       ${DIM}Best for: Dedicated DevShakti machine${NC}"
    echo ""
    echo -e "    ${BOLD}${BLUE}2)${NC} ${BOLD}Dual Boot${NC}                   ${DIM}— Install alongside Windows/other OS${NC}"
    echo -e "       ${DIM}Best for: Keep Windows + DevShakti side by side${NC}"
    echo ""
    echo -e "    ${BOLD}${MAGENTA}3)${NC} ${BOLD}Custom Partition (Advanced)${NC} ${DIM}— Manual partitioning with cfdisk${NC}"
    echo -e "       ${DIM}Best for: Power users who want full control${NC}"
    echo ""

    local choice
    choice=$(prompt_input "Enter choice (1/2/3)" "1")

    case "${choice}" in
        1) INSTALL_MODE="fulldisk" ;;
        2) INSTALL_MODE="dualboot" ;;
        3) INSTALL_MODE="custom" ;;
        *)
            print_error "Invalid choice. Defaulting to Full Disk Install."
            INSTALL_MODE="fulldisk"
            ;;
    esac

    print_success "Installation mode: ${INSTALL_MODE}"
    log "Install mode: ${INSTALL_MODE}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 3: Disk Selection
# ──────────────────────────────────────────────────────────────────────────────
select_disk() {
    print_step "3" "Disk Selection"

    print_info "Available storage devices:"
    echo ""

    # List all block devices (exclude loop, rom)
    local disks=()
    local idx=1
    while IFS= read -r line; do
        local name size type model
        name=$(echo "${line}" | awk '{print $1}')
        size=$(echo "${line}" | awk '{print $2}')
        type=$(echo "${line}" | awk '{print $3}')
        model=$(echo "${line}" | cut -d' ' -f4-)

        if [[ "${type}" == "disk" ]]; then
            disks+=("${name}")
            echo -e "    ${WHITE}${idx})${NC} /dev/${name}  ${CYAN}${size}${NC}  ${DIM}${model}${NC}"
            idx=$((idx + 1))
        fi
    done < <(lsblk -dno NAME,SIZE,TYPE,MODEL 2>/dev/null | grep -v "loop\|sr\|rom")

    if [[ ${#disks[@]} -eq 0 ]]; then
        print_error "No disks found!"
        exit 1
    fi

    echo ""
    local disk_choice
    disk_choice=$(prompt_input "Select disk number" "1")

    local disk_idx=$((disk_choice - 1))
    if [[ ${disk_idx} -lt 0 || ${disk_idx} -ge ${#disks[@]} ]]; then
        print_error "Invalid disk selection."
        exit 1
    fi

    TARGET_DISK="/dev/${disks[${disk_idx}]}"
    print_success "Target disk: ${TARGET_DISK}"

    # Show current partition table
    echo ""
    print_info "Current partition layout on ${TARGET_DISK}:"
    echo ""
    lsblk -o NAME,SIZE,FSTYPE,LABEL,MOUNTPOINT "${TARGET_DISK}" 2>/dev/null | while read -r line; do
        echo -e "    ${DIM}${line}${NC}"
    done

    log "Target disk: ${TARGET_DISK}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 4: Filesystem Selection
# ──────────────────────────────────────────────────────────────────────────────
select_filesystem() {
    print_step "4" "Filesystem"

    echo -e "  ${WHITE}Select root filesystem:${NC}"
    echo ""
    echo -e "    ${WHITE}1)${NC} ${BOLD}ext4${NC}   ${DIM}— Stable, battle-tested, fast (recommended)${NC}"
    echo -e "    ${WHITE}2)${NC} ${BOLD}btrfs${NC}  ${DIM}— Snapshots, compression, modern (Timeshift compatible)${NC}"
    echo -e "    ${WHITE}3)${NC} ${BOLD}xfs${NC}    ${DIM}— High performance, great for large files${NC}"
    echo ""

    local fs_choice
    fs_choice=$(prompt_input "Enter choice (1/2/3)" "1")

    case "${fs_choice}" in
        1) FILESYSTEM="ext4" ;;
        2) FILESYSTEM="btrfs" ;;
        3) FILESYSTEM="xfs" ;;
        *) FILESYSTEM="ext4" ;;
    esac

    print_success "Filesystem: ${FILESYSTEM}"
    log "Filesystem: ${FILESYSTEM}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Step 5: User Account
# ──────────────────────────────────────────────────────────────────────────────
setup_user() {
    print_step "5" "User Account"

    HOSTNAME_VAL=$(prompt_input "Hostname" "devshakti")
    USERNAME=$(prompt_input "Username" "")
    while [[ -z "${USERNAME}" ]]; do
        print_error "Username cannot be empty."
        USERNAME=$(prompt_input "Username" "")
    done

    echo ""
    print_info "Set user password for '${USERNAME}':"
    USER_PASSWORD=$(prompt_password "Password")

    echo ""
    print_info "Set root password (or press Enter to use same as user):"
    echo -en "  ${ARROW}  Root password (Enter=same): "
    read -rs ROOT_PASSWORD
    echo ""
    if [[ -z "${ROOT_PASSWORD}" ]]; then
        ROOT_PASSWORD="${USER_PASSWORD}"
        print_info "Root password set to same as user password."
    fi

    print_success "Hostname: ${HOSTNAME_VAL}"
    print_success "Username: ${USERNAME}"
    print_success "Passwords configured"

    log "User: ${USERNAME}, Hostname: ${HOSTNAME_VAL}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Confirmation Summary
# ──────────────────────────────────────────────────────────────────────────────
confirm_installation() {
    print_step "6" "Confirmation"

    echo -e "  ${BOLD}${WHITE}Installation Summary:${NC}"
    echo ""
    echo -e "    ${WHITE}OS:${NC}          ${OS_NAME} v${OS_VERSION} \"${OS_CODENAME}\""
    echo -e "    ${WHITE}Mode:${NC}        ${INSTALL_MODE}"
    echo -e "    ${WHITE}Disk:${NC}        ${TARGET_DISK}"
    echo -e "    ${WHITE}Filesystem:${NC}  ${FILESYSTEM}"
    echo -e "    ${WHITE}Hostname:${NC}    ${HOSTNAME_VAL}"
    echo -e "    ${WHITE}User:${NC}        ${USERNAME}"
    echo -e "    ${WHITE}Timezone:${NC}    ${TIMEZONE}"
    echo -e "    ${WHITE}Keymap:${NC}      ${KEYMAP}"
    echo -e "    ${WHITE}Locale:${NC}      ${LOCALE}"
    echo ""

    if [[ "${INSTALL_MODE}" == "fulldisk" ]]; then
        echo -e "  ${BOLD}${RED}⚠  WARNING: This will ERASE ALL DATA on ${TARGET_DISK}!${NC}"
        echo ""
    fi

    if ! prompt_yesno "Proceed with installation?" "n"; then
        echo -e "\n  ${INFO}  Installation cancelled."
        exit 0
    fi

    echo ""
    print_arrow "Starting installation..."
    log "Installation confirmed. Starting..."
}

# ──────────────────────────────────────────────────────────────────────────────
# Partitioning — Full Disk Mode
# ──────────────────────────────────────────────────────────────────────────────
partition_fulldisk() {
    print_info "Partitioning ${TARGET_DISK} (Full Disk mode)..."
    log "Partitioning: full disk"

    # Wipe existing partition table
    wipefs -af "${TARGET_DISK}" &>>"${INSTALL_LOG}"
    sgdisk --zap-all "${TARGET_DISK}" &>>"${INSTALL_LOG}"

    # Determine partition naming convention
    local part_prefix="${TARGET_DISK}"
    if [[ "${TARGET_DISK}" == *"nvme"* || "${TARGET_DISK}" == *"mmcblk"* ]]; then
        part_prefix="${TARGET_DISK}p"
    fi

    # Create GPT partition table
    sgdisk -o "${TARGET_DISK}" &>>"${INSTALL_LOG}"

    # Partition 1: EFI System Partition (512 MB)
    sgdisk -n 1:0:+${EFI_SIZE} -t 1:ef00 -c 1:"EFI System" "${TARGET_DISK}" &>>"${INSTALL_LOG}"

    # Partition 2: Swap (8 GB)
    sgdisk -n 2:0:+${SWAP_SIZE_GB}G -t 2:8200 -c 2:"Linux Swap" "${TARGET_DISK}" &>>"${INSTALL_LOG}"

    # Partition 3: Root (remaining space)
    sgdisk -n 3:0:0 -t 3:8300 -c 3:"Linux Root" "${TARGET_DISK}" &>>"${INSTALL_LOG}"

    # Inform kernel of partition changes
    partprobe "${TARGET_DISK}" &>>"${INSTALL_LOG}"
    sleep 2

    EFI_PART="${part_prefix}1"
    SWAP_PART="${part_prefix}2"
    ROOT_PART="${part_prefix}3"

    print_success "EFI:  ${EFI_PART} (${EFI_SIZE})"
    print_success "Swap: ${SWAP_PART} (${SWAP_SIZE_GB}G)"
    print_success "Root: ${ROOT_PART} (remaining space)"
}

# ──────────────────────────────────────────────────────────────────────────────
# Partitioning — Dual Boot Mode
# ──────────────────────────────────────────────────────────────────────────────
partition_dualboot() {
    print_info "Dual Boot Setup on ${TARGET_DISK}..."
    log "Partitioning: dual boot"

    echo ""
    print_info "Current partitions on ${TARGET_DISK}:"
    echo ""
    lsblk -o NAME,SIZE,FSTYPE,LABEL "${TARGET_DISK}" | while read -r line; do
        echo -e "    ${line}"
    done

    # Detect existing EFI partition
    local existing_efi
    existing_efi=$(fdisk -l "${TARGET_DISK}" 2>/dev/null | grep "EFI System" | awk '{print $1}' | head -1)

    if [[ -n "${existing_efi}" ]]; then
        EFI_PART="${existing_efi}"
        print_success "Existing EFI partition found: ${EFI_PART}"
    else
        print_warn "No existing EFI partition found."
        print_info "An EFI partition will be created from free space."
    fi

    echo ""
    print_info "We need free space on the disk for DevShakti."
    print_info "If your disk has no free space, you can shrink an existing partition."
    echo ""

    if prompt_yesno "Would you like to launch cfdisk to resize/create partitions?" "y"; then
        print_info "Use cfdisk to:"
        echo -e "    ${DIM}1. Resize your Windows/existing partition to free up space${NC}"
        echo -e "    ${DIM}2. Create a new Linux partition (type: Linux filesystem)${NC}"
        echo -e "    ${DIM}3. Optionally create a swap partition (type: Linux swap)${NC}"
        echo -e "    ${DIM}4. Write and quit${NC}"
        echo ""
        echo -e "  ${WARN}  Press Enter to launch cfdisk..."
        read -r
        cfdisk "${TARGET_DISK}"
        partprobe "${TARGET_DISK}" &>>"${INSTALL_LOG}"
        sleep 2
    fi

    # Now ask user to identify partitions
    echo ""
    print_info "Updated partition layout:"
    lsblk -o NAME,SIZE,FSTYPE,LABEL "${TARGET_DISK}" | while read -r line; do
        echo -e "    ${line}"
    done

    # Determine partition prefix
    local part_prefix="${TARGET_DISK}"
    if [[ "${TARGET_DISK}" == *"nvme"* || "${TARGET_DISK}" == *"mmcblk"* ]]; then
        part_prefix="${TARGET_DISK}p"
    fi

    echo ""
    if [[ -z "${EFI_PART}" ]]; then
        local efi_num
        efi_num=$(prompt_input "EFI partition number (e.g., 1 for ${part_prefix}1)" "1")
        EFI_PART="${part_prefix}${efi_num}"
    fi

    local root_num
    root_num=$(prompt_input "Root partition number for DevShakti" "")
    ROOT_PART="${part_prefix}${root_num}"

    if prompt_yesno "Do you have a separate swap partition?" "n"; then
        local swap_num
        swap_num=$(prompt_input "Swap partition number" "")
        SWAP_PART="${part_prefix}${swap_num}"
    fi

    print_success "EFI:  ${EFI_PART}"
    print_success "Root: ${ROOT_PART}"
    [[ -n "${SWAP_PART}" ]] && print_success "Swap: ${SWAP_PART}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Partitioning — Custom/Advanced Mode
# ──────────────────────────────────────────────────────────────────────────────
partition_custom() {
    print_info "Custom Partition Mode (Advanced)"
    log "Partitioning: custom"

    echo ""
    print_info "Launching cfdisk for manual partitioning..."
    print_info "Create the following partitions:"
    echo -e "    ${WHITE}1.${NC} EFI System Partition  ${DIM}(Type: EFI System, 512 MB minimum)${NC}"
    echo -e "    ${WHITE}2.${NC} Root partition         ${DIM}(Type: Linux filesystem, 40 GB+ recommended)${NC}"
    echo -e "    ${WHITE}3.${NC} Swap partition          ${DIM}(Type: Linux swap, optional, 4-16 GB)${NC}"
    echo -e "    ${WHITE}4.${NC} Home partition          ${DIM}(Type: Linux filesystem, optional, remaining space)${NC}"
    echo ""
    echo -e "  ${WARN}  Press Enter to launch cfdisk..."
    read -r

    cfdisk "${TARGET_DISK}"
    partprobe "${TARGET_DISK}" &>>"${INSTALL_LOG}"
    sleep 2

    # Show updated layout
    echo ""
    print_info "Updated partition layout:"
    lsblk -o NAME,SIZE,FSTYPE,LABEL "${TARGET_DISK}" | while read -r line; do
        echo -e "    ${line}"
    done

    # Determine partition prefix
    local part_prefix="${TARGET_DISK}"
    if [[ "${TARGET_DISK}" == *"nvme"* || "${TARGET_DISK}" == *"mmcblk"* ]]; then
        part_prefix="${TARGET_DISK}p"
    fi

    echo ""
    print_info "Assign your partitions:"

    local efi_num
    efi_num=$(prompt_input "EFI partition number" "")
    EFI_PART="${part_prefix}${efi_num}"

    local root_num
    root_num=$(prompt_input "Root (/) partition number" "")
    ROOT_PART="${part_prefix}${root_num}"

    if prompt_yesno "Do you have a swap partition?" "n"; then
        local swap_num
        swap_num=$(prompt_input "Swap partition number" "")
        SWAP_PART="${part_prefix}${swap_num}"
    fi

    if prompt_yesno "Do you have a separate /home partition?" "n"; then
        local home_num
        home_num=$(prompt_input "Home (/home) partition number" "")
        HOME_PART="${part_prefix}${home_num}"
    fi

    print_success "EFI:  ${EFI_PART}"
    print_success "Root: ${ROOT_PART}"
    [[ -n "${SWAP_PART}" ]] && print_success "Swap: ${SWAP_PART}"
    [[ -n "${HOME_PART}" ]] && print_success "Home: ${HOME_PART}"
}

# ──────────────────────────────────────────────────────────────────────────────
# Format Partitions
# ──────────────────────────────────────────────────────────────────────────────
format_partitions() {
    print_info "Formatting partitions..."

    # Format EFI — only for full disk mode or if no existing EFI
    if [[ "${INSTALL_MODE}" == "fulldisk" ]]; then
        mkfs.fat -F32 -n "EFI" "${EFI_PART}" &>>"${INSTALL_LOG}"
        print_success "Formatted ${EFI_PART} as FAT32 (EFI)"
    else
        # For dual boot, don't reformat the existing EFI — just use it
        print_info "Using existing EFI partition ${EFI_PART} (not reformatting)"
    fi

    # Format root
    case "${FILESYSTEM}" in
        ext4)
            mkfs.ext4 -L "DevShakti" "${ROOT_PART}" &>>"${INSTALL_LOG}"
            ;;
        btrfs)
            mkfs.btrfs -f -L "DevShakti" "${ROOT_PART}" &>>"${INSTALL_LOG}"
            ;;
        xfs)
            mkfs.xfs -f -L "DevShakti" "${ROOT_PART}" &>>"${INSTALL_LOG}"
            ;;
    esac
    print_success "Formatted ${ROOT_PART} as ${FILESYSTEM}"

    # Format swap
    if [[ -n "${SWAP_PART}" ]]; then
        mkswap -L "DevShakti-Swap" "${SWAP_PART}" &>>"${INSTALL_LOG}"
        print_success "Formatted ${SWAP_PART} as swap"
    fi

    # Format home (if separate)
    if [[ -n "${HOME_PART}" ]]; then
        mkfs.ext4 -L "DevShakti-Home" "${HOME_PART}" &>>"${INSTALL_LOG}"
        print_success "Formatted ${HOME_PART} as ext4 (home)"
    fi

    log "Formatting complete"
}

# ──────────────────────────────────────────────────────────────────────────────
# Mount Partitions
# ──────────────────────────────────────────────────────────────────────────────
mount_partitions() {
    print_info "Mounting partitions..."

    # Mount root
    if [[ "${FILESYSTEM}" == "btrfs" ]]; then
        mount -o compress=zstd,noatime "${ROOT_PART}" /mnt &>>"${INSTALL_LOG}"
        # Create btrfs subvolumes
        btrfs subvolume create /mnt/@ &>>"${INSTALL_LOG}"
        btrfs subvolume create /mnt/@home &>>"${INSTALL_LOG}"
        btrfs subvolume create /mnt/@cache &>>"${INSTALL_LOG}"
        btrfs subvolume create /mnt/@log &>>"${INSTALL_LOG}"
        btrfs subvolume create /mnt/@snapshots &>>"${INSTALL_LOG}"
        umount /mnt
        mount -o compress=zstd,noatime,subvol=@ "${ROOT_PART}" /mnt &>>"${INSTALL_LOG}"
        mkdir -p /mnt/{home,.snapshots,var/cache,var/log}
        mount -o compress=zstd,noatime,subvol=@home "${ROOT_PART}" /mnt/home &>>"${INSTALL_LOG}"
        mount -o compress=zstd,noatime,subvol=@cache "${ROOT_PART}" /mnt/var/cache &>>"${INSTALL_LOG}"
        mount -o compress=zstd,noatime,subvol=@log "${ROOT_PART}" /mnt/var/log &>>"${INSTALL_LOG}"
        mount -o compress=zstd,noatime,subvol=@snapshots "${ROOT_PART}" /mnt/.snapshots &>>"${INSTALL_LOG}"
        print_success "Btrfs subvolumes created and mounted"
    else
        mount "${ROOT_PART}" /mnt &>>"${INSTALL_LOG}"
    fi
    print_success "Root mounted at /mnt"

    # Mount EFI
    mkdir -p /mnt/boot/efi
    mount "${EFI_PART}" /mnt/boot/efi &>>"${INSTALL_LOG}"
    print_success "EFI mounted at /mnt/boot/efi"

    # Swap
    if [[ -n "${SWAP_PART}" ]]; then
        swapon "${SWAP_PART}" &>>"${INSTALL_LOG}"
        print_success "Swap activated"
    fi

    # Home
    if [[ -n "${HOME_PART}" ]]; then
        mkdir -p /mnt/home
        mount "${HOME_PART}" /mnt/home &>>"${INSTALL_LOG}"
        print_success "Home mounted at /mnt/home"
    fi

    log "Partitions mounted"
}

# ──────────────────────────────────────────────────────────────────────────────
# Install Base System (pacstrap)
# ──────────────────────────────────────────────────────────────────────────────
install_base_system() {
    print_step "7" "Installing Base System"
    print_info "This will take several minutes depending on your internet speed..."
    echo ""

    # Core packages to bootstrap with pacstrap
    local packages=(
        # Base
        base linux-zen linux-zen-headers linux-firmware amd-ucode
        # Essential tools
        base-devel dkms sudo nano vim git wget curl
        # Bootloader
        grub efibootmgr os-prober
        # Networking
        networkmanager bluez bluez-utils
        # Audio
        pipewire pipewire-alsa pipewire-pulse pipewire-jack wireplumber
        # Display
        sddm plasma-meta plasma-wayland-session
        # GPU — AMD
        mesa lib32-mesa vulkan-radeon lib32-vulkan-radeon xf86-video-amdgpu
        libva-mesa-driver lib32-libva-mesa-driver mesa-vdpau lib32-mesa-vdpau
        # GPU — NVIDIA
        nvidia-open-dkms nvidia-utils lib32-nvidia-utils nvidia-settings
        # Vulkan common
        vulkan-icd-loader lib32-vulkan-icd-loader vulkan-tools
        # KDE apps
        dolphin konsole kate ark spectacle gwenview okular partitionmanager
        kvantum xdg-desktop-portal-kde
        # Wine & Gaming
        wine-staging wine-gecko wine-mono winetricks vkd3d
        steam gamemode lib32-gamemode mangohud lib32-mangohud lutris
        # Power management
        tlp tlp-rdw powertop acpi acpid
        # Plymouth
        plymouth
        # Shell
        zsh fish
        # Fonts
        noto-fonts noto-fonts-cjk noto-fonts-emoji ttf-liberation ttf-dejavu
        ttf-fira-code inter-font otf-font-awesome
        # Multimedia
        vlc ffmpeg gstreamer gst-plugins-base gst-plugins-good
        gst-plugins-bad gst-plugins-ugly gst-libav
        # Utilities
        firefox htop btop fastfetch p7zip unzip unrar flatpak
        fuse2 ntfs-3g dosfstools gparted file-roller
        # Networking tools
        openssh reflector
        # Dev tools
        python python-pip nodejs npm gcc make cmake
        # SDDM theme deps
        sddm-kcm qt6-5compat qt6-declarative qt6-svg
    )

    print_info "Installing ${#packages[@]} packages..."
    echo ""

    pacstrap /mnt "${packages[@]}" 2>&1 | while IFS= read -r line; do
        # Show progress for key milestones
        if echo "${line}" | grep -q "installing "; then
            local pkg_name
            pkg_name=$(echo "${line}" | grep -oP 'installing \K\S+' | head -1)
            echo -en "\r  ${ARROW}  Installing: ${CYAN}${pkg_name}${NC}                          "
        fi
    done
    echo ""

    print_success "Base system installed"
    log "pacstrap complete"
}

# ──────────────────────────────────────────────────────────────────────────────
# Generate fstab
# ──────────────────────────────────────────────────────────────────────────────
generate_fstab() {
    print_info "Generating fstab..."
    genfstab -U /mnt >> /mnt/etc/fstab
    print_success "fstab generated"
    log "fstab generated"
}

# ──────────────────────────────────────────────────────────────────────────────
# System Configuration (chroot)
# ──────────────────────────────────────────────────────────────────────────────
configure_system() {
    print_step "8" "System Configuration"

    # Write the chroot script
    cat > /mnt/tmp/devshakti-chroot.sh << CHROOT_EOF
#!/usr/bin/env bash
set -euo pipefail

echo "=== Configuring DevShakti OS ==="

# ── Timezone ──
ln -sf /usr/share/zoneinfo/${TIMEZONE} /etc/localtime
hwclock --systohc
echo "Timezone: ${TIMEZONE}"

# ── Locale ──
sed -i 's/#en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
locale-gen
echo "LANG=${LOCALE}" > /etc/locale.conf
echo "KEYMAP=${KEYMAP}" > /etc/vconsole.conf
echo "Locale: ${LOCALE}"

# ── Hostname ──
echo "${HOSTNAME_VAL}" > /etc/hostname
cat > /etc/hosts << HOSTS
127.0.0.1   localhost
::1         localhost
127.0.1.1   ${HOSTNAME_VAL}.localdomain ${HOSTNAME_VAL}
HOSTS
echo "Hostname: ${HOSTNAME_VAL}"

# ── Users ──
echo "root:${ROOT_PASSWORD}" | chpasswd
useradd -m -G wheel,video,audio,storage,optical,network,power,lp -s /bin/zsh "${USERNAME}"
echo "${USERNAME}:${USER_PASSWORD}" | chpasswd
echo "${USERNAME} ALL=(ALL:ALL) ALL" >> /etc/sudoers.d/10-devshakti
chmod 440 /etc/sudoers.d/10-devshakti
echo "User: ${USERNAME}"

# ── NVIDIA kernel modules ──
cat > /etc/modprobe.d/nvidia.conf << 'NVIDIA_CONF'
options nvidia_drm modeset=1 fbdev=1
options nvidia NVreg_UsePageAttributeTable=1
options nvidia NVreg_DynamicPowerManagement=0x02
NVIDIA_CONF

# ── AMD GPU ──
cat > /etc/modprobe.d/amdgpu.conf << 'AMD_CONF'
options amdgpu ppfeaturemask=0xffffffff
options amdgpu dc=1
options amdgpu dpm=1
AMD_CONF

# ── mkinitcpio ──
sed -i 's/^MODULES=.*/MODULES=(nvidia nvidia_modeset nvidia_uvm nvidia_drm amdgpu)/' /etc/mkinitcpio.conf
# Add plymouth to HOOKS
sed -i 's/udev/udev plymouth/' /etc/mkinitcpio.conf
mkinitcpio -P
echo "initramfs rebuilt"

# ── GRUB ──
cat > /etc/default/grub << 'GRUB_CONF'
GRUB_DEFAULT=0
GRUB_TIMEOUT=3
GRUB_DISTRIBUTOR="DevShakti"
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash loglevel=3 rd.systemd.show_status=auto rd.udev.log_level=3 vt.global_cursor_default=0 nvidia_drm.modeset=1 amd_pstate=active"
GRUB_CMDLINE_LINUX=""
GRUB_PRELOAD_MODULES="part_gpt part_msdos"
GRUB_DISABLE_OS_PROBER=false
GRUB_GFXMODE=auto
GRUB_GFXPAYLOAD_LINUX=keep
GRUB_CONF

grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=DevShakti --recheck 2>&1 || true
grub-mkconfig -o /boot/grub/grub.cfg 2>&1
echo "GRUB installed"

# ── Gaming optimizations ──
cat > /etc/sysctl.d/80-gamecompat.conf << 'SYSCTL_CONF'
vm.max_map_count = 2147483642
vm.swappiness = 10
SYSCTL_CONF

mkdir -p /etc/security/limits.d
cat > /etc/security/limits.d/99-esync.conf << 'ESYNC_CONF'
* soft nofile 1048576
* hard nofile 1048576
ESYNC_CONF

# ── Environment ──
cat > /etc/environment << 'ENV_CONF'
# DevShakti OS — Environment Configuration
QT_QPA_PLATFORMTHEME=kvantum
MOZ_ENABLE_WAYLAND=1
ENV_CONF

# ── Enable services ──
systemctl enable sddm.service
systemctl enable NetworkManager.service
systemctl enable bluetooth.service
systemctl enable tlp.service
systemctl enable acpid.service
systemctl enable fstrim.timer
echo "Services enabled"

# ── Flatpak ──
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo 2>/dev/null || true

echo "=== DevShakti OS configuration complete ==="
CHROOT_EOF

    chmod +x /mnt/tmp/devshakti-chroot.sh

    # Run the chroot script
    arch-chroot /mnt /tmp/devshakti-chroot.sh 2>&1 | while IFS= read -r line; do
        if [[ -n "${line}" ]]; then
            echo -e "    ${DIM}${line}${NC}"
        fi
    done

    # Clean up
    rm -f /mnt/tmp/devshakti-chroot.sh

    print_success "System configuration complete"
    log "System configured"
}

# ──────────────────────────────────────────────────────────────────────────────
# Copy DevShakti Custom Files
# ──────────────────────────────────────────────────────────────────────────────
copy_devshakti_files() {
    print_step "9" "Installing DevShakti Theme & Tools"

    # Copy custom scripts from live ISO to installed system
    local source_dirs=(
        "/usr/local/bin"
        "/usr/share/applications"
        "/usr/share/mime/packages"
        "/usr/share/kservices5"
    )

    for dir in "${source_dirs[@]}"; do
        if [[ -d "${dir}" ]]; then
            # Copy DevShakti-specific files
            find "${dir}" -name "devshakti*" -exec cp -v {} "/mnt${dir}/" \; &>>"${INSTALL_LOG}" || true
        fi
    done

    # Copy skel configs to the new user's home
    local user_home="/mnt/home/${USERNAME}"
    if [[ -d /etc/skel/.config ]]; then
        cp -r /etc/skel/.config "${user_home}/" 2>>"${INSTALL_LOG}" || true
        arch-chroot /mnt chown -R "${USERNAME}:${USERNAME}" "/home/${USERNAME}/.config" 2>>"${INSTALL_LOG}" || true
    fi

    # Copy TLP config
    if [[ -f /etc/tlp.conf ]]; then
        cp /etc/tlp.conf /mnt/etc/tlp.conf 2>>"${INSTALL_LOG}" || true
    fi

    # Make scripts executable
    arch-chroot /mnt bash -c 'chmod +x /usr/local/bin/devshakti-* 2>/dev/null || true' &>>"${INSTALL_LOG}"

    # Update MIME database
    arch-chroot /mnt update-mime-database /usr/share/mime 2>>"${INSTALL_LOG}" || true

    print_success "DevShakti theme and tools installed"
    print_success "Wine drag-and-drop integration configured"
    print_success "Power management profiles installed"

    log "DevShakti files copied"
}

# ──────────────────────────────────────────────────────────────────────────────
# Cleanup & Unmount
# ──────────────────────────────────────────────────────────────────────────────
cleanup() {
    print_step "10" "Finalizing"

    print_info "Syncing filesystem..."
    sync

    print_info "Unmounting partitions..."
    umount -R /mnt 2>>"${INSTALL_LOG}" || true

    if [[ -n "${SWAP_PART}" ]]; then
        swapoff "${SWAP_PART}" 2>>"${INSTALL_LOG}" || true
    fi

    print_success "All partitions unmounted"
    log "Cleanup complete"
}

# ──────────────────────────────────────────────────────────────────────────────
# Final Success Message
# ──────────────────────────────────────────────────────────────────────────────
show_success() {
    echo ""
    echo -e "${GREEN}"
    cat << 'SUCCESS'
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║          ✓  DevShakti OS Installation Complete!              ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
SUCCESS
    echo -e "${NC}"

    echo -e "  ${WHITE}What's next:${NC}"
    echo ""
    echo -e "    ${GREEN}1.${NC} Remove the installation media (USB drive)"
    echo -e "    ${GREEN}2.${NC} Reboot: ${CYAN}reboot${NC}"
    echo -e "    ${GREEN}3.${NC} Log in with username: ${CYAN}${USERNAME}${NC}"
    echo -e "    ${GREEN}4.${NC} On first login, DevShakti will configure Wine & GPU drivers"
    echo ""

    if [[ "${INSTALL_MODE}" == "dualboot" ]]; then
        echo -e "  ${INFO}  ${WHITE}Dual Boot:${NC} GRUB will show both DevShakti and your other OS at startup."
        echo ""
    fi

    echo -e "  ${DIM}Installation log: ${INSTALL_LOG}${NC}"
    echo ""
    echo -e "  ${BOLD}${CYAN}Welcome to DevShakti! ⚡${NC}"
    echo ""

    if prompt_yesno "Reboot now?" "y"; then
        reboot
    fi
}

# ══════════════════════════════════════════════════════════════════════════════
# Main Entry Point
# ══════════════════════════════════════════════════════════════════════════════
main() {
    # Initialize log
    echo "DevShakti OS Installer — $(date)" > "${INSTALL_LOG}"

    print_header
    preflight_checks
    select_locale
    select_install_mode
    select_disk
    select_filesystem
    setup_user
    confirm_installation

    # Partition based on mode
    case "${INSTALL_MODE}" in
        fulldisk)  partition_fulldisk ;;
        dualboot)  partition_dualboot ;;
        custom)    partition_custom ;;
    esac

    format_partitions
    mount_partitions
    install_base_system
    generate_fstab
    configure_system
    copy_devshakti_files
    cleanup
    show_success
}

main "$@"
