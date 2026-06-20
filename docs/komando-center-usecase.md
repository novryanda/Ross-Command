# Use Case Sistem Terimplementasi
# KOMANDO CENTER

---

| Field | Detail |
|---|---|
| Dokumen | Use Case Sistem Terimplementasi |
| Versi | v2.0 |
| Tanggal | 20 Juni 2026 |
| Sumber Acuan | Implementasi backend/frontend saat ini |
| Referensi Teknis | `apps/api/src/*`, `apps/fe/src/*`, `apps/api/prisma/schema.prisma` |

## 1. Tujuan

Dokumen ini memperbarui use case Komando Center agar sesuai dengan sistem yang saat ini sudah terimplementasi di repository. Fokus dokumen ini adalah fitur yang benar-benar tersedia pada modul backend dan dipakai oleh frontend saat ini.

## 2. Ringkasan Sistem Saat Ini

Komando Center saat ini mencakup kemampuan berikut:

- autentikasi berbasis session dengan login username/password
- lock akun otomatis setelah 5 kali gagal login
- manajemen profil user aktif
- dashboard terpisah untuk super admin, komandan, dan anggota
- manajemen satuan organisasi berbentuk tree
- manajemen user dan keanggotaan satuan oleh super admin
- manajemen akun sosial media milik user
- pembuatan, penyimpanan draft, pengiriman, pembatalan, dan monitoring perintah
- assignment per anggota hasil resolusi target satuan/individu
- submission bukti pelaksanaan, termasuk multi-link platform untuk order `posting`
- monitoring bawahan oleh komandan
- notifikasi sistem
- activity log untuk auth, order, dan submission
- export progress assignment order ke file Excel

## 3. Aktor

| Aktor | Deskripsi |
|---|---|
| Super Admin | Mengelola user, satuan, dashboard admin, unlock user, reset password user |
| Komandan | User yang memiliki minimal satu satuan yang dipimpin atau cakupan bawahan dalam hierarki |
| Anggota | User pelaksana yang menerima assignment |
| Sistem | Proses otomatis: lock akun, broadcast order, refresh status order, activity log, notifikasi |

Catatan implementasi:

- `role` yang tersimpan di database adalah `super_admin` atau `member`.
- Status "komandan" ditentukan dinamis dari struktur organisasi melalui `HierarchyService`, bukan role terpisah.

## 4. Modul dan Use Case

### 4.1 Autentikasi dan Profil

| ID | Use Case | Aktor |
|---|---|---|
| UC-01 | Login ke sistem | Semua user |
| UC-02 | Logout dari sistem | Semua user |
| UC-03 | Melihat profil sesi aktif (`auth/me`) | Semua user |
| UC-04 | Mengubah profil sendiri | Semua user |
| UC-05 | Unlock akun user | Super Admin |
| UC-06 | Reset password user | Super Admin |

### 4.2 Dashboard

| ID | Use Case | Aktor |
|---|---|---|
| UC-07 | Melihat dashboard admin | Super Admin |
| UC-08 | Melihat dashboard komandan | Komandan |
| UC-09 | Melihat dashboard anggota | Anggota |

### 4.3 Organisasi dan User

| ID | Use Case | Aktor |
|---|---|---|
| UC-10 | Melihat tree satuan | Super Admin |
| UC-11 | Menambah satuan | Super Admin |
| UC-12 | Mengubah satuan | Super Admin |
| UC-13 | Menghapus satuan | Super Admin |
| UC-14 | Assign anggota ke satuan | Super Admin |
| UC-15 | Transfer anggota antar satuan | Super Admin |
| UC-16 | Melihat daftar user | Super Admin |
| UC-17 | Menambah user | Super Admin |
| UC-18 | Melihat detail user | Super Admin |
| UC-19 | Mengubah user | Super Admin |
| UC-20 | Menonaktifkan user | Super Admin |
| UC-21 | Melihat akun sosial media user lain dalam hierarki | Super Admin / Komandan |

### 4.4 Akun Sosial Media

