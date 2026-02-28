# 🚀 Life Operating System

**Telegram Mini App** для управления жизнью с Rule Engine аналитикой и экспортом в AI.

## 📋 Оглавление

- [Возможности](#-возможности)
- [Архитектура](#-архитектура)
- [Быстрый старт](#-быстрый-старт)
- [API Документация](#-api-документация)
- [Деплой](#-деплой)
- [MVP Стратегия](#-mvp-стратегия)

---

## ✨ Возможности

### Трекинг сфер жизни
- 😴 **Сон** — отслеживание часов сна
- 💧 **Вода** — учёт потребления воды
- 🍎 **Питание** — калории и белки
- 💪 **Спорт** — тип и длительность тренировок
- 💼 **Работа** — рабочие часы
- 💰 **Финансы** — доходы и расходы
- 😊 **Настроение** — оценка 1-10
- 📚 **Саморазвитие** — минуты обучения
- ❤️ **Личная жизнь** — оценка 1-10

### Dashboard
- 🎯 **LifeScore** — общий показатель качества жизни
- 🎨 **Цветовые индикаторы** — красный/жёлтый/зелёный/синий
- 📊 **Колесо баланса** — визуализация сфер
- ⚡ **Рекомендации** — от Rule Engine

### Цели и Задачи
- 🎯 Цели по сферам с прогрессом
- ✅ Задачи с приоритетами и чек-листами
- 📅 Дедлайны и категории

### Аналитика
- 📈 Графики прогресса
- 🔗 Корреляции между сферами
- 📊 Недельная статистика

### Rule Engine (AI без API)
- 🔴 Критические предупреждения
- 🟡 Рекомендации по улучшению
- 🟢 Положительные подкрепления

### Экспорт в нейросеть
- 📋 Копирование отчёта в буфер
- 📥 Скачать .txt / .csv / .json
- 🤖 Оптимизированный формат для ChatGPT/Qwen

---

## 🏗️ Архитектура

```
life-os/
├── backend/                 # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/    # Обработчики запросов
│   │   ├── services/       # Бизнес-логика
│   │   │   ├── AuthService.ts
│   │   │   ├── LifeScoreService.ts
│   │   │   ├── RuleEngineService.ts
│   │   │   └── ReportGeneratorService.ts
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API endpoints
│   │   └── types/          # TypeScript типы
│   └── prisma/
│       └── schema.prisma   # Схема БД
│
├── frontend/               # React + Tailwind + iOS дизайн
│   ├── src/
│   │   ├── components/    # UI компоненты
│   │   ├── pages/         # Страницы
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API клиент
│   │   └── store/         # Zustand store
│   └── public/
│
└── docker-compose.yml      # Docker для разработки
```

### База данных (PostgreSQL)

**users** — пользователи
- id, telegramId, username, firstName, lastName
- sphereWeights (веса сфер для LifeScore)

**daily_metrics** — ежедневные метрики
- userId, date, sleepHours, waterMl, calories...
- mood, selfDevMinutes, personalLifeScore...

**goals** — цели
- userId, sphere, targetValue, currentValue
- startDate, endDate, status, progress

**tasks** — задачи
- userId, title, category, priority, status
- checklist, dueDate, isRecurring

**weekly_stats** — недельная статистика
- userId, weekStart, avgSleepHours, totalWaterMl...
- lifeScore, lifeScoreChange

**rule_engine_logs** — логи рекомендаций
- userId, ruleId, severity, message, sphere

---

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- Telegram Bot Token

### 1. Клонирование
```bash
cd life-os
```

### 2. Backend
```bash
cd backend

# Установка зависимостей
npm install

# Копирование .env
cp .env.example .env

# Редактирование .env
# TELEGRAM_BOT_TOKEN=your_token
# DATABASE_URL=postgresql://user:pass@localhost:5432/life_os

# Запуск PostgreSQL (Docker)
docker run -d \
  -e POSTGRES_USER=lifeos \
  -e POSTGRES_PASSWORD=lifeos123 \
  -e POSTGRES_DB=life_os \
  -p 5432:5432 \
  postgres:15

# Миграция БД
npx prisma migrate dev

# Запуск сервера
npm run dev
```

### 3. Frontend
```bash
cd frontend

# Установка зависимостей
npm install

# Копирование .env
cp .env.example .env

# Запуск
npm run dev
```

### 4. Telegram Bot
1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен
3. Вставьте в `backend/.env`
4. Настройте Web App URL в BotFather

---

## 📡 API Документация

### Auth
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/telegram` | Авторизация через Telegram |
| POST | `/api/auth/dev` | Dev авторизация |
| GET | `/api/auth/weights` | Получить веса сфер |
| PUT | `/api/auth/weights` | Обновить веса сфер |

### Metrics
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/metrics/:date` | Метрики за дату |
| GET | `/api/metrics` | Метрики за период |
| POST | `/api/metrics` | Создать/обновить метрики |
| PATCH | `/api/metrics/:field` | Обновить поле |
| DELETE | `/api/metrics/:date` | Удалить метрики |

### Goals
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/goals` | Список целей |
| POST | `/api/goals` | Создать цель |
| PUT | `/api/goals/:id` | Обновить цель |
| PATCH | `/api/goals/:id/progress` | Обновить прогресс |
| DELETE | `/api/goals/:id` | Удалить цель |

### Tasks
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/tasks` | Список задач |
| POST | `/api/tasks` | Создать задачу |
| PUT | `/api/tasks/:id` | Обновить задачу |
| PATCH | `/api/tasks/:id/status` | Обновить статус |
| PATCH | `/api/tasks/:id/checklist/:itemId` | Чек-лист |
| DELETE | `/api/tasks/:id` | Удалить задачу |

### Analytics
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/analytics/dashboard` | Дашборд |
| GET | `/api/analytics/wheel` | Колесо баланса |
| GET | `/api/analytics/correlations` | Корреляции |
| GET | `/api/analytics/progress` | Прогресс по сферам |
| GET | `/api/analytics/export` | Экспорт отчёта |

---

## 🌐 Деплой

### Backend (Railway/Render/Heroku)

1. **Подготовка:**
```bash
# backend/.env.production
DATABASE_URL=postgresql://...
JWT_SECRET=secure_random_string
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_token
WEB_APP_URL=https://your-domain.com
```

2. **Dockerfile (backend):**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Frontend (Vercel/Netlify)

1. **Настройки сборки:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Переменные окружения:**
```
VITE_API_URL=https://your-backend.railway.app/api
```

### Database (Neon/Railway PostgreSQL)

1. Создайте PostgreSQL инстанс
2. Получите connection string
3. Обновите `DATABASE_URL`

### Telegram Web App

1. Откройте @BotFather
2. `/newapp` → выберите бота
3. Укажите URL: `https://your-frontend.vercel.app`
4. Получите прямую ссылку на Web App

---

## 📈 MVP Стратегия

### Фаза 1: Ядро (Неделя 1-2)
- [x] Базовая структура проекта
- [x] Авторизация через Telegram
- [x] Трекинг основных метрик
- [x] Простой LifeScore
- [ ] Деплой на тестовый сервер

### Фаза 2: Аналитика (Неделя 3-4)
- [x] Rule Engine с правилами
- [x] Dashboard с индикаторами
- [x] Колесо баланса
- [x] Экспорт отчётов
- [ ] Бета-тестирование (10-20 пользователей)

### Фаза 3: Цели и Задачи (Неделя 5-6)
- [x] Система целей
- [x] Управление задачами
- [x] Чек-листы
- [ ] Уведомления
- [ ] Публичный релиз

### Фаза 4: Улучшения (Неделя 7-8)
- [ ] Push-уведомления
- [ ] Социальные функции
- [ ] Интеграции (Google Fit, Apple Health)
- [ ] Premium функции

### Метрики успеха
- 📊 DAU/MAU > 30%
- ⭐ Retention D7 > 40%
- 🎯 Средний LifeScore пользователей > 50
- 💬 NPS > 30

---

## 🛠️ Технологии

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL 14+
- **Auth:** JWT + Telegram WebApp
- **Validation:** Zod

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Routing:** React Router v6
- **Charts:** Chart.js + react-chartjs-2

### DevOps
- **Docker:** Контейнеризация
- **CI/CD:** GitHub Actions
- **Hosting:** Railway/Vercel
- **Monitoring:** Winston logs

---

## 📝 Лицензия

MIT License — свободное использование с указанием авторства.

---

## 👥 Контакты

- **Telegram:** @your_username
- **GitHub:** Issues & PRs welcome
- **Demo:** [Ссылка на демо]

---

## 🙏 Благодарности

- Telegram Team за Web App API
- Prisma Team за отличную ORM
- React Team за замечательный фреймворк

---

**Сделано с ❤️ для улучшения качества жизни**
