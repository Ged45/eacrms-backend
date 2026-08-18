# Deployment Guide — eacrms-backend

This document describes a production-ready deployment for `eacrms-backend` using Docker Compose, CI/CD, and secure server configuration. It assumes a target Ubuntu server (example: 172.20.83.22) and preserves the repository layout and Dockerfile.

Contents
- Overview
- Server preparation
- Docker & Compose installation
- Application layout on server
- Environment variables and ports
- CI/CD (GitHub Actions) and registry
- Deploy, update, and rollback
- Database migrations, backups and seeding
- Monitoring, logs and healthchecks
- Security hardening
- Troubleshooting & quick checks

Overview
--------

Goal: run the app in Docker with a production compose file at `/opt/eacrms/docker-compose.prod.yml`, keep Postgres data persisted, run migrations on deploy, and allow CI to update the running image.

Server preparation (one-liner summary)
------------------------------------

1. Create a non-root deploy user (`ubuntu` exists on many images). 2. Install Docker and the Compose plugin. 3. Place `docker-compose.prod.yml` and a secure `.env` in `/opt/eacrms`. 4. Ensure SSH key-based access for CI.

Commands (run as a sudo-capable user):

```bash
# update and install utilities
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release git unzip

# create deploy directory
sudo mkdir -p /opt/eacrms
sudo chown $USER:$USER /opt/eacrms
```

Install Docker & Compose
------------------------

Follow Docker's convenience script and enable Compose plugin:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Optional: install compose plugin if not included
sudo apt install -y docker-compose-plugin
```

Log out and back in (or restart shell) so group permissions apply.

Application layout on server
----------------------------

- `/opt/eacrms/docker-compose.prod.yml` — production compose file (provided).
- `/opt/eacrms/.env` — environment file with secrets (never committed to git).
- Docker will create a persistent volume for Postgres (declared in compose).

Environment variables & ports
-----------------------------

Use the example file `.env.prod.example` as a template. Key items:
- `IMAGE_NAME` — full registry path to the built image (e.g. `ghcr.io/<owner>/<repo>`)
- `IMAGE_TAG` — tag used by CI (e.g. commit SHA)
- `HOST_PORT` — host port mapped to container port 5000 (set to `3000` or `5000` depending availability)
- `DATABASE_URL` — if you want to point to an external DB, provide full URL

Pick port 3000 or 5000:

```bash
# check if 3000 is free
ss -ltn "sport = :3000" || true
# if occupied choose 5000 or adjust HOST_PORT in .env
```

CI/CD and registry
-------------------

This repo contains a GitHub Actions workflow at `.github/workflows/deploy.yml` that:
- Builds and pushes a Docker image to the registry (GHCR by default).
- Uses an SSH action to SSH to the server and run `docker compose -f /opt/eacrms/docker-compose.prod.yml up -d`.

Required GitHub secrets (set under repo Settings → Secrets):
- `SSH_PRIVATE_KEY` — private key for CI deploy user paired with authorized public key on server.
- `DEPLOY_HOST` — server IP (172.20.83.22)
- `DEPLOY_USER` — server user (ubuntu)
- `IMAGE_NAME` — registry path
- Optional: `DEPLOY_PORT` if non-standard SSH port

How CI deploys (high level)
---------------------------
1. Workflow builds image and pushes it to `IMAGE_NAME:IMAGE_TAG`.
2. CI SSHs into server and runs `docker pull $IMAGE` and `docker compose -f /opt/eacrms/docker-compose.prod.yml up -d`.
3. The app runs with the updated image; migrations are executed as part of the image `CMD`.

Deploy, update, rollback
-------------------------

Manual deploy commands (useful for debugging):

```bash
cd /opt/eacrms
# pull the built image
docker pull ${IMAGE_NAME}:${IMAGE_TAG}
# -d recreate with new image
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

To roll back:

1. Identify previous image tag (e.g. previous commit SHA or `latest-stable`).
2. Update `.env` `IMAGE_TAG` or the compose override then run `docker compose up -d` referencing older tag.

Database migrations, seeding & backups
------------------------------------

This project uses Prisma. The Dockerfile runs `npx prisma migrate deploy && npx prisma db seed` on container start. Recommendations:

- Ensure migrations are idempotent and tested in staging before production.  
- Back up Postgres before migrations:

```bash
# run from host
docker exec -t eacrms-postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > /opt/eacrms/backups/db_$(date +%F_%T).sql
```

- Restore example:

```bash
cat /opt/eacrms/backups/db_2026-01-01_12:00:00.sql | docker exec -i eacrms-postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
```

Monitoring, logs & healthchecks
-------------------------------

- Use `docker compose ps` and `docker logs eacrms-app` for quick checks.
- Consider adding Prometheus + Grafana or use existing host monitoring.
- Ensure `docker-compose.prod.yml` retains the Postgres healthcheck (present in repo).

Security hardening
------------------

- Use SSH key-based auth only; disable password authentication in `/etc/ssh/sshd_config`:

```bash
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload sshd
```

- Use UFW to open only required ports (SSH and app port):

```bash
sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow ${HOST_PORT}/tcp
sudo ufw enable
```

- Put TLS in front of the app using an Nginx reverse proxy and Certbot. Example steps:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
# configure nginx to proxy_pass to http://127.0.0.1:${HOST_PORT}
# run: sudo certbot --nginx -d your.domain.tld
```

Backups & retention
-------------------

- Schedule daily/weekly backups of Postgres with `pg_dump` to an off-host location.
- Keep rotation with `find /opt/eacrms/backups -type f -mtime +30 -delete`.

Troubleshooting & quick checks
-----------------------------

- Check container status:

```bash
docker compose -f /opt/eacrms/docker-compose.prod.yml ps
docker logs --follow eacrms-app
```

- Check migrations were applied inside the app container:

```bash
docker exec -it eacrms-app sh -c "npx prisma migrate status --schema=prisma/schema.prisma"
```

Common errors
- If compose fails: `docker compose -f docker-compose.prod.yml config` shows merge errors.
- If DB connection fails: verify `DATABASE_URL` and that Postgres container is healthy.

Automation helpers (optional)
----------------------------

You can create a small `bootstrap-server.sh` script to perform many of these steps automatically. Ask me and I will generate one tailored to your server.

Final notes
-----------

1. Keep secrets out of the repository. Use GitHub Secrets for CI and a `.env` on the server for runtime.  
2. Test deployments in a staging environment before production.  
3. After first successful deploy, consider adding more automation: zero-downtime deploys, canary tags, comprehensive monitoring and alerting.

File references
- Production compose: `docker-compose.prod.yml` (already added).
- CI workflow: `.github/workflows/deploy.yml` (already added).
- Example env: `.env.prod.example` (already added).
