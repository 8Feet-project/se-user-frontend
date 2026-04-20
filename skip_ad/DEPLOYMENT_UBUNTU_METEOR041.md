# Ubuntu Deployment Guide for `sb.meteor041.com`

This guide deploys the Bili SponsorBlock backend on a third-party Ubuntu Linux server without conflicting with other websites already using ports `80` and `443`.

## Architecture

- `meteor041.com` and any existing websites stay unchanged.
- `sb.meteor041.com` is dedicated to SponsorBlock APIs.
- `nginx` remains the only public process listening on `80/443`.
- Self-hosted Supabase listens on `127.0.0.1:18000` only.
- The worker runs as a private background service and exposes no public port.

## Recommended Layout

```text
/srv/
  supabase-project/
  bili-sponsorblock/
    supabase/
    worker/
/etc/nginx/sites-available/
  sb.meteor041.com.conf
/etc/systemd/system/
  bili-sponsorblock-worker.service
/etc/
  bili-sponsorblock-worker.env
```

## 1. DNS

Create an `A` record:

- `sb.meteor041.com -> your server public IP`

Wait until DNS resolves before requesting the TLS certificate.

## 2. Base Packages

```bash
sudo apt update
sudo apt upgrade -y
sudo timedatectl set-timezone Asia/Hong_Kong
sudo apt install -y ca-certificates curl gnupg lsb-release git unzip jq nginx certbot python3-certbot-nginx ffmpeg
```

