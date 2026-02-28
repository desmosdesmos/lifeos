# 📡 API Документация

Полная документация REST API Life OS.

## Базовая информация

**Base URL:** `http://localhost:3000/api` (dev)  
**Content-Type:** `application/json`  
**Авторизация:** `Bearer {token}`

---

## 🔐 Авторизация

### Telegram авторизация

**POST** `/auth/telegram`

Проверка и авторизация через Telegram WebApp initData.

**Request:**
```json
{
  "initData": "query_id=AAE...&user=%7B%22id%22..."
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "languageCode": "ru"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 401:**
```json
{
  "error": "Invalid Telegram data"
}
```

---

### Dev авторизация

**POST** `/auth/dev`

Только для разработки!

**Request:**
```json
{
  "telegramId": "123456789",
  "username": "test_user",
  "firstName": "Test"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": { ... },
  "token": "..."
}
```

---

### Веса сфер

**GET** `/auth/weights`

Получить веса сфер пользователя для расчёта LifeScore.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "weights": {
    "sleep": 15.0,
    "water": 10.0,
    "nutrition": 10.0,
    "fitness": 15.0,
    "work": 15.0,
    "finance": 15.0,
    "mood": 10.0,
    "selfDevelopment": 5.0,
    "personalLife": 5.0
  }
}
```

---

**PUT** `/auth/weights`

Обновить веса сфер.

**Request:**
```json
{
  "weights": {
    "sleep": 20.0,
    "water": 10.0,
    "fitness": 20.0,
    "work": 10.0,
    "finance": 15.0,
    "mood": 10.0,
    "selfDevelopment": 5.0,
    "personalLife": 10.0
  }
}
```

---

## 📊 Метрики

### Получить за дату

