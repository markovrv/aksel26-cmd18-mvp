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
    const adminHash = await bcrypt.hash('Admin123!', saltRounds);
    const lavandaHash = await bcrypt.hash('Lavanda456!', saltRounds);
    const leplastHash = await bcrypt.hash('Leplast321!', saltRounds);
    const userHash = await bcrypt.hash('Test1234!', saltRounds);
    const mayakHash = await bcrypt.hash('Mayak789!', saltRounds);

    // Admin — Никита Подлевских (как на prod)
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@zavodych.ru', adminHash, 'Никита Подлевских', 'admin', 1, 0]
    );

    // Enterprise users
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['lavanda@zavodych.ru', lavandaHash, 'Марина Сидорова', 'enterprise', 1, 0]
    );
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['leplast@zavodych.ru', leplastHash, 'Ольга Кузнецова', 'enterprise', 1, 0]
    );
    // Нанолек привязан к lavanda (user_id=2 на prod — Марина Сидорова)
    // Маяк — отдельный enterprise пользователь
    await db.runAsync(
      `INSERT INTO users (email, password_hash, name, role, is_confirmed, is_blocked) VALUES (?, ?, ?, ?, ?, ?)`,
      ['mayak@zavodych.ru', mayakHash, 'Маяк Маякович', 'enterprise', 1, 0]
    );

    // Regular users
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
    console.log('Users created: 4 enterprise + 4 regular + admin');

    // === Create Professions (с image_url и video_url как на prod) ===
    const professions = [
      {
        title: 'Инженер-технолог',
        description: 'Разрабатывает и внедряет технологические процессы производства',
        industry: 'Производство',
        video_url: '',
        image_url: 'https://sun9-10.userapi.com/s/v1/ig2/daaR2AvnniyIE6WWBVvAzeI5TSsQoCp0ezzgS14A-n9CfNY5WfNsqans1i3CSgmsYQJUQgbxxYt-c1e-WO_fb5C2.jpg?quality=95&as=32x27,48x40,72x60,108x91,160x134,240x202,360x302,480x403,540x453,640x537,720x605,736x618&from=bu&cs=736x0'
      },
      {
        title: 'Оператор станков с ЧПУ',
        description: 'Управляет автоматизированным оборудованием',
        industry: 'Производство',
        video_url: '',
        image_url: 'https://sun9-11.userapi.com/s/v1/ig2/1UsvzZzl9_k30kb1aGmSmFXuZ99tonlyKjC1Nd9KMYG_9h73gziXLleglN8vLJoiwaYb6IHM1mhgYbIinzq5nfyD.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,736x736&from=bu&cs=736x0'
      },
      {
        title: 'Сварщик',
        description: 'Соединяет металлические конструкции различными способами',
        industry: 'Производство',
        video_url: '',
        image_url: 'https://sun59-1.userapi.com/s/v1/ig2/BDbRZeF_gXpTu4z1fccQHWDNoRDV_GIavdPoLkwskDD18WaY1yUhT28SEVp1LSuUsgXf6GrzOhOHot0ER5t471Xi.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,512x512&from=bu&cs=512x0'
      },
      {
        title: 'Электромонтажник',
        description: 'Монтирует и обслуживает электрические сети и оборудование',
        industry: 'Энергетика',
        video_url: '',
        image_url: 'https://sun9-85.userapi.com/s/v1/ig2/P42QBsUD0BZGg_0hvNLCMpO13yF_dVxAON2kCdQnS-qLbaPDcmtcM7tAd1AYdqPLx41UheDrQ54X0q_X77Tvs_mp.jpg?quality=95&as=32x31,48x47,72x71,108x106,160x157,240x236,360x354,480x472,540x531,615x605&from=bu&cs=615x0'
      },
      {
        title: 'Лаборант химического анализа',
        description: 'Проводит исследования и анализы в лаборатории',
        industry: 'Химическая',
        video_url: '',
        image_url: 'https://sun9-57.userapi.com/s/v1/ig2/45C1zn7Mbof3VqgZyv4fWVo45vw6-ffRxfWq7bC0AxjAyeTYX8jGmr8g1TsdVQQRwXz1-7F3GmHhaywHTNTaSJLE.jpg?quality=95&as=32x18,48x26,72x40,108x59,160x88,240x132,360x198,480x264,540x297,640x352,720x396,735x404&from=bu&cs=735x0'
      },
      {
        title: 'Биотехнолог',
        description: 'Разрабатывает биологические продукты и технологии',
        industry: 'Биотехнологии',
        video_url: 'https://vkvideo.ru/video_ext.php?oid=-238878105&id=456239017&hash=333a2589a275c36e&hd=3',
        image_url: 'https://sun9-27.userapi.com/s/v1/ig2/SV7vBQRBIfYlkRThEbWMSFVJdiapMNjH-LxuO7xPguIOE3RpadDuXLYkeelEWPF-WX-zH1LssbUPZbX4UzNy1kgB.jpg?quality=95&as=32x27,48x40,72x60,108x90,160x133,240x200,360x300,480x399,540x449,626x521&from=bu&cs=626x0'
      },
      {
        title: 'Программист АСУ ТП',
        description: 'Настраивает системы автоматизированного управления',
        industry: 'IT',
        video_url: '',
        image_url: 'https://sun59-2.userapi.com/s/v1/ig2/cfK3lDIC36kCqNi5u1rTy4IarXvuIVd4Mrvm8ssBVGMU5NroUmRkidxdVYahFxXcUu-xT-PsP7zBQ_AzpEhaY7No.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,736x736&from=bu&cs=736x0'
      },
      {
        title: 'Менеджер по продажам',
        description: 'Работает с клиентами и заключает сделки',
        industry: 'Торговля',
        video_url: '',
        image_url: 'https://sun9-20.userapi.com/s/v1/ig2/h_5HI6iHbFqLAR0SEpMx-W0DdIRC497u8I6oq8qQ1Sbz2c0cNgplUebhMCiuK1AQsP61cDc4tWuCs9PR6SVtdy98.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,736x736&from=bu&cs=736x0'
      },
      {
        title: 'Маркетолог',
        description: 'Разрабатывает стратегии продвижения продукции',
        industry: 'Маркетинг',
        video_url: '',
        image_url: 'https://sun9-79.userapi.com/s/v1/ig2/Yf1hPG_MZRBh0pIy45PiQa-vN6UJZnYkfnBM9VZ09Fek7OixNf42ktDQLaQRiQelz_YUvHdmPkiwIboDOnLRJFX2.jpg?quality=95&as=32x31,48x47,72x70,108x105,160x155,240x233,360x349,480x465,540x524,557x540&from=bu&cs=557x0'
      },
      {
        title: 'Бухгалтер',
        description: 'Ведёт финансовый учёт и отчётность',
        industry: 'Финансы',
        video_url: '',
        image_url: 'https://sun9-79.userapi.com/s/v1/ig2/83lr6ojhkOXQ-jNkRUBAI5wm_OTZSXXhJtdMa-bEvq9avPVkpSvu2U_geRVgQLPMKKiZ2f64FLnKQp6WZPK_isOQ.jpg?quality=95&as=32x19,48x29,72x44,108x65,160x97,240x145,360x218,480x290,540x326,640x387,720x435,736x445&from=bu&cs=736x0'
      },
      {
        title: 'Логист',
        description: 'Организует грузоперевозки и складскую логистику',
        industry: 'Логистика',
        video_url: '',
        image_url: 'https://sun59-1.userapi.com/s/v1/ig2/hNrwOlLR86c1iaFxYrrGJkU2iWE7y2hJY-X2V52ZoHG2rN-X_fFETayekVmJxrhTuMl_UyBSlez1fXgCrxpvvPCG.jpg?quality=95&as=32x18,48x27,72x40,108x61,160x90,240x135,360x202,480x270,540x304,640x360,720x405,736x414&from=bu&cs=736x0'
      },
      {
        title: 'Эколог',
        description: 'Контролирует соблюдение экологических норм',
        industry: 'Экология',
        video_url: '',
        image_url: 'https://sun9-78.userapi.com/s/v1/ig2/jlV5-Y3Ci49ClOddMfIUOz_FULaTJORd6JIpt5IERHL6HfCScMDLufZ6_JkkOJwI7HWfd7_FN9nMtpQI_-PU1Eyg.jpg?quality=95&as=32x21,48x32,72x48,108x72,160x107,240x160,360x240,480x320,540x360,640x427,720x480,735x490&from=bu&cs=735x0'
      }
    ];

    const professionIds = [];
    for (const p of professions) {
      const result = await db.runAsync(
        'INSERT INTO professions (title, description, industry, video_url, image_url) VALUES (?, ?, ?, ?, ?)',
        [p.title, p.description, p.industry, p.video_url, p.image_url]
      );
      professionIds.push(result.lastID);
    }
    console.log('Professions created:', professionIds.length);

    // === Create Enterprises (как на prod, но без мусорного "паивм") ===
    // На prod 8 предприятий. Пропускаем id=8 (паивм — тестовый мусор).
    // Создаём 7 нормальных предприятий.
    const enterprises = [
      {
        name: 'АгроФьюжн',
        description: 'Производство продуктов питания из местного сырья. Современные технологии переработки и хранения.',
        industry: 'Пищевая промышленность',
        city: 'Кирово-Чепецк',
        address: 'ул. Промышленная, 7',
        phone: '+7 (8332) 77-88-99',
        website: 'https://agrofusion.ru',
        photo_url: null,
        latitude: 58.553,
        longitude: 50.035,
        user_id: null,
        professions: [1, 10, 11] // Инженер-технолог, Бухгалтер, Логист
      },
      {
        name: 'ВяткаТелеком',
        description: 'Телекоммуникационная компания, предоставляющая услуги связи и интернета по всей области.',
        industry: 'IT и связь',
        city: 'Киров',
        address: 'ул. Ленина, 100',
        phone: '+7 (8332) 55-44-33',
        website: 'https://vyatkacom.ru',
        photo_url: null,
        latitude: 58.5885,
        longitude: 49.682,
        user_id: null,
        professions: [7, 8, 9] // Программист, Менеджер, Маркетолог
      },
      {
        name: 'Кировский электромашиностроительный завод',
        description: 'Производство электродвигателей и генераторов для промышленности и транспорта. Более 50 лет опыта.',
        industry: 'Машиностроение',
        city: 'Киров',
        address: 'ул. Щорса, 54',
        phone: '+7 (8332) 45-67-89',
        website: 'https://kemz.ru',
        photo_url: null,
        latitude: 58.582,
        longitude: 49.645,
        user_id: null,
        professions: [1, 3, 4] // Инженер, Сварщик, Электромонтажник
      },
      {
        name: 'ЛеПласт',
        description: 'Производство пластиковых изделий и упаковки. Инновационные технологии литья, собственный конструкторский отдел.',
        industry: 'Пластик',
        city: 'Киров',
        address: 'Октябрьский пр., 88',
        phone: '+7 (8332) 98-76-54',
        website: 'https://leplast.ru',
        photo_url: null,
        latitude: 58.6038,
        longitude: 49.675,
        user_id: 3, // Ольга Кузнецова (leplast@)
        professions: [1, 2, 7] // Инженер, Оператор ЧПУ, Программист
      },
      {
        name: 'МеталлПро',
        description: 'Производство металлоконструкций и изделий из металла для строительства и промышленности.',
        industry: 'Металлургия',
        city: 'Слободской',
        address: 'ул. Индустриальная, 22',
        phone: '+7 (8332) 66-77-88',
        website: 'https://metallpro-kirov.ru',
        photo_url: null,
        latitude: 58.731,
        longitude: 50.168,
        user_id: null,
        professions: [1, 2, 3] // Инженер, Оператор ЧПУ, Сварщик
      },
      {
        name: 'ООО «Нанолек»',
        description: 'Российская биофармацевтическая компания, основанная в 2011 году; её производственный комплекс расположен в пгт Лёвинцы (Кировская область). Компания занимается разработкой и производством вакцин (в т.ч. первой российской вакцины против ВПЧ) и биотехнологических препаратов, с 2020 года входит в перечень системообразующих предприятий РФ.',
        industry: 'Фармацевтическая промышленность',
        city: 'Лёвинцы',
        address: 'улица 70-летия Октября, 142.',
        phone: '+7(83354)2-50-13',
        website: 'https://nanolek.ru/ru/',
        photo_url: 'https://sun9-46.userapi.com/s/v1/ig2/44pzwIxj_c4YPBoIEtFqMImaGTYv-4zwRli4FMW1mofNWTzjtK2b2gXPBTCpS3AMgVDfbw1Ka4ULx8Cv6qjEMZWT.jpg?quality=95&as=32x18,48x27,72x40,108x61,160x90,240x135,360x202,480x270,540x303,640x360,720x405,1080x607,1280x719,1440x809,2141x1203&from=bu&cs=2141x0',
        latitude: 58.520761673267074,
        longitude: 49.46179674381612,
        user_id: 2, // Марина Сидорова (lavanda@)
        professions: [5, 6, 11] // Лаборант, Биотехнолог, Логист
      },
      {
        name: 'ПАО «Кировский завод «Маяк»',
        description: 'Машиностроительное предприятие в Кирове (основан в 1941 году), выпускающее военную технику и товары народного потребления. Награждён орденом Отечественной войны I степени и орденом Александра Невского.',
        industry: 'Машиностроение',
        city: 'Киров',
        address: 'ул. Молодой Гвардии, д. 67',
        phone: '+78332405299',
        website: 'https://kzmayak.ru',
        photo_url: 'https://sun9-11.userapi.com/s/v1/ig2/xzhym2jssg8W2kz0lyc6spshM5-E2BrlKM0F_sDCPttnOltsL-SFHK3chTwDh3STMIW6EmsfvaXyNIy-OSo7decm.jpg?quality=95&as=32x24,48x36,72x54,108x81,160x120,240x180,360x270,480x360,540x405,640x479,720x539,1080x809,1200x899&from=bu&u=Z5ear8BQX3GOgtaXDlAKoA9sShuUKx9QuFI0yw_b76c&cs=1200x0',
        latitude: 58.59875796692679,
        longitude: 49.65576264781492,
        user_id: 4, // Маяк Маякович (mayak@)
        professions: []
      }
    ];

    const enterpriseIds = [];
    for (const e of enterprises) {
      const result = await db.runAsync(
        `INSERT INTO enterprises (name, description, industry, city, address, phone, website, photo_url, latitude, longitude, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.name, e.description, e.industry, e.city, e.address, e.phone, e.website, e.photo_url, e.latitude, e.longitude, e.user_id]
      );
      enterpriseIds.push(result.lastID);

      // Link professions
      for (const profIdx of e.professions) {
        const profId = professionIds[profIdx - 1]; // 1-based index -> 0-based array
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

    // === Create Educational Institutions (все 22 с prod) ===
    const institutions = [
      { name: 'Волго-Вятский колледж информатики, финансов, права, управления', type: 'колледж', website: 'https://vvkifpu.ru' },
      { name: 'Вятский автомобильно-промышленный колледж', type: 'колледж', website: 'http://vapk.info' },
      { name: 'Вятский государственный агротехнологический университет', type: 'вуз', website: 'https://vgatu.ru' },
      { name: 'Вятский государственный университет', type: 'вуз', website: 'https://vyatsu.ru' },
      { name: 'Вятский гуманитарно-экономический колледж', type: 'колледж', website: 'https://www.vgek-kirov.ru' },
      { name: 'Вятский колледж профессиональных технологий, управления и сервиса', type: 'колледж', website: 'http://vyatktuis.ru' },
      { name: 'Вятский экономико-социальный колледж', type: 'колледж', website: 'https://vesk43.ru' },
      { name: 'Вятский электромашиностроительный техникум', type: 'техникум', website: 'https://vemst.ru' },
      { name: 'Вятско-Полянский механический техникум', type: 'техникум', website: 'https://www.vpmt.ru' },
      { name: 'Кировский авиационный техникум', type: 'техникум', website: 'https://aviakat.ru' },
      { name: 'Кировский автодорожный техникум', type: 'техникум', website: 'http://кгат.рф' },
      { name: 'Кировский государственный медицинский университет', type: 'вуз', website: 'https://kirovgma.ru' },
      { name: 'Кировский институт (филиал) Московского гуманитарно-экономического университета', type: 'вуз', website: 'https://mgeu-kirov.ru' },
      { name: 'Кировский лесопромышленный колледж', type: 'колледж', website: 'https://kirovlpk.ru' },
      { name: 'Кировский многопрофильный техникум', type: 'техникум', website: 'https://kmpt-kirov.gosuslugi.ru' },
      { name: 'Кировский технологический колледж', type: 'колледж', website: 'https://ktc-kirov.ru' },
      { name: 'Кировский технологический колледж пищевой промышленности', type: 'колледж', website: 'http://www.kpp.kirov.ru' },
      { name: 'Кировский филиал «Московского финансово-юридического университета»', type: 'вуз', website: 'https://kirov.mfua.ru' },
      { name: 'Кировский филиал «Санкт-Петербургского Гуманитарного университета профсоюзов»', type: 'вуз', website: 'https://spbgupkirov.ru' },
      { name: 'Кировский филиал Российской академии народного хозяйства и государственной службы при Президенте Российской Федерации', type: 'вуз', website: 'https://krv.ranepa.ru' },
      { name: 'Колледж «Топ Академия» (филиал Московского международного колледжа цифровых технологий «Академия ТОП»)', type: 'колледж', website: 'https://kir.top-academy.ru' },
      { name: 'Орлово-Вятский колледж педагогики и профессиональных технологий', type: 'колледж', website: 'https://vk.com/club125256232' }
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

    // === Link professions to institutions (как на prod) ===
    // Маппинг profession_id -> массив institution_id (по названиям)
    const instByName = {};
    for (let i = 0; i < institutions.length; i++) {
      instByName[institutions[i].name] = institutionIds[i];
    }

    const links = {
      1: ['Вятский государственный университет', 'Кировский технологический колледж пищевой промышленности'],
      2: ['Вятский автомобильно-промышленный колледж', 'Вятский электромашиностроительный техникум', 'Кировский авиационный техникум'],
      3: ['Вятский автомобильно-промышленный колледж', 'Вятский электромашиностроительный техникум', 'Вятско-Полянский механический техникум', 'Кировский автодорожный техникум'],
      4: ['Вятский электромашиностроительный техникум', 'Кировский многопрофильный техникум'],
      5: ['Вятский автомобильно-промышленный колледж', 'Вятский государственный университет', 'Кировский авиационный техникум'],
      6: ['Вятский государственный университет', 'Вятский колледж профессиональных технологий, управления и сервиса', 'Кировский государственный медицинский университет'],
      7: ['Волго-Вятский колледж информатики, финансов, права, управления', 'Вятский государственный университет', 'Кировский авиационный техникум'],
      8: ['Волго-Вятский колледж информатики, финансов, права, управления', 'Вятский государственный агротехнологический университет', 'Вятский государственный университет', 'Вятский колледж профессиональных технологий, управления и сервиса', 'Кировский технологический колледж', 'Кировский филиал «Московского финансово-юридического университета»', 'Кировский филиал Российской академии народного хозяйства и государственной службы при Президенте Российской Федерации'],
      9: ['Вятский государственный университет', 'Вятский гуманитарно-экономический колледж', 'Кировский государственный медицинский университет', 'Кировский институт (филиал) Московского гуманитарно-экономического университета', 'Кировский филиал «Московского финансово-юридического университета»', 'Кировский филиал «Санкт-Петербургского Гуманитарного университета профсоюзов»', 'Колледж «Топ Академия» (филиал Московского международного колледжа цифровых технологий «Академия ТОП»)'],
      10: ['Вятский государственный агротехнологический университет', 'Вятский государственный университет', 'Вятский гуманитарно-экономический колледж', 'Вятский экономико-социальный колледж', 'Кировский институт (филиал) Московского гуманитарно-экономического университета', 'Кировский лесопромышленный колледж', 'Орлово-Вятский колледж педагогики и профессиональных технологий'],
      11: ['Вятский автомобильно-промышленный колледж', 'Вятский государственный агротехнологический университет', 'Вятский гуманитарно-экономический колледж', 'Кировский лесопромышленный колледж'],
      12: ['Вятский государственный агротехнологический университет', 'Вятский государственный университет']
    };

    let linkCount = 0;
    for (const [profIdx, instNames] of Object.entries(links)) {
      const profId = professionIds[Number(profIdx) - 1]; // 1-based -> 0-based
      for (const instName of instNames) {
        const instId = instByName[instName];
        if (instId) {
          await db.runAsync(
            'INSERT INTO profession_educational_institutions (profession_id, institution_id) VALUES (?, ?)',
            [profId, instId]
          );
          linkCount++;
        }
      }
    }
    console.log('Profession-institution links created:', linkCount);

    // === Create Vacancies ===
    // Лаванда (Нанолек — id 6 в списке): лаборант (5) - 2 места, биотехнолог (6) - 1 место
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[5], professionIds[4], 2] // Нанолек + Лаборант
    );
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[5], professionIds[5], 1] // Нанолек + Биотехнолог
    );
    // ЛеПласт (id 4 в списке): инженер-технолог (1) - 3 места, оператор ЧПУ (2) - 5 мест
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[3], professionIds[0], 3] // ЛеПласт + Инженер
    );
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[3], professionIds[1], 5] // ЛеПласт + Оператор ЧПУ
    );
    // КЭМЗ (id 3 в списке): сварщик (3) - 2 места
    await db.runAsync(
      'INSERT INTO vacancies (enterprise_id, profession_id, available_slots) VALUES (?, ?, ?)',
      [enterpriseIds[2], professionIds[2], 2] // КЭМЗ + Сварщик
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