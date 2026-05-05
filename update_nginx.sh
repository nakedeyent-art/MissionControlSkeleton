sudo mkdir -p /var/www/missioncontrol
sudo cp -r ~/.openclaw/control-ui/* /var/www/missioncontrol/
sudo chown -R www-data:www-data /var/www/missioncontrol

sudo tee /etc/nginx/sites-enabled/openclaw-gateway > /dev/null << 'NGINX'
server {
    server_name gateway.nak3deye.com;

    root /var/www/missioncontrol;
    index index.html;

    # Serve static Mission Control React files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Pass WebSockets back to OpenClaw gateway daemon just in case
    location /ws {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/gateway.nak3deye.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/gateway.nak3deye.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = gateway.nak3deye.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name gateway.nak3deye.com;
    return 404; # managed by Certbot
}
NGINX

sudo systemctl restart nginx
