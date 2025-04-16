# Visa Status Checker Deployment Guide

This guide provides instructions for deploying the Visa Status Checker application to production environments.

## Backend Deployment (Node.js Express API)

### Option 1: Deployment to Render

1. **Create a Render account**
   - Sign up at [render.com](https://render.com)

2. **Create a new Web Service**
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository containing the Visa Status Checker backend

3. **Configure the service**
   - Name: `visa-status-checker-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Select an appropriate plan (Free tier for testing)

4. **Set environment variables**
   - Add all variables from `.env.example` with appropriate production values
   - Ensure `NODE_ENV=production`
   - Set `MONGO_URI` to your MongoDB Atlas connection string
   - Set `FRONTEND_URL` to your frontend deployment URL
   - Add `SENTRY_DSN` for error tracking
   - Set `ENCRYPTION_KEY` and `SIGNING_KEY` (use strong random values)

5. **Deploy the service**
   - Click "Create Web Service"
   - Render will automatically deploy your application

### Option 2: Deployment to AWS EC2

1. **Launch an EC2 instance**
   - Use Amazon Linux 2 or Ubuntu Server
   - Select an appropriate instance type (t2.micro for testing)
   - Configure security groups to allow HTTP/HTTPS traffic

2. **Install Node.js and dependencies**
   ```bash
   # For Ubuntu
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # For Amazon Linux
   curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/visa-status-checker.git
   cd visa-status-checker/backend
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

5. **Install PM2 for process management**
   ```bash
   sudo npm install -g pm2
   ```

6. **Start the application**
   ```bash
   npm install
   pm2 start server.js --name "visa-api"
   pm2 startup  # Configure PM2 to start on system boot
   ```

7. **Set up Nginx as a reverse proxy**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/visa-api
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Enable the site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/visa-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Frontend Deployment (React/Vue/Angular)

### Deployment to Vercel

1. **Create a Vercel account**
   - Sign up at [vercel.com](https://vercel.com)

2. **Install Vercel CLI (optional)**
   ```bash
   npm install -g vercel
   ```

3. **Deploy via GitHub integration**
   - Connect your GitHub account to Vercel
   - Import your repository
   - Configure project settings:
     - Framework Preset: Select your frontend framework (React, Vue, etc.)
     - Build Command: `npm run build`
     - Output Directory: `dist` or `build` (depends on your framework)

4. **Set environment variables**
   - Add `VITE_API_URL` pointing to your backend API URL
   - Add any other required environment variables

5. **Deploy the project**
   - Click "Deploy"
   - Vercel will build and deploy your frontend application

## Database Deployment (MongoDB)

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas account**
   - Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster**
   - Select a cloud provider and region
   - Choose a cluster tier (M0 Sandbox is free)
   - Name your cluster

3. **Configure database access**
   - Create a database user with a strong password
   - Add IP access list entries (whitelist your deployment servers)

4. **Connect to your cluster**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Update the `MONGO_URI` in your backend environment variables

5. **Create indexes for performance**
   - Create indexes on frequently queried fields
   - Example: Create an index on `passportNumber` and `uniqueApplicationCode`

## CI/CD Pipeline Setup (GitHub Actions)

1. **Create GitHub Actions workflow files**

   Create `.github/workflows/backend-ci.yml`:
   ```yaml
   name: Backend CI

   on:
     push:
       branches: [ main ]
       paths:
         - 'backend/**'
     pull_request:
       branches: [ main ]
       paths:
         - 'backend/**'

   jobs:
     build:
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: ./backend

       steps:
       - uses: actions/checkout@v3
       - name: Use Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '16.x'
           cache: 'npm'
           cache-dependency-path: './backend/package-lock.json'
       - run: npm ci
       - run: npm test
   ```

   Create `.github/workflows/frontend-ci.yml`:
   ```yaml
   name: Frontend CI

   on:
     push:
       branches: [ main ]
       paths:
         - 'frontend/**'
     pull_request:
       branches: [ main ]
       paths:
         - 'frontend/**'

   jobs:
     build:
       runs-on: ubuntu-latest
       defaults:
         run:
           working-directory: ./frontend

       steps:
       - uses: actions/checkout@v3
       - name: Use Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '16.x'
           cache: 'npm'
           cache-dependency-path: './frontend/package-lock.json'
       - run: npm ci
       - run: npm run build
   ```

## Post-Deployment Checklist

1. **Verify HTTPS is working correctly**
2. **Test all API endpoints**
3. **Verify database connections and queries**
4. **Check error logging and monitoring**
5. **Test notification system**
6. **Perform security scan**
7. **Set up regular database backups**
8. **Configure uptime monitoring**

## Troubleshooting

### Common Issues

1. **Connection refused errors**
   - Check security groups/firewall settings
   - Verify the service is running (`pm2 status`)

2. **Database connection issues**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string is correct

3. **CORS errors**
   - Ensure `FRONTEND_URL` is set correctly in backend environment
   - Check CORS configuration in server.js

4. **SSL certificate issues**
   - Renew certificates if expired
   - Check certificate configuration

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the application logs
2. Review Sentry error reports
3. Consult the project documentation
4. Open an issue on the project repository