# Seed Data — Struktur TNI (Kodam I/BB)
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                                       |
|---------------|----------------------------------------------------------------|
| **Dokumen**   | Seed Data Specification — Struktur Organisasi TNI             |
| **Versi**     | v2.1                                                           |
| **Tanggal**   | 20 Juni 2026                                                   |
| **Author**    | System Analyst                                                 |
| **Status**    | Implemented                                                    |
| **Referensi** | Prisma Schema v2 (final) · API Spec v1.1 · Laporan Harian Monitoring Siber Kodam I/BB |

### Revision History

| Versi | Tanggal    | Deskripsi                                                                 | Author         |
|-------|------------|----------------------------------------------------------------------------|----------------|
| v1.0  | 16-06-2026 | Seed data awal — struktur militer generik (Batalyon/Kompi)                 | System Analyst |
| v2.0  | 19-06-2026 | Diganti total: struktur nyata Kodam I/BB, schema Prisma final dengan Better Auth-native fields, ActivityLog, OrderSocialTarget | System Analyst |

---

## 1. Mengapa Dokumen Ini Diperbarui Total

Seed data v1.0 dibuat berdasarkan ERD awal yang masih draft. Sekarang ada **schema Prisma final** yang berbeda signifikan, dan kamu juga minta struktur organisasi **nyata** berdasarkan Laporan Harian Monitoring Siber Kodam I/BB. Dua perubahan ini saling berkaitan, jadi dokumen ini ditulis ulang dari nol.

### 1.1 Perubahan Skema yang Memengaruhi Cara Seed

| Area | v1.0 (lama) | v2.0 (schema final) | Dampak ke Seed |
|---|---|---|---|
| Model `User` | Field generik (`fullName`, `username`, `password` di luar Better Auth) | **Native Better Auth fields**: `email`, `emailVerified`, `username`, `displayUsername`, `image`, `role: String`, `banned`, `banReason`, `banExpires` — field custom kita (`nip`, `failedLoginAttempts`, `lockedUntil`, dst.) ditambahkan di model yang sama | User **wajib** dibuat lewat `auth.api.createUser()`, field `role` sekarang **String** bebas (bukan enum), `banned`/`banExpires` menggantikan logic lockout manual sebagian |
| Auth tables | Diasumsikan terpisah | `Session`, `Account`, `Verification`, `RateLimit` eksplisit ada di schema, dengan `Session.impersonatedBy` (mendukung admin plugin "impersonate user") | Tidak perlu manual insert — Better Auth API yang isi |
| `Order` | Field generic posting | Tambahan: `postingSourceUrl`, `postingTargetPlatforms` (Json), relasi baru `OrderSocialTarget[]` | Order jenis `posting` sekarang bisa punya **banyak** target sosmed (multi-platform) lewat tabel terpisah, bukan cuma satu `targetUrl` |
| **`OrderSocialTarget`** (baru) | Tidak ada | Tabel baru: `orderId`, `platform`, `url`, `sortOrder` | Dipakai untuk perintah yang menyasar lebih dari 1 link/platform sekaligus (umum di kasus monitoring siber lintas platform) |
| **`ActivityLog`** (baru) | Tidak ada | Tabel baru: `activityKey` (unique), `type` (enum: `order_created`, `order_sent`, `submission_sent`), relasi opsional ke actor/order/assignment/submission | Dashboard Admin "Aktivitas Terbaru" sekarang **harus** dari tabel ini, bukan data dummy hardcoded |
| `OrderTarget` | unique constraint longgar | `@@unique([orderId, unitId])` **dan** `@@unique([orderId, userId])` terpisah | Tidak masalah untuk seed, tapi insert harus hormati constraint ini |
| `Submission` | Hanya `driveLink` | Tambahan `platformLinks` (Json) — submission bisa lampirkan link per platform, bukan cuma 1 link Drive | Skenario submission sekarang bisa diisi `platformLinks` untuk kasus multi-platform |

### 1.2 Konsekuensi Langsung untuk Cara Kita Seed

