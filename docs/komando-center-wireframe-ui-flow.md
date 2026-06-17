# Wireframe & UI Flow Document
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                              |
|---------------|-----------------------------------------------------|
| **Dokumen**   | Wireframe & UI Flow Specification                   |
| **Versi**     | v1.0                                                |
| **Tanggal**   | 16 Juni 2026                                        |
| **Author**    | UI/UX Designer                                      |
| **Platform**  | Web App (Desktop-first, responsive)                 |
| **Status**    | Draft                                               |
| **Referensi** | Use Case v1.0, ERD v1.0                             |

### Revision History

| Versi | Tanggal    | Deskripsi              | Author       |
|-------|------------|------------------------|--------------|
| v1.0  | 16-06-2026 | Initial wireframe draft | UI/UX Designer |

---

## 1. UX Planning

### 1.1 User Personas

**Persona A — Komandan Satuan**
- Role: Pejabat yang memimpin satu atau beberapa satuan
- Primary goal: Membuat perintah dan memantau seberapa banyak anggota sudah melaksanakannya
- Pain point: Tidak tahu siapa saja yang belum mengerjakan tanpa harus tanya satu-satu
- Device: Desktop (di kantor), kadang mobile

**Persona B — Anggota Lapangan**
- Role: Pelaksana perintah dari atasan
- Primary goal: Tahu apa yang harus dikerjakan hari ini dan bisa kirim bukti dengan cepat
- Pain point: Tidak ingat deadline, atau tidak tahu perintah baru sudah masuk
- Device: Bisa desktop atau mobile

**Persona C — Super Admin**
- Role: Pengelola teknis sistem
- Primary goal: Susun struktur organisasi dan kelola akun user
- Pain point: Susah visualisasi tree hierarki yang dalam jika banyak satuan
- Device: Desktop

---

### 1.2 UX Principles Proyek Ini

1. **Hierarchy first** — Setiap halaman harus mencerminkan struktur hierarki; Komandan hanya melihat lingkup bawahannya
2. **Action urgency visible** — Perintah yang mendekati deadline selalu dapat visual cue yang jelas
3. **Zero ambiguity on status** — Status perintah (belum/selesai/terlambat) harus langsung terbaca tanpa membuka detail
4. **Filter is power** — Berikan kontrol penuh kepada Komandan untuk memfilter data sesuai kebutuhan analisis
5. **Submit harus semudah mungkin** — Anggota hanya butuh paste satu link dan klik satu tombol

---

### 1.3 Struktur Navigasi (Information Architecture)

```
KOMANDO CENTER
│
├── [Super Admin]
│   ├── Dashboard Admin
│   ├── Manajemen Organisasi (Tree Satuan)
│   ├── Manajemen User
│   └── Pengaturan Sistem
│
├── [Komandan]
│   ├── Dashboard Komandan
│   ├── Perintah Saya (yang dibuat)
│   │   ├── Buat Perintah Baru
│   │   └── Detail Perintah + Progress
│   ├── Perintah Diterima (jika punya atasan)
│   ├── Anggota Saya
│   └── Profil & Akun Sosmed
│
└── [Anggota]
    ├── Dashboard Anggota
    ├── Perintah Saya (yang diterima)
    │   └── Detail Perintah + Submit Bukti
    └── Profil & Akun Sosmed
```

---

## 2. Global Layout & Navigation Shell

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (240px, collapsible)    │  MAIN CONTENT AREA                │
│                                 │                                   │
│ ┌─────────────────────────┐     │  ┌─────────────────────────────┐  │
│ │  🏛 KOMANDO CENTER       │     │  │  TOPBAR                     │  │
│ │  ─────────────────────  │     │  │  [Page Title]    [👤 Nama]  │  │
│ │                         │     │  └─────────────────────────────┘  │
│ │  📊 Dashboard           │     │                                   │
│ │  📋 Perintah Saya       │     │  [CONTENT AREA]                   │
│ │  📩 Perintah Diterima   │     │                                   │
│ │  👥 Anggota Saya        │     │                                   │
│ │  📱 Akun Sosmed         │     │                                   │
│ │                         │     │                                   │
│ │  ─── Admin Only ──────  │     │                                   │
│ │  🏢 Manajemen Org.      │     │                                   │
│ │  👤 Manajemen User      │     │                                   │
│ │                         │     │                                   │
│ │  ─────────────────────  │     │                                   │
│ │  ⚙️  Pengaturan         │     │                                   │
│ │  🚪 Logout              │     │                                   │
│ └─────────────────────────┘     │                                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Catatan Navigasi:**
- Sidebar menampilkan menu sesuai role user (Super Admin / Komandan / Anggota)
- "Perintah Diterima" hanya muncul jika user memiliki atasan (bukan top-level Komandan)
- "Anggota Saya" hanya muncul untuk Komandan
- Menu Admin hanya muncul untuk Super Admin
- Sidebar dapat di-collapse menjadi icon-only (64px) untuk ruang konten lebih luas

---

## 3. Halaman Login

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    🏛 KOMANDO CENTER                                 │
│              Sistem Manajemen Operasi Sosial Media                  │
│                                                                     │
│         ┌─────────────────────────────────────────┐                 │
│         │                                         │                 │
│         │   Username                              │                 │
│         │   ┌─────────────────────────────────┐  │                 │
│         │   │                                 │  │                 │
│         │   └─────────────────────────────────┘  │                 │
│         │                                         │                 │
│         │   Password                              │                 │
│         │   ┌─────────────────────────────────┐  │                 │
│         │   │                          👁      │  │                 │
│         │   └─────────────────────────────────┘  │                 │
│         │                                         │                 │
│         │   ┌─────────────────────────────────┐  │                 │
│         │   │           MASUK                 │  │                 │
│         │   └─────────────────────────────────┘  │                 │
│         │                                         │                 │
│         │   [!] Lupa password? Hubungi Admin      │                 │
│         │                                         │                 │
│         └─────────────────────────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**State & Validasi:**
- Error state: "Username atau password salah" (banner merah di atas form)
- Locked state: "Akun dikunci sementara. Hubungi Admin." (banner oranye)
- Loading state: tombol MASUK → spinner + disabled
- Password field: toggle 👁 untuk show/hide

