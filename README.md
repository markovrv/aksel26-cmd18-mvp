# Заводыч

**Платформа для профориентации школьников** — помогает познакомиться с предприятиями и профессиями своего региона через экскурсии, интерактивные материалы и запись на мероприятия.

## Возможности

- 🔍 **Каталог профессий** — поиск и фильтрация по отраслям
- 🏭 **Предприятия** — карточки с описанием, контактами и расположением на карте
- 📅 **Запись на экскурсии** — выбор даты и времени, управление бронированиями
- ✅ **QR-коды** — отметка о посещении через сканирование
- 🤖 **ИИ-помощник** — чат для вопросов о профессиях и предприятиях
- 👤 **Личный кабинет** — профиль, история посещений, управление записями
- 🛡️ **Админ-панель** — управление пользователями, статистика, блокировки
- 🖥️ **Панель предприятия** — управление слотами и записями

## Технический стек

### Frontend
- **React 18** + **Vite 5**
- **React Router v6** — маршрутизация
- **Zustand** — управление состоянием
- **Lucide React** — иконки
- **jsQR** — сканирование QR-кодов
- **CSS Modules** + **CSS Custom Properties**

### Backend
- **Node.js 20** + **Express 4**
- **SQLite3** (WAL mode) — база данных
- **JWT** (httpOnly cookies) — аутентификация
- **bcrypt** — хеширование паролей
- **express-validator** — валидация
- **Winston** — логирование

### Инфраструктура
- **Docker** + **docker-compose**
- **Helmet**, **CORS**, **rate-limit** — безопасность
- **Nodemailer** — email-уведомления

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

# Запуск в режиме разработки
npm run dev
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

## API

Полный перечень API-эндпоинтов — в [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).

## Переменные окружения

| Переменная | Описание |
|-----------|----------|
| `JWT_SECRET` | Секретный ключ для JWT |
| `DB_PATH` | Путь к SQLite |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | SMTP для писем |
| `AI_API_KEY` / `AI_API_URL` / `AI_API_MODEL` | ИИ-чат |
| `YMAPS_API_KEY` | Ключ Яндекс.Карт |
| `PORT` | Порт сервера (по умолчанию 3001) |
| `CLIENT_URL` | URL клиента |

## Структура проекта

```
zavodych/
├── client/              # React frontend
│   ├── src/            # Исходники
│   └── public/         # Статика
├── server/              # Express backend
│   ├── controllers/    # Обработчики запросов
│   ├── db/             # База данных (схема, сиды)
│   ├── middleware/     # Middleware (auth, upload)
│   ├── routes/         # Маршруты
│   └── utils/          # Утилиты
├── uploads/             # Загруженные файлы
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Лицензия

MIT