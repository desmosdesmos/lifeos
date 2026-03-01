# 🚀 LIFE OS — PROJECT CONTEXT & DOCUMENTATION

**Для передачи Codex или другому AI-ассистенту для работы с проектом**

---

## 📋 ОБЗОР ПРОЕКТА

**Life OS** — это Telegram Mini App (Web App) для управления жизнью с элементами геймификации и AI-аналитики.

### 🎯 Цель
Создать систему трекинга ключевых сфер жизни с автоматическими рекомендациями (Rule Engine) и экспортом данных в AI-системы.

### 🌐 URL
- **Frontend:** https://life-os-seven-khaki.vercel.app
- **Backend API:** https://life-os-seven-khaki.vercel.app/api
- **База данных:** Neon PostgreSQL
- **Telegram Bot:** @lifeosforyou_bot

---

## 🏗️ АРХИТЕКТУРА

```
┌─────────────────────────────────────────┐
│         Telegram Web App (Frontend)     │
│         React + Tailwind + iOS 26 UI    │
│         Vercel Hosting                  │
└─────────────────┬───────────────────────┘
                  │ REST API
                  ▼
┌─────────────────────────────────────────┐
│         Vercel Serverless Functions     │
│         /api/auth, /api/metrics, etc.   │
└─────────────────┬───────────────────────┘
                  │ Prisma ORM
                  ▼
┌─────────────────────────────────────────┐
│         Neon PostgreSQL                 │
│         Serverless Database             │
└─────────────────────────────────────────┘
```

---

## 📁 СТРУКТУРА ПРОЕКТА

```
life-os/
├── backend/                    # Backend API (Vercel Serverless)
│   ├── api/
│   │   ├── auth.ts            # Telegram авторизация
│   │   ├── auth-dev.ts        # Dev авторизация (без БД)
│   │   ├── auth-simple.ts     # Простая авторизация
│   │   ├── health.ts          # Health check endpoint
│   │   └── test.ts            # Test endpoint
│   ├── prisma/
│   │   └── schema.prisma      # Prisma схема БД
│   ├── package.json
│   └── .env                   # Environment variables
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # UI компоненты (iOS 26)
│   │   │   ├── dashboard/     # Dashboard компоненты
│   │   │   ├── tracking/      # Трекинг сферы
│   │   │   └── navigation/    # Header, TabBar, Modal
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TrackingPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts         # API клиент
│   │   │   └── telegram.ts    # Telegram WebApp SDK
│   │   ├── store/
│   │   │   └── appStore.ts    # Zustand store
│   │   ├── hooks/
│   │   │   └── index.ts       # Custom hooks
│   │   ├── styles/
│   │   │   └── global.css     # iOS 26 дизайн система
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript типы
│   │   └── App.tsx            # Главный компонент
│   ├── package.json
│   └── vite.config.ts
│
├── vercel.json                 # Vercel конфигурация
└── README.md                   # Документация
```

---

## 🛠️ ТЕХНИЧЕСКИЙ СТЕК

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.2.0 | UI фреймворк |
| TypeScript | 5.3.3 | Типизация |
| Vite | 5.1.4 | Build tool |
| Tailwind CSS | 3.4.1 | Стилизация |
| React Router | 6.22.1 | Роутинг |
| Zustand | 4.5.1 | State management |
| Axios | 1.6.7 | HTTP клиент |
| Chart.js | 4.4.1 | Графики |

### Backend
| Технология | Версия | Назначение |
|------------|--------|------------|
| Node.js | 18.x | Runtime |
| Vercel Functions | - | Serverless API |
| Prisma | 5.10.0 | ORM |
| JWT | 9.0.2 | Токены |
| Neon | - | PostgreSQL |

### Инфраструктура
| Сервис | Назначение |
|--------|------------|
| Vercel | Frontend + Backend хостинг |
| Neon | PostgreSQL база данных |
| Telegram | Web App платформа |
| GitHub | Version control |

---

## 🔑 КЛЮЧЕВЫЕ ФУНКЦИИ

### 1. Авторизация
- ✅ Telegram WebApp initData валидация
- ✅ JWT токены (30 дней)
- ✅ Dev режим для тестирования

### 2. Трекинг сфер жизни
- 😴 Сон (часы)
- 💧 Вода (мл)
- 🍎 Питание (калории)
- 💪 Спорт (минуты)
- 💼 Работа (часы)
- 💰 Финансы (доход/расход)
- 😊 Настроение (1-10)
- 📚 Саморазвитие (минуты)
- ❤️ Личная жизнь (1-10)

### 3. LifeScore
- Формула: Σ(sphereScore × sphereWeight) / Σ(weights)
- Веса по умолчанию: сон 15%, фитнес 15%, работа 15%, финансы 15%, вода 10%, питание 10%, настроение 10%, развитие 5%, личное 5%

### 4. Rule Engine
- Автоматические рекомендации на основе метрик
- 3 уровня: INFO, WARNING, CRITICAL
- Примеры правил:
  - Сон < 5 часов → CRITICAL
  - Вода < 1000 мл → CRITICAL
  - Работа > 10 часов → WARNING

### 5. Цели и Задачи
- Цели с прогрессом и дедлайнами
- Задачи с приоритетами и чек-листами

### 6. Аналитика
- Колесо баланса жизни
- Корреляции между сферами
- Экспорт отчётов для AI

---

## 🎨 iOS 26 DESIGN SYSTEM

