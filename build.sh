#!/usr/bin/env bash
# ============================================================================
# DevShakti OS — Build Script
# ============================================================================
# Builds the DevShakti OS live/install ISO using archiso.
#
# Features:
#   - Root permission check
#   - archiso dependency verification
#   - Workspace setup in /tmp/devshakti-build
#   - AUR package building with local custom repo
#   - mkarchiso invocation to produce the final ISO
#   - Colored status output
#   - Automatic cleanup on completion/failure
#
# Usage:
#   sudo ./build.sh            — full build (official + AUR packages)
#   sudo ./build.sh --no-aur   — skip AUR package building
#   sudo ./build.sh --clean    — remove previous build artifacts only
#
# Copyright (c) 2026 DevShakti Project
# SPDX-License-Identifier: MIT
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly BUILD_DIR="/tmp/devshakti-build"
readonly WORK_DIR="${BUILD_DIR}/work"
readonly OUT_DIR="${BUILD_DIR}/out"
readonly PROFILE_DIR="${BUILD_DIR}/profile"
readonly AUR_BUILD_DIR="${BUILD_DIR}/aur-build"
readonly AUR_REPO_DIR="${BUILD_DIR}/aur-repo"
readonly AUR_REPO_NAME="devshakti"
readonly AUR_REPO_DB="${AUR_REPO_DIR}/${AUR_REPO_NAME}.db.tar.gz"
readonly ISO_NAME="devshakti"
readonly LOG_FILE="${BUILD_DIR}/build-$(date +%Y%m%d-%H%M%S).log"

# AUR packages to build
readonly AUR_PACKAGES=(
    "whitesur-kde-theme-git"
    "whitesur-icon-theme-git"
    "whitesur-cursor-theme-git"
    "whitesur-gtk-theme-git"
    "kwin-effects-forceblur"
    "protonup-qt"
    "heroic-games-launcher-bin"
)

# Build user for makepkg (cannot run as root)
readonly BUILD_USER="devshakti-builder"

# Flags
SKIP_AUR=false
CLEAN_ONLY=false

# ---------------------------------------------------------------------------
# Color Definitions
# ---------------------------------------------------------------------------
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly BOLD='\033[1m'
readonly NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Logging Helpers
# ---------------------------------------------------------------------------
log_info()    { echo -e "${CYAN}[INFO]${NC}    $*"; }
log_success() { echo -e "${GREEN}[OK]${NC}      $*"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $*"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $*"; }
log_step()    { echo -e "\n${MAGENTA}${BOLD}══════════════════════════════════════════════════════════════${NC}"; \
                echo -e "${MAGENTA}${BOLD}  ▸ $*${NC}"; \
                echo -e "${MAGENTA}${BOLD}══════════════════════════════════════════════════════════════${NC}"; }
log_banner()  {
    echo -e "${BLUE}${BOLD}"
    echo "  ╔══════════════════════════════════════════════════════════╗"
    echo "  ║                                                          ║"
    echo "  ║              🔱  DevShakti OS Builder  🔱                ║"
    echo "  ║                                                          ║"
    echo "  ║   Custom Arch Linux — HP Victus 15 · Ryzen 7 · RTX 4050 ║"
    echo "  ║                                                          ║"
    echo "  ╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# ---------------------------------------------------------------------------
# Cleanup Handler
# ---------------------------------------------------------------------------
cleanup() {
    local exit_code=$?
    echo ""
    if [[ $exit_code -ne 0 ]]; then
        log_error "Build failed with exit code ${exit_code}."
        log_error "Check the log file: ${LOG_FILE}"
    fi

    # Remove the temporary build user if it was created
    if id "${BUILD_USER}" &>/dev/null; then
        log_info "Removing temporary build user '${BUILD_USER}'..."
        userdel -rf "${BUILD_USER}" 2>/dev/null || true
    fi

    log_info "Cleanup complete."
    exit $exit_code
}
trap cleanup EXIT INT TERM

# ---------------------------------------------------------------------------
# Parse Arguments
# ---------------------------------------------------------------------------
parse_args() {
    for arg in "$@"; do
        case "$arg" in
            --no-aur)   SKIP_AUR=true ;;
            --clean)    CLEAN_ONLY=true ;;
            --help|-h)
                echo "Usage: sudo $0 [--no-aur] [--clean] [--help]"
                echo ""
                echo "  --no-aur   Skip building AUR packages"
                echo "  --clean    Remove previous build artifacts and exit"
                echo "  --help     Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown argument: ${arg}"
                exit 1
                ;;
        esac
    done
}

