# 🚀 Инструкция по деплою на GitHub + Vercel + Railway

## 📋 Шаг 1: Создание GitHub репозитория

### Через командную строку (Windows):

```bash
cd "C:\Users\Yan\Desktop\Health Manage\life-os"

# Инициализация Git
git init

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "Initial commit: Life OS v1.0"

# Создание главной ветки
git branch -M main
```

### Создание репозитория на GitHub:

1. Откройте https://github.com/new
2. Введите имя репозитория: `life-os`
3. Выберите **Private** или **Public**
4. **НЕ** ставьте галочки на "Initialize this repository with..."
5. Нажмите **Create repository**

### Привязка и пуш:

```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/life-os.git

# Пуш в GitHub
git push -u origin main
```

---

## 📦 Шаг 2: Деплой Frontend на Vercel

### Вариант A: Через Vercel CLI (рекомендуется)

```bash
# Установка Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login

# Переход в папку frontend
cd frontend

# Деплой
vercel --prod
```

**Во время деплоя:**
1. Введите `Y` для создания нового проекта
2. Введите имя проекта: `life-os-frontend`
3. Root Directory: оставьте пустым (мы уже в папке frontend)
4. Framework: Vite (определится автоматически)

### Вариант B: Через веб-интерфейс

1. Откройте https://vercel.com/new
2. Нажмите **Import Git Repository**
3. Выберите ваш GitHub репозиторий `life-os`
4. Настройте:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. Добавьте Environment Variables:
   ```
   VITE_API_URL = https://your-backend.railway.app/api
   ```

6. Нажмите **Deploy**

### После деплоя:

Vercel выдаст вам URL вида: `https://life-os-frontend.vercel.app`

**Сохраните этот URL!** Он понадобится для настройки backend.

---

## ⚙️ Шаг 3: Деплой Backend на Railway

### Через Railway CLI:

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин в Railway
railway login

# Переход в папку backend
cd backend

# Инициализация проекта
railway init

# Создание нового проекта
# Введите имя: life-os-backend

# Деплой
railway up
```

### Через веб-интерфейс:

1. Откройте https://railway.app/dashboard
2. Нажмите **New Project**
3. Выберите **Deploy from GitHub repo**
4. Выберите репозиторий `life-os`
5. Укажите Root Directory: `backend`

### Настройка переменных окружения:

В Railway Dashboard → Variables добавьте:

```env
TELEGRAM_BOT_TOKEN=8771751252:AAF19pl3mtDEqyy-Srg74qwiSJndh_CWB10
JWT_SECRET=your-super-secret-random-string-here
WEB_APP_URL=https://your-frontend.vercel.app
NODE_ENV=production
PORT=3000
```

### Создание PostgreSQL базы:

1. В проекте Railway нажмите **New** → **Database** → **PostgreSQL**
2. Дождитесь создания БД
3. Скопируйте **Connection String** из Variables
4. Обновите переменную `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/life_os
   ```

### Применение миграций:

```bash
# В Railway CLI
railway run npx prisma migrate deploy
railway run npx prisma generate
```

Или через Railway Dashboard → Open Shell:
```bash
npx prisma migrate deploy
npx prisma generate
```

### После деплоя:

Railway выдаст вам URL вида: `https://life-os-backend-production.up.railway.app`

**Сохраните этот URL!**

---

## 🔗 Шаг 4: Связывание сервисов

### Обновление Frontend:

1. Откройте Vercel Dashboard → ваш проект
2. Перейдите в **Settings** → **Environment Variables**
3. Обновите `VITE_API_URL`:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
4. Нажмите **Save**
5. Сделайте редиплой: **Deployments** → **...** → **Redeploy**

### Обновление Backend:

1. Откройте Railway Dashboard → ваш проект
2. Обновите `WEB_APP_URL`:
   ```
   WEB_APP_URL=https://your-frontend.vercel.app
   ```

---

## 🤖 Шаг 5: Настройка Telegram Web App

### Настройка бота:

1. Откройте @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите **Bot Settings** → **Menu Button** → **Configure Menu Button**
5. Отправьте URL вашего frontend: `https://your-frontend.vercel.app`
6. Введите название кнопки: `Открыть Life OS`

### Создание Web App кнопки:

1. В @BotFather отправьте `/newapp`
2. Выберите бота
3. Введите название: `Life OS`
4. Введите описание: `Система управления жизнью`
5. Отправьте URL: `https://your-frontend.vercel.app`
6. Введите short name: `lifeos`

**Готово!** Теперь бот имеет Web App.

**Прямая ссылка:** `https://t.me/your_bot_name/lifeos`

---

## ✅ Шаг 6: Проверка работы

### Health Check Backend:

Откройте в браузере:
```
https://your-backend.railway.app/health
```

Должно вернуться:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Проверка Frontend:

Откройте:
```
https://your-frontend.vercel.app
```

Должна открыться страница авторизации.

### Проверка Telegram WebApp:

1. Откройте вашего бота в Telegram
2. Нажмите меню кнопку или отправьте `/start`
3. Web App должен открыться внутри Telegram

---

## 🔧 Troubleshooting

### Frontend не подключается к API:

**Ошибка в консоли:** `CORS Error` или `Network Error`

**Решение:**
1. Проверьте `VITE_API_URL` в Vercel Environment Variables
2. В Railway добавьте переменную `WEB_APP_URL` с URL frontend
3. Перезапустите backend: `railway restart`

### Backend не запускается:

**Ошибка:** `Database connection error`

**Решение:**
1. Проверьте `DATABASE_URL` в Railway Variables
2. Убедитесь, что PostgreSQL создан
3. Примените миграции: `railway run npx prisma migrate deploy`

### Telegram initData не работает:

**Ошибка:** `Invalid Telegram data`

**Решение:**
1. Проверьте `TELEGRAM_BOT_TOKEN` в Railway Variables
2. Убедитесь, что токен правильный
3. Откройте Web App из Telegram (не из браузера)

### Vercel сборка падает:

**Ошибка:** `Build failed`

**Решение:**
1. Проверьте логи в Vercel Dashboard → Deployments → View Build Logs
2. Убедитесь, что `frontend/package.json` корректен
3. Проверьте `frontend/vite.config.ts`

---

## 📊 Мониторинг

### Vercel Analytics:
- Откройте Vercel Dashboard → ваш проект
- Раздел **Analytics** показывает посещения

### Railway Logs:
- Railway Dashboard → ваш проект → **Logs**
- Реальное время логи backend

### Health Check:
```bash
# Проверка backend
curl https://your-backend.railway.app/health

# Проверка frontend
curl https://your-frontend.vercel.app
```

---

## 🎉 Готово!

Ваш Life OS развёрнут и доступен:

- **Frontend:** `https://your-frontend.vercel.app`
- **Backend API:** `https://your-backend.railway.app/api`
- **Telegram WebApp:** `https://t.me/your_bot_name/lifeos`

### Следующие шаги:

1. ✅ Протестируйте все функции
2. ✅ Соберите первый фидбек
3. ✅ Исправьте найденные баги
4. ✅ Добавьте новые фичи

**Удачи с запуском! 🚀**

---

## 📝 Команды для быстрого деплоя обновлений

```bash
# После изменений в коде
cd "C:\Users\Yan\Desktop\Health Manage\life-os"

# Git commit и пуш
git add .
git commit -m "Fix: описание изменений"
git push origin main

# Vercel обновится автоматически при пуше в main
# Railway можно обновить через:
cd backend
railway up
```
