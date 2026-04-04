#!/bin/bash
set -e
cd /home/ubuntu/projects/public-web
git pull origin main
echo "Deployed at $(date)"