## 3. Docker and Compose

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Node.js and `yt-dlp`

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
yt-dlp --version
```

## 5. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## 6. Prepare Supabase

```bash
sudo mkdir -p /srv/supabase-project
sudo chown -R $USER:$USER /srv/supabase-project
cd /srv
git clone --depth 1 https://github.com/supabase/supabase /srv/supabase-src
cp -rf /srv/supabase-src/docker/* /srv/supabase-project
cp /srv/supabase-src/docker/.env.example /srv/supabase-project/.env
cd /srv/supabase-project
docker compose pull
```

Generate keys from the official helper scripts:

```bash
cd /srv/supabase-src/docker
sh utils/generate-keys.sh
sh utils/add-new-auth-keys.sh
```

Edit `/srv/supabase-project/.env` and set at least:

```dotenv
SUPABASE_PUBLIC_URL=https://sb.meteor041.com
API_EXTERNAL_URL=https://sb.meteor041.com
SITE_URL=https://sb.meteor041.com

DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=ChangeThisToAStrongPassword123
```

Keep the generated publishable/anon and service-role/secret keys. The browser extension will use the publishable key. The worker and functions will use the service key.

## 7. Avoid Port Conflicts

Supabase ships with a public gateway that usually binds `8000:8000`. On a multi-site server, bind it to loopback only.

Open `/srv/supabase-project/docker-compose.yml` and change any public gateway mapping like:

```yaml
- 8000:8000
```

to:

```yaml
- 127.0.0.1:18000:8000
```

If you expose Postgres for maintenance, also bind it to loopback only. Example:

```yaml
- 127.0.0.1:15432:5432
```

## 8. Start Supabase

```bash
cd /srv/supabase-project
docker compose up -d
docker compose ps
```

Quick local health check:

```bash
curl -I http://127.0.0.1:18000/auth/v1/
```

A `401` response is expected and means the auth service is reachable.

## 9. Nginx Reverse Proxy for `sb.meteor041.com`

Create a dedicated nginx site:

```bash
sudo tee /etc/nginx/sites-available/sb.meteor041.com.conf > /dev/null <<'EOF'
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name sb.meteor041.com;

    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:18000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}
EOF
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/sb.meteor041.com.conf /etc/nginx/sites-enabled/sb.meteor041.com.conf
sudo nginx -t
sudo systemctl reload nginx
```

Issue the TLS certificate:

```bash
sudo certbot --nginx -d sb.meteor041.com -m admin@meteor041.com --agree-tos --redirect -n
```

Validate:

```bash
curl -I https://sb.meteor041.com/auth/v1/
```

## 10. Upload Project Files

Create the project root on the server:

```bash
sudo mkdir -p /srv/bili-sponsorblock
sudo chown -R $USER:$USER /srv/bili-sponsorblock
```

From your Windows machine:

```powershell
scp -r E:\code\SE-frontend\skip_ad\supabase ubuntu@YOUR_SERVER_IP:/srv/bili-sponsorblock/
scp -r E:\code\SE-frontend\skip_ad\worker ubuntu@YOUR_SERVER_IP:/srv/bili-sponsorblock/
```

## 11. Deploy Edge Functions

Copy the functions into Supabase:

```bash
mkdir -p /srv/supabase-project/volumes/functions
cp -r /srv/bili-sponsorblock/supabase/functions/_shared /srv/supabase-project/volumes/functions/
cp -r /srv/bili-sponsorblock/supabase/functions/lookup-segments /srv/supabase-project/volumes/functions/
cp -r /srv/bili-sponsorblock/supabase/functions/request-analysis /srv/supabase-project/volumes/functions/
cp -r /srv/bili-sponsorblock/supabase/functions/submit-mark /srv/supabase-project/volumes/functions/
cp -r /srv/bili-sponsorblock/supabase/functions/submit-feedback /srv/supabase-project/volumes/functions/
cd /srv/supabase-project
docker compose restart functions --no-deps
```

## 12. Apply Database Migration

```bash
cd /srv/supabase-project
docker compose exec -T db psql -U postgres -d postgres < /srv/bili-sponsorblock/supabase/migrations/202604210001_sponsorblock_init.sql
```

## 13. Install Worker Dependencies

```bash
cd /srv/bili-sponsorblock/worker
npm install
```

## 14. Worker Environment

Create `/etc/bili-sponsorblock-worker.env`:

```bash
sudo tee /etc/bili-sponsorblock-worker.env > /dev/null <<'EOF'
SUPABASE_URL=https://sb.meteor041.com
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
CLASSIFY_MODEL=gpt-4o-mini
ESCALATE_MODEL=gpt-5-mini
YT_DLP_PATH=/usr/local/bin/yt-dlp
POLL_INTERVAL_MS=15000
EOF

sudo chmod 600 /etc/bili-sponsorblock-worker.env
```

## 15. Worker Systemd Service

```bash
sudo tee /etc/systemd/system/bili-sponsorblock-worker.service > /dev/null <<'EOF'
[Unit]
Description=Bili SponsorBlock Worker
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/srv/bili-sponsorblock/worker
EnvironmentFile=/etc/bili-sponsorblock-worker.env
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

Start and watch logs:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bili-sponsorblock-worker
sudo systemctl status bili-sponsorblock-worker
sudo journalctl -u bili-sponsorblock-worker -f
```

## 16. Plugin Configuration

After deployment, set the extension remote API to:

```js
remoteApi: {
  enabled: true,
  functionsBaseUrl: 'https://sb.meteor041.com/functions/v1',
  anonKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
  requestTimeoutMs: 8000,
  cacheTtlMs: 24 * 60 * 60 * 1000,
  analysisCooldownMs: 10 * 60 * 1000
}
```

Reload the unpacked extension after changing the file.

## 17. Validation Commands

Test the auth endpoint:

```bash
curl -I https://sb.meteor041.com/auth/v1/
```

Test the custom lookup function:

```bash
curl -X POST https://sb.meteor041.com/functions/v1/lookup-segments \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_SUPABASE_PUBLISHABLE_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_PUBLISHABLE_KEY" \
  -d '{"bvid":"BV1ewdhBmEux","cid":"BV1ewdhBmEux:p1"}'
```

Watch worker logs:

```bash
sudo journalctl -u bili-sponsorblock-worker -f
```

## 18. Operational Notes

- Keep only `nginx` on public `80/443`.
- Keep Supabase and Postgres on loopback-bound ports.
- Store the service role key only on the server, never in the browser extension.
- The extension should use the publishable key only.
- If another project already uses nginx, just add the new `sb.meteor041.com` site and do not touch existing server blocks.