1. **User WAJIB dibuat via `auth.api.createUser()`** — sama seperti v1.0, tidak berubah prinsipnya. Tapi field `email` sekarang **wajib unique** dan ada `emailVerified` (kita set `true` semua karena tidak ada flow verifikasi email).
2. **`role` adalah String bebas**, bukan enum Prisma — jadi nilai `"super_admin"` dan `"member"` hanya konvensi aplikasi, bukan dibatasi database. Validasi role tetap dilakukan di application layer (Route Handler / middleware), bukan di constraint DB.
3. **`ActivityLog` harus diisi manual saat seed** setiap kali kita membuat Order (`order_created`), mengirim Order (`order_sent`), dan membuat Submission (`submission_sent`) — supaya Dashboard Admin punya data untuk ditampilkan.
4. **`OrderSocialTarget` diisi** untuk perintah yang menyasar isu viral lintas platform (sesuai konteks laporan monitoring siber kamu, satu isu sering muncul di YouTube + Twitter/X + TikTok + Instagram + Facebook sekaligus).

---

## 2. Struktur Organisasi — Kodam I/BB (Sesuai Dokumen Laporan)

Berdasarkan kop & tembusan surat yang kamu lampirkan, struktur hierarkinya:

```
🏛️  MABES AD (Markas Besar Angkatan Darat)               — Level 0, root
│
└── 🎖️  KODAM I/BUKIT BARISAN                              — Level 1
      Pangdam I/BB (Komandan Kodam)
      │
      ├── 👤 Kasdam I/BB                                   — anggota langsung Kodam (staf)
      ├── 👤 Irdam I/BB                                    — anggota langsung Kodam (inspektorat)
      ├── 👤 Asisten Operasi Kasdam I/BB                   — anggota langsung Kodam
      ├── 👤 Asisten Intelijen Kasdam I/BB                 — anggota langsung Kodam
      │
      ├── 🏢 KOREM 022/PT (Pantai Timur)                   — Level 2
      ├── 🏢 KOREM 023/KS (Kawal Samudera)                 — Level 2
      ├── 🏢 KOREM 031/WB (Wira Bima)                      — Level 2
      ├── 🏢 KOREM 032/WBR (Wirabraja)                     — Level 2
      │
      ├── 🏢 SATBALAKDAM I/BB — Denintel                   — Level 2
      ├── 🏢 SATBALAKDAM I/BB — Denpom                     — Level 2
      ├── 🏢 SATBALAKDAM I/BB — Denkesyah                   — Level 2
      └── 🏢 SATBALAKDAM I/BB — Zidam                       — Level 2
```

> **Catatan istilah:** "Tembusan" dalam surat dinas **bukan** berarti penerima tembusan langsung jadi target perintah — tembusan hanya menandakan siapa yang *mendapat info copy* surat. Dalam konteks aplikasi, daftar tembusan kita gunakan untuk menentukan **siapa saja yang perlu didaftarkan sebagai user/Komandan** di sistem, karena merekalah yang secara struktural relevan menerima perintah monitoring siber dari Pangdam.

### 2.1 Pemetaan Tembusan ke Struktur Tree

| Tembusan di Surat | Posisi di Tree | Keterangan |
|---|---|---|
| Pangdam I/BB | Komandan Kodam I/BB | Penerima utama laporan, juga pembuat perintah ke jajaran |
| Kasdam I/BB | Anggota langsung Kodam I/BB | Kepala Staf — posisi staf, tidak punya bawahan di tree |
| Irdam I/BB | Anggota langsung Kodam I/BB | Inspektorat — posisi staf |
| Para Danrem jajaran Kodam I/BB | **Komandan** masing-masing Korem | Setiap Korem punya 1 Komandan (Danrem) |
| Para Asisten Kasdam I/BB | Anggota langsung Kodam I/BB (beberapa) | Staf asisten, jamak — kita buat 2 sebagai sampel |
| Para Ka/Dansatbalakdam I/BB | **Komandan** masing-masing Satbalakdam | Setiap Satbalakdam punya 1 Komandan |

---

## 3. Daftar Lengkap User (Personil)

### 3.1 Level Mabes AD & Kodam (Root + Level 1)

