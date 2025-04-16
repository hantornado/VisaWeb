# DNS and Server Security Guide

## 1. DNSSEC Configuration with Cloudflare

DNSSEC (Domain Name System Security Extensions) adds an additional layer of security to DNS by cryptographically signing DNS records, preventing DNS spoofing and cache poisoning attacks.

### Setting up DNSSEC with Cloudflare

1. **Log in to your Cloudflare account**
   - Access the Cloudflare dashboard at [dash.cloudflare.com](https://dash.cloudflare.com)

2. **Select your domain**
   - Click on the domain you're using for the Visa Status Checker application

3. **Enable DNSSEC**
   - Navigate to the DNS tab
   - Scroll down to find the "DNSSEC" section
   - Click "Enable DNSSEC"
   - Cloudflare will generate the necessary DS (Delegation Signer) records

4. **Configure your domain registrar**
   - Copy the DS record information provided by Cloudflare
   - Log in to your domain registrar's website
   - Find the DNS or DNSSEC management section
   - Add the DS record from Cloudflare
   - Save the changes

5. **Verify DNSSEC activation**
   - Return to Cloudflare after 24-48 hours
   - Check that the DNSSEC status shows as "Active"
   - You can also verify using online DNSSEC checking tools like [dnsviz.net](https://dnsviz.net)

## 2. Software and Dependencies Update Strategy

### Automated Dependency Updates

1. **Install Dependabot for GitHub**
   - Create a `.github/dependabot.yml` file in your repository with the following content:

   ```yaml
   version: 2
   updates:
     # Update npm packages
     - package-ecosystem: "npm"
       directory: "/backend"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
       versioning-strategy: auto
       allow:
         - dependency-type: "production"
       ignore:
         - dependency-name: "express"
           versions: ["5.x"]
       labels:
         - "dependencies"
         - "security"

     # Update npm packages for frontend
     - package-ecosystem: "npm"
       directory: "/frontend"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
       versioning-strategy: auto
       allow:
         - dependency-type: "production"
       labels:
         - "dependencies"
         - "security"
   ```

2. **Implement npm audit in CI/CD pipeline**
   - Add the following to your CI/CD configuration:

   ```yaml
   # For GitHub Actions
   security-audit:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v3
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '16'
       - name: Install dependencies
         run: |
           cd backend
           npm ci
       - name: Run security audit
         run: |
           cd backend
           npm audit --production
   ```

3. **Manual update procedure**
   - Schedule monthly reviews of dependencies
   - Run `npm outdated` to identify packages needing updates
   - Test updates in a staging environment before deploying to production
   - Document all updates in a changelog

## 3. DDoS Protection with Cloudflare

### Basic DDoS Protection Setup

1. **Enable Cloudflare proxy**
   - Ensure all DNS records have the orange cloud icon (proxied) in Cloudflare
   - This routes traffic through Cloudflare's network for protection

2. **Configure security level**
   - Go to the "Security" tab in Cloudflare
   - Set the security level to "Medium" (recommended starting point)
   - This balances protection with legitimate user access

3. **Enable "Under Attack Mode" during active attacks**
   - In the Cloudflare dashboard, go to "Security" > "Settings"
   - Toggle "Under Attack Mode" to "On" when experiencing an attack
   - This adds a browser challenge to filter out bot traffic

4. **Configure rate limiting**
   - Go to "Security" > "WAF" > "Rate limiting rules"
   - Create a new rate limiting rule:
     - Name: "API Rate Limit"
     - If incoming requests match: URI Path contains "/api/"
     - And, rate exceeds: 100 requests per minute
     - Then: Block

5. **Set up custom firewall rules**
   - Go to "Security" > "WAF" > "Custom rules"
   - Create rules to block suspicious traffic patterns
   - Example rule to block suspicious user agents:
     - If: User Agent contains "sqlmap" or "nikto"
     - Then: Block

## 4. Server Firewall Configuration

### AWS EC2 Security Groups (if using AWS)

1. **Create a web application security group**
   - Name: `visa-app-web-sg`
   - Description: "Security group for Visa Status Checker web servers"
   - Inbound rules:
     - Allow HTTP (port 80) from Cloudflare IP ranges only
     - Allow HTTPS (port 443) from Cloudflare IP ranges only
     - Allow SSH (port 22) from your office IP address only
   - Outbound rules:
     - Allow all traffic to all destinations (default)

2. **Create a database security group**
   - Name: `visa-app-db-sg`
   - Description: "Security group for Visa Status Checker database"
   - Inbound rules:
     - Allow MongoDB (port 27017) from `visa-app-web-sg` only
   - Outbound rules:
     - Allow all traffic to all destinations (default)

### Linux Server Firewall (UFW for Ubuntu)

1. **Install and enable UFW**
   ```bash
   sudo apt update
   sudo apt install ufw
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   ```

2. **Configure firewall rules**
   ```bash
   # Allow SSH (restrict to your IP if possible)
   sudo ufw allow ssh
   
   # Allow HTTP and HTTPS
   sudo ufw allow http
   sudo ufw allow https
   
   # Allow Node.js application port
   sudo ufw allow 5000/tcp
   
   # Enable the firewall
   sudo ufw enable
   ```

3. **Verify firewall status**
   ```bash
   sudo ufw status verbose
   ```

### Fail2Ban Configuration

1. **Install Fail2Ban**
   ```bash
   sudo apt update
   sudo apt install fail2ban
   ```

2. **Create a custom configuration**
   ```bash
   sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
   sudo nano /etc/fail2ban/jail.local
   ```

3. **Add Node.js application protection**
   Add the following to `/etc/fail2ban/jail.local`:
   ```
   [nodejs-app]
   enabled = true
   port = http,https
   filter = nodejs-app
   logpath = /var/log/nodejs/app.log
   maxretry = 5
   findtime = 600
   bantime = 3600
   ```

4. **Create a custom filter**
   Create `/etc/fail2ban/filter.d/nodejs-app.conf`:
   ```
   [Definition]
   failregex = ^.*Failed login attempt from IP: <HOST>.*$
              ^.*Too many requests from IP: <HOST>.*$
   ignoreregex =
   ```

5. **Start Fail2Ban**
   ```bash
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

## Implementation Checklist

- [ ] Configure DNSSEC with Cloudflare
- [ ] Set up automated dependency updates with Dependabot
- [ ] Implement npm audit in CI/CD pipeline
- [ ] Enable Cloudflare proxy and DDoS protection
- [ ] Configure rate limiting rules
- [ ] Set up server firewall (AWS Security Groups or UFW)
- [ ] Install and configure Fail2Ban

## Maintenance Schedule

- **Weekly**: Review security logs and Fail2Ban reports
- **Monthly**: Run manual dependency updates and security audits
- **Quarterly**: Review and update firewall rules
- **Annually**: Conduct a comprehensive security review