**GET** `/metrics/:date`

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "metric": {
    "id": 1,
    "date": "2024-02-28T00:00:00.000Z",
    "sleepHours": 7.5,
    "waterMl": 2500,
    "calories": 2200,
    "workoutMinutes": 45,
    "workoutType": "cardio",
    "workHours": 8,
    "income": 5000,
    "expenses": 1500,
    "mood": 8,
    "selfDevMinutes": 30,
    "personalLifeScore": 7,
    "sphereStatuses": {
      "SLEEP": {
        "value": 7.5,
        "target": 8,
        "percentage": 94,
        "status": "excellent",
        "color": "blue"
      },
      "WATER": { ... }
    },
    "lifeScore": 78.5
  }
}
```

**Response 200 (нет данных):**
```json
{
  "success": true,
  "metric": null
}
```

---

### Получить за период

**GET** `/metrics?from=2024-02-01&to=2024-02-28&limit=30`

**Response 200:**
```json
{
  "success": true,
  "metrics": [
    {
      "id": 1,
      "date": "2024-02-28T00:00:00.000Z",
      "sleepHours": 7.5,
      "waterMl": 2500,
      ...
    }
  ],
  "count": 28
}
```

---

### Создать/обновить метрики

**POST** `/metrics`

Upsert: создаёт новую запись или обновляет существующую за дату.

**Request:**
```json
{
  "date": "2024-02-28",
  "sleepHours": 7.5,
  "waterMl": 500,
  "calories": 2200,
  "workoutMinutes": 45,
  "workoutType": "cardio",
  "workHours": 8,
  "income": 0,
  "expenses": 500,
  "mood": 8,
  "selfDevMinutes": 30,
  "personalLifeScore": 7,
  "notes": "Отличный день!"
}
```

**Response 200:**
```json
{
  "success": true,
  "metric": {
    "id": 1,
    "date": "2024-02-28T00:00:00.000Z",
    "sleepHours": 7.5,
    "waterMl": 2500,
    ...
    "lifeScore": 78.5
  }
}
```

---

### Обновить поле

**PATCH** `/metrics/:field`

Быстрое обновление одного поля (аккумулятивно для числовых полей).

**Request:**
```json
{
  "value": 250,
  "date": "2024-02-28"
}
```

**Примеры:**
- `PATCH /metrics/waterMl` — добавить воды
- `PATCH /metrics/mood` — обновить настроение
- `PATCH /metrics/selfDevMinutes` — добавить минут саморазвития

---

### Удалить за дату

**DELETE** `/metrics/:date`

**Response 200:**
```json
{
  "success": true
}
```

---

### Статистика за сегодня

**GET** `/metrics/today/stats`

**Response 200:**
```json
{
  "success": true,
  "today": {
    "date": "2024-02-28T00:00:00.000Z",
    "lifeScore": 78.5,
    "sphereBreakdown": {
      "sleep": { "score": 94, "weight": 15, "weightedScore": 14.1 },
      "water": { "score": 83, "weight": 10, "weightedScore": 8.3 },
      ...
    },
    "sphereStatuses": {
      "SLEEP": { "value": 7.5, "target": 8, "percentage": 94, "status": "excellent", "color": "blue" },
      ...
    },
    "recommendations": [
      {
        "ruleId": "WATER_EXCELLENT",
        "ruleName": "Отличный водный баланс",
        "severity": "INFO",
        "message": "Превосходно! Вы пьёте 2500 мл воды в день.",
        "sphere": "WATER",
        "suggestion": "Поддерживайте отличный водный баланс!"
      }
    ]
  }
}
```

---

## 🎯 Цели

### Получить все цели

**GET** `/goals?status=ACTIVE&sphere=FITNESS`

**Query параметры:**
- `status` — ACTIVE | COMPLETED | PAUSED | CANCELLED
- `sphere` — SLEEP | WATER | FITNESS | ...

**Response 200:**
```json
{
  "success": true,
  "goals": [
    {
      "id": 1,
      "userId": 1,
      "title": "Похудеть на 5 кг",
      "description": "К лету быть в форме",
      "sphere": "FITNESS",
      "targetValue": 5,
      "currentValue": 3,
      "unit": "кг",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-04-01T00:00:00.000Z",
      "status": "ACTIVE",
      "progress": 60,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-02-28T00:00:00.000Z"
    }
  ]
}
```

---

### Создать цель

**POST** `/goals`

**Request:**
```json
{
  "title": "Похудеть на 5 кг",
  "description": "К лету быть в форме",
  "sphere": "FITNESS",
  "targetValue": 5,
  "currentValue": 0,
  "unit": "кг",
  "startDate": "2024-01-01",
  "endDate": "2024-04-01"
}
```

**Response 201:**
```json
{
  "success": true,
  "goal": { ... }
}
```

**Response 400:**
```json
{
  "error": "End date must be after start date"
}
```

---

### Обновить прогресс

**PATCH** `/goals/:id/progress`

**Request:**
```json
{
  "currentValue": 3.5
}
```

Или с дельтой:
```json
{
  "delta": 0.5
}
```

**Response 200:**
```json
{
  "success": true,
  "goal": {
    "id": 1,
    "currentValue": 3.5,
    "progress": 70,
    "status": "ACTIVE"
  }
}
```

---

### Удалить цель

**DELETE** `/goals/:id`

**Response 200:**
```json
{
  "success": true
}
```

---

### Сводка по целям

**GET** `/goals/summary`

**Response 200:**
```json
{
  "success": true,
  "summary": {
    "total": 5,
    "completed": 1,
    "onTrack": 3,
    "behind": 1,
    "bySphere": {
      "FITNESS": {
        "count": 2,
        "avgProgress": 65
      },
      "FINANCE": {
        "count": 1,
        "avgProgress": 80
      }
    }
  },
  "goals": [...]
}
```

---

## ✅ Задачи

### Получить все задачи

**GET** `/tasks?status=PENDING&category=WORK&priority=HIGH&limit=20`

**Response 200:**
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "userId": 1,
      "title": "Подготовить отчёт",
      "description": "Квартальный отчёт для руководства",
      "category": "WORK",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "checklist": [
        {
          "id": 1,
          "text": "Собрать данные",
          "isCompleted": true
        },
        {
          "id": 2,
          "text": "Создать презентацию",
          "isCompleted": false
        }
      ],
      "dueDate": "2024-03-01T00:00:00.000Z",
      "completedAt": null,
      "isRecurring": false,
      "createdAt": "2024-02-25T00:00:00.000Z",
      "updatedAt": "2024-02-28T00:00:00.000Z"
    }
  ]
}
```

---

### Создать задачу

**POST** `/tasks`

**Request:**
```json
{
  "title": "Подготовить отчёт",
  "description": "Квартальный отчёт",
  "category": "WORK",
  "priority": "HIGH",
  "dueDate": "2024-03-01",
  "checklist": [
    { "text": "Собрать данные" },
    { "text": "Создать презентацию" }
  ],
  "isRecurring": false
}
```

---

### Обновить статус

**PATCH** `/tasks/:id/status`

**Request:**
```json
{
  "status": "COMPLETED"
}
```

**Response 200:**
```json
{
  "success": true,
  "task": {
    "id": 1,
    "status": "COMPLETED",
    "completedAt": "2024-02-28T10:30:00.000Z"
  }
}
```

---

### Переключить элемент чек-листа

**PATCH** `/tasks/:id/checklist/:itemId`

**Response 200:**
```json
{
  "success": true,
  "item": {
    "id": 2,
    "text": "Создать презентацию",
    "isCompleted": true
  },
  "taskComplete": true
}
```

---

### Статистика задач

**GET** `/tasks/stats`