---

## 4. Dashboard — Komandan

Halaman utama Komandan setelah login. Menyajikan ringkasan status seluruh perintah aktif dan progress anggota.

### 4.1 Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboard Komandan                          [+ Buat Perintah Baru]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │ 📋 Aktif     │ │ 👥 Total     │ │ ✅ Sudah     │ │ ⏳ Belum  │  │
│  │              │ │  Anggota     │ │  Submit      │ │  Submit   │  │
│  │     12       │ │    145       │ │    87        │ │    58     │  │
│  │  perintah    │ │  dibawahku   │ │  hari ini    │ │  hari ini │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │
│                                                                     │
├── FILTER BAR ───────────────────────────────────────────────────────┤
│                                                                     │
│  Satuan:          Jenis Perintah:    Status:       Periode:         │
│  [Semua Satuan ▼] [Semua Jenis   ▼] [Semua      ▼][Bulan ini    ▼] │
│                                                                     │
│  Rentang Tanggal: [DD/MM/YYYY] s/d [DD/MM/YYYY]  [Reset Filter]    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PERINTAH AKTIF                                    Urut: [Deadline▼]│
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🔴 KOMENTAR  │ Serbu Postingan @target123                     │  │
│  │              │ Deadline: Hari ini, 17.00 WIB  ⚠️ 3 jam lagi  │  │
│  │ Progress:    │ ████████████░░░░░░░░ 62 / 100 anggota         │  │
│  │              │ ✅ Selesai: 58  ⏰ Terlambat: 4  ⏳ Belum: 38  │  │
│  │              │                              [Lihat Detail →]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🟡 ENGAGEMENT│ Like & Share Postingan Resmi                   │  │
│  │              │ Deadline: Besok, 12.00 WIB                     │  │
│  │ Progress:    │ ██████████████████░░ 90 / 145 anggota         │  │
│  │              │ ✅ Selesai: 88  ⏰ Terlambat: 2  ⏳ Belum: 55  │  │
│  │              │                              [Lihat Detail →]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🔵 POSTING   │ Upload Konten Kampanye Juni                    │  │
│  │              │ Deadline: 20 Jun 2026, 08.00 WIB               │  │
│  │ Progress:    │ ████████████████████ 145 / 145 anggota ✅ DONE │  │
│  │              │ ✅ Selesai: 140  ⏰ Terlambat: 5  ⏳ Belum: 0  │  │
│  │              │                              [Lihat Detail →]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Filter Lengkap — Dashboard Komandan

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Satuan** | Dropdown tree (searchable) | Semua Satuan / [daftar satuan di bawah komandan secara hierarki] |
| **Jenis Perintah** | Dropdown multi-select | Semua / Posting / Engagement / Komentar / Report Akun |
| **Status Perintah** | Dropdown single-select | Semua / Aktif / Selesai / Expired / Draft / Dibatalkan |
| **Periode Preset** | Dropdown single-select | Hari ini / Minggu ini / Bulan ini / Bulan lalu / Custom |
| **Rentang Tanggal** | Date range picker | Dari [tanggal] s/d [tanggal] — aktif jika periode = Custom |
| **Urutan Tampilan** | Dropdown sort | Deadline Terdekat / Deadline Terjauh / Progress Terendah / Progress Tertinggi / Terbaru Dibuat |
| **Progress** | Slider range | 0% – 100% (filter perintah berdasarkan % completion) |

**Filter Quick Chips** (di atas daftar — one-click):
- `⚠️ Hampir Deadline` — deadline < 24 jam
- `🚨 Belum Ada Submit` — progress 0%
- `✅ Sudah Selesai` — progress 100%
- `⏰ Ada yang Terlambat` — ada anggota dengan status terlambat

---

## 5. Halaman Buat Perintah Baru

Multi-step wizard dengan progress indicator.

### 5.1 Step 1 — Informasi Perintah

