// === Тестовый скрипт для проверки отправки уведомлений в VK ===
// Запуск:
//   node test-vk-notify.js
// Перед запуском установите переменные окружения VK_ADMIN_ID и VK_TOKEN,
// либо передайте их через временное окружение:
//
//   set VK_ADMIN_ID=123456789 && set VK_TOKEN=vk1.a.xxxxx && node test-vk-notify.js
//
// Либо через PowerShell:
//   $env:VK_ADMIN_ID=123456789; $env:VK_TOKEN="vk1.a.xxxxx"; node test-vk-notify.js

import { sendVkNotification } from './server/utils/vkNotify.js';

const testData = {
  userName: 'Иван Иванов',
  enterpriseName: 'ООО "Лаванда"',
  professionTitle: 'Лаборант химического анализа',
  createdAt: new Date().toLocaleString('ru-RU')
};

console.log('=== Тест VK уведомления ===');
console.log('Данные для отправки:');
console.log(JSON.stringify(testData, null, 2));
console.log('');
console.log(`VK_ADMIN_ID: ${process.env.VK_ADMIN_ID || '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`VK_TOKEN:    ${process.env.VK_TOKEN ? '✅ Установлен (скрыт)' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log('');

if (!process.env.VK_ADMIN_ID || !process.env.VK_TOKEN) {
  console.log('⚠️  Для запуска теста установите переменные окружения:');
  console.log('   VK_ADMIN_ID — ID администратора ВКонтакте (число)');
  console.log('   VK_TOKEN    — Токен сообщества ВКонтакте');
  console.log('');
  console.log('Пример:');
  console.log('   $env:VK_ADMIN_ID=123456789; $env:VK_TOKEN="vk1.a.xxxxx"; node test-vk-notify.js');
  process.exit(1);
}

console.log('🔄 Отправка уведомления...');

try {
  await sendVkNotification(testData);
  console.log('');
  console.log('✅ Скрипт выполнен. Результат отправки — в логах выше.');
  console.log('   Если нет ошибок — проверьте сообщения у указанного VK_ADMIN_ID.');
} catch (err) {
  console.error('❌ Ошибка при отправке:', err.message);
  process.exit(1);
}