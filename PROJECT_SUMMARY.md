# 🎯 Life OS — Проект готов к запуску!

## 📁 Структура проекта

```
life-os/
├── README.md                 # Главная документация
├── ARCHITECTURE.md           # Архитектурное описание
├── DEPLOYMENT.md             # Инструкция по деплою
├── MVP_STRATEGY.md           # MVP стратегия
├── API_DOCS.md               # API документация
├── docker-compose.yml        # Docker конфигурация
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma     # Схема БД
│   └── src/
│       ├── index.ts          # Точка входа
│       ├── config/
│       │   ├── database.ts
│       │   ├── index.ts
│       │   └── logger.ts
│       ├── middleware/
│       │   ├── auth.ts       # Telegram auth
│       │   └── validation.ts
│       ├── services/
│       │   ├── AuthService.ts
│       │   ├── LifeScoreService.ts    # Формула LifeScore
│       │   ├── RuleEngineService.ts   # AI без API
│       │   └── ReportGeneratorService.ts  # Экспорт
│       ├── controllers/
│       │   ├── AuthController.ts
│       │   ├── MetricsController.ts
│       │   ├── GoalsController.ts
│       │   ├── TasksController.ts
│       │   └── AnalyticsController.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── metrics.ts
│       │   ├── goals.ts
│       │   ├── tasks.ts
│       │   └── analytics.ts
│       └── types/
│           └── index.ts
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── Dockerfile
    ├── .env.example
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── styles/
        │   └── global.css    # iOS стили
        ├── types/
        │   └── index.ts
        ├── services/
        │   ├── api.ts        # API клиент
        │   └── telegram.ts   # Telegram WebApp
        ├── store/
        │   └── appStore.ts   # Zustand
        ├── hooks/
        │   └── index.ts
        ├── components/
        │   ├── ui/
        │   │   └── index.tsx       # UI компоненты
        │   ├── dashboard/
        │   │   └── index.tsx       # LifeScoreRing, WheelChart
        │   ├── tracking/
        │   │   └── index.tsx       # Трекеры сфер
        │   └── navigation/
        │       └── index.tsx       # TabBar, Header, Modal
        └── pages/
            ├── DashboardPage.tsx
            ├── TrackingPage.tsx
            ├── GoalsPage.tsx
            ├── TasksPage.tsx
            └── AnalyticsPage.tsx
```

---

## 🚀 Быстрый старт

### 1. Запуск через Docker (рекомендуется)

```bash
cd life-os

# Копирование .env файлов
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Редактирование backend/.env
# TELEGRAM_BOT_TOKEN=your_token_here

# Запуск всех сервисов
docker compose up -d

# Проверка логов
docker compose logs -f
```

Доступно по адресам:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Backend Health:** http://localhost:3000/health

### 2. Локальная разработка

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

**Frontend (в другом терминале):**
```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Формула LifeScore

```
LifeScore = Σ(sphereScore × sphereWeight) / Σ(weights)

Где:
- sphereScore нормализуется к 0-100 для каждой сферы
- sphereWeight настраивается пользователем (сумма ~100)

Веса по умолчанию:
- Сон: 15%
- Вода: 10%
- Питание: 10%
- Фитнес: 15%
- Работа: 15%
- Финансы: 15%
- Настроение: 10%
- Саморазвитие: 5%
- Личная жизнь: 5%
```

### Нормализация сфер

| Сфера | Формула | Цель |
|-------|---------|------|
| Сон | (hours / 8) × 100 | 8 часов |
| Вода | (ml / 2500) × 100 | 2500 мл |
| Фитнес | (minutes / 45) × 100 | 45 мин/день |
| Настроение | ((mood - 1) / 9) × 100 | 8/10 |
| Работа | 100 - deviation от 8ч | 8 часов |

---

## 🤖 Rule Engine — Правила

### Критические (CRITICAL)
- **SLEEP_CRITICAL:** Сон < 5 часов
- **WATER_CRITICAL:** Вода < 1000 мл
- **WORK_OVERWORK:** Работа > 10 часов
- **FINANCE_NEGATIVE:** Расходы > доходов

### Предупреждения (WARNING)
- **SLEEP_WARNING:** Сон 5-7 часов
- **WATER_WARNING:** Вода 1000-2000 мл
- **FITNESS_LOW:** Тренировки < 90 мин/неделю
- **MOOD_LOW:** Настроение < 5
- **SELF_DEV_NONE:** Нет саморазвития

### Положительные (INFO)
- **SLEEP_EXCELLENT:** Сон 7-9 часов
- **WATER_EXCELLENT:** Вода > 2000 мл
- **FITNESS_EXCELLENT:** Тренировки > 150 мин/неделю

---

## 📱 Telegram WebApp интеграция

### Получение данных пользователя

```typescript
import telegramService from '@/services/telegram';

