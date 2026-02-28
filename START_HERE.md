# 🎯 Life OS — Готово к деплою!

## ✅ Что сделано

- [x] Git репозиторий инициализирован
- [x] Все файлы закоммичены (65 файлов)
- [x] Созданы конфигурации для Vercel и Railway
- [x] Настроен .gitignore
- [x] Токен Telegram бота добавлен в backend/.env

---

## 📤 СЛЕДУЮЩИЕ ШАГИ — Деплой

### 1️⃣ Создать репозиторий на GitHub

```
Откройте: https://github.com/new
Имя: life-os
Создайте репозиторий (без инициализации!)
```

### 2️⃣ Запушить код в GitHub

Выполните в терминале (замените YOUR_USERNAME):

```bash
cd "C:\Users\Yan\Desktop\Health Manage\life-os"
git remote add origin https://github.com/YOUR_USERNAME/life-os.git
git push -u origin main
```

### 3️⃣ Деплой Frontend на Vercel

```bash
npm install -g vercel
vercel login
cd frontend
vercel --prod
```

### 4️⃣ Деплой Backend на Railway

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

Затем в Railway Dashboard:
- Добавьте PostgreSQL базу
- Настройте переменные (см. ниже)

---

## 🔑 Переменные окружения

### Backend (Railway Variables):

```env
TELEGRAM_BOT_TOKEN=8771751252:AAF19pl3mtDEqyy-Srg74qwiSJndh_CWB10
DATABASE_URL=postgresql://... (из Railway PostgreSQL)
JWT_SECRET=life-os-super-secret-key-change-in-production
WEB_APP_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3000
```

### Frontend (Vercel Environment Variables):

```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 🤖 Настройка Telegram Web App

1. Откройте @BotFather в Telegram
2. `/mybots` → выберите вашего бота
3. **Bot Settings** → **Menu Button** → **Configure Menu Button**
4. Отправьте URL: `https://your-frontend.vercel.app`
5. Введите название: `Открыть Life OS`

**Готово!** Web App доступен по ссылке:
```
https://t.me/your_bot_name/lifeos
```

---

## 📁 Структура проекта

```
life-os/
├── backend/           # Node.js + Express + Prisma
│   ├── .env          # ✅ Токен уже добавлен
│   ├── src/
│   └── prisma/
│
├── frontend/          # React + Tailwind
│   ├── .env
│   └── src/
│
├── .github/
│   └── workflows/
│       └── deploy.yml # CI/CD для Vercel
│
└── Документация/
    ├── README.md
    ├── QUICK_DEPLOY.md        # ⭐ Начните отсюда!
    ├── DEPLOY_STEP_BY_STEP.md # Подробная инструкция
    ├── API_DOCS.md
    └── ...
```

---

## 🚀 Быстрый деплой (3 команды)

После создания репозитория на GitHub:

```bash
# 1. Пуш в GitHub
git push -u origin main

# 2. Деплой frontend
cd frontend && vercel --prod

# 3. Деплой backend
cd ../backend && railway up
```

---

## ✅ Чеклист перед запуском

- [ ] GitHub репозиторий создан
- [ ] Код запушен в GitHub
- [ ] Vercel проект создан (frontend)
- [ ] Railway проект создан (backend + PostgreSQL)
- [ ] Переменные окружения настроены
- [ ] Миграции БД применены (`prisma migrate deploy`)
- [ ] Telegram Web App настроен через @BotFather
- [ ] Health check работает: `https://backend.railway.app/health`

---

## 🆘 Если что-то не работает

1. Откройте `QUICK_DEPLOY.md` — краткая инструкция
2. Откройте `DEPLOY_STEP_BY_STEP.md` — подробная инструкция
3. Проверьте логи:
   - Vercel: Dashboard → Deployments → View Logs
   - Railway: Dashboard → Logs

---

## 🎉 Успешного запуска!

Проект полностью готов к деплою. Все конфигурационные файлы созданы.

**Время на деплой:** ~15-20 минут

**Ваш Life OS будет доступен:**
- 🌐 Web: `https://your-frontend.vercel.app`
- 📱 Telegram: `https://t.me/your_bot_name/lifeos`
- 🔌 API: `https://your-backend.railway.app/api`

---

**Создано с ❤️ для улучшения качества жизни**
