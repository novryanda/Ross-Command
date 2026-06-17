# Use Case & Use Scenario Document
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                              |
|---------------|-----------------------------------------------------|
| **Dokumen**   | Use Case & Use Scenario Specification               |
| **Versi**     | v1.0                                                |
| **Tanggal**   | 16 Juni 2026                                        |
| **Author**    | System Analyst                                      |
| **Status**    | Draft                                               |

### Revision History

| Versi | Tanggal    | Deskripsi                        | Author          |
|-------|------------|----------------------------------|-----------------|
| v1.0  | 16-06-2026 | Initial draft — semua use case   | System Analyst  |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini mendefinisikan seluruh Use Case dan Use Scenario dari sistem **Komando Center**, sebuah web application untuk manajemen operasi sosial media berbasis hierarki organisasi berjenjang (n-level tree). Dokumen ini menjadi acuan utama dalam proses perancangan sistem, pengembangan fitur, dan pengujian.

### 1.2 Ruang Lingkup Sistem

Komando Center memungkinkan:
- Komandan membuat dan mendistribusikan perintah aksi sosial media ke satuan/anggota secara rekursif berdasarkan hierarki organisasi
- Anggota menerima perintah, melaksanakan, dan mengirimkan bukti berupa link Google Drive
- Anggota mendaftarkan akun sosial media mereka ke dalam sistem
- Komandan memantau progress pelaksanaan perintah secara real-time
- Admin mengelola struktur organisasi, user, dan konfigurasi sistem

### 1.3 Definisi & Akronim

| Istilah           | Definisi                                                                                   |
|-------------------|--------------------------------------------------------------------------------------------|
| Komando Center    | Nama sistem yang dibangun                                                                  |
| Satuan            | Node dalam hierarki organisasi yang dapat berisi sub-satuan dan/atau anggota               |
| Anggota           | User yang berada di leaf node hierarki — tidak memiliki bawahan                            |
| Komandan          | User yang memiliki bawahan (satuan atau anggota) dalam hierarki                            |
| Perintah (Order)  | Instruksi aksi sosial media yang diterbitkan oleh Komandan                                 |
| Assignment        | Record penugasan perintah kepada anggota individual                                        |
| Broadcast         | Proses distribusi perintah ke seluruh anggota dalam satuan target secara rekursif          |
| Tree Traversal    | Penelusuran rekursif dari node satuan ke seluruh anggota di bawahnya                       |
| Link Drive        | URL Google Drive yang berisi bukti pelaksanaan perintah                                    |
| Akun Sosmed       | Akun media sosial milik anggota yang didaftarkan ke sistem                                 |

---

## 2. Aktor Sistem

| Actor ID | Actor          | Deskripsi                                                                                                     |
|----------|----------------|---------------------------------------------------------------------------------------------------------------|
| ACT-01   | **Super Admin** | Mengelola seluruh sistem: struktur organisasi, akun user, dan konfigurasi. Tidak terlibat dalam alur perintah. |
| ACT-02   | **Komandan**   | User yang memiliki bawahan dalam hierarki. Bisa memberi perintah ke bawahan. Bisa sekaligus menerima perintah dari atasan (kecuali Komandan level tertinggi). |
| ACT-03   | **Anggota**    | User leaf node — tidak memiliki bawahan. Hanya menerima dan mengeksekusi perintah.                            |
| ACT-04   | **System**     | Aktor sekunder. Menjalankan proses otomatis: broadcast rekursif, update status, notifikasi.                   |

> **Catatan Penting:** ACT-02 dan ACT-03 bukan role yang di-hardcode terpisah. Penentuan dilakukan secara dinamis berdasarkan posisi user dalam tree hierarki. Komandan = siapapun yang memiliki minimal satu child node (satuan/anggota) dalam hierarki.

---

## 3. Katalog Use Case

### MODULE 1 — Manajemen Organisasi

| UC ID  | Use Case                              | Actor Utama  |
|--------|---------------------------------------|--------------|
| UC-01  | Kelola Struktur Organisasi (Tree)     | Super Admin  |
| UC-02  | Tambah / Edit / Hapus Satuan          | Super Admin  |
| UC-03  | Tambah / Edit / Hapus User Anggota   | Super Admin  |
| UC-04  | Assign Anggota ke Satuan              | Super Admin  |

### MODULE 2 — Manajemen Akun Sosial Media

| UC ID  | Use Case                              | Actor Utama           |
|--------|---------------------------------------|-----------------------|
| UC-05  | Daftarkan Akun Sosmed                 | Anggota / Komandan   |
| UC-06  | Edit / Hapus Akun Sosmed              | Anggota / Komandan   |
| UC-07  | Lihat Daftar Akun Sosmed Sendiri      | Anggota / Komandan   |
| UC-08  | Lihat Akun Sosmed Bawahan             | Komandan              |

### MODULE 3 — Manajemen Perintah

| UC ID  | Use Case                              | Actor Utama  |
|--------|---------------------------------------|--------------|
| UC-09  | Buat Perintah Baru                    | Komandan     |
| UC-10  | Tentukan Target Perintah              | Komandan     |
| UC-11  | Broadcast Perintah ke Satuan (Auto)   | System       |
| UC-12  | Edit / Batalkan Perintah              | Komandan     |
| UC-13  | Lihat Daftar Perintah yang Dibuat     | Komandan     |

### MODULE 4 — Eksekusi & Pelaporan

