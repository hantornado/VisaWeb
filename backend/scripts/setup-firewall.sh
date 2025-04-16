#!/bin/bash
# Server Firewall Configuration Script for Visa Status Checker
# This script configures UFW firewall rules for the application server

# Exit on any error
set -e

echo "[INFO] Starting firewall configuration..."

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "[ERROR] This script must be run as root"
    exit 1
fi

# Install UFW if not already installed
if ! command -v ufw &> /dev/null; then
    echo "[INFO] Installing UFW..."
    apt update
    apt install -y ufw
fi

# Reset UFW to default settings
echo "[INFO] Resetting UFW to default settings..."
ufw --force reset

# Set default policies
echo "[INFO] Setting default policies..."
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (restrict to specific IP if available)
echo "[INFO] Allowing SSH connections..."
if [ -n "$ADMIN_IP" ]; then
    ufw allow from $ADMIN_IP to any port 22 proto tcp
    echo "[INFO] SSH access restricted to IP: $ADMIN_IP"
else
    ufw allow ssh
    echo "[WARNING] SSH access allowed from any IP. Consider restricting this in production."
fi

# Allow HTTP and HTTPS
echo "[INFO] Allowing HTTP and HTTPS connections..."
ufw allow http
ufw allow https

# Allow Node.js application port
NODE_PORT=${PORT:-5000}
echo "[INFO] Allowing Node.js application port: $NODE_PORT"
ufw allow $NODE_PORT/tcp

# If using Cloudflare, restrict HTTP/HTTPS to Cloudflare IPs only
if [ "$USE_CLOUDFLARE" = "true" ]; then
    echo "[INFO] Configuring Cloudflare-only access for HTTP/HTTPS..."
    
    # Remove the general HTTP/HTTPS rules
    ufw delete allow http
    ufw delete allow https
    
    # Cloudflare IPv4 ranges (this list should be updated periodically)
    # Source: https://www.cloudflare.com/ips-v4
    CLOUDFLARE_IPS=(
        "173.245.48.0/20"
        "103.21.244.0/22"
        "103.22.200.0/22"
        "103.31.4.0/22"
        "141.101.64.0/18"
        "108.162.192.0/18"
        "190.93.240.0/20"
        "188.114.96.0/20"
        "197.234.240.0/22"
        "198.41.128.0/17"
        "162.158.0.0/15"
        "104.16.0.0/13"
        "104.24.0.0/14"
        "172.64.0.0/13"
        "131.0.72.0/22"
    )
    
    # Allow HTTP/HTTPS only from Cloudflare IPs
    for ip in "${CLOUDFLARE_IPS[@]}"; do
        ufw allow from $ip to any port 80 proto tcp
        ufw allow from $ip to any port 443 proto tcp
    done
    
    echo "[INFO] HTTP/HTTPS access restricted to Cloudflare IPs only"
fi

# Enable UFW
echo "[INFO] Enabling UFW..."
ufw --force enable

# Display status
echo "[INFO] Firewall configuration complete. Current status:"
ufw status verbose

# Install and configure Fail2Ban
echo "[INFO] Setting up Fail2Ban..."

# Install Fail2Ban if not already installed
if ! command -v fail2ban-client &> /dev/null; then
    echo "[INFO] Installing Fail2Ban..."
    apt update
    apt install -y fail2ban
fi

# Create Fail2Ban configuration
echo "[INFO] Configuring Fail2Ban..."

# Create jail.local if it doesn't exist
if [ ! -f /etc/fail2ban/jail.local ]; then
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
fi

# Create Node.js application filter
cat > /etc/fail2ban/filter.d/nodejs-app.conf << EOF
[Definition]
failregex = ^.*Failed login attempt from IP: <HOST>.*$
           ^.*Too many requests from IP: <HOST>.*$
ignoreregex =
EOF

# Add Node.js application jail
cat >> /etc/fail2ban/jail.local << EOF

[nodejs-app]
enabled = true
port = http,https
filter = nodejs-app
logpath = /var/log/nodejs/app.log
maxretry = 5
findtime = 600
bantime = 3600
EOF

# Create log directory if it doesn't exist
mkdir -p /var/log/nodejs

# Restart Fail2Ban
echo "[INFO] Restarting Fail2Ban..."
systemctl restart fail2ban
systemctl enable fail2ban

echo "[INFO] Fail2Ban configuration complete"
echo "[SUCCESS] Server security configuration completed successfully"