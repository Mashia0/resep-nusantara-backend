# 🍜 Resep Masakan Nusantara - Backend API

Backend REST API untuk aplikasi katalog resep masakan tradisional Nusantara.  
Dibuat menggunakan **Node.js + Express + MariaDB**, dideploy di **Google Cloud Platform**.

---

## ⚙️ Setup Lokal

### 1. Clone & Install
```bash
git clone <repo-url>
cd resep-nusantara-backend
npm install
```

### 2. Konfigurasi .env
Salin `.env.example` menjadi `.env`, lalu sesuaikan:
```env
PORT=3000
DB_HOST=<IP_VM_DATABASE>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=KomputasiAwan2026!
DB_NAME=db_<NIM_KAMU>
```

### 3. Jalankan
```bash
npm start
```

---

## 📋 Endpoint API

| Method | Endpoint     | Keterangan                        |
|--------|--------------|-----------------------------------|
| GET    | /health      | Cek status backend & database     |
| GET    | /schema      | Struktur data & daftar endpoint   |
| GET    | /resep       | Ambil semua data resep            |
| GET    | /resep/:id   | Ambil detail satu resep           |
| POST   | /resep       | Tambah resep baru                 |
| PUT    | /resep/:id   | Update data resep                 |
| DELETE | /resep/:id   | Hapus data resep                  |

---

## 📦 Struktur Data (Tabel `resep`)

| Field              | Tipe     | Keterangan                          |
|--------------------|----------|-------------------------------------|
| id                 | INT      | Primary key, auto increment         |
| nama_masakan       | VARCHAR  | Nama masakan (wajib)                |
| asal_daerah        | VARCHAR  | Asal daerah masakan (wajib)         |
| bahan_utama        | TEXT     | Bahan utama (wajib)                 |
| tingkat_kesulitan  | ENUM     | Mudah / Sedang / Sulit (wajib)     |
| waktu_masak        | INT      | Durasi memasak dalam menit (wajib)  |
| porsi              | INT      | Jumlah porsi (opsional, default 2)  |
| deskripsi          | TEXT     | Deskripsi singkat (opsional)        |
| created_at         | TIMESTAMP| Waktu dibuat                        |
| updated_at         | TIMESTAMP| Waktu diperbarui                    |

---

## 🚀 Deployment ke GCP

### Opsi A: Cloud Run (Recommended)
```bash
# Build & push image
gcloud builds submit --tag gcr.io/<PROJECT_ID>/be-<NIM>

# Deploy ke Cloud Run
gcloud run deploy be-<NIM> \
  --image gcr.io/<PROJECT_ID>/be-<NIM> \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=<IP_DB>,DB_NAME=db_<NIM>,DB_USER=root,DB_PASSWORD=KomputasiAwan2026!
```

### Opsi B: Compute Engine (VM e2-small)
```bash
# Di dalam VM
git clone <repo-url>
cd resep-nusantara-backend
npm install
# Edit .env sesuai konfigurasi
npm start
```

---

## 📝 Contoh Request

### POST /resep
```json
{
  "nama_masakan": "Rendang Daging",
  "asal_daerah": "Sumatera Barat",
  "bahan_utama": "Daging sapi, santan kelapa, cabai merah",
  "tingkat_kesulitan": "Sulit",
  "waktu_masak": 180,
  "porsi": 6,
  "deskripsi": "Masakan khas Minangkabau dengan bumbu rempah kaya rasa"
}
```
