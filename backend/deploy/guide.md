# YARO Backend — Hostinger VPS Deployment Guide

## 1. Prerequisites

- Hostinger VPS (Ubuntu 22.04+)
- Node.js 18+ installed
- PostgreSQL (Supabase account)
- Domains pointed to your VPS IP

## 2. Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs git nginx

# Verify
node --version
npm --version
```

## 3. Deploy Backend

```bash
# Clone repo
git clone https://github.com/MIRUN2303/yaro.git /var/www/yaro
cd /var/www/yaro/backend

# Install deps
npm install --production

# Create .env file
cp .env.example .env
nano .env

# Fill in your .env values (see below)
```

### .env Configuration

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-secret
RESEND_API_KEY=re_xxxxx
JWT_SECRET=<generate with: openssl rand -hex 32>
ADMIN_EMAIL=admin@yaro.com
ADMIN_PASSWORD=<choose a strong password>
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

## 4. Database Setup

1. Go to [Supabase Dashboard](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy and paste the contents of `backend/src/migrations/001_initial.sql`
5. Run the migration
6. Copy your Supabase URL and keys from Project Settings → API

### Supabase Storage Setup

1. In Supabase Dashboard, go to Storage
2. Create a new bucket called `yaro-images`
3. Set bucket to public
4. Create a policy to allow public reads:

```sql
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'yaro-images');
```

## 5. Process Manager (PM2)

```bash
npm install -g pm2

# Start the backend
pm2 start src/index.js --name yaro-backend
pm2 save
pm2 startup
```

## 6. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/yaro`:

```nginx
server {
    listen 80;
    server_name api.yaro.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}

server {
    listen 80;
    server_name yaro.com www.yaro.com;

    root /var/www/yaro;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }

    location /admin {
        proxy_pass http://127.0.0.1:3000/admin;
    }
}
```

Enable and restart:

```bash
ln -sf /etc/nginx/sites-available/yaro /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

## 7. SSL with Let's Encrypt

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yaro.com -d www.yaro.com -d api.yaro.com
```

## 8. Connect Frontend to Backend

In each HTML file, add the API base URL at the top of the relevant script section:

```js
const API_BASE = 'https://api.yaro.com/api';
```

The frontend should be updated to call these endpoints instead of using static data (see `CONNECT_FRONTEND.md` for per-file changes).

## 9. Admin Dashboard

- URL: `https://yaro.com/admin`
- Login with ADMIN_EMAIL / ADMIN_PASSWORD from .env
- Manage collections, stories, products, orders

## 10. Monitoring

```bash
pm2 status
pm2 logs yaro-backend
pm2 monit

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 11. Backup

```bash
# Database backup via Supabase (SQL dump)
# Set up a cron job for daily backups
0 3 * * * pg_dump your-db-url > /backups/yaro-$(date +\%Y\%m\%d).sql
```

## 12. Troubleshooting

- Check PM2 logs: `pm2 logs yaro-backend`
- Check Nginx: `nginx -t && systemctl status nginx`
- Test API: `curl https://api.yaro.com/api/health`
- Check firewall: `ufw status` (ensure 80, 443 are open)
