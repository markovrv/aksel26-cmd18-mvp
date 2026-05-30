// === Seed Database ===
import db from './index.js';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saltRounds = 12;

function runSchema() {
  return new Promise((resolve, reject) => {
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema, (err) => {
        if (err) return reject(err);
        resolve();
      });
    } else {
      resolve();
    }
  });
}

async function seed() {
  console.log('Seeding database...');

  try {
    // Убедимся, что схема создана
    await runSchema();
    // === Clear existing data ===
    await db.runAsync('DELETE FROM vacancy_applications');
    await db.runAsync('DELETE FROM vacancies');
    await db.runAsync('DELETE FROM profession_educational_institutions');
    await db.runAsync('DELETE FROM educational_institutions');
    await db.runAsync('DELETE FROM qr_codes');
    await db.runAsync('DELETE FROM bookings');
    await db.runAsync('DELETE FROM slots');
    await db.runAsync('DELETE FROM enterprise_professions');
    await db.runAsync('DELETE FROM enterprises');
    await db.runAsync('DELETE FROM professions');
    await db.runAsync('DELETE FROM ai_chat_history');
    await db.runAsync('DELETE FROM users');

    // === Create Users ===
    // Admin
    const adminHash = await bcrypt.hash('Admin123!', saltRounds);
    const adminResult = await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@zavodych.ru', adminHash, 'Александр Петров', 'admin', 1, 0]
    );
    console.log('Admin created:', adminResult.lastID);

    // Enterprise users
    const lavandaHash = await bcrypt.hash('Lavanda456!', saltRounds);
    const leplastHash = await bcrypt.hash('Leplast321!', saltRounds);

    const lavandaResult = await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['lavanda@zavodych.ru', lavandaHash, 'Марина Сидорова', 'enterprise', 1, 0]
    );

    const leplastResult = await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['leplast@zavodych.ru', leplastHash, 'Ольга Кузнецова', 'enterprise', 1, 0]
    );
    console.log('Enterprise users created');

    // Regular users
    const userHash = await bcrypt.hash('Test1234!', saltRounds);

    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['school1@test.ru', userHash, 'Никита Смирнов', 'user', 1, 0]
    );
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['student1@test.ru', userHash, 'Алиса Воробьёва', 'user', 1, 0]
    );
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['parent1@test.ru', userHash, 'Светлана Белова', 'user', 1, 0]
    );
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['blocked@test.ru', userHash, 'Иван Тестов', 'user', 1, 1]
    );
    console.log('Regular users created');

    // === Create Professions ===
    const professions = [
      { title: 'Инженер-технолог', description: 'Разрабатывает и внедряет технологические процессы производства', industry: 'Производство' },
      { title: 'Оператор станков с ЧПУ', description: 'Управляет автоматизированным оборудованием', industry: 'Производство' },
      { title: 'Сварщик', description: 'Соединяет металлические конструкции различными способами', industry: 'Производство' },
      { title: 'Электромонтажник', description: 'Монтирует и обслуживает электрические сети и оборудование', industry: 'Энергетика' },
      { title: 'Лаборант химического анализа', description: 'Проводит исследования и анализы в лаборатории', industry: 'Химическая' },
      { title: 'Биотехнолог', description: 'Разрабатывает биологические продукты и технологии', industry: 'Биотехнологии' },
      { title: 'Программист АСУ ТП', description: 'Настраивает системы автоматизированного управления', industry: 'IT' },
      { title: 'Менеджер по продажам', description: 'Работает с клиентами и заключает сделки', industry: 'Торговля' },
      { title: 'Маркетолог', description: 'Разрабатывает стратегии продвижения продукции', industry: 'Маркетинг' },
      { title: 'Бухгалтер', description: 'Ведёт финансовый учёт и отчётность', industry: 'Финансы' },
      { title: 'Логист', description: 'Организует грузоперевозки и складскую логистику', industry: 'Логистика' },
      { title: 'Эколог', description: 'Контролирует соблюдение экологических норм', industry: 'Экология' }
    ];

    const professionIds = [];
    for (const p of professions) {
      const result = await db.runAsync(
        'INSERT INTO professions (title, description, industry) VALUES (?, ?, ?)',
        [p.title, p.description, p.industry]
      );
      professionIds.push(result.lastID);
    }
    console.log('Professions created:', professionIds.length);

    // === Create Enterprises ===
    const enterprises = [
      {
        name: 'Лаванда',
        description: 'Производство косметической продукции на основе натуральных компонентов. Современное оборудование, дружный коллектив, возможности для профессионального роста.',
        industry: 'Косметика',
        city: 'Киров',
        address: 'ул. Промышленная, 15',
        phone: '+7 (8332) 12-34-56',
        website: 'https://lavanda-kirov.ru',
        latitude: 58.5966,
        longitude: 49.6601,
        user_id: lavandaResult.lastID,
        professions: [5, 6, 11] // lab, biotech, ecol
      },
      {
        name: 'ЛеПласт',
        description: 'Производство пластиковых изделий и упаковки. Инновационные технологии литья, собственный конструкторский отдел.',
        industry: 'Пластик',
        city: 'Киров',
        address: 'Октябрьский пр., 88',
        phone: '+7 (8332) 98-76-54',
        website: 'https://leplast.ru',
        latitude: 58.6038,
        longitude: 49.6750,
        user_id: leplastResult.lastID,
        professions: [1, 2, 7] // engineer, CNC, programmer
      },
      {
        name: 'Кировский электромашиностроительный завод',
        description: 'Производство электродвигателей и генераторов для промышленности и транспорта. Более 50 лет опыта.',
        industry: 'Машиностроение',
        city: 'Киров',
        address: 'ул. Щорса, 54',
        phone: '+7 (8332) 45-67-89',
        website: 'https://kemz.ru',
        latitude: 58.5820,
        longitude: 49.6450,
        user_id: null,
        professions: [1, 3, 4] // engineer, welder, electrician
      },
      {
        name: 'АгроФьюжн',
        description: 'Производство продуктов питания из местного сырья. Современные технологии переработки и хранения.',
        industry: 'Пищевая промышленность',
        city: 'Кирово-Чепецк',
        address: 'ул. Промышленная, 7',
        phone: '+7 (8332) 77-88-99',
        website: 'https://agrofusion.ru',
        latitude: 58.5530,
        longitude: 50.0350,
        user_id: null,
        professions: [1, 10, 11] // engineer, logistics, ecol
      },
      {
        name: 'ВяткаТелеком',
        description: 'Телекоммуникационная компания, предоставляющая услуги связи и интернета по всей области.',
        industry: 'IT и связь',
        city: 'Киров',
        address: 'ул. Ленина, 100',
        phone: '+7 (8332) 55-44-33',
        website: 'https://vyatkacom.ru',
        latitude: 58.5885,
        longitude: 49.6820,
        user_id: null,
        professions: [7, 8, 9] // programmer, sales, marketing
      },
      {
        name: 'МеталлПро',
        description: 'Производство металлоконструкций и изделий из металла для строительства и промышленности.',
        industry: 'Металлургия',
        city: 'Слободской',
        address: 'ул. Индустриальная, 22',
        phone: '+7 (8332) 66-77-88',
        website: 'https://metallpro-kirov.ru',
        latitude: 58.7310,
        longitude: 50.1680,
        user_id: null,
        professions: [1, 2, 3] // engineer, CNC, welder
      }
    ];

    const enterpriseIds = [];
    for (const e of enterprises) {
      const result = await db.runAsync(
        `INSERT INTO enterprises (name, description, industry, city, address, phone, website, latitude, longitude, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.name, e.description, e.industry, e.city, e.address, e.phone, e.website, e.latitude, e.longitude, e.user_id]
      );
      enterpriseIds.push(result.lastID);

      // Link professions
      for (const profId of e.professions) {
        await db.runAsync(
          'INSERT INTO enterprise_professions (enterprise_id, profession_id) VALUES (?, ?)',
          [result.lastID, profId]
        );
      }
    }
    console.log('Enterprises created:', enterpriseIds.length);

    // === Create Slots for next 2 weeks ===
    const today = new Date();
    const slots = [];

    for (const entId of enterpriseIds) {
      for (let day = 1; day <= 14; day++) {
        const slotDate = new Date(today);
        slotDate.setDate(today.getDate() + day);

        // Skip some days randomly for variety
        if (Math.random() > 0.6) continue;

        const dateStr = slotDate.toISOString().split('T')[0];
        const times = ['09:00', '11:00', '14:00', '16:00'];

        // Add 2-3 slots per enterprise per day
        const timesToAdd = times.slice(0, 2 + Math.floor(Math.random() * 2));
        for (const time of timesToAdd) {
          slots.push({
            enterprise_id: entId,
            date: dateStr,
            time: time,
            max_participants: 8 + Math.floor(Math.random() * 5)
          });
        }
      }
    }

    for (const s of slots) {
      await db.runAsync(
        'INSERT INTO slots (enterprise_id, date, time, max_participants) VALUES (?, ?, ?, ?)',
        [s.enterprise_id, s.date, s.time, s.max_participants]
      );
    }
    console.log('Slots created:', slots.length);

    // === Create Educational Institutions ===
    const institutions = [
      { name: 'Вятский государственный университет', type: 'вуз', website: 'https://vyatsu.ru' },
      { name: 'Кировский технологический колледж', type: 'колледж', website: 'https://ktk-kirov.ru' },
      { name: 'Кировский авиационный техникум', type: 'техникум', website: 'https://kavt-kirov.ru' }
    ];

    const institutionIds = [];
    for (const inst of institutions) {
      const result = await db.runAsync(
        'INSERT INTO educational_institutions (name, type, website) VALUES (?, ?, ?)',
        [inst.name, inst.type, inst.website]
      );
      institutionIds.push(result.lastID);
    }
    console.log('Educational institutions created:', institutionIds.length);

    // Link some professions to institutions
    // Инженер-технолог (1) -> ВятГУ, КАВТ
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [1, institutionIds[0]]);
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [1, institutionIds[2]]);
    // Программист АСУ ТП (7) -> ВятГУ, КТК
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [7, institutionIds[0]]);
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [7, institutionIds[1]]);
    // Лаборант (5) -> ВятГУ
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [5, institutionIds[0]]);
    // Биотехнолог (6) -> ВятГУ
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [6, institutionIds[0]]);
    // Электромонтажник (4) -> КАВТ
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [4, institutionIds[2]]);
    // Сварщик (3) -> КТК
    await db.runAsync('INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)', [3, institutionIds[1]]);
    console.log('Profession-institution links created');

    // === Create Vacancies ===
    // Лаванда: лаборант (5) - 2 места, биотехнолог (6) - 1 место
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[0], 5, 2]
    );
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[0], 6, 1]
    );
    // ЛеПласт: инженер-технолог (1) - 3 места, оператор ЧПУ (2) - 5 мест
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[1], 1, 3]
    );
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[1], 2, 5]
    );
    // КЭМЗ: сварщик (3) - 2 места
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[2], 3, 2]
    );
    console.log('Vacancies created');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();