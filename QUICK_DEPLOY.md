# 🚀 БЫСТРЫЙ СТАРТ — Деплой Life OS

## ✅ Git уже инициализирован!

Файлы закоммичены. Теперь нужно создать репозиторий на GitHub и запушить.

---

## 📋 Шаг 1: Создание репозитория на GitHub

1. Откройте https://github.com/new
2. Введите имя: `life-os`
3. Выберите **Public** или **Private**
4. Нажмите **Create repository**
5. **НЕ** ставьте галочки на инициализацию!

---

## 📤 Шаг 2: Пуш в GitHub

После создания репозитория выполните в терминале:

```bash
cd "C:\Users\Yan\Desktop\Health Manage\life-os"

# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/life-os.git

# Пуш
git push -u origin main
```

---

## 🌐 Шаг 3: Деплой на Vercel (Frontend)

### Вариант A: Vercel CLI (быстрее)

```bash
# Установка Vercel
npm install -g vercel

# Логин
vercel login

# Деплой frontend
cd frontend
vercel --prod
```

Следуйте инструкциям в терминале.

### Вариант B: Vercel Web

1. https://vercel.com/new
2. Import Git Repository → выберите `life-os`
3. Root Directory: `frontend`
4. Environment Variables:
   ```
   VITE_API_URL = https://your-backend.railway.app/api
   ```
5. Deploy

---

## ⚙️ Шаг 4: Деплой на Railway (Backend)

### Вариант A: Railway CLI

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Деплой backend
cd backend
railway init
railway up
```

### Вариант B: Railway Web

1. https://railway.app/dashboard
2. New Project → Deploy from GitHub
3. Выберите `life-os`
4. Root Directory: `backend`

### Настройка переменных в Railway:

В Railway Dashboard → Variables добавьте:

```env
TELEGRAM_BOT_TOKEN=8771751252:AAF19pl3mtDEqyy-Srg74qwiSJndh_CWB10
DATABASE_URL=postgresql://... (создайте PostgreSQL в Railway)
JWT_SECRET=super-secret-key-change-me
WEB_APP_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3000
```

### Создание БД:

1. Railway Dashboard → ваш проект → New → PostgreSQL
2. Скопируйте Connection String
3. Добавьте как `DATABASE_URL`
4. Примените миграции:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma generate
   ```

---

## 🤖 Шаг 5: Настройка Telegram

1. Откройте @BotFather
2. `/mybots` → выберите бота
3. Bot Settings → Menu Button → Configure Menu Button
4. URL: `https://your-frontend.vercel.app`
5. Название: `Открыть Life OS`

---

## ✅ Проверка

1. Health check backend:
   ```
   https://your-backend.railway.app/health
   ```

2. Frontend:
   ```
   https://your-frontend.vercel.app
   ```

3. Telegram WebApp:
   ```
   https://t.me/your_bot_name/lifeos
   ```

---

## 🔄 Обновление после изменений

```bash
cd "C:\Users\Yan\Desktop\Health Manage\life-os"
git add .
git commit -m "Fix: описание изменений"
git push origin main

# Vercel обновится автоматически
# Railway: railway up
```

---

## 🆘 Помощь

Если что-то не работает, откройте `DEPLOY_STEP_BY_STEP.md` — там подробная инструкция.
