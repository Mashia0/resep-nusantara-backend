const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// Database config
const dbConfig = {
  host: process.env.DB_HOST || '34.50.74.33',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'user_2311522028',
  database: process.env.DB_NAME || 'db_2311522028',
};

// Create DB pool
const pool = mysql.createPool(dbConfig);

// Initialize table if not exists
async function initDB() {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS resep (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_masakan VARCHAR(100) NOT NULL,
        asal_daerah VARCHAR(100) NOT NULL,
        bahan_utama TEXT NOT NULL,
        tingkat_kesulitan ENUM('Mudah', 'Sedang', 'Sulit') NOT NULL DEFAULT 'Sedang',
        waktu_masak INT NOT NULL COMMENT 'dalam menit',
        porsi INT NOT NULL DEFAULT 2,
        deskripsi TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  }
}

// =====================
// GET /health
// =====================
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
  }

  const status = dbStatus === 'connected' ? 'success' : 'error';
  const message =
    dbStatus === 'connected'
      ? 'Backend is running'
      : 'Backend is running, but database is not connected';

  res.status(dbStatus === 'connected' ? 200 : 500).json({
    status,
    message,
    database: dbStatus,
    student: {
      name: 'Mashia Zavira Septyana',     
      nim: '2311522028',         
    },
  });
});

// =====================
// GET /schema
// =====================
app.get('/schema', (req, res) => {
  res.json({
    student: {
      name: 'Mashia Zavira Septyana',         // <-- GANTI DENGAN NAMA KAMU
      nim: '2311522028',          // <-- GANTI DENGAN NIM KAMU
    },
    resource: {
      name: 'resep',
      label: 'Data Resep Masakan Nusantara',
      description: 'Aplikasi untuk mengelola data resep masakan tradisional Nusantara',
    },
    fields: [
      { name: 'nama_masakan',    label: 'Nama Masakan',     type: 'text',   required: true,  showInTable: true },
      { name: 'asal_daerah',     label: 'Asal Daerah',      type: 'text',   required: true,  showInTable: true },
      { name: 'bahan_utama',     label: 'Bahan Utama',      type: 'text',   required: true,  showInTable: true },
      { name: 'tingkat_kesulitan', label: 'Tingkat Kesulitan', type: 'select', required: true, showInTable: true,
        options: ['Mudah', 'Sedang', 'Sulit'] },
      { name: 'waktu_masak',     label: 'Waktu Masak (menit)', type: 'number', required: true, showInTable: true },
      { name: 'porsi',           label: 'Porsi (orang)',    type: 'number', required: false, showInTable: false },
      { name: 'deskripsi',       label: 'Deskripsi',        type: 'textarea', required: false, showInTable: false },
    ],
    endpoints: {
      list:   '/resep',
      detail: '/resep/{id}',
      create: '/resep',
      update: '/resep/{id}',
      delete: '/resep/{id}',
    },
  });
});

// =====================
// GET /resep  (semua data)
// =====================
app.get('/resep', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM resep ORDER BY created_at DESC');
    res.json({
      status: 'success',
      message: 'Data retrieved successfully',
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// =====================
// GET /resep/:id
// =====================
app.get('/resep/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM resep WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Data not found' });
    }
    res.json({ status: 'success', message: 'Data retrieved successfully', data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// =====================
// POST /resep
// =====================
app.post('/resep', async (req, res) => {
  const { nama_masakan, asal_daerah, bahan_utama, tingkat_kesulitan, waktu_masak, porsi, deskripsi } = req.body;

  if (!nama_masakan || !asal_daerah || !bahan_utama || !tingkat_kesulitan || !waktu_masak) {
    return res.status(400).json({
      status: 'error',
      message: 'Field nama_masakan, asal_daerah, bahan_utama, tingkat_kesulitan, dan waktu_masak wajib diisi',
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO resep (nama_masakan, asal_daerah, bahan_utama, tingkat_kesulitan, waktu_masak, porsi, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nama_masakan, asal_daerah, bahan_utama, tingkat_kesulitan, waktu_masak, porsi || 2, deskripsi || null]
    );
    const [newRow] = await pool.query('SELECT * FROM resep WHERE id = ?', [result.insertId]);
    res.status(201).json({ status: 'success', message: 'Data created successfully', data: newRow[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// =====================
// PUT /resep/:id
// =====================
app.put('/resep/:id', async (req, res) => {
  const { nama_masakan, asal_daerah, bahan_utama, tingkat_kesulitan, waktu_masak, porsi, deskripsi } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM resep WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Data not found' });
    }

    const current = existing[0];
    await pool.query(
      'UPDATE resep SET nama_masakan=?, asal_daerah=?, bahan_utama=?, tingkat_kesulitan=?, waktu_masak=?, porsi=?, deskripsi=? WHERE id=?',
      [
        nama_masakan     || current.nama_masakan,
        asal_daerah      || current.asal_daerah,
        bahan_utama      || current.bahan_utama,
        tingkat_kesulitan || current.tingkat_kesulitan,
        waktu_masak      || current.waktu_masak,
        porsi            !== undefined ? porsi : current.porsi,
        deskripsi        !== undefined ? deskripsi : current.deskripsi,
        req.params.id,
      ]
    );

    const [updated] = await pool.query('SELECT * FROM resep WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data updated successfully', data: updated[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// =====================
// DELETE /resep/:id
// =====================
app.delete('/resep/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM resep WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Data not found' });
    }

    await pool.query('DELETE FROM resep WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await initDB();
});