```
┌─────────────────────────────────────────────────────────────────────┐
│ Buat Perintah Baru                                                  │
│                                                                     │
│  ●───────────────○───────────────○                                  │
│  1. Informasi    2. Target       3. Konfirmasi                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Judul Perintah *                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ contoh: Serbu Postingan @akun_target                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Jenis Perintah *                                                   │
│  ┌──────────────────────────────────────┐                          │
│  │  ○ 📝 POSTING      ○ 👍 ENGAGEMENT  │                          │
│  │  ○ 💬 KOMENTAR     ○ 🚩 REPORT AKUN │                          │
│  └──────────────────────────────────────┘                          │
│                                                                     │
│  ── [Muncul kondisional berdasarkan Jenis Perintah] ─────────────  │
│                                                                     │
│  [Jika POSTING]                                                     │
│  Narasi / Caption yang Harus Diposting *                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │                                              0 / 2200 char  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Hashtag (opsional)                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ #hashtag1 #hashtag2                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Jika ENGAGEMENT]                                                  │
│  Aksi yang Harus Dilakukan * (pilih minimal 1)                      │
│  ┌──────────────────────────────────────────┐                      │
│  │  ☑ 👍 Like   ☑ 🔁 Share   ☑ 🔄 Repost  │                      │
│  └──────────────────────────────────────────┘                      │
│                                                                     │
│  [Jika KOMENTAR]                                                    │
│  Narasi Komentar * (teks yang harus digunakan)                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Sentimen Komentar *                                                │
│  ○ 👍 Positif    ○ 👎 Negatif                                       │
│                                                                     │
│  [Jika REPORT AKUN]                                                 │
│  Alasan Report *                                                    │
│  ┌──────────────────────────────────┐                              │
│  │  Pilih alasan report           ▼ │                              │
│  └──────────────────────────────────┘                              │
│  Catatan Tambahan                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ── [Field yang selalu ada] ─────────────────────────────────────  │
│                                                                     │
│  Link Target * (URL postingan / akun sosmed yang jadi sasaran)      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ https://                                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Deskripsi / Instruksi Tambahan                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Deadline *                                                         │
│  ┌────────────────────┐  ┌────────────┐                            │
│  │  DD / MM / YYYY 📅 │  │  HH : MM ⏰│                            │
│  └────────────────────┘  └────────────┘                            │
│  ⚠️ Deadline minimal 1 jam dari sekarang                            │
│                                                                     │
│                    [Simpan Draft]   [Lanjut ke Target →]           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Step 2 — Pilih Target

```
┌─────────────────────────────────────────────────────────────────────┐
│ Buat Perintah Baru                                                  │
│                                                                     │
│  ●───────────────●───────────────○                                  │
│  1. Informasi    2. Target       3. Konfirmasi                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Pilih Target Perintah                                              │
│  Perintah akan dikirim ke seluruh anggota di dalam target yang      │
│  dipilih secara otomatis (termasuk sub-satuan di dalamnya)          │
│                                                                     │
│  [Pilih Semua Bawahan] [Reset Pilihan]                              │
│                                                                     │
│  Cari satuan / anggota:                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔍                                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  STRUKTUR ORGANISASI DI BAWAHKU                             │   │
│  │                                                             │   │
│  │  ☑ 🏢 Batalyon Alpha                        (48 anggota)   │   │
│  │  │  ☑ 🏢 Kompi A                           (16 anggota)   │   │
│  │  │  │  ☑ 👤 Sersan Budi                                   │   │
│  │  │  │  ☑ 👤 Kopral Andi                                   │   │
│  │  │  │  ☐ 👤 Prajurit Deni  [nonaktif]                    │   │
│  │  │  ☑ 🏢 Kompi B                           (16 anggota)   │   │
│  │  │  ☐ 🏢 Kompi C                           (16 anggota)   │   │
│  │  ☐ 🏢 Batalyon Beta                         (52 anggota)   │   │
│  │  ☑ 👤 Letnan Sari (anggota langsung)                       │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📊 RINGKASAN TARGET                                        │   │
│  │  Satuan dipilih: 3     Anggota terpilih: 97                 │   │
│  │  (termasuk semua anggota di dalam satuan yang dipilih)      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│              [← Kembali]              [Lanjut ke Konfirmasi →]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 Step 3 — Konfirmasi & Kirim

