# Заводыч

**Платформа для профориентации школьников** — помогает познакомиться с предприятиями и профессиями своего региона через экскурсии, интерактивные материалы и запись на мероприятия.

## Возможности

- 🔍 **Каталог профессий** — поиск и фильтрация по отраслям, видео-визитки
- 🏭 **Предприятия** — карточки с описанием, контактами и расположением на карте
- 🗺️ **Карта** — интерактивная карта предприятий (Яндекс.Карты)
- 📅 **Запись на экскурсии** — выбор даты и времени, управление бронированиями
- ✅ **QR-коды** — отметка о посещении через сканирование
- 🤖 **ИИ-помощник** — чат для вопросов о профессиях и предприятиях
- 👤 **Личный кабинет** — профиль, история посещений, управление записями
- 🛡️ **Админ-панель** — управление пользователями, профессиями, предприятиями, статистика, настройки AI
- 🖥️ **Панель предприятия** — управление слотами и записями, редактирование профиля

## Технический стек

### Frontend
- **React 18** + **Vite 5**
- **React Router v6** — маршрутизация
- **Zustand** — управление состоянием
- **Lucide React** — иконки
- **jsQR** — сканирование QR-кодов
- **CSS Custom Properties** — стилизация

### Backend
- **Node.js 20** + **Express 4**
- **SQLite3** (WAL mode) — база данных
- **JWT** (httpOnly cookies) — аутентификация
- **bcrypt** — хеширование паролей
- **express-validator** — валидация
- **Winston** — логирование
- **Multer** — загрузка файлов
- **Nodemailer** — email-уведомления

### Инфраструктура
- **Docker** + **docker-compose**
- **Helmet**, **CORS**, **rate-limit** — безопасность

## Быстрый старт

### Предварительные требования
- Node.js 20+
- npm

### Установка и запуск

```bash
# Клонирование
git clone https://github.com/your-username/zavodych.git
cd zavodych

# Установка зависимостей
cd client && npm install
cd ../server && npm install

# Настройка окружения
cp .env.example .env
# отредактируйте .env

# Инициализация БД (с тестовыми данными)
cd server
npm run seed
cd ..

# Запуск сервера (порт 3001)
cd server && node --watch --import dotenv/config --env-file ../.env index.js

# Запуск клиента (в другом терминале)
cd client && npx vite --host 0.0.0.0
```

### Запуск через Docker

```bash
docker-compose up --build
```

### Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@zavodych.ru | Admin123! |
| Предприятие | lavanda@zavodych.ru | Lavanda456! |
| Предприятие | leplast@zavodych.ru | Leplast321! |
| Пользователь | school1@test.ru | Test1234! |
| Пользователь | student1@test.ru | Test1234! |

## API Маршруты

Все маршруты имеют префикс `/api`.

### Auth (`/api/auth`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| POST | `/api/auth/register` | — | Регистрация (email, password, name, role) |
| POST | `/api/auth/login` | — | Вход |
| POST | `/api/auth/logout` | — | Выход |
| GET | `/api/auth/confirm/:token` | — | Подтверждение email |
| GET | `/api/auth/me` | Требуется auth | Текущий пользователь |

### Professions (`/api/professions`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| GET | `/api/professions` | — | Список профессий (search, industry, page, limit) |
| GET | `/api/professions/:id` | — | Детали профессии |
| GET | `/api/professions/:id/enterprises` | — | Предприятия по профессии |
| POST | `/api/professions` | Admin | Создать профессию |
| PUT | `/api/professions/:id` | Admin | Обновить профессию |
| DELETE | `/api/professions/:id` | Admin | Удалить профессию |

### Enterprises (`/api/enterprises`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| GET | `/api/enterprises` | — | Список предприятий (industry, city, hasSlots, page, limit) |
| GET | `/api/enterprises/geo` | — | Geo-данные для карты (с координатами) |
| GET | `/api/enterprises/:id` | — | Детали предприятия (с профессиями и количеством слотов) |
| GET | `/api/enterprises/:id/slots` | — | Слоты предприятия |
| GET | `/api/enterprises/:id/bookings` | Enterprise/Admin | Записи предприятия |
| POST | `/api/enterprises` | Enterprise/Admin | Создать предприятие |
| PUT | `/api/enterprises/:id` | Enterprise/Admin | Обновить предприятие |
| DELETE | `/api/enterprises/:id` | Admin | Удалить предприятие |
| POST | `/api/enterprises/:id/slots` | Enterprise/Admin | Создать слот |