| UC ID  | Use Case                              | Actor Utama           |
|--------|---------------------------------------|-----------------------|
| UC-14  | Lihat Daftar Perintah yang Diterima   | Anggota / Komandan   |
| UC-15  | Submit Bukti Pelaksanaan (Link Drive) | Anggota / Komandan   |
| UC-16  | Auto Update Status Selesai            | System                |

### MODULE 5 — Monitoring & Dashboard

| UC ID  | Use Case                              | Actor Utama  |
|--------|---------------------------------------|--------------|
| UC-17  | Lihat Dashboard Progress Perintah     | Komandan     |
| UC-18  | Filter Progress per Satuan / Periode  | Komandan     |
| UC-19  | Lihat Detail Submission Anggota       | Komandan     |

### MODULE 6 — Autentikasi

| UC ID  | Use Case                              | Actor Utama   |
|--------|---------------------------------------|---------------|
| UC-20  | Login ke Sistem                       | Semua Actor   |
| UC-21  | Logout dari Sistem                    | Semua Actor   |
| UC-22  | Ganti Password                        | Semua Actor   |

---

## 4. Use Case Scenario Detail

---

### UC-20: Login ke Sistem

**Actor(s):** Super Admin / Komandan / Anggota (Primary), System (Secondary)
**Trigger:** User mengakses halaman login dan mengisi form kredensial
**Preconditions:**
- User memiliki akun yang sudah dibuat oleh Admin
- User belum dalam kondisi login (tidak memiliki sesi aktif)

**Main Success Scenario:**
1. User membuka halaman login Komando Center
2. User mengisi field **Username** dan **Password**
3. User klik tombol "Login"
4. System memvalidasi format input (tidak boleh kosong)
5. System memverifikasi kredensial ke database
6. System mengidentifikasi role dan posisi user dalam hierarki
7. System membuat sesi aktif dan menerbitkan token autentikasi
8. System mengarahkan user ke Dashboard sesuai role (Dashboard Komandan / Dashboard Anggota / Panel Admin)

**Alternative Flows:**
- **A1 — Langkah 5: Username tidak ditemukan:**
  1. System menampilkan pesan: "Username atau password salah"
  2. System mencatat percobaan gagal
  3. Kembali ke form login

- **A2 — Langkah 5: Password salah:**
  1. System menampilkan pesan generik yang sama dengan A1 (tidak mengungkap mana yang salah)
  2. Jika percobaan gagal ≥ 5 kali, lanjut ke E1

**Exception Flows:**
- **E1 — Akun terkunci:**
  1. System mengunci akun selama 30 menit
  2. System menampilkan: "Akun terkunci sementara. Hubungi Admin untuk membuka akses."

**Postconditions (Success):** Sesi user aktif; user diarahkan ke dashboard sesuai role
**Postconditions (Failure):** Tidak ada sesi dibuat; percobaan gagal tercatat

**Business Rules:**
- BR-001: Pesan error login harus generik — tidak boleh mengungkap apakah username atau password yang salah
- BR-002: Akun dikunci setelah 5 percobaan gagal berturutan

**Related Use Cases:** UC-21 (Logout)

---

### UC-21: Logout dari Sistem

**Actor(s):** Super Admin / Komandan / Anggota
**Trigger:** User klik tombol "Logout"
**Preconditions:**
- User memiliki sesi aktif

**Main Success Scenario:**
1. User klik tombol "Logout" di navigasi
2. System menampilkan konfirmasi: "Apakah kamu yakin ingin keluar?"
3. User klik "Ya, Keluar"
4. System menghapus token sesi di server
5. System menghapus data sesi di sisi client (browser)
6. System mengarahkan user kembali ke halaman Login

**Alternative Flows:**
- **A1 — Langkah 3: User memilih "Batal":**
  1. Konfirmasi ditutup
  2. User tetap berada di halaman sebelumnya dengan sesi aktif

**Postconditions (Success):** Sesi dihapus; token tidak valid lagi; user di halaman Login

---

### UC-22: Ganti Password

**Actor(s):** Super Admin / Komandan / Anggota
**Trigger:** User membuka menu "Pengaturan Akun" dan memilih "Ganti Password"
**Preconditions:**
- User memiliki sesi aktif

**Main Success Scenario:**
1. User membuka halaman Pengaturan Akun
2. User mengisi field: **Password Lama**, **Password Baru**, **Konfirmasi Password Baru**
3. User klik "Simpan Password Baru"
4. System memverifikasi Password Lama cocok dengan yang tersimpan di database
5. System memvalidasi Password Baru (minimal 8 karakter)
6. System memvalidasi Password Baru = Konfirmasi Password Baru
7. System menyimpan password baru dalam bentuk hash
8. System menampilkan notifikasi: "Password berhasil diperbarui"

**Alternative Flows:**
- **A1 — Langkah 4: Password lama salah:**
  1. System menampilkan: "Password lama tidak sesuai"
  2. Form tidak di-reset, user diminta isi ulang field Password Lama

- **A2 — Langkah 5: Password baru terlalu pendek:**
  1. System menampilkan: "Password minimal 8 karakter"

- **A3 — Langkah 6: Konfirmasi tidak cocok:**
  1. System menampilkan: "Konfirmasi password tidak sesuai"

**Postconditions (Success):** Password baru tersimpan; sesi tetap aktif

---

