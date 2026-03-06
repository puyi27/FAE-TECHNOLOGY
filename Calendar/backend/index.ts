import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg'; // Importación completa del paquete

const { Pool } = pg; // Extraemos el Pool manualmente

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. OBTENER TODOS LOS USUARIOS Y SUS PRESENCIAS ---
app.get('/api/users', async (req, res) => {
  const query = `
    SELECT u.*, 
    COALESCE(
      json_agg(
        json_build_object(
          'id_presence', p.id_presence,
          'date', p.date,
          'categories', json_build_object(
            'id_category', c.id_category,
            'name', c.name,
            'icon', c.icon
          )
        )
      ) FILTER (WHERE p.id_presence IS NOT NULL), '[]'
    ) as presences
    FROM users u
    LEFT JOIN presences p ON u.id_user = p.id_user
    LEFT JOIN categories c ON p.id_category = c.id_category
    GROUP BY u.id_user
    ORDER BY u.full_name ASC;
  `;

  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Errore caricamento utenti" });
  }
});

// --- 2. OBTENER CATEGORÍAS (Para el Modal) ---
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id_category ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Errore caricamento categorie" });
  }
});

// --- 3. AÑADIR O ACTUALIZAR PRESENCIA (Upsert SQL) ---
app.post('/api/presences', async (req, res) => {
  const { id_user, date, id_category } = req.body;

  // Este query inserta o, si ya existe el usuario y la fecha, actualiza la categoría
  const query = `
    INSERT INTO presences (id_user, date, id_category)
    VALUES ($1, $2, $3)
    ON CONFLICT (id_user, date) 
    DO UPDATE SET id_category = EXCLUDED.id_category
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [id_user, date, id_category]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al guardar presencia:", error);
    res.status(500).json({ error: "Errore salvataggio presenza" });
  }
});

// --- 4. ELIMINAR PRESENCIA ---
app.delete('/api/presences', async (req, res) => {
  const { id_user, date } = req.body;
  try {
    await pool.query('DELETE FROM presences WHERE id_user = $1 AND date = $2', [id_user, date]);
    res.json({ message: "Eliminato con successo" });
  } catch (error) {
    res.status(500).json({ error: "Errore eliminazione" });
  }
});

// --- 5. CREAR USUARIO (POST) ---
app.post('/api/users', async (req, res) => {
  const { full_name, phoneNumber, alias, work } = req.body;
  
  try {
    // IMPORTANTE: Mantenemos "phoneNumber" entre comillas por si Postgres es estricto con las mayúsculas
    const query = `
      INSERT INTO users (full_name, "phoneNumber", alias, work)
      VALUES ($1, $2, $3, $4) RETURNING *`;
      
    const result = await pool.query(query, [
      full_name, 
      phoneNumber || null, 
      alias || full_name.split(' ')[0].substring(0, 10), 
      work || 'Dipendente'
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    // Ahora verás exactamente por qué falla Postgres en la consola de tu terminal
    console.error("🔴 Error real en Postgres (Crear):", error);
    res.status(500).json({ error: "Errore creazione utente" });
  }
});

// --- 6. ACTUALIZAR USUARIO (PUT) ---
app.put('/api/users/:id_user', async (req, res) => {
  const { id_user } = req.params;
  const { full_name, phoneNumber, alias, work } = req.body;
  
  try {
    const query = `
      UPDATE users 
      SET full_name = $1, "phoneNumber" = $2, alias = $3, work = $4
      WHERE id_user = $5 RETURNING *`;
      
    const result = await pool.query(query, [
      full_name, 
      phoneNumber || null, 
      alias, 
      work, 
      id_user
    ]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("🔴 Error real en Postgres (Actualizar):", error);
    res.status(500).json({ error: "Errore aggiornamento utente" });
  }
});
// --- 7. ELIMINAR USUARIO (DELETE) ---
app.delete('/api/users/:id_user', async (req, res) => {
  const { id_user } = req.params;
  
  try {
    // ⚠️ ATENCIÓN: Si este usuario tiene registros en la tabla "presences", 
    // y tu base de datos no tiene "ON DELETE CASCADE" configurado, 
    // Postgres no te dejará borrarlo.
    
    // Por si acaso, borramos primero sus presencias asociadas (opcional pero seguro)
    await pool.query('DELETE FROM presences WHERE id_user = $1', [id_user]);
    
    // Ahora sí, borramos al usuario
    const query = 'DELETE FROM users WHERE id_user = $1 RETURNING *';
    const result = await pool.query(query, [id_user]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    
    res.json({ message: "Utente eliminato con successo", deletedUser: result.rows[0] });
  } catch (error) {
    console.error("🔴 Error real en Postgres (Eliminar):", error);
    res.status(500).json({ error: "Errore eliminazione utente" });
  }
});
// POST: Crear categoría
app.post('/api/categories', async (req, res) => {
  const { name, icon } = req.body; // 👈 Quitamos description
  try {
    const query = `INSERT INTO categories (name, icon) VALUES ($1, $2) RETURNING *`;
    const result = await pool.query(query, [name, icon]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Errore creazione" });
  }
});

// PUT: Actualizar categoría
app.put('/api/categories/:id_category', async (req, res) => {
  const { id_category } = req.params;
  const { name, icon } = req.body; // 👈 Quitamos description
  try {
    const query = `UPDATE categories SET name = $1, icon = $2 WHERE id_category = $3 RETURNING *`;
    const result = await pool.query(query, [name, icon, id_category]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Errore aggiornamento" });
  }
});

// --- ELIMINAR CATEGORÍA (DELETE) ---
app.delete('/api/categories/:id_category', async (req, res) => {
  const { id_category } = req.params;
  try {
    // IMPORTANTE: Primero borramos las presencias asociadas a esta categoría para que Postgres no explote por las llaves foráneas
    await pool.query('DELETE FROM presences WHERE id_category = $1', [id_category]);
    
    // Ahora borramos la categoría
    await pool.query('DELETE FROM categories WHERE id_category = $1', [id_category]);
    res.json({ message: "Categoria eliminata con successo" });
  } catch (error) {
    console.error("🔴 Error real en Postgres (Eliminar Categoría):", error);
    res.status(500).json({ error: "Errore eliminazione categoria" });
  }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
});