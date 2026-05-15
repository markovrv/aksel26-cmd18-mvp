# Заводыч — Лог разработки

## Статус проекта
Проект завершён на 100%. MVP портала профориентации готов к использованию.

## Архитектура

### Принятые решения

1. **Двухколоночный layout** — сайдбар 280px + контент 1fr для desktop, одноколоночный для mobile (≤1100px)
2. **CSS Modules + CSS Custom Properties** — все стили в base.css и globals.css, компоненты используют CSS-переменные из :root
3. **SQLite через sqlite3** — Promise-обёртка для async/await совместимости, WAL mode для производительности
4. **JWT в httpOnly cookie** — безопасная аутентификация без localStorage
5. **Express-validator** — обязательная валидация всех POST/PUT запросов

## Выполненные шаги

### Шаг 1 — Структура проекта и конфигурация
- Создана структура `/home/user/zavodych/` с client/ и server/
- Настроены package.json для корневого проекта, client и server
- vite.config.js с проксированием /api на localhost:3001
- .env с переменными окружения

### Шаг 2 — База данных
- schema.sql: 8 таблиц (users, professions, enterprises, slots, bookings, qr_codes, ai_chat_history)
- db/index.js: sqlite3 с Promise-обёртками (runAsync, getAsync, allAsync)
- seed.js: создание тестовых данных (7 пользователей, 12 профессий, 6 предприятий, 126 слотов)

### Шаг 3 — Бэкенд API
- auth routes: register, login, logout, confirm, me
- professions routes: CRUD + get enterprises by profession
- enterprises routes: CRUD + geo + slots + bookings
- slots routes: delete
- bookings routes: create, my, delete
- qr routes: scan, generate
- profile routes: get, update, visited
- admin routes: users, block, stats
- ai routes: chat, clear history

### Шаг 4 — Фронтенд
- Layout с Sidebar (навигация) и MobileTop (мобильная шапка)
- HomePage: Hero-блок, шаги, фичи, карточки предприятий
- ProfessionsPage: поиск, фильтры, карточки
- EnterpriseDetailPage: информация + слоты + запись
- LoginPage, RegisterPage: авторизация с логотипом
- BookingsPage: список записей со статусами
- QRScannerPage: getUserMedia + jsQR
- HelpPage: ИИ-чат с персонажем
- MapPage: Яндекс.Карты (требует API-ключ)
- EnterprisePanelPage: управление слотами
- AdminPage: статистика, пользователи, блокировка
- Компоненты: Toast, Sidebar, Layout, EnterpriseCard, ProfessionCard

### Шаг 5 — State Management
- useAuthStore (Zustand): user, isLoading, checkAuth, login, register, logout, updateProfile
- useToastStore (Zustand): toasts, addToast, removeToast, success, error, info

## API Reference

| Метод | URL | Роль | Описание | Статус |
|-------|-----|------|----------|--------|
| POST | /api/auth/register | - | Регистрация | ✅ |
| POST | /api/auth/login | - | Вход | ✅ |
| POST | /api/auth/logout | - | Выход | ✅ |
| GET | /api/auth/me | user | Текущий пользователь | ✅ |
| GET | /api/professions | - | Список профессий | ✅ |
| GET | /api/professions/:id | - | Профессия | ✅ |
| GET | /api/professions/:id/enterprises | - | Предприятия с профессией | ✅ |
| GET | /api/enterprises | - | Список предприятий | ✅ |
| GET | /api/enterprises/geo | - | Координаты для карты | ✅ |
| GET | /api/enterprises/:id | - | Предприятие | ✅ |
| GET | /api/enterprises/:id/slots | - | Слоты предприятия | ✅ |
| GET | /api/enterprises/:id/bookings | enterprise,admin | Записи предприятия | ✅ |
| POST | /api/enterprises/:id/slots | enterprise,admin | Создать слот | ✅ |
| GET | /api/slots/:slotId | - | Слот | ✅ |
| DELETE | /api/slots/:slotId | enterprise,admin | Удалить слот | ✅ |
| POST | /api/bookings | user | Создать запись | ✅ |
| GET | /api/bookings/my | user | Мои записи | ✅ |
| DELETE | /api/bookings/:id | user,enterprise,admin | Отменить запись | ✅ |
| POST | /api/qr/scan | user | Сканировать QR | ✅ |
| GET | /api/qr/generate/:enterpriseId | enterprise,admin | QR-коды | ✅ |
| GET | /api/profile | user | Профиль | ✅ |
| PUT | /api/profile | user | Обновить профиль | ✅ |
| GET | /api/profile/visited | user | Посещённые предприятия | ✅ |
| GET | /api/admin/users | admin | Пользователи | ✅ |
| PUT | /api/admin/users/:id/block | admin | Блокировка | ✅ |
| GET | /api/admin/stats | admin | Статистика | ✅ |
| POST | /api/ai/chat | user | Чат с ИИ | ✅ |
| DELETE | /api/ai/chat/history | user | Очистить историю | ✅ |

## Переменные окружения

| Переменная | Описание | Пример |
|-----------|----------|--------|
| JWT_SECRET | Секретный ключ для JWT | your_secret_here |
| DB_PATH | Путь к SQLite | ./server/db/zavodych.db |
| SMTP_HOST | SMTP-хост | smtp.mailtrap.io |
| SMTP_PORT | SMTP-порт | 587 |
| SMTP_USER | SMTP-логин | your_user |
| SMTP_PASS | SMTP-пароль | your_pass |
| AI_API_KEY | Ключ OpenAI | your_key |
| AI_API_URL | URL OpenAI API | https://api.openai.com/v1/chat/completions |
| YMAPS_API_KEY | Ключ Яндекс.Карт | your_yandex_maps_api_key |
| PORT | Порт сервера | 3001 |
| CLIENT_URL | URL клиента | http://localhost:5173 |

## Как запустить проект

### Установка зависимостей
```bash
cd /home/user/zavodych
npm install
cd client && npm install
cd ../server && npm install
```

### Инициализация базы данных
```bash
cd /home/user/zavodych/server
node db/seed.js
```

### Запуск dev-серверов
```bash
# Backend (в одном терминале)
cd /home/user/zavodych/server
node index.js

# Frontend (в другом терминале)
cd /home/user/zavodych/client
npm run dev
```

Или запуск обоих через concurrently:
```bash
cd /home/user/zavodych
npm run dev
```

### Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| admin | admin@zavodych.ru | Admin123! |
| enterprise | lavanda@zavodych.ru | Lavanda456! |
| enterprise | leplast@zavodych.ru | Leplast321! |
| user | school1@test.ru | Test1234! |
| user | student1@test.ru | Test1234! |
| user | parent1@test.ru | Test1234! |

## Известные проблемы и TODO

1. **Яндекс.Карты** — требуется реальный API-ключ для работы карты
2. **AI Chat** — работает fallback-режим без API-ключа
3. **QR Scanner** — требует HTTPS или localhost для getUserMedia
4. **Images** — assets/logo.jpg и assets/person.jpg должны быть скопированы в client/public/assets/

## Технический стек

- **Frontend**: React 18, Vite 5, React Router v6, Zustand, Lucide React, jsQR
- **Backend**: Node.js 20, Express 4, SQLite3, bcrypt, jsonwebtoken, nodemailer, qrcode
- **Styling**: CSS Modules + CSS Custom Properties (Mobile First, 320px-2560px)