| ID | Use Case | Aktor |
|---|---|---|
| UC-22 | Melihat akun sosial media sendiri | Semua user non-admin |
| UC-23 | Menambah akun sosial media | Semua user non-admin |
| UC-24 | Mengubah akun sosial media | Semua user non-admin |
| UC-25 | Menghapus akun sosial media | Semua user non-admin |

### 4.5 Perintah dan Monitoring

| ID | Use Case | Aktor |
|---|---|---|
| UC-26 | Melihat daftar order | Komandan |
| UC-27 | Membuat order | Komandan |
| UC-28 | Menyimpan order sebagai draft | Komandan |
| UC-29 | Mengirim order draft | Komandan |
| UC-30 | Mengubah order draft | Komandan |
| UC-31 | Membatalkan order aktif | Komandan |
| UC-32 | Melihat detail order | Komandan |
| UC-33 | Melihat daftar assignment order | Komandan |
| UC-34 | Melihat progress assignment per satuan | Komandan |
| UC-35 | Export progress assignment order ke Excel | Komandan |

### 4.6 Assignment dan Submission

| ID | Use Case | Aktor |
|---|---|---|
| UC-36 | Melihat daftar assignment milik sendiri | Anggota / Komandan yang menerima tugas |
| UC-37 | Melihat detail assignment | Anggota / Komandan yang menerima tugas |
| UC-38 | Submit bukti pelaksanaan | Anggota / Komandan yang menerima tugas |
| UC-39 | Resubmit bukti pelaksanaan | Anggota / Komandan yang menerima tugas |

### 4.7 Monitoring Bawahan, Notifikasi, Aktivitas

| ID | Use Case | Aktor |
|---|---|---|
| UC-40 | Melihat daftar anggota bawahan | Komandan |
| UC-41 | Melihat anggota bawahan per satuan | Komandan |
| UC-42 | Melihat detail anggota bawahan | Komandan |
| UC-43 | Melihat notifikasi | Semua user |
| UC-44 | Melihat ringkasan notifikasi | Semua user |
| UC-45 | Menandai semua notifikasi sudah dibaca | Semua user |
| UC-46 | Melihat activity log | Super Admin / Komandan |

## 5. Detail Use Case Inti

### UC-01 Login ke sistem

**Aktor:** Semua user  
**Trigger:** User mengirim kredensial username dan password.

**Alur utama:**
1. User mengisi `username` dan `password`.
2. Sistem mencari user aktif berdasarkan username.
3. Sistem memeriksa apakah akun sedang terkunci (`locked_until`).
4. Jika akun tidak terkunci, sistem memverifikasi password melalui Better Auth.
5. Jika berhasil, sistem membuat session, mengisi `last_login_at`, dan mereset `failed_login_attempts`.

**Alur alternatif:**
- Jika login gagal, sistem mencatat `login_attempts` dan menaikkan `failed_login_attempts`.
- Jika gagal 5 kali berturut-turut, sistem mengisi `locked_until` selama 30 menit.

**Postcondition:**
- Session aktif tersimpan di tabel `session`.

### UC-04 Mengubah profil sendiri

**Aktor:** Semua user yang sudah login  
**Data yang bisa diubah:** `fullName`, `username`, `nip`

**Aturan implementasi:**
- username dinormalisasi ke lowercase
- username baru harus unik
- email internal user ikut diperbarui ke format `${username}@internal.komando`
- `account.account_id` untuk provider `username` ikut diperbarui

### UC-05 Unlock akun user

**Aktor:** Super Admin

**Hasil:**
- `failed_login_attempts` direset ke `0`
- `locked_until` diubah menjadi `null`

### UC-06 Reset password user

**Aktor:** Super Admin

**Hasil:**
- password user diganti melalui Better Auth
- counter gagal login dan status lock dibersihkan

### UC-10 Melihat tree satuan

**Aktor:** Super Admin

**Output utama:**
- daftar root satuan
- child satuan bertingkat
- komandan satuan
- direct member pada tiap satuan

### UC-13 Menghapus satuan

**Aktor:** Super Admin

