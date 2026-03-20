#!/bin/bash
# Deploy PromptDiff to VPS
set -e

VPS="root@104.156.238.81"

echo "Deploying PromptDiff..."

# Push latest code
git push

# Deploy on VPS
ssh $VPS << 'EOF'
cd /root/promptdiff && git pull

# Backend
cd backend
export PATH=$PATH:/usr/local/go/bin
go build -o /usr/local/bin/promptdiff cmd/server/main.go
systemctl restart promptdiff

# Frontend
cd ../frontend
npm ci --production=false
npm run build
systemctl restart promptdiff-web

echo "Deploy complete"
EOF