### Slots (`/api/slots`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| DELETE | `/api/slots/:slotId` | Enterprise/Admin | Удалить слот |

### Bookings (`/api/bookings`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| POST | `/api/bookings` | Auth | Создать бронирование (slot_id, enterprise_id) |
| GET | `/api/bookings/my` | Auth | Мои бронирования |
| DELETE | `/api/bookings/:id` | Auth | Отменить бронирование |

### QR (`/api/qr`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| POST | `/api/qr/scan` | Auth | Отсканировать QR (token) |
| GET | `/api/qr/generate/:enterpriseId` | Enterprise/Admin | Сгенерировать QR-коды для предприятия |

### Profile (`/api/profile`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| GET | `/api/profile` | Auth | Профиль пользователя |
| PUT | `/api/profile` | Auth | Обновить профиль (name, phone, city, avatar_url) |
| GET | `/api/profile/visited` | Auth | Посещённые предприятия |

### Admin (`/api/admin`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| GET | `/api/admin/users` | Admin | Список пользователей |
| PUT | `/api/admin/users/:id/block` | Admin | Заблокировать/разблокировать пользователя |
| GET | `/api/admin/stats` | Admin | Статистика (users, enterprises, professions, bookings, visited, activeSlots) |
| GET | `/api/admin/enterprise-users-available` | Admin | Доступные enterprise-пользователи |
| GET | `/api/admin/ai-creds` | Admin | Настройки AI ассистента |
| PUT | `/api/admin/ai-creds` | Admin | Сохранить настройки AI |

### AI (`/api/ai`)

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| POST | `/api/ai/chat` | Auth | Отправить сообщение AI-ассистенту |
| DELETE | `/api/ai/chat/history` | Auth | Очистить историю чата |

### Widget (`/api/widget`) — без аутентификации

| Метод | Путь | Аутентификация | Описание |
|-------|------|---------------|----------|
| POST | `/api/widget/chat` | Опционально | Чат-виджет (без обязательной авторизации) |

## Схема базы данных

### users
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| email | TEXT UNIQUE | Email |
| password_hash | TEXT | Хеш пароля (bcrypt) |
| name | TEXT | Имя |
| role | TEXT | Роль: `user`, `enterprise`, `admin` |
| phone | TEXT | Телефон |
| city | TEXT | Город |
| avatar_url | TEXT | Аватар |
| is_blocked | INTEGER | 0/1 |
| is_confirmed | INTEGER | Подтверждён ли email |
| confirm_token | TEXT | Токен подтверждения |
| created_at | TEXT | Дата создания |

### professions
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| title | TEXT | Название профессии |
| description | TEXT | Описание |
| industry | TEXT | Отрасль |
| video_url | TEXT | Ссылка на видео ВК (vkvideo.ru) |
| image_url | TEXT | Изображения (JSON: `"ключ":"url"`) |
| created_at | TEXT | |

### enterprises
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| name | TEXT | Название |
| description | TEXT | Описание |
| industry | TEXT | Отрасль |
| city | TEXT | Город |
| address | TEXT | Адрес |
| phone | TEXT | Телефон |
| website | TEXT | Сайт |
| photo_url | TEXT | Фото |
| latitude | REAL | Координаты (широта) |
| longitude | REAL | Координаты (долгота) |
| user_id | INTEGER FK → users.id | Ответственный пользователь (enterprise) |
| created_at | TEXT | |

### enterprise_professions (many-to-many)
| Поле | Тип | Описание |
|------|-----|----------|
| enterprise_id | INTEGER PK, FK → enterprises.id | |
| profession_id | INTEGER PK, FK → professions.id | |

### slots
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| enterprise_id | INTEGER FK → enterprises.id | |
| date | TEXT | Дата |
| time | TEXT | Время |
| max_participants | INTEGER | Макс. участников (по умолч. 10) |
| booked_count | INTEGER | Занято мест |
| created_at | TEXT | |

