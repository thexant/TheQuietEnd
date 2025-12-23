# The Quiet End - Multiplayer Server

WebSocket server for ambient online multiplayer features.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start server:
```bash
npm start
```

Server will run on `ws://localhost:8080`

## Production Deployment (VPS with HTTPS)

### Prerequisites
- Node.js 18+ installed on VPS
- Nginx installed (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)
- Domain pointing to your VPS

### Step 1: Upload Files

Upload the `server/` folder to your VPS:
```bash
scp -r server/ user@yourdomain.com:/var/www/gatecontrol/
```

### Step 2: Install Dependencies

```bash
cd /var/www/gatecontrol/server
npm install
```

### Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 4: Start Server with PM2

```bash
pm2 start server.js --name tqe-multiplayer
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

### Step 5: Configure Nginx Reverse Proxy

Create/edit nginx config (e.g., `/etc/nginx/sites-available/gatecontrol`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration (adjust paths to your certificates)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory for static files
    root /var/www/gatecontrol;
    index index.html;

    # Serve static game files
    location / {
        try_files $uri $uri/ =404;
    }

    # WebSocket proxy (IMPORTANT: This handles the multiplayer server)
    location / {
        # First try static files, then proxy WebSocket upgrade requests
        try_files $uri $uri/ @websocket;
    }

    location @websocket {
        # Only proxy WebSocket upgrade requests
        if ($http_upgrade != "websocket") {
            return 404;
        }

        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

**Simpler alternative (WebSocket on separate path):**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Static files
    root /var/www/gatecontrol;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # WebSocket endpoint (dedicated path)
    location /multiplayer {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

If using the separate path option, update `index.html` line 8750:
```javascript
defaultServerUrl = `wss://${window.location.host}/multiplayer`;
```

### Step 6: Enable and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/gatecontrol /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 7: Configure Firewall

If using ufw:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 8080/tcp  # Only if not using nginx proxy
```

## Monitoring

Check server status:
```bash
pm2 status
pm2 logs tqe-multiplayer
```

Restart server:
```bash
pm2 restart tqe-multiplayer
```

Stop server:
```bash
pm2 stop tqe-multiplayer
```

## Environment Variables

You can configure the server port via environment variable:

```bash
PORT=8080 pm2 start server.js --name tqe-multiplayer
```

Or create a `.env` file in the server directory.

## Troubleshooting

### WebSocket connection fails with SSL error
- Ensure you're using `wss://` not `ws://` on HTTPS sites
- Check nginx SSL configuration
- Verify certificates are valid: `sudo certbot certificates`

### Players can't connect
- Check server is running: `pm2 status`
- Check nginx configuration: `sudo nginx -t`
- Check firewall allows HTTPS (443): `sudo ufw status`
- Check server logs: `pm2 logs tqe-multiplayer`

### Connection works locally but not on VPS
- Verify WebSocket URL is correct (check browser console)
- Check nginx reverse proxy is configured
- Ensure server is listening: `netstat -tlnp | grep 8080`

## Performance

The server can handle ~100 concurrent connections on a basic VPS. For more players:
- Use a reverse proxy load balancer
- Scale horizontally with Redis for state sharing
- Increase Node.js memory: `node --max-old-space-size=4096 server.js`

## Security Notes

- The server has no authentication (by design for ambient multiplayer)
- Messages are not validated beyond length (160 chars)
- Consider rate limiting if abuse becomes an issue
- WebSocket connections are secured by HTTPS/WSS