```
┌─────────────────────────────────────────────────────────────────────┐
│ Buat Perintah Baru                                                  │
│                                                                     │
│  ●───────────────●───────────────●                                  │
│  1. Informasi    2. Target       3. Konfirmasi                      │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📋 RINGKASAN PERINTAH                                              │
│                                                                     │
│  Judul          : Serbu Postingan @target123                        │
│  Jenis          : 💬 KOMENTAR (Sentimen: Negatif)                   │
│  Link Target    : https://instagram.com/p/abc123                   │
│  Narasi Komentar: "Akun ini menyebarkan informasi tidak akurat..."  │
│  Deadline       : 16 Juni 2026, 17.00 WIB                          │
│                                                                     │
│  👥 TARGET DISTRIBUSI                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Batalyon Alpha (Kompi A + Kompi B)  → 32 anggota           │   │
│  │  Letnan Sari (individu)              →  1 anggota           │   │
│  │  ─────────────────────────────────────────────              │   │
│  │  Total penerima perintah             → 97 anggota           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ⚠️ Setelah dikirim, konten perintah tidak dapat diubah.           │
│     Perintah hanya dapat dibatalkan jika diperlukan.               │
│                                                                     │
│         [← Kembali Edit]    [Simpan Draft]    [🚀 Kirim Perintah]  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Halaman Daftar Perintah (Dibuat oleh Komandan)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Perintah yang Saya Buat                      [+ Buat Perintah Baru] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILTER ────────────────────────────────────────────────────────── │
│                                                                     │
│  Cari judul:         Jenis:            Status:       Periode:       │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 🔍           │   │ Semua      ▼ │  │ Semua  ▼ │  │ Bulan ini│  │
│  └──────────────┘   └──────────────┘  └──────────┘  └──────────┘  │
│                                                                     │
│  Target Satuan:      Progress:           Urut:                     │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────────┐  │
│  │ Semua      ▼ │   │ 0% - 100%  ▼ │   │ Deadline Terdekat   ▼ │  │
│  └──────────────┘   └──────────────┘   └───────────────────────┘  │
│                                                                     │
│  Rentang Tanggal: [DD/MM/YYYY] s/d [DD/MM/YYYY]  [Reset] [Terapkan]│
│                                                                     │
│  Quick Filter: [⚠️ Hampir Deadline] [🚨 Belum Ada Submit] [📋 Draft]│
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Menampilkan 12 perintah                           [Tabel] [Kartu] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Judul Perintah      │ Jenis    │ Deadline      │ Progress │ Aksi  │
│  ─────────────────────────────────────────────────────────────────  │
│  Serbu @target123    │ KOMENTAR │ Hari ini 17:00│ 62/97 ⚠️ │ [→]   │
│  Like & Share Resmi  │ ENGAGE.  │ Besok 12:00   │ 90/145   │ [→]   │
│  Upload Konten Juni  │ POSTING  │ 20 Jun 08:00  │ 145/145✅│ [→]   │
│  Report Akun Hoaks   │ REPORT   │ 18 Jun 20:00  │ 0/97  🚨 │ [→]   │
│  Komentar Positif X  │ KOMENTAR │ [EXPIRED]     │ 70/97 ⏰  │ [→]   │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│                          [← Prev]  1  2  3  [Next →]               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Halaman Daftar Perintah (Dibuat)

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Cari Judul** | Search input | Free text, real-time |
| **Jenis Perintah** | Dropdown multi-select | Semua / Posting / Engagement / Komentar / Report Akun |
| **Status Perintah** | Dropdown single-select | Semua / Draft / Aktif / Selesai / Expired / Dibatalkan |
| **Target Satuan** | Dropdown tree searchable | Semua / [daftar satuan di bawah komandan] |
| **Periode Preset** | Dropdown | Hari ini / Minggu ini / Bulan ini / Bulan lalu / Semua / Custom |
| **Rentang Tanggal** | Date range picker | Dari – Sampai (aktif saat Periode = Custom) |
| **Progress** | Dropdown range | Semua / Belum mulai (0%) / Sedang berjalan (1–99%) / Selesai (100%) |
| **Urutan** | Dropdown sort | Deadline Terdekat / Deadline Terjauh / Progress Terendah / Progress Tertinggi / Terbaru Dibuat / Terlama Dibuat |
| **Quick chips** | Toggle button chip | ⚠️ Hampir Deadline / 🚨 Belum Ada Submit / 📋 Draft / ✅ Selesai / ⏰ Ada Terlambat |

---

## 7. Halaman Detail Perintah + Progress Anggota

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Kembali   Detail Perintah                     [✏️ Edit] [🚫 Batal]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  💬 KOMENTAR  │  Serbu Postingan @target123                         │
│               │  Deadline: 16 Jun 2026, 17.00 WIB  ⚠️ 3 jam lagi  │
│               │  Dibuat: 15 Jun 2026, 09.00 WIB                    │
│               │  Link Target: https://instagram.com/p/abc123 [↗]   │
│               │  Narasi: "Akun ini menyebarkan..."                  │
│               │  Sentimen: 👎 Negatif                               │
│                                                                     │
├── RINGKASAN PROGRESS ───────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ Total       │ │ ✅ Selesai  │ │ ⏰ Terlambat│ │ ⏳ Belum    │  │
│  │ 97 anggota  │ │    58       │ │      4      │ │    35       │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                     │
│  ████████████████████░░░░░░░░░░░░░░  62 / 97  (63.9%)             │
│                                                                     │
├── FILTER ANGGOTA ───────────────────────────────────────────────────┤
│                                                                     │
│  Cari anggota:    Satuan:          Status Submit:    Urut:          │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────┐ ┌───────────┐  │
│  │ 🔍 Nama..  │  │ Semua      ▼ │  │ Semua     ▼ │ │ Nama A-Z▼ │  │
│  └────────────┘  └──────────────┘  └─────────────┘ └───────────┘  │
│                                                                     │
│  Quick: [⏳ Belum Submit] [✅ Sudah Submit] [⏰ Terlambat]          │
│                                                                     │
│  [📥 Export ke Excel]                                               │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DETAIL PER SATUAN (Collapse/Expand)                                │
│                                                                     │
│  ▼ 🏢 Batalyon Alpha — 32 anggota  ✅ 20  ⏰ 2  ⏳ 10             │
│  │                                                                  │
│  │  ▼ 🏢 Kompi A — 16 anggota  ✅ 12  ⏰ 1  ⏳ 3                  │
│  │  │                                                               │
│  │  │  Nama Anggota     │ Status     │ Waktu Submit  │ Bukti Drive  │
│  │  │  ────────────────────────────────────────────────────────    │
│  │  │  Sersan Budi      │ ✅ Selesai │ 16 Jun 14:22  │ [Buka ↗]   │
│  │  │  Kopral Andi      │ ✅ Selesai │ 16 Jun 13:45  │ [Buka ↗]   │
│  │  │  Prajurit Deni    │ ⏳ Belum   │      -        │     -       │
│  │  │  Prajurit Eko     │ ⏰ Terlmbt │ 16 Jun 18:30  │ [Buka ↗]   │
│  │  │                                                               │
│  │  ▼ 🏢 Kompi B — 16 anggota  ✅ 8   ⏰ 1  ⏳ 7                  │
│  │  │  ...                                                          │
│                                                                     │
│  ▼ 👤 Letnan Sari (individu) — ✅ Selesai  16 Jun 11:00  [Buka ↗] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Halaman Detail Perintah

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Cari Anggota** | Search input | Free text, cari berdasarkan nama |
| **Satuan** | Dropdown tree | Semua / [daftar sub-satuan dalam target perintah ini] |
| **Status Submit** | Dropdown single-select | Semua / Belum Dikerjakan / Selesai / Terlambat |
| **Urutan Tabel** | Dropdown sort | Nama A-Z / Nama Z-A / Waktu Submit Terbaru / Waktu Submit Terlama / Status |
| **Quick chips** | Toggle chip | ⏳ Belum Submit / ✅ Sudah Submit / ⏰ Terlambat |
| **Export** | Tombol aksi | Export ke Excel (.xlsx) — berisi data filtered saat ini |

---

## 8. Halaman Perintah Saya (Anggota / Komandan sebagai penerima)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Perintah Saya                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │ ⏳ Belum     │ │ ✅ Selesai   │ │ ⏰ Terlambat │ │ 📋 Total  │  │
│  │  Dikerjakan  │ │              │ │              │ │           │  │
│  │      5       │ │     18       │ │      2       │ │    25     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘  │
│                                                                     │
├── FILTER ───────────────────────────────────────────────────────── │
│                                                                     │
│  Cari judul:         Jenis:            Status:       Periode:       │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 🔍           │   │ Semua      ▼ │  │ Semua  ▼ │  │ Semua  ▼ │  │
│  └──────────────┘   └──────────────┘  └──────────┘  └──────────┘  │
│                                                                     │
│  Rentang Tanggal: [DD/MM/YYYY] s/d [DD/MM/YYYY]  [Reset Filter]    │
│                                                                     │
│  Urut berdasarkan:                                                  │
│  ┌───────────────────────────────────────────┐                     │
│  │  Deadline Terdekat                      ▼ │                     │
│  └───────────────────────────────────────────┘                     │
│                                                                     │
│  Quick: [⏳ Belum Dikerjakan] [⚠️ Hampir Deadline] [✅ Selesai]    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🔴 ⚠️ DEADLINE 3 JAM LAGI                                     │  │
│  │ 💬 KOMENTAR — Serbu Postingan @target123                      │  │
│  │ Dari: Komandan Satuan Alpha                                   │  │
│  │ Deadline: 16 Jun 2026, 17.00 WIB                              │  │
│  │ Status: ⏳ BELUM DIKERJAKAN                                   │  │
│  │                                    [Lihat Detail] [Submit ✅] │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🟡 👍 ENGAGEMENT — Like & Share Postingan Resmi               │  │
│  │ Dari: Komandan Satuan Alpha                                   │  │
│  │ Deadline: Besok, 12.00 WIB                                    │  │
│  │ Status: ⏳ BELUM DIKERJAKAN                                   │  │
│  │                                    [Lihat Detail] [Submit ✅] │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🟢 📝 POSTING — Upload Konten Kampanye Juni                   │  │
│  │ Dari: Komandan Satuan Alpha                                   │  │
│  │ Deadline: 20 Jun 2026, 08.00 WIB                              │  │
│  │ Status: ✅ SELESAI — Dikerjakan 16 Jun 14:22                  │  │
│  │ Bukti: drive.google.com/... [Lihat] [Ganti Bukti]            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Halaman Perintah Saya (Anggota)

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Cari Judul** | Search input | Free text, real-time |
| **Jenis Perintah** | Dropdown multi-select | Semua / Posting / Engagement / Komentar / Report Akun |
| **Status Saya** | Dropdown single-select | Semua / Belum Dikerjakan / Selesai / Terlambat |
| **Dari Siapa** | Dropdown | Semua / [daftar nama Komandan yang pernah beri perintah] |
| **Periode** | Dropdown | Hari ini / Minggu ini / Bulan ini / Bulan lalu / Semua / Custom |
| **Rentang Tanggal** | Date range picker | Dari – Sampai |
| **Urutan** | Dropdown sort | Deadline Terdekat / Deadline Terjauh / Terbaru Diterima / Terlama Diterima / Status |
| **Quick chips** | Toggle chip | ⏳ Belum Dikerjakan / ⚠️ Hampir Deadline / ✅ Selesai / ⏰ Terlambat |

---

## 9. Halaman Detail Perintah (Anggota) + Modal Submit Bukti

### 9.1 Detail Perintah (view Anggota)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Kembali    Detail Perintah                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  💬 KOMENTAR                          Status: ⏳ BELUM DIKERJAKAN   │
│                                                                     │
│  Serbu Postingan @target123                                         │
│                                                                     │
│  Dari Komandan:   Komandan Satuan Alpha                             │
│  Diterima:        15 Jun 2026, 10.30 WIB                           │
│  ⚠️ Deadline:    16 Jun 2026, 17.00 WIB (3 jam 24 menit lagi)     │
│                                                                     │
│  ─── INSTRUKSI ─────────────────────────────────────────────────── │
│                                                                     │
│  Link Target:                                                       │
│  https://instagram.com/p/abc123 [Buka di Tab Baru ↗]              │
│                                                                     │
│  Narasi yang Harus Digunakan:                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ "Akun ini menyebarkan informasi yang tidak akurat dan        │   │
│  │  menyesatkan masyarakat. Harap waspada."                    │   │
│  │                                          [📋 Salin Narasi]  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Sentimen: 👎 Negatif                                               │
│                                                                     │
│  Deskripsi Tambahan dari Komandan:                                  │
│  Pastikan akun sosmed kalian sudah terdaftar dan gunakan narasi     │
│  di atas secara verbatim. Jangan modifikasi teks.                   │
│                                                                     │
│  ─── AKUN SOSMED SAYA ──────────────────────────────────────────── │
│  Instagram: @akun_saya_1 [↗]   @akun_saya_2 [↗]                   │
│  (Akun yang relevan untuk perintah ini)                             │
│                                                                     │
│                                  [🚀 Submit Bukti Pelaksanaan]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Modal Submit Bukti

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ✖                                                  │
│       Submit Bukti Pelaksanaan                                      │
│       Serbu Postingan @target123                                    │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Upload bukti kamu ke Google Drive, lalu paste link-nya di bawah.  │
│                                                                     │
│  Link Google Drive *                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ https://drive.google.com/...                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  Pastikan link Drive kamu sudah diset "Anyone with link can view"   │
│                                                                     │
│  Catatan Tambahan (opsional)                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ contoh: sudah dikerjakan di 2 akun                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│             [Batal]                  [✅ Kirim Bukti]              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**State modal:**
- Loading: tombol "Kirim Bukti" → spinner + disabled
- Success: modal tertutup → toast "Bukti berhasil dikirim! ✅" → status kartu berubah ke SELESAI
- Error (URL invalid): inline error merah di bawah field link

---

## 10. Halaman Anggota Saya (Komandan)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Anggota Saya                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILTER ────────────────────────────────────────────────────────── │
│                                                                     │
│  Cari nama:          Satuan:           Platform Sosmed:             │
│  ┌──────────────┐   ┌──────────────┐  ┌──────────────────────────┐ │
│  │ 🔍 Nama...   │   │ Semua      ▼ │  │ Semua Platform         ▼ │ │
│  └──────────────┘   └──────────────┘  └──────────────────────────┘ │
│                                                                     │
│  Status Akun Sosmed:              Urut:                            │
│  ┌──────────────────────────────┐  ┌─────────────────────────────┐ │
│  │ Semua                      ▼ │  │ Nama A-Z                  ▼ │ │
│  └──────────────────────────────┘  └─────────────────────────────┘ │
│                                                                     │
│  Quick: [✅ Punya Akun Sosmed] [⚠️ Belum Daftarkan Akun Sosmed]    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TAMPILAN: [🌳 Per Satuan] [📋 Tabel Semua Anggota]                 │
│                                                                     │
│  ── MODE TABEL ────────────────────────────────────────────────── │
│                                                                     │
│  Nama             │ Satuan      │ Akun Sosmed          │ Aksi      │
│  ───────────────────────────────────────────────────────────────── │
│  Sersan Budi      │ Kompi A     │ 📷 IG, 𝕏 Twitter     │ [Lihat]  │
│  Kopral Andi      │ Kompi A     │ 📷 IG, TikTok, FB    │ [Lihat]  │
│  Prajurit Deni    │ Kompi A     │ ⚠️ Belum daftarkan   │ [Lihat]  │
│  Letnan Sari      │ Langsung    │ 📷 IG, 𝕏 Twitter     │ [Lihat]  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Halaman Anggota Saya

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Cari Nama** | Search input | Free text |
| **Satuan** | Dropdown tree searchable | Semua / [daftar sub-satuan dalam hierarki komandan] |
| **Platform Sosmed** | Dropdown multi-select | Semua / Instagram / Twitter-X / Facebook / TikTok / YouTube / Other |
| **Status Akun Sosmed** | Dropdown single-select | Semua / Sudah Daftarkan Akun / Belum Daftarkan Akun |
| **Jumlah Akun Sosmed** | Dropdown | Semua / Tidak ada / 1 akun / 2–3 akun / 4+ akun |
| **Urutan** | Dropdown sort | Nama A-Z / Nama Z-A / Jumlah Akun Sosmed / Satuan |
| **Mode Tampilan** | Toggle | 🌳 Per Satuan (tree view) / 📋 Tabel semua anggota |
| **Quick chips** | Toggle chip | ✅ Punya Akun Sosmed / ⚠️ Belum Daftarkan Akun |

---

## 11. Halaman Profil Anggota (dilihat Komandan)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Kembali    Profil Anggota                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  👤  Sersan Budi Santoso                                            │
│      NIP: 1234567890                                                │
│      Satuan: Kompi A, Batalyon Alpha                                │
│      Bergabung: 12 Maret 2025                                       │
│                                                                     │
├── AKUN SOSIAL MEDIA ────────────────────────────────────────────────│
│                                                                     │
│  ┌──────────┬──────────────────┬──────────────────────┬─────────┐  │
│  │ Platform │ Username         │ URL Profil           │         │  │
│  ├──────────┼──────────────────┼──────────────────────┼─────────┤  │
│  │ 📷 IG    │ @budi_santoso    │ instagram.com/budi.. │ [↗ Buka]│  │
│  │ 𝕏 Twitter│ @budi_tw         │ twitter.com/budi_tw  │ [↗ Buka]│  │
│  │ TikTok   │ @budi.tiktok     │ tiktok.com/@budi..   │ [↗ Buka]│  │
│  └──────────┴──────────────────┴──────────────────────┴─────────┘  │
│                                                                     │
├── RIWAYAT PERINTAH ─────────────────────────────────────────────────│
│                                                                     │
│  Filter: Status: [Semua ▼]  Jenis: [Semua ▼]  Periode: [Bulan ini▼]│
│                                                                     │
│  Perintah             │ Jenis    │ Deadline     │ Status     │ Bukti│
│  ─────────────────────────────────────────────────────────────────  │
│  Serbu @target123     │ KOMENTAR │ 16 Jun 17:00 │ ✅ Selesai │ [↗] │
│  Like Postingan Resmi │ ENGAGE.  │ 15 Jun 12:00 │ ⏰ Terlmbt │ [↗] │
│  Upload Konten Juni   │ POSTING  │ 14 Jun 08:00 │ ✅ Selesai │ [↗] │
│                                                                     │
│  Total: 25 perintah  ✅ 22 selesai  ⏰ 2 terlambat  ⏳ 1 pending   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Riwayat Perintah di Profil Anggota

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Status Assignment** | Dropdown single-select | Semua / Selesai / Terlambat / Belum Dikerjakan |
| **Jenis Perintah** | Dropdown multi-select | Semua / Posting / Engagement / Komentar / Report Akun |
| **Periode** | Dropdown | Minggu ini / Bulan ini / Bulan lalu / Semua / Custom |
| **Rentang Tanggal** | Date range picker | Dari – Sampai |
| **Urutan** | Dropdown sort | Deadline Terbaru / Deadline Terlama / Status |

---

## 12. Halaman Akun Sosial Media (Milik Sendiri)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Akun Sosial Media Saya                       [+ Tambah Akun Baru]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILTER ────────────────────────────────────────────────────────── │
│                                                                     │
│  Platform:                         Urut:                           │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │ Semua Platform             ▼ │  │ Terbaru Didaftarkan        ▼ ││
│  └──────────────────────────────┘  └──────────────────────────────┘│
│                                                                     │
│  Quick: [📷 Instagram] [𝕏 Twitter-X] [📘 Facebook] [TikTok] [YT]  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📷 Instagram                                                │   │
│  │ @budi_santoso                                               │   │
│  │ instagram.com/budi_santoso  [↗ Buka Profil]                │   │
│  │ Catatan: Akun utama                                         │   │
│  │ Didaftarkan: 12 Mar 2025          [✏️ Edit]  [🗑️ Hapus]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 𝕏 Twitter-X                                                 │   │
│  │ @budi_tw                                                    │   │
│  │ twitter.com/budi_tw  [↗ Buka Profil]                       │   │
│  │ Catatan: Akun cadangan                                      │   │
│  │ Didaftarkan: 01 Apr 2025          [✏️ Edit]  [🗑️ Hapus]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🎵 TikTok                                                   │   │
│  │ @budi.tiktok                                                │   │
│  │ tiktok.com/@budi.tiktok  [↗ Buka Profil]                   │   │
│  │ Catatan: -                                                  │   │
│  │ Didaftarkan: 15 Mei 2025          [✏️ Edit]  [🗑️ Hapus]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [Empty state jika belum ada]                                       │
│  📱 Kamu belum mendaftarkan akun sosial media.                      │
│  Atasan kamu perlu tahu akun sosmed kamu untuk penugasan.           │
│                              [+ Tambah Akun Sekarang]              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Halaman Akun Sosmed Sendiri

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Platform** | Dropdown multi-select | Semua / Instagram / Twitter-X / Facebook / TikTok / YouTube / Other |
| **Urutan** | Dropdown sort | Terbaru Didaftarkan / Terlama Didaftarkan / Platform A-Z |
| **Quick chips platform** | Toggle chip | 📷 IG / 𝕏 Twitter / 📘 Facebook / 🎵 TikTok / ▶️ YouTube |

---

## 13. Halaman Manajemen Organisasi (Admin)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Manajemen Organisasi                         [+ Tambah Satuan Root] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILTER ────────────────────────────────────────────────────────── │
│                                                                     │
│  Cari satuan/anggota:         Level Hierarki:                       │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐│
│  │ 🔍 nama satuan atau user │  │ Semua Level                    ▼ ││
│  └──────────────────────────┘  └──────────────────────────────────┘│
│                                                                     │
│  [Expand Semua] [Collapse Semua]                                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TREE ORGANISASI                                                    │
│                                                                     │
│  ▼ 🏢 ANGKATAN DARAT              Komandan: Jend. Ahmad   [⚙️ Edit]│
│  │   Anggota Langsung: 5  Sub-Satuan: 3                            │
│  │                                                                  │
│  │  ▼ 🏢 Batalyon Alpha            Komandan: Kol. Budi    [⚙️ Edit]│
│  │  │   Anggota: 48  Sub-Satuan: 3                                  │
│  │  │                                                               │
│  │  │  ▼ 🏢 Kompi A               Komandan: Kapten Sari  [⚙️ Edit]│
│  │  │  │  Anggota: 16                                               │
│  │  │  │  👤 Sersan Budi                            [✏️] [🗑️]     │
│  │  │  │  👤 Kopral Andi                            [✏️] [🗑️]     │
│  │  │  │                      [+ Tambah Anggota]  [+ Tambah Sub]   │
│  │  │  ▶ 🏢 Kompi B  (collapsed)                                   │
│  │  │  ▶ 🏢 Kompi C  (collapsed)                                   │
│  │  │                                                               │
│  │  ▶ 🏢 Batalyon Beta  (collapsed)                                 │
│  │  ▶ 🏢 Batalyon Gamma  (collapsed)                                │
│  │                                                                  │
│  👤 Letnan Sari (anggota langsung Angkatan Darat)  [✏️] [🗑️]      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Manajemen Organisasi

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Cari** | Search input | Nama satuan atau nama user — highlight hasil di tree |
| **Level Hierarki** | Dropdown | Semua Level / Level 1 (Root) / Level 2 / Level 3 / Level 4+ |
| **Jenis Node** | Toggle | Semua / Satuan saja / Anggota saja |
| **Status Komandan** | Dropdown | Semua / Ada Komandan / Belum Ada Komandan |
| **Expand/Collapse** | Tombol aksi | Expand Semua / Collapse Semua |

---

## 14. Halaman Manajemen User (Admin)

```
┌─────────────────────────────────────────────────────────────────────┐
│ Manajemen User                                    [+ Tambah User]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FILTER ────────────────────────────────────────────────────────── │
│                                                                     │
│  Cari user:          Satuan:          Role:         Status Akun:    │
│  ┌──────────────┐   ┌──────────────┐ ┌──────────┐  ┌───────────┐  │
│  │ 🔍 Nama/NIP  │   │ Semua      ▼ │ │ Semua  ▼ │  │ Aktif   ▼ │  │
│  └──────────────┘   └──────────────┘ └──────────┘  └───────────┘  │
│                                                                     │
│  Platform Sosmed Terdaftar:       Urut:                            │
│  ┌──────────────────────────────┐  ┌─────────────────────────────┐ │
│  │ Semua Platform             ▼ │  │ Nama A-Z                  ▼ │ │
│  └──────────────────────────────┘  └─────────────────────────────┘ │
│                                                                     │
│  Quick: [⚠️ Akun Dikunci] [⚠️ Belum Daftarkan Sosmed]              │
│         [👤 Tanpa Satuan] [🔑 Super Admin]                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Menampilkan 145 user                                               │
│                                                                     │
│  Nama            │ NIP      │ Satuan     │ Role    │ Sosmed │ Aksi  │
│  ─────────────────────────────────────────────────────────────────  │
│  Budi Santoso    │ 12345    │ Kompi A    │ Member  │ 3 akun │ [→]   │
│  Andi Kurnia     │ 12346    │ Kompi A    │ Member  │ 2 akun │ [→]   │
│  Sari Dewi       │ 12347    │ Langsung   │ Member  │ 1 akun │ [→]   │
│  Deni Pratama    │ 12348    │ Kompi A    │ Member  │ ⚠️ 0   │ [→]   │
│                                                                     │
│                          [← Prev]  1  2  3  [Next →]               │
└─────────────────────────────────────────────────────────────────────┘
```

### Filter Lengkap — Manajemen User (Admin)

| Filter | Tipe Komponen | Opsi / Nilai |
|--------|---------------|--------------|
| **Cari** | Search input | Nama lengkap atau NIP |
| **Satuan** | Dropdown tree searchable | Semua / [daftar seluruh satuan] / Tanpa Satuan |
| **Role** | Dropdown | Semua / Super Admin / Member |
| **Status Akun** | Dropdown | Aktif / Dikunci / Semua |
| **Platform Sosmed** | Dropdown multi-select | Semua / Instagram / Twitter-X / Facebook / TikTok / YouTube |
| **Status Sosmed** | Dropdown | Semua / Sudah Daftarkan / Belum Daftarkan |
| **Urutan** | Dropdown sort | Nama A-Z / Nama Z-A / Terbaru Dibuat / Jumlah Sosmed |
| **Quick chips** | Toggle chip | ⚠️ Akun Dikunci / ⚠️ Belum Daftarkan Sosmed / 👤 Tanpa Satuan / 🔑 Super Admin |

---

## 15. Dashboard Anggota

```
┌─────────────────────────────────────────────────────────────────────┐
│ Dashboard — Selamat datang, Sersan Budi 👋                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐ ┌──────────────────────────────────────┐  │
│  │ ⏳ HARUS DIKERJAKAN  │ │ 🔴 PERHATIAN — Deadline Mepet        │  │
│  │                      │ │                                      │  │
│  │        5             │ │  Serbu @target123                   │  │
│  │    perintah aktif    │ │  ⚠️ Deadline dalam 3 jam            │  │
│  │                      │ │                   [Submit Sekarang] │  │
│  └──────────────────────┘ └──────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ ✅ Selesai   │ │ ⏰ Terlambat │ │ 📊 Total     │                │
│  │    18        │ │      2       │ │    25        │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
│                                                                     │
│  PERINTAH TERBARU                           [Lihat Semua →]        │
│                                                                     │
│  🔴 ⚠️ Serbu @target123 — Deadline 3 jam lagi     [Submit ✅]      │
│  🟡    Like & Share Resmi — Deadline Besok 12:00   [Submit ✅]      │
│  🟢 ✅ Upload Konten Juni — Selesai 16 Jun 14:22   [Lihat]         │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  📱 AKUN SOSMED SAYA       3 akun terdaftar        [Kelola →]      │
│  📷 @budi_santoso   𝕏 @budi_tw   🎵 @budi.tiktok                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 16. Rekap Master Filter — Semua Halaman