| No | Nama Lengkap | Username | Posisi | Role App | NIP | Email (dummy) |
|----|---|---|---|---|---|---|
| 1 | Super Admin Sistem | `superadmin` | — | `super_admin` | — | superadmin@internal.komando |
| 2 | Jenderal TNI Maruli Simanjuntak | `kasad` | Kepala Staf AD (Komandan Mabes AD) | `member` | `NIP-AD-0001` | kasad@internal.komando |
| 3 | Mayor Jenderal TNI Putranto Gatot | `pangdam_ibb` | **Pangdam I/Bukit Barisan** (Komandan Kodam I/BB) | `member` | `NIP-KODAM-0001` | pangdam_ibb@internal.komando |
| 4 | Brigadir Jenderal TNI Hendra Wijaya | `kasdam_ibb` | Kasdam I/BB (staf, anggota langsung Kodam) | `member` | `NIP-KODAM-0002` | kasdam_ibb@internal.komando |
| 5 | Kolonel Inf. Bambang Setiawan | `irdam_ibb` | Irdam I/BB (staf, anggota langsung Kodam) | `member` | `NIP-KODAM-0003` | irdam_ibb@internal.komando |
| 6 | Kolonel Inf. Andi Prasetya | `asops_kasdam` | Asisten Operasi Kasdam I/BB | `member` | `NIP-KODAM-0004` | asops_kasdam@internal.komando |
| 7 | Kolonel Inf. Dedi Kurniawan | `asintel_kasdam` | Asisten Intelijen Kasdam I/BB | `member` | `NIP-KODAM-0005` | asintel_kasdam@internal.komando |

### 3.2 Komandan Korem (Danrem) — Level 2

| No | Nama Lengkap | Username | Posisi | NIP | Satuan |
|----|---|---|---|---|---|
| 8  | Kolonel Inf. Ridwan Hutapea | `danrem_022` | Danrem 022/Pantai Timur | `NIP-REM-0022` | Korem 022/PT |
| 9  | Kolonel Inf. Surya Atmaja | `danrem_023` | Danrem 023/Kawal Samudera | `NIP-REM-0023` | Korem 023/KS |
| 10 | Kolonel Inf. Fadli Ramadhan | `danrem_031` | Danrem 031/Wira Bima | `NIP-REM-0031` | Korem 031/WB |
| 11 | Kolonel Inf. Yusuf Maulana | `danrem_032` | Danrem 032/Wirabraja | `NIP-REM-0032` | Korem 032/WBR |

### 3.3 Komandan Satbalakdam (Ka/Dan) — Level 2

| No | Nama Lengkap | Username | Posisi | NIP | Satuan |
|----|---|---|---|---|---|
| 12 | Letnan Kolonel Inf. Aditya Wibowo | `dandenintel` | Komandan Denintel Kodam I/BB | `NIP-SAT-0001` | Satbalakdam — Denintel |
| 13 | Letnan Kolonel Cpm. Bayu Saputra | `dandenpom`   | Komandan Denpom Kodam I/BB   | `NIP-SAT-0002` | Satbalakdam — Denpom |
| 14 | Letnan Kolonel Ckm. dr. Reza Pahlevi | `kadenkesyah` | Kepala Denkesyah Kodam I/BB | `NIP-SAT-0003` | Satbalakdam — Denkesyah |
| 15 | Letnan Kolonel Czi. Hario Nugroho | `danzidam` | Komandan Zidam I/BB | `NIP-SAT-0004` | Satbalakdam — Zidam |

### 3.4 Anggota Pelaksana — Setiap Korem (3 anggota) & Setiap Satbalakdam (2 anggota)

**Korem 022/PT:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 16 | Sersan Mayor Joko Susilo | `joko_susilo` | `NIP-REM022-001` |
| 17 | Sersan Kepala Agus Salim | `agus_salim` | `NIP-REM022-002` |
| 18 | Sersan Dwi Cahyono | `dwi_cahyono` | `NIP-REM022-003` |

**Korem 023/KS:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 19 | Sersan Mayor Rudi Hartanto | `rudi_hartanto` | `NIP-REM023-001` |
| 20 | Sersan Kepala Bayu Pamungkas | `bayu_pamungkas` | `NIP-REM023-002` |
| 21 | Sersan Indra Lesmana | `indra_lesmana` | `NIP-REM023-003` |

