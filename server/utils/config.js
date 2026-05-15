// === Application Config ===
// Lazy getters — process.env is read at call time, not at import time.
// This avoids issues with ESM import hoisting vs dotenv load order.

export function getJwtSecret() {
  return process.env.JWT_SECRET || 'zavodych_dev_secret_key_2024';
}

export function getDbPath() {
  return process.env.DB_PATH;
}

export function getPort() {
  return process.env.PORT || 3001;
}

export function getClientUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5173';
}