Ringkasan seluruh filter yang tersedia di sistem:

| Halaman | Filter yang Tersedia |
|---------|---------------------|
| **Dashboard Komandan** | Satuan, Jenis Perintah, Status Perintah, Periode Preset, Rentang Tanggal, Progress Range, Urutan, Quick Chips (Hampir Deadline / Belum Ada Submit / Selesai / Ada Terlambat) |
| **Daftar Perintah Dibuat** | Cari Judul, Jenis Perintah, Status, Target Satuan, Periode Preset, Rentang Tanggal, Progress Range, Urutan, Quick Chips |
| **Detail Perintah + Progress** | Cari Anggota, Satuan, Status Submit, Urutan Tabel, Quick Chips (Belum/Sudah/Terlambat), Export Excel |
| **Perintah Saya (Anggota)** | Cari Judul, Jenis Perintah, Status Saya, Dari Siapa, Periode Preset, Rentang Tanggal, Urutan, Quick Chips |
| **Anggota Saya (Komandan)** | Cari Nama, Satuan, Platform Sosmed, Status Akun Sosmed, Jumlah Akun Sosmed, Urutan, Mode Tampilan (Tree/Tabel), Quick Chips |
| **Profil Anggota — Riwayat** | Status Assignment, Jenis Perintah, Periode Preset, Rentang Tanggal, Urutan |
| **Akun Sosmed Sendiri** | Platform, Urutan, Quick Chips Platform |
| **Manajemen Organisasi (Admin)** | Cari Satuan/User, Level Hierarki, Jenis Node, Status Komandan, Expand/Collapse |
| **Manajemen User (Admin)** | Cari Nama/NIP, Satuan, Role, Status Akun, Platform Sosmed, Status Sosmed, Urutan, Quick Chips |