### UC-01: Kelola Struktur Organisasi

**Actor(s):** Super Admin
**Trigger:** Admin membuka menu "Manajemen Organisasi"
**Preconditions:**
- Admin sudah login

**Main Success Scenario:**
1. Admin membuka halaman Manajemen Organisasi
2. System menampilkan visualisasi tree hierarki seluruh organisasi (expandable/collapsible nodes)
3. Admin dapat melakukan operasi berikut pada setiap node:
   - Tambah sub-satuan di bawah satuan yang dipilih (UC-02)
   - Tambah anggota baru ke satuan yang dipilih (UC-03)
   - Pindahkan satuan ke parent satuan yang berbeda
   - Hapus satuan (dengan validasi)
4. System memperbarui visualisasi tree secara real-time setelah setiap operasi

**Business Rules:**
- BR-003: Satuan tidak dapat dihapus jika masih memiliki anggota aktif yang memiliki assignment perintah berstatus `BELUM_DIKERJAKAN`
- BR-004: Minimal harus ada 1 satuan root (level tertinggi) dalam sistem

**Related Use Cases:** UC-02, UC-03, UC-04

---

### UC-02: Tambah / Edit / Hapus Satuan

**Actor(s):** Super Admin
**Trigger:** Admin memilih opsi tambah/edit/hapus pada node satuan di tree organisasi
**Preconditions:**
- Admin sudah login dan berada di halaman Manajemen Organisasi

**Main Success Scenario (Tambah Satuan):**
1. Admin klik "Tambah Sub-Satuan" pada node satuan tertentu
2. System menampilkan form: Nama Satuan, Deskripsi (opsional), Komandan Satuan (pilih user)
3. Admin mengisi data dan klik "Simpan"
4. System memvalidasi nama satuan tidak duplikat dalam satu level yang sama
5. System membuat node satuan baru sebagai child dari satuan yang dipilih
6. System menampilkan notifikasi: "Satuan berhasil ditambahkan"

**Main Success Scenario (Edit Satuan):**
1. Admin klik "Edit" pada node satuan tertentu
2. System menampilkan form pre-filled dengan data satuan saat ini
3. Admin mengubah data yang diperlukan dan klik "Simpan"
4. System menyimpan perubahan dan memperbarui tree

**Main Success Scenario (Hapus Satuan):**
1. Admin klik "Hapus" pada node satuan tertentu
2. System memeriksa apakah satuan memiliki anggota aktif dengan assignment berstatus `BELUM_DIKERJAKAN`
3. Jika tidak ada: System menampilkan konfirmasi hapus
4. Admin klik "Ya, Hapus"
5. System menghapus satuan dan seluruh child node-nya secara rekursif
6. System menampilkan notifikasi: "Satuan berhasil dihapus"

**Alternative Flows:**
- **A1 — Langkah 2 (Hapus): Satuan masih memiliki assignment aktif:**
  1. System menampilkan: "Satuan tidak dapat dihapus. Terdapat X anggota dengan perintah aktif yang belum diselesaikan."
  2. Operasi hapus dibatalkan

**Postconditions (Success):** Tree hierarki diperbarui sesuai operasi yang dilakukan

---

### UC-03: Tambah / Edit / Hapus User Anggota

**Actor(s):** Super Admin
**Trigger:** Admin memilih opsi tambah/edit/hapus user dari halaman Manajemen User atau dari node satuan
**Preconditions:**
- Admin sudah login

**Main Success Scenario (Tambah User):**
1. Admin klik "Tambah User Baru"
2. System menampilkan form: Nama Lengkap, Username, Password Awal, NIP/ID (opsional), Satuan (pilih dari dropdown tree)
3. Admin mengisi data dan klik "Simpan"
4. System memvalidasi username tidak sudah digunakan
5. System membuat akun user baru dan meng-assign ke satuan yang dipilih
6. System menampilkan notifikasi: "User berhasil ditambahkan"

**Alternative Flows:**
- **A1 — Langkah 4: Username sudah ada:**
  1. System menampilkan: "Username sudah digunakan. Pilih username lain."

**Postconditions (Success):** User baru terdaftar di sistem dan terhubung ke satuan yang dipilih

---

### UC-04: Assign Anggota ke Satuan

**Actor(s):** Super Admin
**Trigger:** Admin memilih opsi "Pindah Satuan" pada user tertentu
**Preconditions:**
- Admin sudah login
- User yang akan dipindah sudah terdaftar di sistem

**Main Success Scenario:**
1. Admin membuka detail user atau klik "Pindah Satuan" pada user tertentu
2. System menampilkan dropdown tree satuan yang tersedia
3. Admin memilih satuan tujuan
4. System memeriksa apakah user memiliki assignment aktif di satuan lama
5. System memindahkan user ke satuan baru
6. System menampilkan notifikasi: "Anggota berhasil dipindahkan ke [Nama Satuan]"

**Business Rules:**
- BR-005: User yang dipindah tetap memiliki kewajiban menyelesaikan assignment perintah yang sudah diterima sebelumnya
- BR-006: Assignment baru akan mengikuti satuan baru setelah proses pemindahan

---

### UC-05: Daftarkan Akun Sosial Media

**Actor(s):** Anggota / Komandan
**Trigger:** User membuka menu "Akun Sosial Media Saya" dan klik "Tambah Akun"
**Preconditions:**
- User sudah login
- User memiliki akun sosial media yang ingin didaftarkan