# ---------------------------------------------------------------------------
# Pre-flight Checks
# ---------------------------------------------------------------------------
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)."
        exit 1
    fi
    log_success "Running as root."
}

check_dependencies() {
    log_step "Checking Dependencies"

    local missing=()

    # archiso is the critical dependency
    if ! pacman -Qi archiso &>/dev/null; then
        missing+=("archiso")
    fi

    # git is needed for AUR
    if ! command -v git &>/dev/null; then
        missing+=("git")
    fi

    # base-devel for makepkg
    if ! pacman -Qq base-devel &>/dev/null 2>&1; then
        missing+=("base-devel")
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        log_warn "Missing packages: ${missing[*]}"
        log_info "Installing missing dependencies..."
        pacman -Sy --noconfirm --needed "${missing[@]}"
    fi

    # Verify archiso is now available
    if ! command -v mkarchiso &>/dev/null; then
        log_error "mkarchiso not found. Please install archiso."
        exit 1
    fi

    log_success "All dependencies satisfied."
    log_info "archiso version: $(pacman -Q archiso | awk '{print $2}')"
}

# ---------------------------------------------------------------------------
# Workspace Setup
# ---------------------------------------------------------------------------
clean_workspace() {
    log_step "Cleaning Previous Build Artifacts"

    if [[ -d "${BUILD_DIR}" ]]; then
        log_info "Removing ${BUILD_DIR}..."
        rm -rf "${BUILD_DIR}"
        log_success "Previous build artifacts removed."
    else
        log_info "No previous build directory found."
    fi
}

setup_workspace() {
    log_step "Setting Up Build Workspace"

    # Create directory structure
    mkdir -p "${WORK_DIR}" "${OUT_DIR}" "${PROFILE_DIR}" "${AUR_BUILD_DIR}" "${AUR_REPO_DIR}"

    log_info "Build directory:  ${BUILD_DIR}"
    log_info "Work directory:   ${WORK_DIR}"
    log_info "Output directory: ${OUT_DIR}"
    log_info "Profile directory:${PROFILE_DIR}"

    # Copy the DevShakti archiso profile into the build workspace
    log_info "Copying archiso profile from ${SCRIPT_DIR}/archiso/ ..."
    if [[ ! -d "${SCRIPT_DIR}/archiso" ]]; then
        log_error "archiso profile directory not found at ${SCRIPT_DIR}/archiso/"
        log_error "Ensure profiledef.sh, packages.x86_64, and related files exist."
        exit 1
    fi

    cp -a "${SCRIPT_DIR}/archiso/"* "${PROFILE_DIR}/"
    log_success "Profile copied to ${PROFILE_DIR}."

    # Verify critical profile files
    local required_files=("profiledef.sh" "packages.x86_64" "pacman.conf")
    for f in "${required_files[@]}"; do
        if [[ ! -f "${PROFILE_DIR}/${f}" ]]; then
            log_error "Missing required profile file: ${f}"
            exit 1
        fi
    done
    log_success "All required profile files verified."
}

# ---------------------------------------------------------------------------
# AUR Package Building
# ---------------------------------------------------------------------------
setup_build_user() {
    # makepkg refuses to run as root, so we create a temporary unprivileged user
    if id "${BUILD_USER}" &>/dev/null; then
        log_info "Build user '${BUILD_USER}' already exists."
    else
        log_info "Creating temporary build user '${BUILD_USER}'..."
        useradd -m -d "/tmp/${BUILD_USER}" -s /bin/bash "${BUILD_USER}"
    fi

    # Grant passwordless sudo for pacman (needed by makepkg -s)
    echo "${BUILD_USER} ALL=(ALL) NOPASSWD: /usr/bin/pacman" > "/etc/sudoers.d/${BUILD_USER}"
    chmod 440 "/etc/sudoers.d/${BUILD_USER}"

    # Ensure build dirs are accessible
    chown -R "${BUILD_USER}:${BUILD_USER}" "${AUR_BUILD_DIR}"

    log_success "Build user configured."
}

