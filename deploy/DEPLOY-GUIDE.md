# Deploying goodobox.com

## Option 1: VPS (DigitalOcean, AWS, Linode, etc.) — Recommended

### 1. Provision a server
- Ubuntu 22.04+ VPS ($6-12/mo on DigitalOcean or Linode)
- Note your server's **public IP address** (e.g. `143.198.xx.xx`)

### 2. GoDaddy DNS setup
Log into GoDaddy → Domain Settings → **DNS Management** for goodobox.com:

| Type  | Name | Value              | TTL    |
|-------|------|--------------------|--------|
| A     | @    | YOUR_SERVER_IP     | 600    |
| A     | www  | YOUR_SERVER_IP     | 600    |

Delete any existing A records or "parked" records first.

### 3. Server setup
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

# Clone your project
cd /var/www
git clone YOUR_REPO_URL good-open-box
cd good-open-box

# Build
chmod +x deploy.sh
./deploy.sh

# Create production .env
cd backend
cp .env.example .env
nano .env   # Set JWT_SECRET to a random string
```

### 4. Setup systemd service
```bash
sudo cp /var/www/good-open-box/deploy/goodobox.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable goodobox
sudo systemctl start goodobox

# Check it's running
sudo systemctl status goodobox
curl http://localhost:5000/api/health
```

### 5. Setup Nginx + SSL
```bash
# Copy nginx config
sudo cp /var/www/good-open-box/deploy/nginx-goodobox.conf /etc/nginx/sites-available/goodobox
sudo ln -s /etc/nginx/sites-available/goodobox /etc/nginx/sites-enabled/

# First, temporarily comment out the SSL server block and use only port 80 proxy
# to get SSL certificate. Then:

# Get free SSL certificate
sudo certbot --nginx -d goodobox.com -d www.goodobox.com

# Restart nginx
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Verify
- Open https://goodobox.com
- Check https://goodobox.com/api/health

---

## Option 2: Railway / Render (easier, no server management)

### Railway
1. Push code to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Set root directory to `/backend`
4. Add environment variables: `NODE_ENV=production`, `JWT_SECRET=your_secret`, `PORT=5000`
5. Railway gives you a URL like `goodobox-production.up.railway.app`

### GoDaddy DNS for Railway/Render
| Type  | Name | Value                                    | TTL  |
|-------|------|------------------------------------------|------|
| CNAME | www  | goodobox-production.up.railway.app       | 600  |
| CNAME | @    | goodobox-production.up.railway.app       | 600  |

Then add custom domain `goodobox.com` in Railway/Render dashboard.

---

## Option 3: Vercel (frontend) + Railway (backend)

Split deployment — Vercel for React, Railway for API:

1. **Frontend on Vercel**: Connect GitHub, set root to `frontend/`
2. **Backend on Railway**: Connect GitHub, set root to `backend/`
3. Update `frontend/src/api/axios.js` baseURL:
   ```js
   baseURL: import.meta.env.PROD ? 'https://api.goodobox.com/api' : '/api'
   ```
4. GoDaddy DNS: Point `goodobox.com` to Vercel, `api.goodobox.com` to Railway

---

## Quick checklist
- [ ] Server provisioned with public IP
- [ ] GoDaddy DNS A records pointing to server IP
- [ ] DNS propagated (check with `dig goodobox.com`)
- [ ] Node.js app running on port 5000
- [ ] Nginx proxying port 80/443 → 5000
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] `.env` file has strong JWT_SECRET
- [ ] Site loads at https://goodobox.com