**Main Success Scenario:**
1. User membuka halaman "Akun Sosial Media Saya"
2. User klik tombol "Tambah Akun Baru"
3. System menampilkan form dengan field:
   - **Platform** (dropdown: Instagram / Twitter-X / Facebook / TikTok / YouTube / lainnya)
   - **Username / Handle** (contoh: @namaakun)
   - **URL Profil** (opsional — link langsung ke profil)
   - **Catatan** (opsional — misal: akun utama, akun cadangan)
4. User mengisi data dan klik "Simpan"
5. System memvalidasi: platform dipilih dan username tidak kosong
6. System menyimpan data akun sosmed ke profil user
7. System menampilkan notifikasi: "Akun sosial media berhasil didaftarkan"
8. Akun baru muncul dalam daftar akun sosmed user

**Alternative Flows:**
- **A1 — Langkah 5: Field wajib tidak diisi:**
  1. System menampilkan validasi inline: "Platform dan username wajib diisi"
  2. Form tidak disubmit

- **A2 — Langkah 5: Kombinasi platform + username sudah pernah didaftarkan:**
  1. System menampilkan: "Akun [platform] dengan username tersebut sudah terdaftar"
  2. User dapat memilih untuk melanjutkan dengan akun yang sudah ada atau membatalkan

**Postconditions (Success):** Akun sosmed tersimpan dan terhubung ke profil user; dapat dilihat oleh Komandan melalui UC-08

**Business Rules:**
- BR-007: Satu user dapat mendaftarkan lebih dari satu akun per platform
- BR-008: Data akun sosmed hanya bisa diedit/dihapus oleh pemilik akun atau Super Admin

**Related Use Cases:** UC-06, UC-07, UC-08

---

### UC-06: Edit / Hapus Akun Sosial Media

**Actor(s):** Anggota / Komandan
**Trigger:** User memilih opsi "Edit" atau "Hapus" pada akun sosmed tertentu di daftar akun mereka
**Preconditions:**
- User sudah login
- User memiliki minimal 1 akun sosmed yang sudah terdaftar

**Main Success Scenario (Edit):**
1. User membuka halaman "Akun Sosial Media Saya"
2. User klik ikon "Edit" pada akun yang ingin diubah
3. System menampilkan form pre-filled dengan data akun saat ini
4. User mengubah data yang diperlukan (username, URL profil, catatan)
5. User klik "Simpan Perubahan"
6. System menyimpan perubahan dan memperbarui tampilan daftar
7. System menampilkan notifikasi: "Data akun berhasil diperbarui"

**Main Success Scenario (Hapus):**
1. User klik ikon "Hapus" pada akun yang ingin dihapus
2. System menampilkan konfirmasi: "Hapus akun [platform] @[username]?"
3. User klik "Ya, Hapus"
4. System menghapus data akun dari sistem
5. System menampilkan notifikasi: "Akun berhasil dihapus"

**Postconditions (Success):** Data akun sosmed diperbarui/dihapus dari sistem

---

### UC-07: Lihat Daftar Akun Sosial Media Sendiri

**Actor(s):** Anggota / Komandan
**Trigger:** User membuka menu "Akun Sosial Media Saya"
**Preconditions:**
- User sudah login

**Main Success Scenario:**
1. User membuka halaman "Akun Sosial Media Saya"
2. System menampilkan daftar seluruh akun sosmed yang telah didaftarkan user
3. Setiap item menampilkan: Icon Platform, Username, URL Profil, Catatan, Tanggal Didaftarkan
4. User dapat melakukan filter berdasarkan platform
5. User dapat langsung klik "Tambah Akun" untuk mendaftarkan akun baru (UC-05)

**Postconditions:** User dapat melihat, mengedit, atau menghapus akun sosmed mereka

---

### UC-08: Lihat Akun Sosial Media Bawahan

**Actor(s):** Komandan
**Trigger:** Komandan membuka profil anggota atau menu "Anggota" di dashboard
**Preconditions:**
- Komandan sudah login
- Memiliki minimal 1 anggota di bawahnya

**Main Success Scenario:**
1. Komandan membuka halaman "Manajemen Anggota"
2. System menampilkan daftar seluruh anggota di bawah Komandan (sesuai hierarki)
3. Komandan klik nama anggota tertentu
4. System menampilkan profil anggota beserta daftar akun sosmed yang sudah didaftarkan
5. Komandan dapat melihat detail: Platform, Username, URL Profil dari setiap akun
6. Komandan dapat filter anggota berdasarkan satuan

**Alternative Flows:**
- **A1 — Anggota belum mendaftarkan akun sosmed:**
  1. System menampilkan: "Anggota ini belum mendaftarkan akun sosial media"

**Business Rules:**
- BR-009: Komandan hanya dapat melihat akun sosmed anggota yang berada dalam cakupan hierarki di bawahnya

---

### UC-09: Buat Perintah Baru

**Actor(s):** Komandan
**Trigger:** Komandan klik tombol "Buat Perintah Baru" dari halaman Manajemen Perintah
**Preconditions:**
- Komandan sudah login
- Minimal terdapat 1 satuan atau anggota di bawah Komandan dalam hierarki