**Korem 031/WB:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 22 | Sersan Mayor Hadi Purnomo | `hadi_purnomo` | `NIP-REM031-001` |
| 23 | Sersan Kepala Fajar Sidiq | `fajar_sidiq` | `NIP-REM031-002` |
| 24 | Sersan Wahyu Adi | `wahyu_adi` | `NIP-REM031-003` |

**Korem 032/WBR:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 25 | Sersan Mayor Galih Permana | `galih_permana` | `NIP-REM032-001` |
| 26 | Sersan Kepala Tri Wibowo | `tri_wibowo` | `NIP-REM032-002` |
| 27 | Sersan Eko Prabowo | `eko_prabowo` | `NIP-REM032-003` |

**Satbalakdam — Denintel:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 28 | Sersan Kepala Doni Saputro | `doni_saputro` | `NIP-DENINTEL-001` |
| 29 | Sersan Arif Budiman | `arif_budiman` | `NIP-DENINTEL-002` |

**Satbalakdam — Denpom:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 30 | Sersan Kepala Maman Suherman | `maman_suherman` | `NIP-DENPOM-001` |
| 31 | Sersan Yanto Kurniawan | `yanto_kurniawan` | `NIP-DENPOM-002` |

**Satbalakdam — Denkesyah:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 32 | Sersan Kepala Dewi Anggraini | `dewi_anggraini` | `NIP-DENKES-001` |
| 33 | Sersan Lina Marlina | `lina_marlina` | `NIP-DENKES-002` |

**Satbalakdam — Zidam:**

| No | Nama Lengkap | Username | NIP |
|----|---|---|---|
| 34 | Sersan Kepala Bagus Setiadi | `bagus_setiadi` | `NIP-ZIDAM-001` |
| 35 | Sersan Catur Nugraha | `catur_nugraha` | `NIP-ZIDAM-002` |

> **Total user: 35** (1 super admin + 6 level Mabes/Kodam + 4 Danrem + 4 Ka/Dan Satbalakdam + 20 anggota pelaksana)

**Password seragam per kelompok (memudahkan testing):**

| Kelompok | Password |
|---|---|
| Super Admin | `Admin@1234!` |
| Mabes AD & Kodam (level staf tinggi) | `Komando@123!` |
| Danrem & Ka/Dan Satbalakdam | `Komandan@123!` |
| Anggota pelaksana | `Anggota@123!` |

---

## 4. Daftar Satuan (Unit Tree)

| No | Nama Satuan | Parent | Level | Pimpinan |
|---|---|---|---|---|
| 1 | Mabes AD | — | 0 | `kasad` |
| 2 | Kodam I/Bukit Barisan | Mabes AD | 1 | `pangdam_ibb` |
| 3 | Korem 022/Pantai Timur | Kodam I/BB | 2 | `danrem_022` |
| 4 | Korem 023/Kawal Samudera | Kodam I/BB | 2 | `danrem_023` |
| 5 | Korem 031/Wira Bima | Kodam I/BB | 2 | `danrem_031` |
| 6 | Korem 032/Wirabraja | Kodam I/BB | 2 | `danrem_032` |
| 7 | Satbalakdam — Denintel | Kodam I/BB | 2 | `dandenintel` |
| 8 | Satbalakdam — Denpom | Kodam I/BB | 2 | `dandenpom` |
| 9 | Satbalakdam — Denkesyah | Kodam I/BB | 2 | `kadenkesyah` |
| 10 | Satbalakdam — Zidam | Kodam I/BB | 2 | `danzidam` |

**Catatan posisi staf (Kasdam, Irdam, Asisten):** mereka **anggota langsung** di satuan "Kodam I/Bukit Barisan" — bukan komandan satuan tersendiri, karena mereka adalah staf/inspektorat, bukan unit komando berjenjang. Ini konsisten dengan prinsip dari dokumen kamu sebelumnya: Komandan = siapa pun yang memimpin minimal satu satuan; staf seperti Kasdam tidak memimpin satuan terpisah, jadi statusnya tetap "Anggota" dalam tree meskipun pangkatnya tinggi.

---

## 5. Daftar Perintah (Orders) — Berdasarkan Isu di Laporan Monitoring Siber

### Catatan Seed: Membership Wajib Pimpinan Satuan

Setiap baris di bawah wajib ada sebagai `UnitMember` aktif (`removedAt = null`). Ini memastikan `Unit.commanderId` tidak menunjuk user dari satuan lain.

