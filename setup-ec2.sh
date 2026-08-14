#!/usr/bin/env bash
set -euo pipefail

# Simple learning setup for Ubuntu 24.04/22.04.
# Installs Docker Engine and Jenkins LTS on the same EC2 instance.

if [ "$(id -u)" -eq 0 ]; then
  echo "Run this script as the normal ubuntu user, not as root. It will use sudo when needed."
  exit 1
fi

echo "==> Updating packages"
sudo apt update
sudo apt install -y ca-certificates curl wget fontconfig openjdk-21-jre

echo "==> Installing Docker (testing/learning convenience installer)"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  rm -f /tmp/get-docker.sh
else
  echo "Docker is already installed."
fi

sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "==> Installing Jenkins LTS"
if ! command -v jenkins >/dev/null 2>&1 && ! dpkg -s jenkins >/dev/null 2>&1; then
  sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc \
    https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key

  echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | \
    sudo tee /etc/apt/sources.list.d/jenkins.list >/dev/null

  sudo apt update
  sudo apt install -y jenkins
else
  echo "Jenkins is already installed."
fi

sudo systemctl enable --now jenkins
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

echo
echo "============================================================"
echo "Setup complete."
echo "Jenkins: http://YOUR_EC2_PUBLIC_IP:8080"
echo "Initial Jenkins password:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || true
echo
echo "IMPORTANT: Log out of SSH and log back in so your ubuntu user picks up Docker group membership."
echo "============================================================"