**Main Success Scenario:**
1. Komandan membuka halaman "Manajemen Perintah" dan klik "Buat Perintah Baru"
2. System menampilkan form perintah dengan field:
   - **Judul Perintah** (wajib)
   - **Jenis Perintah** (dropdown — wajib): POSTING / ENGAGEMENT / KOMENTAR / REPORT_AKUN
   - **Deskripsi / Instruksi Lengkap** (wajib)
   - **Link Target** — URL postingan/akun sosmed yang jadi target (wajib)
   - **Deadline** — date + time picker (wajib)
3. Berdasarkan Jenis Perintah yang dipilih, System menampilkan field tambahan:
   - Jika `POSTING`: Field **Narasi / Caption yang harus diposting**, **Hashtag (opsional)**, **Lampiran konten (URL gambar/video opsional)**
   - Jika `ENGAGEMENT`: Checkbox kombinasi aksi — **Like** / **Share** / **Repost** (minimal 1 harus dipilih)
   - Jika `KOMENTAR`: Field **Narasi Komentar** (teks yang harus dipakai), **Sentimen** (Radio button: Positif / Negatif)
   - Jika `REPORT_AKUN`: Field **Alasan Report** (dropdown), **Catatan tambahan (opsional)**
4. Komandan mengisi seluruh field yang wajib
5. Komandan klik "Lanjut ke Pilih Target" — masuk ke UC-10
6. Setelah target dipilih, Komandan klik "Kirim Perintah"
7. System menyimpan perintah dengan status `AKTIF` dan mentrigger UC-11 (Broadcast)

**Alternative Flows:**
- **A1 — Simpan sebagai Draft:**
  1. Di langkah 6, Komandan klik "Simpan Draft"
  2. System menyimpan perintah dengan status `DRAFT`
  3. Perintah tidak di-broadcast; anggota belum menerima assignment
  4. Komandan dapat mengedit draft dan mengirimkannya di lain waktu

- **A2 — Form tidak lengkap:**
  1. System menampilkan validasi inline pada field yang belum diisi
  2. Komandan tidak dapat melanjutkan ke langkah pemilihan target

**Postconditions (Success):** Perintah tersimpan dengan status `AKTIF`; semua anggota target menerima assignment

**Business Rules:**
- BR-010: Deadline tidak boleh kurang dari 1 jam dari waktu perintah dikirim
- BR-011: Perintah dengan status `AKTIF` tidak dapat diedit kontennya — hanya dapat dibatalkan

**Related Use Cases:** UC-10 (includes), UC-11 (triggers), UC-12 (extends)

---

### UC-10: Tentukan Target Perintah

**Actor(s):** Komandan
**Trigger:** Komandan menyelesaikan pengisian form perintah dan klik "Lanjut ke Pilih Target" (included dari UC-09)
**Preconditions:**
- Form perintah (UC-09) sudah terisi lengkap dan valid

**Main Success Scenario:**
1. System menampilkan visualisasi tree hierarki organisasi yang berada di bawah Komandan saat ini
2. Komandan memilih target dengan klik node: bisa **Satuan** (node) atau **Anggota individu** (leaf)
3. Ketika Komandan memilih sebuah Satuan, System otomatis meng-highlight seluruh anggota di dalam satuan tersebut secara rekursif sebagai preview
4. Komandan dapat memilih lebih dari satu satuan/anggota sekaligus dengan multi-select
5. System menampilkan summary secara real-time: "Perintah ini akan dikirim ke **X anggota** dari **Y satuan**"
6. Komandan mengkonfirmasi target dengan klik "Konfirmasi Target"
7. Kembali ke UC-09 langkah 6 (klik "Kirim Perintah")

**Alternative Flows:**
- **A1 — Pilih Semua Bawahan:**
  1. Komandan klik "Pilih Semua"
  2. System memilih seluruh anggota yang berada di bawah Komandan
  3. Summary diperbarui menampilkan jumlah total

- **A2 — Tidak ada target yang dipilih:**
  1. Jika Komandan klik "Konfirmasi Target" tanpa memilih apapun
  2. System menampilkan: "Pilih minimal 1 satuan atau anggota sebagai target perintah"

**Postconditions:** Daftar target (satuan/anggota) terkonfirmasi dan siap untuk di-broadcast

---

### UC-11: Broadcast Perintah ke Satuan (Rekursif)

**Actor(s):** System (auto-triggered oleh UC-09)
**Trigger:** Perintah berhasil disimpan dengan status `AKTIF`
**Preconditions:**
- Perintah tersimpan dengan status `AKTIF`
- Daftar target (node satuan/anggota) sudah terdefinisi

**Main Success Scenario:**
1. System menerima daftar node target dari perintah yang baru dibuat
2. Untuk setiap node target yang merupakan **Satuan**, System melakukan tree traversal rekursif ke bawah
3. System mengumpulkan seluruh user leaf node (anggota) dari semua cabang yang ditelusuri
4. System melakukan deduplication — jika satu anggota masuk ke dalam dua satuan yang berbeda yang dipilih, hanya dibuat 1 assignment
5. System membuat record `TaskAssignment` untuk setiap anggota unik dengan data:
   - `order_id`: ID perintah
   - `user_id`: ID anggota
   - `status`: `BELUM_DIKERJAKAN`
   - `assigned_at`: timestamp saat ini
6. System mencatat total assignment yang berhasil dibuat

**Postconditions:** Seluruh anggota dalam satuan target (sampai level terdalam) memiliki TaskAssignment dengan status `BELUM_DIKERJAKAN`