---

## 17. UI States Reference

Setiap halaman dengan daftar/tabel harus memiliki state berikut:

| State | Deskripsi | Tampilan |
|-------|-----------|----------|
| **Loading** | Data sedang dimuat | Skeleton screen — baris placeholder abu-abu animated |
| **Empty (No Data)** | Belum ada data sama sekali | Ilustrasi + teks penjelasan + CTA |
| **Empty (No Results)** | Filter tidak menemukan hasil | "Tidak ada hasil untuk filter ini" + tombol Reset Filter |
| **Error** | Gagal memuat data | Pesan error + tombol Coba Lagi |
| **Partial Load** | Load more / pagination | Tombol "Muat Lebih Banyak" di bawah daftar |

### Contoh Empty State — Perintah Saya

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         📋                                      │
│              Tidak ada perintah aktif                           │
│         Semua perintah sudah kamu selesaikan! 🎉               │
│                                                                 │
│               [Lihat Riwayat Perintah]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 18. Color & Status Badge Reference

| Status / Konteks | Warna | Badge |
|------------------|-------|-------|
| Belum Dikerjakan | Abu-abu | `⏳ Belum Dikerjakan` |
| Selesai (tepat waktu) | Hijau | `✅ Selesai` |
| Terlambat | Oranye | `⏰ Terlambat` |
| Aktif | Biru | `🔵 Aktif` |
| Draft | Abu-abu | `📋 Draft` |
| Expired | Merah muda | `🔴 Expired` |
| Dibatalkan | Merah | `🚫 Dibatalkan` |
| Deadline < 24 jam | Merah alert | `⚠️ X jam lagi` |
| Perintah POSTING | Biru | `📝 POSTING` |
| Perintah ENGAGEMENT | Kuning | `👍 ENGAGEMENT` |
| Perintah KOMENTAR | Ungu | `💬 KOMENTAR` |
| Perintah REPORT | Merah | `🚩 REPORT AKUN` |

---

## 19. Suggested Next Steps

Setelah wireframe ini disetujui:

1. **High-Fidelity Mockup** — implementasi wireframe ke desain visual di Figma dengan design system (warna, tipografi, komponen)
2. **API Specification** — rancang endpoint REST yang mendukung seluruh filter di Section 16 (query params, pagination, sorting)
3. **Database Index Review** — pastikan ERD memiliki index yang tepat untuk mendukung semua kombinasi filter (terutama composite index)
4. **Frontend Implementation** — Next.js App Router + Tailwind CSS + shadcn/ui, dengan React Query untuk data fetching + filter state management