**Aturan implementasi yang aktif:**
- penghapusan dilakukan sebagai soft delete pada seluruh subtree (`deleted_at`)
- sistem menolak penghapusan jika masih ada `task_assignments` berstatus `belum_dikerjakan` pada anggota dalam subtree tersebut untuk order berstatus `aktif` atau `expired`

### UC-17 Menambah user

**Aktor:** Super Admin

**Alur utama:**
1. Admin mengisi `fullName`, `username`, `password`, `nip`, `role`, dan opsional `unitId`.
2. Sistem membuat user melalui Better Auth.
3. Sistem menyimpan user domain ke tabel `users`.
4. Jika `unitId` diisi, sistem membuat `unit_members`.

### UC-20 Menonaktifkan user

**Aktor:** Super Admin

**Efek implementasi:**
- `users.deleted_at` diisi
- `users.banned = true`
- `users.ban_reason` diisi
- seluruh session user dihapus
- membership aktif ditutup dengan `removed_at`

### UC-22 sampai UC-25 Manajemen akun sosial media

**Aktor:** User login

**Data akun sosial media:**
- `platform`
- `username`
- `profileUrl`
- `notes`

**Aturan implementasi:**
- kombinasi `platform + username` per user tidak boleh duplikat untuk akun aktif
- hapus dilakukan sebagai soft delete (`deleted_at`)

### UC-27 Membuat order

**Aktor:** Komandan

**Jenis order yang tersedia:**
- `posting`
- `engagement`
- `komentar`
- `report_akun`

**Data umum order:**
- `title`
- `orderType`
- `description`
- `deadline`
- `targets`
- `status` (`draft` atau `aktif`)

**Data khusus implementasi:**
- `targetUrls` untuk order non-posting, disimpan ke `order_social_targets`
- `postingSourceUrl` untuk order `posting`
- `postingTargetPlatforms` untuk order `posting`
- `narration` untuk `posting` dan `komentar`
- `sentiment` untuk `komentar`
- `engagementActions` untuk `engagement`
- `reportReason` untuk `report_akun`

### UC-29 Mengirim order draft

**Aktor:** Komandan

**Aturan implementasi:**
- hanya order `draft` yang bisa dikirim
- sistem mengubah status ke `aktif`
- sistem mengisi `sent_at`
- sistem melakukan broadcast target ke anggota unik
- sistem membuat `task_assignments`
- sistem membuat `activity_logs` tipe `order_sent`

### UC-30 Mengubah order draft

**Aktor:** Komandan

**Aturan implementasi:**
- hanya order `draft` yang bisa diubah
- target dapat diganti total
- jika status pada update diubah menjadi `aktif`, sistem langsung mengirim order

### UC-31 Membatalkan order aktif

**Aktor:** Komandan

**Aturan implementasi:**
- hanya order `aktif` yang dapat dibatalkan
- status order diubah menjadi `dibatalkan`
- `task_assignments` berstatus `belum_dikerjakan` dihapus
- assignment yang sudah selesai atau terlambat tetap tersisa sebagai histori

### UC-33 Melihat daftar assignment order

**Aktor:** Komandan

**Fitur implementasi:**
- filter `status`
- filter `unitId`
- menampilkan unit aktif user
- menampilkan `latestSubmission`
- untuk order `posting`, `latestSubmission` juga memuat:
  - `platformLinks`
  - `postingCompleteness`
  - `missingPlatforms`

### UC-35 Export progress assignment order

**Aktor:** Komandan

**Output:** file `.xlsx` berisi progress assignment per anggota.

### UC-36 Melihat daftar assignment milik sendiri

**Aktor:** User penerima assignment

**Filter implementasi:**
- `status`
- `orderType`
- `submitDate`
- `deadlineDate`
- `search`
- sorting berdasarkan `assignedAt` atau `deadline`

### UC-38 Submit bukti pelaksanaan

**Aktor:** User penerima assignment

**Aturan implementasi penting:**
- order `dibatalkan` tidak menerima submission
- untuk order non-`posting`, `driveLink` wajib diisi
- untuk order `posting`, minimal satu `platformLinks` wajib diisi
- platform pada `platformLinks` harus termasuk dalam `postingTargetPlatforms`
- submission baru akan menandai submission sebelumnya `is_latest = false`
- status assignment menjadi:
  - `selesai` jika submit `<= deadline`
  - `terlambat` jika submit `> deadline`

