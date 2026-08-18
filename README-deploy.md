# Deployment instructions (production)

This document describes steps to prepare the Ubuntu server and deploy the app using Docker Compose.

Prereqs on server (run as a user with sudo):

1. Update and install Docker

```bash
sudo apt update && sudo apt upgrade -y
# install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
# add ubuntu user to docker group (if using 'ubuntu')
sudo usermod -aG docker ubuntu
```

2. Install Docker Compose plugin (if needed)

```bash
sudo apt install -y docker-compose-plugin
```

3. Create deploy directory and copy files

```bash
sudo mkdir -p /opt/eacrms
sudo chown ubuntu:ubuntu /opt/eacrms
# Copy docker-compose.prod.yml and .env to /opt/eacrms on the server
```

4. Set up SSH key for CI deploy

- On your local machine: `ssh-keygen -t ed25519 -C "gh-actions-deploy"`
- Copy public key to server: `ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@172.20.83.22`
- Store the private key in GitHub repo secret `SSH_PRIVATE_KEY` and set `DEPLOY_HOST`, `DEPLOY_USER` and `IMAGE_NAME` secrets.

5. Start app locally on server

```bash
cd /opt/eacrms
# ensure .env is populated
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

6. Notes & security

- Replace placeholder secrets with cryptographically random values.
- Prefer GitHub Container Registry (GHCR) or a private registry. Set `IMAGE_NAME` to the full registry path.
- After confirming deploy works, consider disabling password SSH auth and using keys only.
