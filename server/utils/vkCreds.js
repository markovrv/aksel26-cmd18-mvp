// === VK Credentials File Utils ===
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CRED_PATH = join(__dirname, '..', 'vk-cred.json');

const defaults = {
  VK_ADMIN_ID: '',
  VK_TOKEN: '',
  notify_on_new_application: true,
  notify_on_new_user: true,
  notify_on_new_booking: true
};

export function loadVkCreds() {
  try {
    const data = JSON.parse(readFileSync(CRED_PATH, 'utf-8'));
    return { ...defaults, ...data };
  } catch (err) {
    return { ...defaults };
  }
}

export function saveVkCreds(data) {
  writeFileSync(CRED_PATH, JSON.stringify(data, null, 2), 'utf-8');
}