### bookings
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | |
| slot_id | INTEGER FK → slots.id | |
| enterprise_id | INTEGER FK → enterprises.id | |
| status | TEXT | `confirmed`, `cancelled`, `visited` |
| created_at | TEXT | |
| UNIQUE(user_id, slot_id) | | |

### qr_codes
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| booking_id | INTEGER FK → bookings.id UNIQUE | |
| token | TEXT UNIQUE | Уникальный токен QR |
| is_scanned | INTEGER | 0/1 |
| scanned_at | TEXT | Дата сканирования |
| created_at | TEXT | |

### ai_chat_history
| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | |
| role | TEXT | `user` или `assistant` |
| content | TEXT | Текст сообщения |
| created_at | TEXT | |

## Структура проекта

```
zavodych/
├── client/                      # React frontend (Vite)
│   ├── public/                  # Статика
│   ├── src/
│   │   ├── App.jsx              # Маршрутизация (React Router)
│   │   ├── main.jsx             # Точка входа
│   │   ├── api/
│   │   │   └── client.js        # HTTP-клиент (fetch + cookies)
│   │   ├── components/
│   │   │   ├── Card.jsx         # Карточки предприятий
│   │   │   ├── ChatWidget.jsx   # ИИ-ассистент (виджет)
│   │   │   ├── Layout.jsx       # Общий макет страниц
│   │   │   ├── Sidebar.jsx      # Боковое меню
│   │   │   ├── Toast.jsx        # Уведомления
│   │   │   └── YandexMapSelector.jsx  # Выбор координат на карте
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProfessionsPage.jsx
│   │   │   ├── ProfessionDetailPage.jsx
│   │   │   ├── EnterprisesPage.jsx
│   │   │   ├── EnterpriseDetailPage.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── BookingsPage.jsx
│   │   │   ├── QRScannerPage.jsx
│   │   │   ├── HelpPage.jsx
│   │   │   ├── EnterprisePanelPage.jsx  # Панель предприятия
│   │   │   └── AdminPage.jsx            # Админ-панель
│   │   ├── store/
│   │   │   ├── useAuthStore.js   # Zustand (аутентификация)
│   │   │   └── useToastStore.js  # Zustand (уведомления)
│   │   └── styles/
│   │       ├── base.css
│   │       └── globals.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                       # Express backend
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── bookingsController.js
│   │   ├── chatWidgetController.js
│   │   ├── enterprisesController.js
│   │   ├── professionsController.js
│   │   ├── profileController.js
│   │   ├── qrController.js
│   │   └── slotsController.js
│   ├── db/
│   │   ├── index.js             # Подключение к SQLite
│   │   ├── schema.sql           # Полная схема БД
│   │   └── seed.js              # Тестовые данные
│   ├── middleware/
│   │   ├── auth.js              # JWT, роли, блокировка
│   │   ├── upload.js            # Multer
│   │   └── validate.js          # Валидация
│   ├── routes/
│   │   ├── admin.js
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── enterprises.js
│   │   ├── professions.js
│   │   ├── profile.js
│   │   ├── qr.js
│   │   ├── slots.js
│   │   └── widget.js
│   ├── utils/
│   │   ├── aiChat.js            # Вызов AI API
│   │   ├── aiCreds.js           # Управление AI-ключами
│   │   ├── config.js            # Конфигурация приложения
│   │   └── logger.js            # Winston
│   ├── index.js                 # Точка входа сервера
│   └── package.json
├── uploads/                      # Загруженные файлы
├── .dockerignore
├── .gitignore
├── DEVELOPMENT_LOG.md
├── docker-compose.yml
├── docker-entrypoint.sh
├── Dockerfile
├── qr-scanner-demo.html
└── README.md
```

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `JWT_SECRET` | Секретный ключ для JWT |
| `DB_PATH` | Путь к SQLite |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP для писем |
| `AI_API_KEY` / `AI_API_URL` / `AI_API_MODEL` | ИИ-чат |
| `YMAPS_API_KEY` | Ключ Яндекс.Карт |
| `PORT` | Порт сервера (по умолчанию 3001) |
| `CLIENT_URL` | URL клиента (по умолчанию http://localhost:5173) |

## Лицензия

MIT