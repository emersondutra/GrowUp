# Guia Completo de Deploy em VPS (App + PostgreSQL) - GrowUp

Este guia explica passo a passo como fazer o deploy da aplicação **GrowUp Terminal** e do banco de dados **PostgreSQL** em uma VPS (Virtual Private Server), como DigitalOcean, Hetzner, AWS EC2, Linode, Contabo, Oracle Cloud ou Hostinger.

---

## 📋 Requisitos Mínimos Recomendados
- **Sistema Operacional:** Ubuntu 22.04 LTS ou 24.04 LTS
- **Recursos:** 1 vCPU, 1 GB ou 2 GB de RAM, 20 GB SSD
- **Portas Liberadas:** 80 (HTTP), 443 (HTTPS) e 22 (SSH)

---

## 🚀 OPÇÃO 1: Deploy Rápido com Docker & Docker Compose (Recomendado)

Esta é a opção mais isolada, segura e simples: o app e o PostgreSQL rodam em containers interligados em uma rede interna isolada.

### Passo 1: Conectar na VPS e Instalar Docker & Docker Compose
```bash
ssh root@SEU_IP_VPS

# Atualizar pacotes do sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker e Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install -y docker-compose-plugin
```

### Passo 2: Clonar ou Transferir o Código do Projeto
```bash
mkdir -p /var/www/growup
cd /var/www/growup

# Copie os arquivos do projeto para esta pasta (via Git ou SCP/Rsync):
# scp -r * root@SEU_IP_VPS:/var/www/growup
```

### Passo 3: Configurar o Arquivo `.env`
Crie o arquivo `.env` na pasta `/var/www/growup`:
```bash
cp .env.example .env
nano .env
```
Defina sua senha segura:
```env
POSTGRES_USER=growup_user
POSTGRES_PASSWORD=coloque_uma_senha_forte_aqui
POSTGRES_DB=growup
PORT=3000
NODE_ENV=production
```

### Passo 4: Subir a Aplicação e o Banco
```bash
# Constrói a imagem e inicia os serviços em background
docker compose up -d --build
```

O PostgreSQL iniciará, criará a estrutura de dados automaticamente e o app estará rodando em `http://SEU_IP_VPS:3000`.

---

## 🛠️ OPÇÃO 2: Deploy Nativo no Ubuntu (Node.js + PostgreSQL + PM2)

Caso prefira rodar o PostgreSQL e o Node.js diretamente no sistema operacional sem Docker:

### Passo 1: Instalar Node.js 20 e PostgreSQL 16
```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Instalar gerenciador de processos PM2 globalmente
sudo npm install -g pm2 tsx
```

### Passo 2: Configurar o Banco de Dados PostgreSQL
Acesse o prompt do PostgreSQL:
```bash
sudo -u postgres psql
```
Execute os comandos SQL para criar o usuário e o banco:
```sql
CREATE USER growup_user WITH ENCRYPTED PASSWORD 'coloque_uma_senha_forte_aqui';
CREATE DATABASE growup OWNER growup_user;
GRANT ALL PRIVILEGES ON DATABASE growup TO growup_user;
\q
```

### Passo 3: Inicializar a Estrutura do Banco
Você pode rodar o script de inicialização pronto:
```bash
sudo -u postgres psql -d growup -f /var/www/growup/postgres-init.sql
```
*(Observação: a aplicação também verifica e cria as tabelas automaticamente ao iniciar).*

### Passo 4: Instalar Dependências e Fazer o Build do Frontend
```bash
cd /var/www/growup
npm install
npm run build
```

### Passo 5: Criar o `.env` de Produção
```bash
nano .env
```
Adicione:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://growup_user:coloque_uma_senha_forte_aqui@localhost:5432/growup"
DB_SSL=false
```

### Passo 6: Iniciar a Aplicação com PM2
```bash
# Iniciar a aplicação
pm2 start server.ts --name "growup-app" --interpreter tsx

# Configurar PM2 para reiniciar com o servidor VPS
pm2 startup
pm2 save
```

---

## 🌐 Configuração do Domínio e Nginx (Proxy Reverso com SSL Grátis)

Para acessar seu app com seu domínio (ex: `app.seudominio.com.br`) com certificado HTTPS válido:

### 1. Instalar Nginx e Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Criar Configuração do Nginx
```bash
sudo nano /etc/nginx/sites-available/growup
```
Cole o seguinte conteúdo:
```nginx
server {
    listen 80;
    server_name app.seudominio.com.br; # Altere para o seu domínio

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Ativar o Site e Emitir Certificado SSL Gratuito
```bash
sudo ln -s /etc/nginx/sites-available/growup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Emitir certificado SSL Let's Encrypt automático:
sudo certbot --nginx -d app.seudominio.com.br
```

---

## 💾 Rotina Automática de Backup do PostgreSQL

Para nunca perder seus dados financeiros, configure um backup diário automático:

### 1. Criar o Script de Backup
```bash
sudo nano /usr/local/bin/backup-growup.sh
```
Cole:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/growup"
DATA=$(date +%Y-%m-%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Se estiver usando Docker:
docker exec growup_postgres pg_dump -U growup_user growup | gzip > "$BACKUP_DIR/backup_$DATA.sql.gz"

# Se estiver usando PostgreSQL nativo no Ubuntu:
# PGPASSWORD="sua_senha" pg_dump -U growup_user -h localhost growup | gzip > "$BACKUP_DIR/backup_$DATA.sql.gz"

# Excluir backups com mais de 30 dias
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete

echo "Backup concluído em $BACKUP_DIR/backup_$DATA.sql.gz"
```
Dê permissão de execução:
```bash
sudo chmod +x /usr/local/bin/backup-growup.sh
```

### 2. Agendar no Cron (Todo dia às 03:00 da manhã)
```bash
sudo crontab -e
```
Adicione a linha:
```cron
0 3 * * * /usr/local/bin/backup-growup.sh >> /var/log/growup_backup.log 2>&1
```

---

## 🔍 Verificação de Saúde e Monitoramento

A aplicação conta com um endpoint nativo de monitoramento para validar a conexão com o PostgreSQL:

- URL: `http://SEU_IP_VPS:3000/api/health` ou `https://app.seudominio.com.br/api/health`
- Resposta de sucesso:
```json
{
  "status": "ok",
  "uptime": 124.5,
  "database": {
    "connected": true,
    "currentTime": "2026-10-30T12:00:00.000Z",
    "version": "PostgreSQL 16.2 on x86_64-pc-linux-gnu"
  },
  "timestamp": "2026-10-30T12:00:00.000Z"
}
```

### Comandos Úteis de Manutenção
```bash
# Ver logs da aplicação (Docker)
docker logs -f growup_app

# Ver logs do banco (Docker)
docker logs -f growup_postgres

# Ver status dos containers
docker compose ps

# Reiniciar aplicação
docker compose restart app
```
