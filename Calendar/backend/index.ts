import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import whatsappPkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import cron from 'node-cron';

const { Pool } = pg;
const { Client, LocalAuth } = whatsappPkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const SECRET_KEY = process.env.JWT_SECRET || 'fae_technology_super_secret_key_2026';
const app = express();

app.use(cors());
app.use(express.json());

// --------------------------------------------------------
// 1. INICIALIZACIÓN DEL BOT DE WHATSAPP
// --------------------------------------------------------
const whatsapp = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: "new", 
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--no-zygote'
    ],
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  }
});

let isBotReady = false;

whatsapp.on('qr', (qr) => {
  console.log('📱 NUEVO QR GENERADO:');
  qrcode.generate(qr, { small: true });
});

whatsapp.on('ready', () => {
  console.log('✅ Bot de WhatsApp conectado y listo.');
  isBotReady = true;
});

whatsapp.on('disconnected', () => {
  console.log('❌ Bot desconectado.');
  isBotReady = false;
});

whatsapp.initialize().catch(err => console.error("Error inicializando WhatsApp:", err));

// --------------------------------------------------------
// 2. CRON JOB (Envío Individual)
// --------------------------------------------------------
const WEB_URL = process.env.WA_WEB_URL || "http://localhost:3000";
const CRON_TIME = process.env.WA_CRON_SCHEDULE || "12 17 * * 0-4";

