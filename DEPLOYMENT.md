# 🚀 Deployment Guide

Полное руководство по развёртыванию Life OS.

## Содержание
1. [Подготовка инфраструктуры](#1-подготовка-инфраструктуры)
2. [База данных](#2-база-данных)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [Telegram Bot](#5-telegram-bot)
6. [Мониторинг](#6-мониторинг)

---

## 1. Подготовка инфраструктуры

### Вариант A: Полностью облачный (рекомендуется)

| Сервис | Назначение | Стоимость |
|--------|------------|-----------|
| **Vercel** | Frontend хостинг | Бесплатно |
| **Railway** | Backend + PostgreSQL | $5-10/мес |
| **Cloudflare** | DNS + CDN | Бесплатно |

### Вариант B: VPS (дешевле, больше контроля)

| Сервис | Назначение | Стоимость |
|--------|------------|-----------|
| **Hetzner/DigitalOcean** | VPS для всего | €5-10/мес |
| **Docker** | Контейнеризация | Бесплатно |

---

## 2. База данных

### Neon (Serverless PostgreSQL) — Рекомендуется

1. Зарегистрируйтесь на [neon.tech](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string
4. Обновите `DATABASE_URL` в backend `.env`

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/life_os?sslmode=require
```

### Railway PostgreSQL

1. Создайте проект на [railway.app](https://railway.app)
2. Добавьте PostgreSQL плагин
3. Скопируйте connection string из Variables

### Docker (локально)

```bash
docker run -d \
  --name life-os-db \
  -e POSTGRES_USER=lifeos \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e POSTGRES_DB=life_os \
  -p 5432:5432 \
  -v life-os-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

---

## 3. Backend

### Railway Deployment

1. **Подготовка:**
```bash
cd backend

# Создайте Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/index.js"]
EOF
```

2. **Deploy:**
   - Подключите GitHub репозиторий к Railway
   - Укажите Root Directory: `backend`
   - Добавьте переменные окружения:
```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_bot_token
JWT_SECRET=$(openssl rand -hex 32)
WEB_APP_URL=https://your-frontend.vercel.app
PORT=3000
```

3. **Миграция БД:**
```bash
# В Railway Console или локально
npx prisma migrate deploy
```

### VPS Deployment (Docker)

```bash
# На сервере
mkdir -p /opt/life-os
cd /opt/life-os

# docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: lifeos
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: life_os
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - life-os

  backend:
    build: ../backend
    environment:
      DATABASE_URL: postgresql://lifeos:${DB_PASSWORD}@db:5432/life_os
      JWT_SECRET: ${JWT_SECRET}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      WEB_APP_URL: ${WEB_APP_URL}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - db
    networks:
      - life-os
    restart: unless-stopped

networks:
  life-os:

volumes:
  postgres_data:
EOF

# .env
cat > .env << EOF
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -hex 32)
TELEGRAM_BOT_TOKEN=your_token
WEB_APP_URL=https://your-domain.com
EOF

# Запуск
docker compose up -d

# Миграция
docker compose exec backend npx prisma migrate deploy
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 4. Frontend

### Vercel Deployment

1. **Подготовка:**
```bash
cd frontend

# Создайте vercel.json
cat > vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
EOF
```

2. **Deploy:**
   - Установите Vercel CLI: `npm i -g vercel`
   - Выполните: `vercel login`
   - Выполните: `vercel --prod`

3. **Переменные окружения в Vercel Dashboard:**
```
VITE_API_URL=https://your-backend.railway.app/api
```

### VPS Deployment

```bash
cd frontend

# Сборка
npm install
npm run build

# Копирование на сервер
scp -r dist/* user@server:/var/www/life-os

# Nginx конфиг
cat > /etc/nginx/sites-available/life-os << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/life-os;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Включение сайта
ln -s /etc/nginx/sites-available/life-os /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 5. Telegram Bot

### Настройка Web App

1. Откройте [@BotFather](https://t.me/botfather)

2. Создайте нового бота:
```
/newbot
Follow prompts...
```

3. Настройте Web App:
```
/newapp
Select your bot
Enter Web App URL: https://your-frontend.vercel.app
Enter short name: lifeos
```

4. Получите прямую ссылку:
```
https://t.me/your_bot_name/lifeos
```

### Menu Button

```
/mybots → Select bot → Bot Settings → Menu Button → Configure Menu Button
Enter URL: https://your-frontend.vercel.app
Enter title: Открыть Life OS
```

### Inline Mode (опционально)

Для доступа из любого чата:
```
/mybots → Select bot → Bot Settings → Inline Mode → Turn on
```

---

## 6. Мониторинг

### Health Check Endpoint

```bash
curl https://your-backend.railway.app/health
# {"status":"ok","timestamp":"2024-..."}
```

### Uptime Monitoring

1. Зарегистрируйтесь на [UptimeRobot](https://uptimerobot.com)
2. Добавьте новый монитор:
   - Type: HTTP
   - URL: `https://your-backend.railway.app/health`
   - Interval: 5 минут

### Логирование

Backend логи автоматически собираются в Railway. Для VPS:

```bash
# Просмотр логов
docker compose logs -f backend

# Сохранение логов
docker compose logs --tail=1000 backend > logs.txt
```

### Метрики для отслеживания

| Метрика | Порог | Действие |
|---------|-------|----------|
| Response Time | > 500ms | Оптимизация запросов |
| Error Rate | > 1% | Проверка логов |
| DB Connections | > 80% | Увеличение лимита |
| Memory Usage | > 80% | Scaling |

---

## 🔧 Troubleshooting

### Backend не запускается

```bash
# Проверка логов
docker compose logs backend

# Проверка подключения к БД
docker compose exec backend npx prisma db pull

# Пересоздание контейнера
docker compose up -d --force-recreate backend
```

### Frontend не подключается к API

```bash
# Проверка VITE_API_URL
echo $VITE_API_URL

# Проверка CORS
curl -I https://your-backend/api/health

# Проверка браузера (Console → Network)
```

### Telegram WebApp не открывается

1. Проверьте URL в BotFather
2. Убедитесь, что HTTPS
3. Проверьте CORS настройки backend

---

## 📊 Production Checklist

- [ ] DATABASE_URL настроен
- [ ] JWT_SECRET установлен
- [ ] TELEGRAM_BOT_TOKEN валиден
- [ ] WEB_APP_URL указывает на production
- [ ] Миграции БД применены
- [ ] HTTPS настроен
- [ ] CORS настроен правильно
- [ ] Логирование работает
- [ ] Health check доступен
- [ ] Резервное копирование БД настроено

---

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railwayapp/railway-action@v1
        with:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./frontend
```

---

**Готово! Ваше Life OS развернуто и готово к использованию 🎉**