### Цвета
```css
--ios-blue: #007aff
--ios-green: #30d158
--ios-red: #ff453a
--ios-yellow: #ffd60a
--ios-purple: #bf5af2
--ios-pink: #ff375f
--ios-teal: #64d2ff
```

### Градиенты
```css
--gradient-blue: linear-gradient(135deg, #007aff 0%, #5e5ce6 100%)
--gradient-green: linear-gradient(135deg, #30d158 0%, #32d74b 100%)
--gradient-gold: linear-gradient(135deg, #ffd60a 0%, #ff9500 100%)
```

### Анимации
- `fadeIn` — плавное появление
- `fadeInUp` — появление снизу
- `slideInRight` — слайд справа
- `scaleIn` — масштабирование
- `pulse` — пульсация
- `shimmer` — мерцание

### Компоненты
- Карточки с hover эффектом
- Кнопки с gradient вариантами
- Слайдеры с градиентным заполнением
- Progress bars с анимацией
- Toggle переключатели
- Badge статусы

---

## 🐛 ИЗВЕСТНЫЕ ПРОБЛЕМЫ

### Решённые проблемы
1. ✅ ~~CORS ошибки~~ — исправлено настройкой заголовков
2. ✅ ~~Prisma не подключается~~ — работает через Neon
3. ✅ ~~API 500 ошибки~~ — упрощена авторизация без БД
4. ✅ ~~Маршруты Vercel~~ — исправлено в vercel.json
5. ✅ ~~Token не сохраняется~~ — исправлено в App.tsx

### Текущие ограничения
1. ⚠️ Backend работает без базы данных (токены генерируются без сохранения)
2. ⚠️ Не все endpoints реализованы (только auth)
3. ⚠️ Трекинг и аналитика требуют подключения БД

---

## 📝 ENVIRONMENT VARIABLES

### Required
```env
TELEGRAM_BOT_TOKEN=8771751252:AAF19pl3mtDEqyy-Srg74qwiSJndh_CWB10
DATABASE_URL=postgresql://... (Neon connection string)
JWT_SECRET=life-os-super-secret-jwt-key-change-in-production-2026
NODE_ENV=production
VITE_API_URL=https://life-os-seven-khaki.vercel.app/api
```

---

## 🚀 DEPLOYMENT

### Frontend
```bash
cd frontend
npm install
npm run build
vercel deploy --prod
```

### Backend (Vercel Serverless)
```bash
cd api
npm install
vercel deploy --prod
```

### Database (Neon)
1. Создать проект на https://neon.tech
2. Скопировать Connection String
3. Добавить в Vercel Environment Variables

---

## 🔧 API ENDPOINTS

### Auth
- `POST /api/auth` — Telegram авторизация
- `POST /api/auth-simple` — Простая авторизация (без БД)
- `POST /api/auth-dev` — Dev авторизация

### Metrics
- `GET /api/metrics/:date` — Метрики за дату
- `POST /api/metrics` — Создать/обновить метрики

### Goals
- `GET /api/goals` — Список целей
- `POST /api/goals` — Создать цель
- `PATCH /api/goals/:id/progress` — Обновить прогресс

### Tasks
- `GET /api/tasks` — Список задач
- `POST /api/tasks` — Создать задачу
- `PATCH /api/tasks/:id/status` — Обновить статус

### Analytics
- `GET /api/analytics/dashboard` — Дашборд
- `GET /api/analytics/wheel` — Колесо баланса
- `GET /api/analytics/correlations` — Корреляции

---

## 📊 CURRENT STATE (Текущее состояние)

### ✅ Работает
- Авторизация через Dev режим
- JWT токены генерируются
- Роутинг между страницами
- iOS 26 дизайн система
- Анимации и переходы
- Dashboard отображает данные

### ⚠️ Требует доработки
- Подключение базы данных
- Сохранение пользователей в БД
- Трекинг метрик
- Цели и задачи
- Аналитика и графики
- Rule Engine рекомендации
- Экспорт в AI

---

## 🎯 NEXT STEPS (Следующие шаги)

1. **Подключить базу данных**
   - Настроить Prisma Client
   - Создать миграции
   - Реализовать CRUD операции

2. **Реализовать трекинг**
   - Страница трекинга сфер
   - Сохранение метрик в БД
   - История изменений

3. **Доработать аналитику**
   - Графики прогресса
   - Колесо баланса
   - Корреляции

4. **Добавить Rule Engine**
   - Правила для рекомендаций
   - Уведомления
   - Экспорт отчётов

5. **Улучшить UI/UX**
   - Больше анимаций
   - Темы оформления
   - Адаптивность

---

## 📞 CONTACTS

- **GitHub:** https://github.com/desmosdesmos/lifeos
- **Vercel:** https://vercel.com/desmosdesmos-projects/lifeos
- **Neon:** https://neon.tech (проект: life-os)

---

## 💡 СОВЕТЫ ДЛЯ РАЗРАБОТКИ

1. **Локальная разработка:**
   ```bash
   cd frontend && npm run dev
   ```

2. **Проверка API:**
   ```bash
   curl https://life-os-seven-khaki.vercel.app/api/health
   ```

3. **Очистка кэша:**
   - Browser: Ctrl+Shift+Delete
   - Vercel: `vercel --prod`

4. **Debug:**
   - Console.log в браузере (F12)
   - Vercel Functions logs в dashboard

---

**Последнее обновление:** 2026-03-01  
**Статус:** MVP готово, требуется подключение БД  
**Версия:** 1.0.0