| Pimpinan | Wajib menjadi anggota aktif di satuan |
|---|---|
| `kasad` | Mabes AD |
| `pangdam_ibb` | Kodam I/Bukit Barisan |
| `danrem_022` | Korem 022/Pantai Timur |
| `danrem_023` | Korem 023/Kawal Samudera |
| `danrem_031` | Korem 031/Wira Bima |
| `danrem_032` | Korem 032/Wirabraja |
| `dandenintel` | Satbalakdam â€” Denintel |
| `dandenpom` | Satbalakdam â€” Denpom |
| `kadenkesyah` | Satbalakdam â€” Denkesyah |
| `danzidam` | Satbalakdam â€” Zidam |

Total membership aktif seed: **34** (semua user member kecuali `superadmin`).

Mengikuti instruksi kamu: **4 jenis perintah variatif** (posting, Blasting, counter, report_akun), dengan isu yang diangkat dari laporan harian yang kamu lampirkan (isu AS-Iran, kenaikan harga BBM, rapat tertutup Komisi I DPR, dan isu MBG/Luhut). Secara transisi database masih menyimpan Blasting sebagai enum internal `engagement`, tetapi UI/API menampilkan label **Blasting**.

| No | Judul | Jenis | Isu Sumber | Pembuat | Target | Deadline | Status |
|---|---|---|---|---|---|---|---|
| 1 | Counter Narasi Provokasi Konflik AS–Iran | `counter` | Berita AS serang Iran (Internasional) | `pangdam_ibb` | Seluruh Kodam I/BB | +6 jam | `aktif` |
| 2 | Monitoring Sebaran Isu Kenaikan Harga BBM | `report_akun` | Pertamax naik Rp16.250 (Nasional) | `kasdam_ibb` | Korem 022/PT + Korem 023/KS | +24 jam | `aktif` |
| 3 | Sosialisasi Positif Program MBG di Wilayah | `posting` | Statement Luhut soal MBG (Nasional) | `pangdam_ibb` | Seluruh Korem (4 Korem) | +48 jam | `aktif` |
| 4 | Engagement Klarifikasi Rapat Tertutup Komisi I DPR | `engagement` | Rapat tertutup Komisi I DPR-Menhan (Nasional) | `asintel_kasdam` | Satbalakdam — Denintel | +12 jam (lampau) | `expired` |
| 5 | Monitoring Akun Penyebar Hoaks Isu Militer AS-Iran | `report_akun` | Spekulasi sekitar isu internasional | `danrem_031` | Korem 031/WB | -1 hari (lampau) | `expired` |
| 6 | Draft — Apresiasi Kinerja Pemerintah Triwulan II | `posting` | Rancangan, belum final | `pangdam_ibb` | — | +7 hari | `draft` |

### 5.1 Detail Konten Setiap Order (untuk seed)

**Order 1 — Counter Narasi Provokasi Konflik AS–Iran (`counter`, AKTIF)**
- `targetUrl` referensi: link YouTube "AS-Iran Kembali Panas..." dari laporan
- `narration`: "Mari kita bijak menyikapi pemberitaan internasional. Fokus pada kondisi dalam negeri yang kondusif dan terus jaga persatuan."
- Memakai `OrderSocialTarget` — disasarkan ke **3 platform sekaligus**: YouTube, Twitter/X, TikTok (mengikuti pola asli laporan yang ada di banyak platform)

**Order 2 — Monitoring Sebaran Isu Kenaikan Harga BBM (`report_akun`, AKTIF)**
- `targetUrl` referensi: artikel Kompas soal harga BBM
- `reportReason`: "Provokasi / Disinformasi Harga"
- Instruksi: pantau akun-akun yang menyebar narasi provokatif terkait kenaikan BBM dan laporkan akun yang melanggar

**Order 3 — Sosialisasi Positif Program MBG (`posting`, AKTIF)**
- `postingSourceUrl`: link Facebook statement Luhut soal MBG
- `postingTargetPlatforms`: `["instagram", "facebook", "twitter_x"]`
- `narration`: "Program Makan Bergizi Gratis terus dibenahi untuk masa depan generasi bangsa. Mari kita dukung program positif untuk anak-anak Indonesia! #MBG #BersamaMajuBangsa"