### UC-40 sampai UC-42 Monitoring bawahan

**Aktor:** Komandan

**Kemampuan terimplementasi:**
- melihat daftar bawahan dengan filter `unitId` dan `search`
- melihat struktur bawahan per satuan
- melihat detail anggota, akun sosial media, dan riwayat assignment anggota tersebut

### UC-43 sampai UC-45 Notifikasi

**Aktor:** Semua user

**Sumber notifikasi implementasi:**
- akun terkunci
- user belum punya satuan
- satuan belum punya komandan
- assignment baru / mendekati deadline / expired
- submission terbaru
- order aktif yang progresnya masih tertinggal

Catatan:
- endpoint `mark-all-read` saat ini mengembalikan respons sukses, tetapi belum menyimpan status baca ke database.

### UC-46 Activity log

**Aktor:** Super Admin / Komandan

**Kategori implementasi:**
- `auth` dari `login_attempts`
- `order` dari `activity_logs` tipe `order_created` dan `order_sent`
- `submission` dari `activity_logs` tipe `submission_sent`

## 6. Business Rules yang Terkonfirmasi dari Implementasi

| ID | Aturan |
|---|---|
| BR-01 | Login gagal 5 kali berturut-turut mengunci akun 30 menit |
| BR-02 | Hanya `super_admin` yang dapat mengakses modul `users` dan `units` |
| BR-03 | Status komandan ditentukan dari hierarki, bukan dari role tersendiri |
| BR-04 | Nama satuan harus unik dalam parent yang sama |
| BR-05 | Satuan tidak bisa dihapus jika subtree masih punya assignment aktif/pending |
| BR-06 | Satu user hanya memiliki satu membership aktif pada satu waktu |
| BR-07 | Order hanya dapat diubah saat status `draft` |
| BR-08 | Order hanya dapat dibatalkan saat status `aktif` |
| BR-09 | Target order minimal satu item |
| BR-10 | Target order dapat berupa `unit` atau `individual` |
| BR-11 | Deduplikasi assignment dilakukan saat broadcast order |
| BR-12 | Satu assignment unik per pasangan `order_id + user_id` |
| BR-13 | Submission lama tetap disimpan, tetapi hanya satu yang `is_latest = true` |
| BR-14 | Submission order `posting` memakai `platform_links`; order lain memakai `drive_link` |
| BR-15 | Platform bukti posting harus sesuai target platform order |
| BR-16 | Activity log order dan submission dicatat ke `activity_logs` |
| BR-17 | Progress order dapat berubah otomatis ke `expired` atau `selesai` melalui refresh status |

## 7. State yang Dipakai Sistem

### 7.1 Status Order

```text
draft -> aktif -> selesai
             -> expired
             -> dibatalkan
```

### 7.2 Status Assignment

```text
belum_dikerjakan -> selesai
                 -> terlambat
```

### 7.3 Tipe Activity Log

```text
order_created
order_sent
submission_sent
```

## 8. Gap Dokumen Lama vs Sistem Saat Ini

Perubahan utama dibanding dokumen lama:

- auth sekarang memakai tabel `session`, `account`, `verification`, dan `rate_limit`
- ada fitur dashboard per role
- ada modul `notifications`
- ada modul `activity`
- ada modul `commander/members`
- order non-posting menyimpan banyak target URL pada `order_social_targets`
- order `posting` memakai `posting_source_url` dan `posting_target_platforms`
- submission tidak lagi hanya link Google Drive; untuk `posting` bisa berupa `platform_links`
- ada fitur export progress order ke Excel
- ada soft delete di banyak entitas domain

## 9. Rekomendasi Lanjutan

- tambahkan persistence status baca notifikasi bila diperlukan
- dokumentasikan endpoint Better Auth bawaan secara terpisah dari controller NestJS custom
- sinkronkan spesifikasi API detail dengan seluruh route yang aktif pada `AppModule`