**Response 200:**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "byStatus": {
      "pending": 10,
      "inProgress": 5,
      "completed": 8,
      "cancelled": 2
    },
    "byCategory": {
      "health": 5,
      "work": 10,
      "finance": 3,
      "learning": 4,
      "personal": 2,
      "other": 1
    },
    "byPriority": {
      "low": 5,
      "medium": 10,
      "high": 7,
      "critical": 3
    },
    "overdue": 2,
    "completedToday": 3
  }
}
```

---

## 📈 Аналитика

### Дашборд

**GET** `/analytics/dashboard`

**Response 200:**
```json
{
  "success": true,
  "dashboard": {
    "date": "2024-02-28T00:00:00.000Z",
    "lifeScore": 78.5,
    "sphereBreakdown": { ... },
    "sphereStatuses": { ... },
    "todayMetrics": { ... },
    "recommendations": [...],
    "goals": {
      "total": 5,
      "avgProgress": 62
    },
    "tasks": {
      "pending": 10,
      "critical": 3
    },
    "wheel": {
      "spheres": [
        { "name": "Сон", "percentage": 94 },
        { "name": "Вода", "percentage": 83 },
        ...
      ]
    }
  }
}
```

---

### Колесо баланса

**GET** `/analytics/wheel?days=7`

**Response 200:**
```json
{
  "success": true,
  "wheel": {
    "spheres": [
      {
        "name": "Сон",
        "value": 7.2,
        "max": 10,
        "percentage": 72
      },
      {
        "name": "Вода",
        "value": 2100,
        "max": 3000,
        "percentage": 70
      },
      ...
    ],
    "overallScore": 75.5
  }
}
```

---

### Корреляции

**GET** `/analytics/correlations?days=30`

**Response 200:**
```json
{
  "success": true,
  "correlations": [
    {
      "correlation": "Сон ↔ Настроение",
      "coefficient": 0.72,
      "interpretation": "Сильная положительная. Качество сна влияет на настроение."
    },
    {
      "correlation": "Спорт ↔ Настроение",
      "coefficient": 0.58,
      "interpretation": "Умеренная положительная. Физическая активность улучшает настроение."
    }
  ],
  "allCorrelations": [...]
}
```

---

### Прогресс по сферам

**GET** `/analytics/progress?days=30&sphere=sleep`

**Response 200:**
```json
{
  "success": true,
  "progress": {
    "sleep": [
      { "date": "2024-02-01", "value": 7.5 },
      { "date": "2024-02-02", "value": 6.5 },
      ...
    ]
  },
  "lifeScoreTrend": [
    { "date": "2024-02-01", "score": 75 },
    { "date": "2024-02-02", "score": 72 },
    ...
  ]
}
```

---

### Недельная статистика

**GET** `/analytics/weekly?weeks=4`

**Response 200:**
```json
{
  "success": true,
  "stats": [
    {
      "id": 1,
      "weekStart": "2024-02-19",
      "weekEnd": "2024-02-25",
      "avgSleepHours": 7.2,
      "totalWaterMl": 15400,
      "avgCalories": 2150,
      "totalWorkoutMinutes": 180,
      "avgWorkHours": 8.5,
      "totalIncome": 50000,
      "totalExpenses": 15000,
      "avgMood": 7.5,
      "totalSelfDevMinutes": 210,
      "avgPersonalLifeScore": 7.0,
      "lifeScore": 78.5,
      "lifeScoreChange": 2.5
    }
  ]
}
```

---

### Экспорт отчёта

**GET** `/analytics/export?format=txt&days=30`

**Форматы:** `txt`, `json`, `csv`

**Response (txt):**
```
Content-Type: text/plain
Content-Disposition: attachment; filename="life-os-report-2024-02-28.txt"

════════════════════════════════════════════
📊 LIFE OS — ПОЛНЫЙ ОТЧЁТ ДЛЯ АНАЛИЗА В AI
════════════════════════════════════════════
...
```

**Response (json):**
```json
{
  "generatedAt": "2024-02-28T10:30:00.000Z",
  "period": {
    "from": "2024-01-29",
    "to": "2024-02-28"
  },
  "user": {
    "telegramId": "123456789"
  },
  "summary": {
    "lifeScore": 78.5,
    "totalDays": 28,
    "completedGoals": 2,
    "completedTasks": 15
  },
  "spheres": {
    "sleep": {
      "name": "sleep",
      "average": 7.2,
      "trend": "up",
      "bestDay": "2024-02-15",
      "worstDay": "2024-02-03"
    },
    ...
  },
  "recommendations": [...],
  "rawText": "════════════════════════════════════..."
}
```

---

## ❌ Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Bad Request — невалидные данные |
| 401 | Unauthorized — нет токена или истёк |
| 403 | Forbidden — доступ запрещён |
| 404 | Not Found — ресурс не найден |
| 429 | Too Many Requests — превышен лимит |
| 500 | Internal Server Error |

**Формат ошибки:**
```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📋 Лимиты

| Endpoint | Лимит |
|----------|-------|
| Все API | 100 запросов / 15 мин |
| POST /metrics | 60 / час |
| GET /analytics/export | 10 / час |

---

## 🔧 Health Check

**GET** `/health`

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-28T10:30:00.000Z"
}
```

---

**Конец документации API**