**Order 4 — Engagement Klarifikasi Rapat Tertutup Komisi I DPR (`engagement`, EXPIRED)**
- `engagementActions`: `["like", "share"]`
- `targetUrl` referensi: artikel Liputan6 soal rapat tertutup Komisi I DPR

**Order 5 — Monitoring Akun Penyebar Hoaks Isu Militer (`report_akun`, EXPIRED)**
- `reportReason`: "Informasi Palsu / Hoaks Isu Pertahanan"

**Order 6 — Draft Apresiasi Kinerja Pemerintah (`posting`, DRAFT)**
- Belum dikirim, masih dalam proses penyusunan narasi oleh Pangdam

---

## 6. Skenario Assignment & Submission (Testing States)

| Order | Anggota | Status | Catatan |
|---|---|---|---|
| **Order 1** (deadline 6 jam) | `joko_susilo`, `agus_salim` (Korem 022) | `selesai` | Submit dengan `platformLinks` multi-platform |
| | `rudi_hartanto` (Korem 023) | `selesai` | |
| | `dwi_cahyono`, `indra_lesmana`, dan sisanya | `belum_dikerjakan` | Untuk uji tampilan progress yang masih berjalan |
| **Order 2** (report BBM) | Semua anggota Korem 022 & 023 (6 orang) | mix: 3 `selesai`, 1 `terlambat`, 2 `belum_dikerjakan` | |
| **Order 3** (posting MBG, semua Korem) | 12 anggota (3 per Korem × 4 Korem) + 4 Danrem | mix realistis: ~60% selesai, 15% terlambat, sisanya belum | Order paling besar — bagus untuk uji dashboard dengan skala lebih besar |
| **Order 4** (EXPIRED, Denintel) | `doni_saputro`, `arif_budiman` | 1 `terlambat`, 1 `belum_dikerjakan` | |
| **Order 5** (EXPIRED, Korem 031) | `hadi_purnomo`, `fajar_sidiq`, `wahyu_adi` + `danrem_031` | 2 `selesai`, 1 `terlambat`, 1 `belum_dikerjakan` | |

---

## 7. Akun Sosial Media (Sampel)

| User | Platform | Username |
|---|---|---|
| `joko_susilo` | instagram | `@joko.susilo_tni` |
| `joko_susilo` | twitter_x | `@joko_tni022` |
| `agus_salim` | tiktok | `@agus.salim.tni` |
| `rudi_hartanto` | instagram | `@rudi_korem023` |
| `hadi_purnomo` | instagram | `@hadi.purnomo31` |
| `hadi_purnomo` | facebook | `Hadi Purnomo TNI` |
| `doni_saputro` | twitter_x | `@doni_denintel` |
| `bagus_setiadi` | instagram | `@bagus.zidam` |

> Beberapa anggota (`dwi_cahyono`, `indra_lesmana`, `tri_wibowo`, dll) **sengaja tidak punya akun sosmed** terdaftar untuk menguji empty state "Belum Daftarkan Akun Sosmed".

---

## 8. ActivityLog yang Harus Dibuat

Karena schema final punya tabel `ActivityLog`, seed **wajib** mengisi log untuk dashboard Admin. Pola `activityKey` harus unik — gunakan format `{type}-{entityId}`:

| activityKey | type | Pemicu |
|---|---|---|
| `order_created-{order1.id}` | `order_created` | Saat Order 1 dibuat |
| `order_sent-{order1.id}` | `order_sent` | Saat Order 1 dikirim (status → aktif) |
| `submission_sent-{submission_joko.id}` | `submission_sent` | Saat `joko_susilo` submit bukti Order 1 |
| ...dst | | Diulang untuk setiap Order yang dikirim dan setiap Submission yang dibuat |

Setiap Order yang berstatus `aktif`/`selesai`/`expired` minimal harus punya 2 log (`order_created` + `order_sent`). Setiap Submission harus punya 1 log (`submission_sent`). Order berstatus `draft` hanya punya `order_created`, tidak ada `order_sent`.

---

## 9. Hal yang Perlu Diperhatikan Developer Saat Implementasi Seed