**Business Rules:**
- BR-012: Satu anggota hanya boleh memiliki 1 assignment per perintah (tidak boleh duplikat)

---

### UC-12: Edit / Batalkan Perintah

**Actor(s):** Komandan
**Trigger:** Komandan memilih opsi "Edit" atau "Batalkan" pada perintah tertentu
**Preconditions:**
- Komandan sudah login
- Perintah yang dimaksud dibuat oleh Komandan ini
- Perintah berstatus `DRAFT` (untuk edit) atau `AKTIF` (untuk batalkan)

**Main Success Scenario (Edit Draft):**
1. Komandan membuka halaman "Perintah Saya" dan memilih perintah dengan status `DRAFT`
2. System menampilkan form perintah yang dapat diedit (sama dengan UC-09)
3. Komandan mengubah data yang diperlukan
4. Komandan klik "Simpan Draft" atau "Kirim Perintah"
5. System menyimpan perubahan

**Main Success Scenario (Batalkan Perintah Aktif):**
1. Komandan klik "Batalkan Perintah" pada perintah berstatus `AKTIF`
2. System menampilkan konfirmasi: "Membatalkan perintah ini akan menghapus semua assignment yang belum diselesaikan. Lanjutkan?"
3. Komandan klik "Ya, Batalkan"
4. System mengubah status perintah → `DIBATALKAN`
5. System menghapus seluruh TaskAssignment dengan status `BELUM_DIKERJAKAN` untuk perintah ini
6. Assignment yang sudah berstatus `SELESAI` atau `TERLAMBAT` tetap tersimpan sebagai histori

**Business Rules:**
- BR-013: Perintah dengan status `AKTIF` tidak dapat diedit kontennya — hanya dapat dibatalkan
- BR-014: Perintah yang sudah `SELESAI` atau `EXPIRED` tidak dapat diedit atau dibatalkan

---

### UC-13: Lihat Daftar Perintah yang Dibuat

**Actor(s):** Komandan
**Trigger:** Komandan membuka halaman "Manajemen Perintah"
**Preconditions:**
- Komandan sudah login

**Main Success Scenario:**
1. Komandan membuka halaman "Manajemen Perintah"
2. System menampilkan daftar perintah yang pernah dibuat oleh Komandan ini
3. Setiap item menampilkan: Judul, Jenis Perintah, Deadline, Status, Progress (X dari Y anggota sudah submit)
4. Komandan dapat filter berdasarkan: Status (Semua / Draft / Aktif / Selesai / Expired / Dibatalkan) / Jenis Perintah / Rentang Tanggal
5. Komandan dapat klik perintah untuk melihat detail dan progress per anggota (UC-19)

---

### UC-14: Lihat Daftar Perintah yang Diterima

**Actor(s):** Anggota / Komandan (jika memiliki atasan)
**Trigger:** User membuka halaman "Perintah Saya"
**Preconditions:**
- User sudah login dan memiliki minimal 1 TaskAssignment

**Main Success Scenario:**
1. User membuka halaman "Perintah Saya"
2. System menampilkan daftar perintah yang di-assign ke user, diurutkan berdasarkan **deadline terdekat**
3. Setiap item menampilkan: Judul, Jenis Perintah, Link Target, Deadline, Status Assignment
4. System menampilkan visual indicator untuk perintah yang **mendekati deadline** (< 24 jam) dan yang sudah **melewati deadline**
5. User dapat klik "Lihat Detail" untuk membaca instruksi lengkap, narasi, dan informasi perintah

**Filter yang tersedia:** Semua / Belum Dikerjakan / Sudah Submit / Terlambat / Expired

**Business Rules:**
- BR-015: User hanya dapat melihat perintah yang di-assign langsung kepadanya

---

### UC-15: Submit Bukti Pelaksanaan

**Actor(s):** Anggota / Komandan (jika punya atasan)
**Trigger:** User klik tombol "Submit Bukti" pada assignment perintah tertentu
**Preconditions:**
- User memiliki TaskAssignment dengan status `BELUM_DIKERJAKAN`
- Deadline perintah belum atau sudah terlewati (keduanya masih diizinkan submit)

**Main Success Scenario:**
1. User membuka detail perintah yang ingin di-submit dari halaman "Perintah Saya"
2. User klik tombol "Submit Bukti"
3. System menampilkan form submission dengan field:
   - **Link Google Drive** (URL — wajib)
   - **Catatan tambahan** (opsional)
4. User menempelkan (paste) link Google Drive yang berisi bukti pelaksanaan
5. System memvalidasi:
   - URL tidak kosong
   - Format URL valid
6. User klik "Kirim Bukti"
7. System menyimpan submission (link + timestamp)
8. System menentukan status:
   - Jika waktu submit ≤ deadline: status → `SELESAI`
   - Jika waktu submit > deadline: status → `TERLAMBAT`
9. System menampilkan notifikasi: "Bukti berhasil dikirim!"
10. Status assignment diperbarui; progress di dashboard Komandan terupdate secara real-time (UC-16)

**Alternative Flows:**
- **A1 — Langkah 5: URL tidak valid:**
  1. System menampilkan: "Link tidak valid. Pastikan URL yang dimasukkan benar dan dapat diakses."
  2. Submission tidak tersimpan; user diminta isi ulang

