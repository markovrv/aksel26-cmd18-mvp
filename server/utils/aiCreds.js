// === AI Credentials File Utils ===
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CRED_PATH = join(__dirname, '..', 'ai-cred.json');

const defaults = {
  AI_API_URL: 'https://api.openai.com/v1/chat/completions',
  AI_API_KEY: '',
  AI_API_MODEL: 'gpt-3.5-turbo',
  AI_SYSTEM_PROMPT: ''
};

export function loadAiCreds() {
  try {
    const data = JSON.parse(readFileSync(CRED_PATH, 'utf-8'));
    return { ...defaults, ...data };
  } catch (err) {
    console.error('Failed to load ai-cred.json:', err.message);
    return { ...defaults };
  }
}

export function saveAiCreds(data) {
  writeFileSync(CRED_PATH, JSON.stringify(data, null, 2), 'utf-8');
}