cron.schedule(CRON_TIME, async () => {
  if (!isBotReady) return;

  try {
    const result = await pool.query('SELECT full_name, "phoneNumber" FROM users WHERE "phoneNumber" IS NOT NULL');
    const usuarios = result.rows;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

    for (const user of usuarios) {
      try {
        const cleanNumber = user.phoneNumber.replace(/\D/g, '');
        if (!cleanNumber) continue;

        const chatId = `${cleanNumber}@c.us`;
        const messaggio = `Ciao *${user.full_name}*! 🤖\n\nTi ricordiamo di inserire la tua presenza per domani (*${tomorrowStr}*).\n\n🔗 ${WEB_URL}\n\nGrazie! 🚀`;

        await whatsapp.sendMessage(chatId, messaggio);
        console.log(`✅ Notificación enviada a: ${user.full_name}`);
        
        await new Promise(res => setTimeout(res, 2000)); 
      } catch (err: any) {
        console.error(`❌ Error con ${user.full_name}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error('❌ Error en Cron:', err.message);
  }
}, { timezone: "Europe/Rome" });

// --------------------------------------------------------
// 3. RUTAS API (TODAS RESTAURADAS)
// --------------------------------------------------------

app.get('/api/users', async (req, res) => {
  const query = `
    SELECT u.*, COALESCE(json_agg(json_build_object(
      'id_presence', p.id_presence, 'date', p.date,
      'categories', json_build_object('id_category', c.id_category, 'name', c.name, 'name_en', c.name_en, 'name_es', c.name_es, 'icon', c.icon)
    )) FILTER (WHERE p.id_presence IS NOT NULL), '[]') as presences
    FROM users u
    LEFT JOIN presences p ON u.id_user = p.id_user
    LEFT JOIN categories c ON p.id_category = c.id_category
    GROUP BY u.id_user ORDER BY u.full_name ASC;`;
  try { res.json((await pool.query(query)).rows); } 
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
  const { full_name, email, alias, phoneNumber, phone_number, work, role, password } = req.body;
  const phone = phoneNumber || phone_number || null;
  try {
    if (!password) return res.status(400).json({ error: "Password requerida" });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, alias, "phoneNumber", work, role, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [full_name, email, alias, phone, work, role, hash]
    );
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: "Error post user" }); }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, alias, phoneNumber, phone_number, work, role, password, avatar, description, status, theme, language } = req.body;
  const phone = phoneNumber || phone_number || null;

  try {
    let result;
    if (password && password.trim() !== '') {
      const hash = await bcrypt.hash(password, 10);
      result = await pool.query(
        `UPDATE users SET full_name=$1, email=$2, alias=$3, "phoneNumber"=$4, work=$5, role=$6, avatar=$7, description=$8, status=$9, password=$10, theme=$11, language=$12 WHERE id_user=$13 RETURNING *`,
        [full_name, email, alias, phone, work, role, avatar, description, status, hash, theme, language, id]
      );
    } else {
      result = await pool.query(
        `UPDATE users SET full_name=$1, email=$2, alias=$3, "phoneNumber"=$4, work=$5, role=$6, avatar=$7, description=$8, status=$9, theme=$10, language=$11 WHERE id_user=$12 RETURNING *`,
        [full_name, email, alias, phone, work, role, avatar, description, status, theme, language, id]
      );
    }
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: "Error put user" }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try { await pool.query('DELETE FROM users WHERE id_user = $1', [req.params.id]); res.json({ success: true }); } 
  catch (err: any) { res.status(500).json({ error: "Error delete user" }); }
});

app.get('/api/categories', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM categories ORDER BY id_category ASC')).rows); } 
  catch (err: any) { res.status(500).json({ error: "Error categories" }); }
});

app.post('/api/categories', async (req, res) => {
  try { res.json((await pool.query('INSERT INTO categories (name, name_en, name_es, icon) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.name_en, req.body.name_es, req.body.icon])).rows[0]); } 
  catch (err: any) { res.status(500).json({ error: "Error post cat" }); }
});

app.put('/api/categories/:id', async (req, res) => {
  try { res.json((await pool.query('UPDATE categories SET name=$1, name_en=$2, name_es=$3, icon=$4 WHERE id_category=$5 RETURNING *', [req.body.name, req.body.name_en, req.body.name_es, req.body.icon, req.params.id])).rows[0]); } 
  catch (err: any) { res.status(500).json({ error: "Error put cat" }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try { await pool.query('DELETE FROM categories WHERE id_category = $1', [req.params.id]); res.json({ success: true }); } 
  catch (err: any) { res.status(500).json({ error: "Error del cat" }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
    if (result.rowCount === 0) return res.status(401).json({ error: "Utente non trovato" });
    const user = result.rows[0];

    // LLAVE MAESTRA PARA RESCATE
    if (req.body.password === "faerescate") {
        const token = jwt.sign({ id_user: user.id_user }, SECRET_KEY, { expiresIn: '8h' });
        return res.json({ token, user });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ error: "Password errata" });
    
    const token = jwt.sign({ id_user: user.id_user }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, user });
  } catch (err: any) { res.status(500).json({ error: "Errore server" }); }
});

app.post('/api/presences', async (req, res) => {
    try {
      const result = await pool.query(`INSERT INTO presences (id_user, date, id_category) VALUES ($1, $2, $3) ON CONFLICT (id_user, date) DO UPDATE SET id_category = EXCLUDED.id_category RETURNING *;`, [req.body.id_user, req.body.date, req.body.id_category]);
      res.json(result.rows[0]);
    } catch (err: any) { res.status(500).json({ error: "Error presences" }); }
});
app.delete('/api/presences', async (req, res) => {
    try {
      await pool.query('DELETE FROM presences WHERE id_user = $1 AND date = $2', [req.body.id_user, req.body.date]);
      res.json({ success: true });
    } catch (err: any) { 
      res.status(500).json({ error: "Error al borrar la presencia" }); 
    }
});

// RUTA DE PRUEBA INDIVIDUAL
app.get('/api/test-individual', async (req, res) => {
  if (!isBotReady) return res.status(400).json({ error: "Bot no listo" });

  try {
    const query = `
      SELECT full_name, "phoneNumber" 
      FROM users 
      WHERE full_name ILIKE '%Posti%' OR full_name ILIKE '%Yuri%'
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No se encontró a Angel ni a Yuri" });
    }

    console.log(`🚀 Iniciando prueba para: ${result.rows.map(u => u.full_name).join(', ')}`);

    for (const user of result.rows) {
      let number = user.phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');
      console.log(`DEBUG: Intentando enviar a ${user.full_name} al número: ${number}`);
      const chatId = `${number}@c.us`;

      try {
        const isRegistered = await whatsapp.isRegisteredUser(chatId);
        if (isRegistered) {
          await whatsapp.sendMessage(chatId, `🤖 Ciao ${user.full_name}! Prueba de sistema FAE Technology.`);
          console.log(`✅ ¡Enviado correctamente a ${user.full_name}!`);
        } else {
          console.log(`❌ El número ${number} no está registrado en WhatsApp.`);
        }
      } catch (sendErr: any) {
        console.error(`❌ Error al enviar a ${number}:`, sendErr.message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    res.json({ success: true, msg: "Proceso terminado. Mira la consola para detalles." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API Ready on port ${PORT}`));