- **A2 — Assignment sudah pernah disubmit:**
  1. System mendeteksi assignment sudah berstatus `SELESAI` atau `TERLAMBAT`
  2. System menampilkan: "Kamu sudah pernah mengirim bukti untuk perintah ini."
  3. System menampilkan link bukti sebelumnya dan menawarkan opsi untuk mengganti
  4. Jika user memilih ganti: System mengizinkan resubmit dan menyimpan submission terbaru

**Postconditions (Success):**
- Status `TaskAssignment` berubah menjadi `SELESAI` atau `TERLAMBAT`
- Data submission (link + timestamp) tersimpan di database
- Counter progress perintah diperbarui

**Business Rules:**
- BR-016: Submission setelah deadline tetap diterima namun ditandai `TERLAMBAT`
- BR-017: User dapat melakukan resubmit untuk mengganti bukti yang sebelumnya dikirim
- BR-018: Sistem tidak melakukan verifikasi otomatis terhadap konten link Drive — validasi hanya pada format URL

**Related Use Cases:** UC-16 (triggers)

---

### UC-16: Auto Update Status Selesai

**Actor(s):** System (auto-triggered oleh UC-15)
**Trigger:** Submission berhasil disimpan
**Preconditions:**
- Submission bukti berhasil tersimpan

**Main Success Scenario:**
1. System menerima event submission berhasil dari UC-15
2. System menghitung: apakah waktu submit ≤ atau > deadline perintah
3. System memperbarui status `TaskAssignment`:
   - `SELESAI` jika tepat waktu
   - `TERLAMBAT` jika melewati deadline
4. System memperbarui counter progress pada perintah terkait (total_submitted + 1)
5. System memeriksa apakah seluruh assignment untuk perintah ini sudah berstatus `SELESAI` atau `TERLAMBAT`
6. Jika semua assignment sudah selesai: System mengubah status perintah → `SELESAI`

---

### UC-17: Lihat Dashboard Progress Perintah

**Actor(s):** Komandan
**Trigger:** Komandan membuka halaman Dashboard
**Preconditions:**
- Komandan sudah login
- Memiliki minimal 1 perintah yang pernah dibuat

**Main Success Scenario:**
1. Komandan membuka halaman Dashboard
2. System menampilkan ringkasan statistik di bagian atas:
   - Total perintah aktif
   - Total anggota di bawah Komandan
   - Total assignment belum dikerjakan
   - Total assignment sudah selesai (tepat waktu + terlambat)
3. System menampilkan daftar perintah aktif beserta progress bar masing-masing: "X / Y anggota sudah submit"
4. Komandan dapat klik perintah tertentu untuk melihat breakdown detail (UC-19)
5. System menampilkan perintah yang mendekati deadline dengan visual alert

---

### UC-18: Filter Progress per Satuan / Periode

**Actor(s):** Komandan
**Trigger:** Komandan menggunakan panel filter di Dashboard atau halaman Monitoring
**Preconditions:**
- Komandan sudah login dan berada di halaman Dashboard atau Detail Perintah

**Main Success Scenario:**
1. Komandan memilih filter yang diinginkan:
   - **Satuan**: dropdown pilih satuan tertentu dalam cakupan hierarki
   - **Jenis Perintah**: POSTING / ENGAGEMENT / KOMENTAR / REPORT_AKUN
   - **Rentang Tanggal**: date range picker (dari tanggal — sampai tanggal)
   - **Status**: Aktif / Selesai / Expired
2. System memfilter dan memperbarui tampilan data sesuai filter yang dipilih
3. Komandan dapat kombinasikan beberapa filter sekaligus
4. Komandan dapat reset semua filter dengan klik "Reset Filter"

---

### UC-19: Lihat Detail Submission Anggota

**Actor(s):** Komandan
**Trigger:** Komandan klik perintah tertentu dari dashboard atau daftar perintah
**Preconditions:**
- Komandan sudah login
- Perintah yang dipilih memiliki minimal 1 assignment

**Main Success Scenario:**
1. Komandan klik perintah tertentu
2. System menampilkan halaman detail perintah dengan:
   - Informasi perintah: judul, jenis, instruksi, link target, deadline
   - Progress summary: total assigned / sudah submit / belum submit / terlambat
3. System menampilkan tabel breakdown per satuan → per anggota dengan kolom:
   - Nama Anggota
   - Satuan
   - Status (Belum Dikerjakan / Selesai / Terlambat)
   - Waktu Submit
   - Link Drive yang disubmit (klikable)
   - Catatan anggota (jika ada)
4. Komandan dapat filter tabel berdasarkan: Satuan / Status
5. Komandan dapat klik link Drive untuk membuka bukti di tab baru

**Business Rules:**
- BR-019: Komandan hanya dapat melihat submission anggota yang berada dalam cakupan hierarki di bawahnya

---

## 5. Status & State Machine

### 5.1 Status Perintah (Order Status)

```
DRAFT → AKTIF → SELESAI
              → EXPIRED  (deadline terlewati, ada assignment belum selesai)
              → DIBATALKAN
```

| Status        | Deskripsi                                                              |
|---------------|------------------------------------------------------------------------|
| `DRAFT`       | Perintah dibuat tapi belum dikirim; belum ada assignment               |
| `AKTIF`       | Perintah sudah dikirim; anggota sudah menerima assignment              |
| `SELESAI`     | Seluruh anggota sudah submit (tepat waktu atau terlambat)              |
| `EXPIRED`     | Deadline terlewati; masih ada anggota yang belum submit                |
| `DIBATALKAN`  | Perintah dibatalkan oleh Komandan; assignment aktif dihapus            |