// Инициализация
telegramService.init();

// Получение пользователя
const user = telegramService.getUser();
// { id: 123456789, username: "...", first_name: "..." }

// Получение initData для авторизации
const initData = telegramService.getInitData();

// Haptic feedback
telegramService.haptic('success');
```

### Авторизация на backend

```typescript
const response = await apiService.authTelegram(initData);
// { success: true, user: {...}, token: "..." }

localStorage.setItem('token', response.token);
```

---

## 🎨 iOS Дизайн система

### Цвета
```css
--ios-bg: #000000
--ios-card: #1C1C1E
--ios-card-secondary: #2C2C2E
--ios-primary: #0A84FF
--ios-green: #30D158
--ios-red: #FF453A
--ios-yellow: #FFD60A
--ios-orange: #FF9500
--ios-gray: #8E8E93
--ios-separator: #38383A
```

### Компоненты
- **Card** — базовая карточка
- **Button** — кнопки (primary/secondary/danger/ghost)
- **Input** — поля ввода
- **Slider** — слайдеры
- **Toggle** — переключатели
- **ProgressBar** — прогресс бары
- **LifeScoreRing** — кольцо LifeScore
- **SphereCard** — карточка сферы
- **WheelChart** — колесо баланса
- **TabBar** — нижняя навигация
- **Header** — верхняя панель
- **Modal** — модальные окна
- **ActionSheet** — нижние шоры

---

## 📡 API Endpoints (кратко)

### Auth
- `POST /api/auth/telegram` — вход через Telegram
- `POST /api/auth/dev` — dev вход
- `GET/PUT /api/auth/weights` — веса сфер

### Metrics
- `GET /api/metrics/:date` — за дату
- `GET /api/metrics` — за период
- `POST /api/metrics` — создать/обновить
- `PATCH /api/metrics/:field` — обновить поле

### Goals
- `GET /api/goals` — список
- `POST /api/goals` — создать
- `PATCH /api/goals/:id/progress` — прогресс

### Tasks
- `GET /api/tasks` — список
- `POST /api/tasks` — создать
- `PATCH /api/tasks/:id/status` — статус

### Analytics
- `GET /api/analytics/dashboard` — дашборд
- `GET /api/analytics/wheel` — колесо
- `GET /api/analytics/correlations` — корреляции
- `GET /api/analytics/export` — экспорт

---

## 🧪 Тестирование

### Backend тесты
```bash
cd backend
npm test
```

### Frontend тесты
```bash
cd frontend
npm test
```

### E2E тесты (планируется)
```bash
npm run test:e2e
```

---

## 📈 Метрики для отслеживания

### Продукт
- DAU/WAU/MAU
- Retention D1/D7/D30
- Average Session Duration
- Tasks Completed per User per Week

### Технические
- API Response Time (< 200ms)
- Error Rate (< 0.1%)
- Uptime (> 99%)

---

## 🔐 Безопасность

- JWT токены (30 дней)
- Валидация Telegram initData
- Rate limiting (100 запросов / 15 мин)
- Helmet.js заголовки
- CORS настройка
- Валидация входных данных (Zod)

---

## 📝 Чеклист перед запуском

- [ ] TELEGRAM_BOT_TOKEN установлен
- [ ] DATABASE_URL настроен
- [ ] JWT_SECRET сгенерирован
- [ ] Миграции БД применены
- [ ] Health check работает
- [ ] CORS настроен
- [ ] HTTPS настроен (production)
- [ ] Логи собираются
- [ ] Бэкапы БД настроены

---

## 🎉 Проект готов!

Все компоненты реализованы:
- ✅ Backend API (Node.js + Express + Prisma)
- ✅ Frontend (React + Tailwind + iOS дизайн)
- ✅ База данных (PostgreSQL схема)
- ✅ Rule Engine (20+ правил)
- ✅ LifeScore формула
- ✅ Экспорт в AI
- ✅ Telegram WebApp интеграция
- ✅ Документация

**Следующие шаги:**
1. Настроить Telegram бота
2. Задеплоить на production
3. Запустить альфа-тест
4. Собрать фидбек
5. Итеративно улучшать

**Удачи в запуске! 🚀**