build_aur_package() {
    local pkg_name="$1"
    local pkg_dir="${AUR_BUILD_DIR}/${pkg_name}"

    log_info "Building AUR package: ${CYAN}${pkg_name}${NC}"

    # Clone from AUR
    if [[ -d "${pkg_dir}" ]]; then
        rm -rf "${pkg_dir}"
    fi

    sudo -u "${BUILD_USER}" git clone --depth 1 \
        "https://aur.archlinux.org/${pkg_name}.git" "${pkg_dir}" 2>&1 | \
        sed 's/^/    /'

    if [[ ! -f "${pkg_dir}/PKGBUILD" ]]; then
        log_error "PKGBUILD not found for ${pkg_name}. Skipping."
        return 1
    fi

    # Build the package
    pushd "${pkg_dir}" > /dev/null
    chown -R "${BUILD_USER}:${BUILD_USER}" "${pkg_dir}"

    if sudo -u "${BUILD_USER}" makepkg -s --noconfirm --needed --noprogressbar 2>&1 | \
        sed 's/^/    /'; then
        # Move built packages to local repo
        local built_pkgs=("${pkg_dir}"/*.pkg.tar.zst)
        if [[ -f "${built_pkgs[0]}" ]]; then
            cp "${built_pkgs[@]}" "${AUR_REPO_DIR}/"
            log_success "${pkg_name} built successfully."
        else
            log_warn "No .pkg.tar.zst found for ${pkg_name}."
        fi
    else
        log_warn "Failed to build ${pkg_name}. Continuing with remaining packages..."
    fi

    popd > /dev/null
}

build_aur_packages() {
    log_step "Building AUR Packages"

    if [[ "$SKIP_AUR" == true ]]; then
        log_warn "AUR package building skipped (--no-aur flag)."
        return 0
    fi

    setup_build_user

    local total=${#AUR_PACKAGES[@]}
    local current=0
    local failed=0

    for pkg in "${AUR_PACKAGES[@]}"; do
        ((current++))
        log_info "[${current}/${total}] Processing ${pkg}..."
        if ! build_aur_package "$pkg"; then
            ((failed++))
        fi
    done

    # Create/update the local repo database
    if compgen -G "${AUR_REPO_DIR}/*.pkg.tar.zst" > /dev/null; then
        log_info "Creating local repository database..."
        repo-add "${AUR_REPO_DB}" "${AUR_REPO_DIR}"/*.pkg.tar.zst
        log_success "Local repo '${AUR_REPO_NAME}' created with $(ls -1 "${AUR_REPO_DIR}"/*.pkg.tar.zst 2>/dev/null | wc -l) package(s)."

        # Inject the local repo into the profile's pacman.conf
        inject_local_repo
    else
        log_warn "No AUR packages were built successfully."
    fi

    # Clean up sudoers entry
    rm -f "/etc/sudoers.d/${BUILD_USER}"

    if [[ $failed -gt 0 ]]; then
        log_warn "${failed} out of ${total} AUR package(s) failed to build."
    else
        log_success "All ${total} AUR packages built successfully."
    fi
}

inject_local_repo() {
    local pacman_conf="${PROFILE_DIR}/pacman.conf"

    # Uncomment or add the [devshakti] repo section
    if grep -q "^\[devshakti\]" "${pacman_conf}" 2>/dev/null; then
        log_info "Local repo section already active in pacman.conf."
    elif grep -q "^#\[devshakti\]" "${pacman_conf}" 2>/dev/null; then
        log_info "Activating [devshakti] repo section in pacman.conf..."
        sed -i 's|^#\[devshakti\]|\[devshakti\]|' "${pacman_conf}"
        sed -i 's|^#SigLevel = Optional TrustAll|SigLevel = Optional TrustAll|' "${pacman_conf}"
        sed -i "s|^#Server = file:///.*|Server = file://${AUR_REPO_DIR}|" "${pacman_conf}"
    else
        log_info "Appending [devshakti] repo section to pacman.conf..."
        cat >> "${pacman_conf}" <<EOF

[devshakti]
SigLevel = Optional TrustAll
Server = file://${AUR_REPO_DIR}
EOF
    fi

    # Also add the AUR package names to packages.x86_64 so they get installed
    local pkg_list="${PROFILE_DIR}/packages.x86_64"
    for pkg in "${AUR_PACKAGES[@]}"; do
        if ! grep -q "^${pkg}$" "${pkg_list}" 2>/dev/null; then
            echo "${pkg}" >> "${pkg_list}"
        fi
    done

    log_success "Local repo injected into build profile."
}

# ---------------------------------------------------------------------------
# ISO Build
# ---------------------------------------------------------------------------
build_iso() {
    log_step "Building DevShakti OS ISO"

    log_info "This may take a while... Go grab a cup of chai ☕"
    log_info "Full build log: ${LOG_FILE}"
    echo ""

    # Run mkarchiso
    mkarchiso -v \
        -w "${WORK_DIR}" \
        -o "${OUT_DIR}" \
        "${PROFILE_DIR}" \
        2>&1 | tee -a "${LOG_FILE}" | \
        while IFS= read -r line; do
            # Show progress lines with prefix
            echo -e "  ${WHITE}│${NC} ${line}"
        done

    # Check if ISO was created
    local iso_file
    iso_file=$(find "${OUT_DIR}" -name "${ISO_NAME}-*.iso" -type f | head -n1)

    if [[ -z "${iso_file}" ]]; then
        log_error "ISO file was not created. Check the build log: ${LOG_FILE}"
        exit 1
    fi

    log_success "ISO built successfully!"
    return 0
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print_summary() {
    local iso_file
    iso_file=$(find "${OUT_DIR}" -name "${ISO_NAME}-*.iso" -type f | head -n1)

    if [[ -z "${iso_file}" ]]; then
        log_error "No ISO file found in ${OUT_DIR}."
        return 1
    fi

    local iso_size
    iso_size=$(du -h "${iso_file}" | awk '{print $1}')
    local iso_sha256
    iso_sha256=$(sha256sum "${iso_file}" | awk '{print $1}')

    echo ""
    echo -e "${GREEN}${BOLD}"
    echo "  ╔══════════════════════════════════════════════════════════╗"
    echo "  ║                                                          ║"
    echo "  ║            ✅  BUILD COMPLETE — DevShakti OS             ║"
    echo "  ║                                                          ║"
    echo "  ╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "  ${BOLD}ISO File:${NC}    ${iso_file}"
    echo -e "  ${BOLD}Size:${NC}        ${iso_size}"
    echo -e "  ${BOLD}SHA-256:${NC}     ${iso_sha256}"
    echo ""
    echo -e "  ${CYAN}Next steps:${NC}"
    echo -e "    1. Write to USB:  ${WHITE}sudo dd bs=4M if=${iso_file} of=/dev/sdX status=progress oflag=sync${NC}"
    echo -e "    2. Or use:        ${WHITE}ventoy / balenaEtcher / Rufus${NC}"
    echo -e "    3. Boot and enjoy DevShakti OS! 🔱"
    echo ""

    # Write checksum file
    echo "${iso_sha256}  $(basename "${iso_file}")" > "${OUT_DIR}/SHA256SUMS"
    log_info "Checksum written to ${OUT_DIR}/SHA256SUMS"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
    parse_args "$@"
    log_banner

    local start_time
    start_time=$(date +%s)

    check_root

    # Clean-only mode
    if [[ "$CLEAN_ONLY" == true ]]; then
        clean_workspace
        log_success "Clean complete. Exiting."
        exit 0
    fi

    check_dependencies
    clean_workspace
    setup_workspace
    build_aur_packages
    build_iso
    print_summary

    local end_time
    end_time=$(date +%s)
    local elapsed=$(( end_time - start_time ))
    local minutes=$(( elapsed / 60 ))
    local seconds=$(( elapsed % 60 ))

    echo -e "  ${BOLD}Build time:${NC}  ${minutes}m ${seconds}s"
    echo ""
}

main "$@"