### 5.2 Status Assignment per Anggota (Assignment Status)

```
BELUM_DIKERJAKAN → SELESAI    (submit sebelum/tepat deadline)
                 → TERLAMBAT  (submit setelah deadline)
```

| Status              | Deskripsi                                          |
|---------------------|----------------------------------------------------|
| `BELUM_DIKERJAKAN`  | Anggota belum submit bukti                         |
| `SELESAI`           | Anggota submit bukti sebelum atau tepat deadline   |
| `TERLAMBAT`         | Anggota submit bukti setelah deadline terlewati    |

### 5.3 Jenis Perintah (Order Type)

| Kode            | Nama                   | Deskripsi                                              |
|-----------------|------------------------|--------------------------------------------------------|
| `POSTING`       | Posting Konten         | Anggota membuat postingan di akun sosmed mereka        |
| `ENGAGEMENT`    | Like / Share / Repost  | Anggota melakukan interaksi pada link postingan target |
| `KOMENTAR`      | Komentar Narasi        | Anggota berkomentar dengan narasi yang ditentukan      |
| `REPORT_AKUN`   | Report Akun            | Anggota melaporkan akun sosmed tertentu                |

---

## 6. Business Rules Summary

| BR ID  | Deskripsi                                                                                          |
|--------|----------------------------------------------------------------------------------------------------|
| BR-001 | Pesan error login harus generik — tidak mengungkap apakah username atau password yang salah        |
| BR-002 | Akun dikunci setelah 5 percobaan login gagal berturutan                                            |
| BR-003 | Satuan tidak dapat dihapus jika anggota di dalamnya memiliki assignment berstatus `BELUM_DIKERJAKAN` |
| BR-004 | Minimal harus ada 1 satuan root (level tertinggi) dalam sistem                                     |
| BR-005 | User yang dipindah satuan tetap wajib menyelesaikan assignment dari satuan lama                    |
| BR-006 | Assignment baru mengikuti satuan baru setelah proses pemindahan                                    |
| BR-007 | Satu user dapat mendaftarkan lebih dari satu akun per platform sosmed                              |
| BR-008 | Data akun sosmed hanya bisa diedit/dihapus oleh pemilik atau Super Admin                          |
| BR-009 | Komandan hanya dapat melihat akun sosmed anggota dalam cakupan hierarkinya                        |
| BR-010 | Deadline perintah minimal 1 jam dari waktu perintah dikirim                                       |
| BR-011 | Perintah berstatus `AKTIF` tidak dapat diedit kontennya — hanya dapat dibatalkan                   |
| BR-012 | Satu anggota hanya boleh memiliki 1 assignment per perintah (tidak boleh duplikat)                |
| BR-013 | Perintah `AKTIF` tidak dapat diedit — hanya bisa dibatalkan                                       |
| BR-014 | Perintah `SELESAI` atau `EXPIRED` tidak dapat diedit atau dibatalkan                              |
| BR-015 | User hanya dapat melihat perintah yang di-assign langsung kepadanya                               |
| BR-016 | Submission setelah deadline tetap diterima namun ditandai `TERLAMBAT`                             |
| BR-017 | User dapat melakukan resubmit untuk mengganti bukti yang sebelumnya dikirim                       |
| BR-018 | Validasi submission hanya pada format URL — tidak ada verifikasi konten link Drive                 |
| BR-019 | Komandan hanya dapat melihat submission anggota dalam cakupan hierarkinya                         |

---

## 7. Relasi Antar Use Case

| Use Case       | Tipe Relasi | Dengan Use Case     | Keterangan                                              |
|----------------|-------------|---------------------|---------------------------------------------------------|
| UC-09          | `<<include>>`  | UC-10               | Buat perintah selalu include pilih target               |
| UC-09          | `<<triggers>>` | UC-11               | Kirim perintah otomatis trigger broadcast               |
| UC-12          | `<<extends>>`  | UC-09               | Edit/batalkan adalah ekstensi dari alur buat perintah   |
| UC-15          | `<<triggers>>` | UC-16               | Submit bukti otomatis trigger update status             |
| UC-05          | `<<extends>>`  | UC-07               | Tambah akun adalah ekstensi dari halaman daftar akun   |
| UC-06          | `<<extends>>`  | UC-07               | Edit/hapus akun adalah ekstensi dari halaman daftar    |
| UC-17          | `<<include>>`  | UC-18               | Dashboard include kemampuan filter                      |
| UC-17          | `<<include>>`  | UC-19               | Dashboard include lihat detail submission               |

---

## 8. Suggested Next Steps

Urutan dokumen teknis yang disarankan setelah use case ini:

1. **ERD (Entity Relationship Diagram)** — entitas utama: `User`, `Unit` (tree adjacency list), `Order`, `TaskAssignment`, `Submission`, `SocialMediaAccount`
2. **Wireframe / UI Flow** — halaman Dashboard Komandan, halaman "Perintah Saya" untuk Anggota, form Buat Perintah, halaman Akun Sosmed
3. **API Specification** — endpoint kritis: `POST /orders`, `GET /orders/assigned`, `POST /assignments/:id/submit`, `POST /social-accounts`
4. **System Architecture** — stack rekomendasi: Next.js + NestJS + PostgreSQL (dengan adjacency list untuk hierarki n-level)
