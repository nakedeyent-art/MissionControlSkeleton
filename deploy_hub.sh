#!/usr/bin/env bash
# =============================================================================
# Mission Control Hub Deployment Script
# Deploys the built React app to gateway.nak3deye.com (34.148.98.219)
# =============================================================================
set -euo pipefail

# ─── CONFIG ──────────────────────────────────────────────────────────────────
VM_IP="34.148.98.219"
VM_USER="rizzolini"  # Change this to 'root' or your specific SSH user if different
BUILD_DIR="$(cd "$(dirname "$0")" && pwd)/dist/"

# This is the directory where gateway.nak3deye.com serves its frontend.
# If you are serving via Nginx directly on the VM, adjust to /var/www/html or similar.
TARGET_DIR="/home/${VM_USER}/.openclaw/control-ui/"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Deploying Mission Control Hub"
echo "  Target: ${VM_USER}@${VM_IP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Build the fresh React Code
echo "▶ Step 1/2 — Building production React app..."
cd "$(dirname "$0")"
npm run build
echo "   ✓ Build complete"

# 2. RSYNC Deploy
echo ""
echo "▶ Step 2/2 — Syncing dist/ to gateway server..."

# Create the target directory on the remote machine if it doesn't exist
ssh -i ~/.ssh/google_compute_engine "${VM_USER}@${VM_IP}" "mkdir -p ${TARGET_DIR}"

# rsyc upload preserving permissions, compressing, and deleting old artifacts
rsync -avz --delete -e "ssh -i ~/.ssh/google_compute_engine" "$BUILD_DIR" "${VM_USER}@${VM_IP}:${TARGET_DIR}"


echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "  Mission Control is now live at: https://gateway.nak3deye.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