| # | Catatan |
|---|---|
| 1 | `email` di model `User` sekarang **unique dan required** — gunakan domain dummy konsisten: `{username}@internal.komando` |
| 2 | `emailVerified` di-set `true` untuk semua user seed (tidak ada flow verifikasi nyata) |
| 3 | `role` adalah `String`, bukan enum — pastikan hanya isi `"super_admin"` atau `"member"` secara konvensi aplikasi |
| 4 | `banned` default `false` — tidak perlu di-set kecuali mau seed skenario user yang di-ban via Better Auth admin plugin |
| 5 | Field lockout (`failedLoginAttempts`, `lockedUntil`) tetap dipakai untuk skenario login gagal — **berbeda** dari `banned`/`banExpires` Better Auth yang untuk admin ban manual |
| 6 | `Unit.path` tetap dihitung programatis: `{parentPath}{unit.id}/` — sama seperti v1.0 |
| 7 | `OrderTarget` punya 2 unique constraint terpisah (`[orderId, unitId]` dan `[orderId, userId]`) — insert per baris, jangan gabung target unit dan user dalam compound key yang sama |
| 8 | `OrderSocialTarget` baru — wajib diisi untuk Order 1 dan Order 3 yang menyasar multi-platform; Order lain yang cuma 1 link tetap pakai `description`/`targetUrl` konvensional di field utama Order tanpa perlu `OrderSocialTarget` |
| 9 | `ActivityLog.activityKey` **harus unique** — selalu sertakan ID entitas terkait dalam key untuk menghindari collision saat re-seed |
| 10 | Urutan insert wajib: User (via Better Auth) → Unit (parent dulu) → UnitMember → SocialAccount → Order → OrderTarget/OrderSocialTarget → TaskAssignment → Submission → ActivityLog (paling akhir, karena depend ke semua entitas lain) |

---

## 10. Skenario Testing yang Tersedia Setelah Seed

| Skenario | User | Yang Diuji |
|---|---|---|
| Login Pangdam, lihat dashboard tingkat Kodam | `pangdam_ibb` / `Komando@123!` | Dashboard Komandan dengan cakupan seluruh Kodam I/BB (4 Korem + 4 Satbalakdam) |
| Login Danrem, lihat dashboard tingkat Korem saja | `danrem_022` / `Komandan@123!` | Dashboard Komandan ter-scope hanya ke Korem 022 |
| Login anggota pelaksana | `joko_susilo` / `Anggota@123!` | Perintah Saya — campuran selesai & pending |
| Order lintas-platform | Lihat Order 1 & 3 sebagai `pangdam_ibb` | Tampilan `OrderSocialTarget` multi-platform di detail perintah |
| Dashboard Admin — Activity Log | `superadmin` / `Admin@1234!` | Recent Activity terisi dari tabel `ActivityLog` asli, bukan dummy |
| Hierarki 3 level dalam (Mabes AD → Kodam → Korem) | `superadmin` di `/admin/units` | Tree depth 0–2 dengan path materialized benar |
| Staf vs Komandan | Bandingkan `kasdam_ibb` (anggota, bukan komandan) vs `danrem_022` (komandan) | Validasi `isCommander` flag bekerja benar — staf tidak otomatis jadi komandan |
| Empty state akun sosmed | `dwi_cahyono` / `Anggota@123!` | Halaman Akun Sosmed kosong |

---

## 11. Yang Perlu Dibuat Selanjutnya (Belum Termasuk di Dokumen Ini)

Dokumen ini adalah **spesifikasi data**, bukan kode-nya. Implementasi sebenarnya (file `prisma/seed.ts` lengkap mengikuti spesifikasi di atas) menyusul setelah kamu konfirmasi struktur ini sudah pas — supaya tidak bolak-balik nulis ulang kode kalau ada detail organisasi yang masih mau diubah.

Yang akan dibuat di tahap berikutnya:
1. `prisma/seed.ts` — implementasi penuh sesuai spesifikasi Section 3–8 di atas, dengan helper `createUser()` via Better Auth, helper `createUnit()` dengan materialized path, dan helper `logActivity()` untuk ActivityLog
2. Update bagian "Verifikasi Seed Data" (query SQL) untuk menyesuaikan nama tabel/kolom schema final (`order_social_targets`, `activity_logs`, dst.)
