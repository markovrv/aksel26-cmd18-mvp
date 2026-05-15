-- === Заводыч Database Schema ===

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'user' CHECK(role IN ('user','enterprise','admin')),
  phone         TEXT,
  city          TEXT,
  avatar_url    TEXT,
  is_blocked    INTEGER NOT NULL DEFAULT 0,
  is_confirmed  INTEGER NOT NULL DEFAULT 0,
  confirm_token TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Профессии
CREATE TABLE IF NOT EXISTS professions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  industry    TEXT    NOT NULL DEFAULT '',
  video_url   TEXT,
  image_url   TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Предприятия
CREATE TABLE IF NOT EXISTS enterprises (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  description   TEXT    NOT NULL DEFAULT '',
  industry      TEXT    NOT NULL DEFAULT '',
  city          TEXT    NOT NULL DEFAULT '',
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  photo_url     TEXT,
  latitude      REAL,
  longitude     REAL,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Связь профессий с предприятиями (many-to-many)
CREATE TABLE IF NOT EXISTS enterprise_professions (
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  profession_id INTEGER NOT NULL REFERENCES professions(id) ON DELETE CASCADE,
  PRIMARY KEY (enterprise_id, profession_id)
);

-- Слоты для записи на экскурсию
CREATE TABLE IF NOT EXISTS slots (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  date          TEXT    NOT NULL,
  time          TEXT    NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  booked_count  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Бронирования (записи на экскурсию)
CREATE TABLE IF NOT EXISTS bookings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slot_id       INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  status        TEXT    NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled','visited')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, slot_id)
);

-- QR-коды посещения
CREATE TABLE IF NOT EXISTS qr_codes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id     INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  token          TEXT    NOT NULL UNIQUE,
  is_scanned     INTEGER NOT NULL DEFAULT 0,
  scanned_at     TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- История чата с ИИ
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role      TEXT    NOT NULL CHECK(role IN ('user','assistant')),
  content   TEXT    NOT NULL,
  created_at TEXT   NOT NULL DEFAULT (datetime('now'))
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_slots_enterprise ON slots(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_slots_date ON slots(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_qr_token ON qr_codes(token);
CREATE INDEX IF NOT EXISTS idx_enterprises_city ON enterprises(city);
CREATE INDEX IF NOT EXISTS idx_enterprises_industry ON enterprises(industry);