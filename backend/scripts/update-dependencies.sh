#!/bin/bash
# Dependency Update Script for Visa Status Checker
# This script performs a safe update of dependencies for both backend and frontend

# Exit on any error
set -e

echo "[INFO] Starting dependency update process..."

# Define project directories
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# Function to update dependencies for a specific directory
update_dependencies() {
    local dir=$1
    local name=$2
    
    echo "[INFO] Updating $name dependencies..."
    
    # Check if directory exists and contains package.json
    if [ ! -d "$dir" ] || [ ! -f "$dir/package.json" ]; then
        echo "[ERROR] $name directory not found or missing package.json"
        return 1
    fi
    
    # Navigate to directory
    cd "$dir"
    
    # Create a backup of package.json and package-lock.json
    echo "[INFO] Creating backup of package files..."
    cp package.json package.json.bak
    if [ -f "package-lock.json" ]; then
        cp package-lock.json package-lock.json.bak
    fi
    
    # Check for outdated packages
    echo "[INFO] Checking for outdated packages..."
    npm outdated
    
    # Run security audit
    echo "[INFO] Running security audit..."
    npm audit
    
    # Update dependencies
    echo "[INFO] Updating dependencies..."
    npm update
    
    # Run security audit again to verify updates
    echo "[INFO] Verifying security after updates..."
    npm audit
    
    # Run tests if available
    if grep -q '"test"' package.json; then
        echo "[INFO] Running tests..."
        npm test || {
            echo "[WARNING] Tests failed after dependency update. Rolling back..."
            mv package.json.bak package.json
            if [ -f "package-lock.json.bak" ]; then
                mv package-lock.json.bak package-lock.json
            fi
            npm install
            return 1
        }
    else
        echo "[WARNING] No test script found in package.json. Skipping tests."
    fi
    
    # Clean up backups if everything succeeded
    rm package.json.bak
    if [ -f "package-lock.json.bak" ]; then
        rm package-lock.json.bak
    fi
    
    echo "[SUCCESS] $name dependencies updated successfully"
    return 0
}

# Update backend dependencies
if update_dependencies "$BACKEND_DIR" "Backend"; then
    echo "[INFO] Backend dependencies updated successfully"
else
    echo "[ERROR] Failed to update backend dependencies"
    exit_code=1
fi

# Update frontend dependencies
if update_dependencies "$FRONTEND_DIR" "Frontend"; then
    echo "[INFO] Frontend dependencies updated successfully"
else
    echo "[ERROR] Failed to update frontend dependencies"
    exit_code=1
fi

# Final status
if [ "$exit_code" -eq 0 ]; then
    echo "[SUCCESS] All dependencies updated successfully"
else
    echo "[ERROR] Some dependency updates failed. Please check the logs."
    exit 1
fi

# Reminder for manual review
echo ""
echo "[REMINDER] Please review the changes and test thoroughly before deploying to production."
echo "[REMINDER] Consider updating the dependency update log with today's changes."