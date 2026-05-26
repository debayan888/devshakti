#!/usr/bin/env bash
# ============================================================================
# DevShakti OS — archiso Profile Definition
# ============================================================================
# Defines the ISO build profile for DevShakti OS.
# This file is sourced by mkarchiso during the build process.
#
# Copyright (c) 2026 DevShakti Project
# SPDX-License-Identifier: MIT
# ============================================================================

# --- ISO Metadata -----------------------------------------------------------
iso_name="devshakti"
iso_label="DEVSHAKTI_$(date +%Y%m)"
iso_publisher="DevShakti Project <https://github.com/devshakti>"
iso_application="DevShakti OS Live/Install Media"
iso_version="$(date +%Y.%m.%d)"
install_dir="arch"
buildmodes=('iso')
arch="x86_64"
pacman_conf="pacman.conf"

# --- Root Filesystem Image ---------------------------------------------------
# Use squashfs with zstd compression for optimal size/speed balance.
# zstd provides significantly faster decompression than xz/gzip while
# maintaining competitive compression ratios — ideal for live boot speed.
airootfs_image_type="squashfs"
airootfs_image_tool_options=('-comp' 'zstd' '-Xcompression-level' '15' '-b' '1M')

# --- Boot Modes --------------------------------------------------------------
# Support both legacy BIOS (via syslinux) and UEFI (via GRUB) boot.
# Uses archiso v88+ boot mode names.
bootmodes=(
    'bios.syslinux'              # BIOS boot (MBR + El Torito)
    'uefi.grub'                  # UEFI boot (x64 ESP + El Torito)
)

# --- File Permissions ---------------------------------------------------------
# Set explicit permissions for sensitive files and scripts in the airootfs.
# Format: ["path"]="uid:gid:mode"
#
# These are applied after the airootfs is populated but before it is
# compressed into the squashfs image.
file_permissions=(
    # Shadow files — restrict to root only (no world-readable)
    ["/etc/shadow"]="0:0:0400"
    ["/etc/gshadow"]="0:0:0400"

    # Root home directory
    ["/root"]="0:0:0750"

    # DevShakti custom scripts in /usr/local/bin
    ["/usr/local/bin/devshakti-gpu-select"]="0:0:0755"
    ["/usr/local/bin/devshakti-power-mode"]="0:0:0755"
    ["/usr/local/bin/devshakti-run-windows"]="0:0:0755"
    ["/usr/local/bin/devshakti-wine-setup"]="0:0:0755"
    ["/usr/local/bin/devshakti-install"]="0:0:0755"
    ["/usr/local/bin/devshakti-first-boot"]="0:0:0755"
)
