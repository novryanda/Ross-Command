# Product Requirements Document (PRD)
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                                  |
|---------------|---------------------------------------------------------|
| **Dokumen**   | Product Requirements Document                           |
| **Produk**    | Komando Center                                          |
| **Versi**     | v1.0                                                    |
| **Tanggal**   | 16 Juni 2026                                            |
| **Author**    | System Analyst                                          |
| **Status**    | Draft                                                   |
| **Referensi** | Use Case v1.0 · ERD v1.0 · Wireframe v1.0 · API Spec v1.0 |

### Revision History

| Versi | Tanggal    | Deskripsi              | Author         |
|-------|------------|------------------------|----------------|
| v1.0  | 16-06-2026 | Initial PRD draft      | System Analyst |

---

## 1. Executive Summary

**Komando Center** adalah platform web terpusat berbasis REST API untuk manajemen operasi sosial media pada organisasi hierarkis berjenjang. Sistem memungkinkan komandan pada setiap level untuk menerbitkan perintah aksi sosial media (posting, engagement, komentar, report akun) kepada satuan atau anggota di bawah mereka secara rekursif, memantau progress pelaksanaan secara real-time, dan menerima bukti pelaksanaan berupa link Google Drive dari setiap anggota.

Sistem dibangun di atas arsitektur **monolith Next.js** (App Router) dengan database **PostgreSQL**, autentikasi menggunakan **Better Auth**, dan backend API menggunakan **Next.js Route Handlers** — semua dalam satu codebase yang terpadu.

---

## 2. Problem Statement

Saat ini, koordinasi operasi sosial media pada organisasi hierarkis besar dilakukan secara manual melalui aplikasi pesan instan (WhatsApp, Telegram, dll.), yang menyebabkan beberapa permasalahan kritis:

- **Tidak ada visibilitas progress**: Komandan tidak dapat memantau secara real-time berapa anggota yang sudah melaksanakan perintah tanpa bertanya satu per satu
- **Perintah tidak terstruktur**: Instruksi (narasi, link target, deadline) tersebar di chat group, mudah terlewat, dan tidak ada format baku
- **Distribusi perintah tidak efisien**: Untuk mengirim perintah ke seluruh anggota di bawah satuan besar, komandan harus meneruskan pesan secara manual ke setiap level
- **Bukti tidak terorganisir**: Screenshot bukti pelaksanaan tersebar di berbagai chat, sulit diaudit dan diverifikasi
- **Tidak ada catatan akun sosmed anggota**: Komandan tidak tahu akun sosmed mana yang dimiliki setiap anggota

Kondisi ini menyebabkan tingkat ketidakpatuhan yang tinggi, tidak adanya akuntabilitas, dan sulitnya evaluasi efektivitas operasi.

**Solusi ideal**: Sebuah platform terpusat yang mengotomasi distribusi perintah berdasarkan hierarki, memungkinkan monitoring real-time, dan menciptakan jejak audit yang lengkap untuk setiap operasi.

---

## 3. Goals & Success Metrics

### 3.1 Tujuan Produk

| ID    | Tujuan                                                             | Success Metric                                                            |
|-------|--------------------------------------------------------------------|---------------------------------------------------------------------------|
| G-01  | Mengotomasi distribusi perintah ke seluruh anggota satuan secara rekursif | Broadcast ke 500+ anggota selesai dalam < 5 detik                   |
| G-02  | Memberikan visibilitas progress real-time kepada Komandan          | Dashboard memperbarui data progress dalam < 3 detik setelah submission    |
| G-03  | Mengurangi waktu yang dibutuhkan anggota untuk menerima dan submit perintah | Anggota dapat submit bukti dalam < 3 langkah dari halaman utama     |
| G-04  | Menciptakan jejak audit terpusat untuk semua operasi               | 100% perintah dan submission tersimpan dengan timestamp                   |
| G-05  | Mendukung hierarki organisasi n-level yang fleksibel               | Admin dapat membuat dan memodifikasi tree hierarki tanpa batas level      |

### 3.2 KPI

| KPI                                     | Target                              |
|-----------------------------------------|-------------------------------------|
| Waktu response API (p95)                | < 500ms untuk semua endpoint        |
| Uptime sistem                           | ≥ 99.5% per bulan                   |
| Waktu load halaman dashboard            | < 2 detik (LCP)                     |
| Tingkat keberhasilan submission         | Error rate submission < 1%          |
| Concurrent users yang didukung          | Minimal 500 concurrent users        |

---

## 4. User Personas

### Persona A — Komandan Satuan

| Atribut      | Detail                                                       |
|--------------|--------------------------------------------------------------|
| **Nama**     | Kol. Budi                                                    |
| **Role**     | Komandan yang memimpin satuan dengan 50–500+ anggota di bawahnya |
| **Goals**    | Mengirim perintah ke semua bawahan sekaligus, memantau siapa yang sudah/belum mengerjakan |
| **Pain Points** | Tidak tahu progress tanpa tanya manual; perintah di chat group sering terlewat |
| **Tech Savviness** | Medium — nyaman dengan web, tapi butuh UI yang intuitif |
| **Device**   | Desktop (di kantor), mobile (di lapangan)                    |

### Persona B — Anggota Lapangan

| Atribut      | Detail                                                       |
|--------------|--------------------------------------------------------------|
| **Nama**     | Prajurit Budi                                                |
| **Role**     | Pelaksana perintah dari atasan — tidak memiliki bawahan      |
| **Goals**    | Tahu perintah apa yang harus dikerjakan hari ini, submit bukti dengan cepat |
| **Pain Points** | Lupa deadline, tidak sadar ada perintah baru masuk, bingung format bukti yang dibutuhkan |
| **Tech Savviness** | Low–Medium — butuh UI yang sangat sederhana           |
| **Device**   | Mobile dan desktop                                           |

### Persona C — Super Admin

| Atribut      | Detail                                                       |
|--------------|--------------------------------------------------------------|
| **Nama**     | Admin Sistem                                                 |
| **Role**     | Pengelola teknis sistem — mengatur struktur organisasi dan akun user |
| **Goals**    | Menyusun hierarki organisasi yang akurat, mengelola akun user secara efisien |
| **Pain Points** | Hierarki organisasi berubah-ubah, butuh interface yang memudahkan reorganisasi |
| **Tech Savviness** | High — memahami sistem informasi                     |
| **Device**   | Desktop                                                      |

---

## 5. Scope

### 5.1 In Scope (Versi 1.0)

- Autentikasi berbasis username/password menggunakan Better Auth
- Manajemen struktur organisasi hierarkis n-level (tree satuan)
- Manajemen akun user oleh Admin
- Pendaftaran akun sosial media oleh anggota
- Pembuatan dan pengiriman perintah dengan 4 jenis: Posting, Engagement, Komentar, Report Akun
- Distribusi perintah otomatis ke seluruh anggota satuan secara rekursif
- Submission bukti pelaksanaan berupa link Google Drive
- Dashboard monitoring progress real-time untuk Komandan
- Filter dan sorting lengkap di semua halaman daftar
- Export data progress ke file Excel (.xlsx)
- Role-based access control (Super Admin / Komandan / Anggota)

### 5.2 Out of Scope (Versi 1.0 — Pertimbangkan untuk v2.0)

- Notifikasi push/email saat perintah baru diterima
- Integrasi langsung dengan platform sosial media (API Instagram, Twitter, dll.)
- Verifikasi otomatis bukti pelaksanaan (validasi konten link Drive)
- Mobile native app (Android/iOS)
- Multi-tenant (sistem untuk lebih dari satu organisasi)
- SSO / OAuth login (Google, Microsoft, dll.)
- Laporan analytics lanjutan (grafik tren, heatmap aktivitas)
- Audit log perubahan data (siapa edit apa, kapan)

---

## 6. Tech Stack

### 6.1 Arsitektur Umum

**Monolith Next.js** — frontend dan backend berada dalam satu codebase Next.js, menggunakan App Router dengan Route Handlers sebagai REST API.

```
┌────────────────────────────────────────────────┐
│               NEXT.JS APPLICATION              │
│                                                │
│  ┌─────────────────┐   ┌──────────────────┐   │
│  │   FRONTEND       │   │   BACKEND API    │   │
│  │   (App Router)   │   │  (Route Handlers)│   │
│  │   React 19       │   │  /api/v1/*       │   │
│  │   Tailwind CSS   │   │                  │   │
│  │   shadcn/ui      │   │  Better Auth     │   │
│  │   TanStack Query │   │  /api/auth/*     │   │
│  └────────┬─────────┘   └────────┬─────────┘   │
│           └──────────────────────┘             │
│                        │                       │
│              ┌─────────▼──────────┐            │
│              │  POSTGRESQL (DB)   │            │
│              │  Prisma ORM        │            │
│              └────────────────────┘            │
└────────────────────────────────────────────────┘
```

### 6.2 Stack Detail

| Layer            | Teknologi              | Versi       | Keterangan                                           |
|------------------|------------------------|-------------|------------------------------------------------------|
| **Framework**    | Next.js                | 16.x        | App Router, monolith, TypeScript                     |
| **Runtime**      | Node.js                | 22.x LTS    | Menjalankan Next.js server                           |
| **Language**     | TypeScript             | 5.x         | Strict mode aktif                                    |
| **UI Library**   | React                  | 19.x        | Server & Client Components                           |
| **Styling**      | Tailwind CSS           | 4.x         | Utility-first CSS                                    |
| **UI Components**| shadcn/ui              | Latest      | Komponen aksesibel berbasis Radix UI                 |
| **Database**     | PostgreSQL              | 16.x        | Relational database utama                            |
| **ORM**          | Prisma                 | 6.x         | Type-safe database client                            |
| **Auth**         | Better Auth            | 1.4+        | Session-based auth dengan cookie                     |
| **Server State** | TanStack Query (React Query) | 5.x   | Data fetching, caching, & invalidation client-side  |
| **Validation**   | Zod                    | 3.x         | Schema validation untuk request body & env vars      |
| **Package Manager** | pnpm               | 9.x         | Dependency management                                |

### 6.3 Development & Infrastructure

| Kategori         | Teknologi              | Keterangan                                           |
|------------------|------------------------|------------------------------------------------------|
| **Linting**      | ESLint + Prettier      | Flat config (ESLint 9.x)                             |
| **Git hooks**    | Husky + lint-staged    | Pre-commit linting & formatting                      |
| **Environment**  | dotenv (.env.local)    | Variabel environment terpisah per environment        |
| **Deployment**   | VPS / Docker           | Self-hosted atau container-based                     |
| **Database Migrations** | Prisma Migrate  | Version-controlled schema migration                  |

---

## 7. Arsitektur Aplikasi

### 7.1 Struktur Project

```
komando-center/
├── public/
│   └── assets/
│       └── images/
├── src/
│   ├── app/                          # App Router — semua routes
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Redirect ke /dashboard atau /login
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                   # Route group — auth pages
│   │   │   └── login/
│   │   │       └── page.tsx          # /login
│   │   │
│   │   ├── (main)/                   # Route group — halaman utama (protected)
│   │   │   ├── layout.tsx            # Layout dengan sidebar & topbar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # /dashboard
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # /orders — daftar perintah dibuat
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # /orders/new — buat perintah baru
│   │   │   │   └── [orderId]/
│   │   │   │       └── page.tsx      # /orders/:id — detail & progress
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx          # /assignments — perintah diterima
│   │   │   │   └── [assignmentId]/
│   │   │   │       └── page.tsx      # /assignments/:id — detail & submit
│   │   │   ├── members/
│   │   │   │   ├── page.tsx          # /members — daftar anggota saya
│   │   │   │   └── [userId]/
│   │   │   │       └── page.tsx      # /members/:id — profil anggota
│   │   │   ├── social-accounts/
│   │   │   │   └── page.tsx          # /social-accounts — akun sosmed saya
│   │   │   └── admin/                # Admin-only pages
│   │   │       ├── layout.tsx        # Guard admin route
│   │   │       ├── units/
│   │   │       │   └── page.tsx      # /admin/units — manajemen organisasi
│   │   │       └── users/
│   │   │           ├── page.tsx      # /admin/users — daftar user
│   │   │           └── [userId]/
│   │   │               └── page.tsx  # /admin/users/:id — detail user
│   │   │
│   │   └── api/                      # REST API — Route Handlers
│   │       ├── auth/
│   │       │   └── [...all]/
│   │       │       └── route.ts      # Better Auth handler (semua /api/auth/*)
│   │       └── v1/
│   │           ├── auth/
│   │           │   ├── me/route.ts
│   │           │   ├── logout/route.ts
│   │           │   └── change-password/route.ts
│   │           ├── units/
│   │           │   ├── route.ts                    # GET, POST
│   │           │   └── [unitId]/
│   │           │       ├── route.ts                # GET, PATCH, DELETE
│   │           │       └── members/
│   │           │           ├── route.ts            # POST
│   │           │           └── [userId]/
│   │           │               └── transfer/route.ts # PATCH
│   │           ├── users/
│   │           │   ├── route.ts                    # GET, POST
│   │           │   └── [userId]/
│   │           │       ├── route.ts                # GET, PATCH, DELETE
│   │           │       ├── unlock/route.ts
│   │           │       ├── reset-password/route.ts
│   │           │       └── social-accounts/route.ts # GET
│   │           ├── social-accounts/
│   │           │   ├── route.ts                    # GET, POST
│   │           │   └── [socialAccountId]/route.ts  # PATCH, DELETE
│   │           ├── orders/
│   │           │   ├── route.ts                    # GET, POST
│   │           │   └── [orderId]/
│   │           │       ├── route.ts                # GET, PATCH
│   │           │       ├── send/route.ts           # POST
│   │           │       ├── cancel/route.ts         # POST
│   │           │       └── assignments/
│   │           │           ├── route.ts            # GET
│   │           │           ├── by-unit/route.ts    # GET
│   │           │           └── export/route.ts     # GET (xlsx)
│   │           ├── assignments/
│   │           │   └── me/
│   │           │       ├── route.ts                # GET
│   │           │       └── [assignmentId]/
│   │           │           ├── route.ts            # GET
│   │           │           └── submit/route.ts     # POST
│   │           ├── commander/
│   │           │   └── members/
│   │           │       ├── route.ts                # GET
│   │           │       ├── by-unit/route.ts        # GET
│   │           │       └── [userId]/route.ts       # GET
│   │           └── dashboard/
│   │               ├── commander/route.ts          # GET
│   │               ├── member/route.ts             # GET
│   │               └── admin/route.ts              # GET
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (Button, Input, dll.)
│   │   ├── layout/                   # Sidebar, Topbar, PageHeader
│   │   └── features/                 # Feature components
│   │       ├── auth/                 # LoginForm
│   │       ├── orders/               # OrderCard, OrderForm, ProgressBar
│   │       ├── assignments/          # AssignmentCard, SubmitModal
│   │       ├── units/                # UnitTree, UnitNode
│   │       ├── members/              # MemberTable, MemberCard
│   │       ├── social-accounts/      # SocialAccountCard, SocialAccountForm
│   │       └── dashboard/            # StatsCard, ProgressOverview
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-session.ts            # Better Auth session hook
│   │   ├── use-debounce.ts
│   │   └── use-filter-params.ts      # URL search params untuk filter
│   │
│   ├── lib/
│   │   ├── auth.ts                   # Better Auth server instance
│   │   ├── auth-client.ts            # Better Auth client instance
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── api.ts                    # Fetch wrapper untuk client-side API calls
│   │   ├── utils.ts                  # Helper functions
│   │   ├── validations/              # Zod schemas per domain
│   │   │   ├── auth.schema.ts
│   │   │   ├── order.schema.ts
│   │   │   ├── unit.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   └── social-account.schema.ts
│   │   └── helpers/
│   │       ├── response.ts           # Response envelope helpers
│   │       ├── permissions.ts        # Role & hierarchy permission checks
│   │       └── hierarchy.ts          # Tree traversal utilities (path-based)
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── api.ts                    # API response types
│   │   ├── entities.ts               # Domain entity types
│   │   └── enums.ts                  # Enum values
│   │
│   ├── providers/
│   │   ├── query-provider.tsx        # TanStack Query provider
│   │   └── session-provider.tsx      # Better Auth session provider
│   │
│   └── middleware.ts                 # Auth guard — redirect unauthenticated users
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Migration history
│
├── .env.example                      # Template environment variables
├── .env.local                        # Local env (git-ignored)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── eslint.config.mjs
└── package.json
```

### 7.2 Alur Request API

```
Browser (Client Component)
    │
    ▼ fetch('/api/v1/orders', { headers: { Cookie: session_token } })
    │
Next.js Server (Route Handler)
    │
    ├── src/middleware.ts ──→ Better Auth session check
    │       │ Unauthenticated → 401 / redirect /login
    │       │ Authenticated → lanjut
    │
    ├── src/app/api/v1/orders/route.ts
    │       │
    │       ├── 1. Parse & validate request (Zod)
    │       ├── 2. Ambil session dari Better Auth
    │       ├── 3. Permission check (lib/helpers/permissions.ts)
    │       ├── 4. Query database (Prisma)
    │       ├── 5. Transform & serialize response
    │       └── 6. Return NextResponse.json(envelope)
    │
    ▼
Browser ← JSON Response
```

### 7.3 Autentikasi dengan Better Auth

Better Auth mengelola autentikasi menggunakan **session-based authentication dengan cookie**:

```
POST /api/auth/sign-in/username
    │
Better Auth Handler (/api/auth/[...all]/route.ts)
    │
    ├── Verifikasi username + password (bcrypt compare)
    ├── Buat session record di database (tabel: session)
    ├── Set cookie HTTP-only: better-auth.session_token
    │
    ▼
Browser menyimpan cookie (HTTP-only, Secure, SameSite=Lax)
```

Setiap request selanjutnya membawa cookie session secara otomatis. Route Handler membaca session via:

```typescript
// Di dalam Route Handler
const session = await auth.api.getSession({ headers: await headers() })
if (!session) return unauthorized()
const currentUser = session.user
```

---

## 8. Functional Requirements

### 8.1 MODULE AUTH — Autentikasi

| ID     | Fitur                     | Deskripsi                                                                               | Prioritas | Acceptance Criteria                                                                         |
|--------|---------------------------|-----------------------------------------------------------------------------------------|-----------|---------------------------------------------------------------------------------------------|
| FR-001 | Login                     | User SHALL login menggunakan username dan password                                      | Critical  | Diberikan kredensial valid, user diarahkan ke dashboard dalam < 2 detik                    |
| FR-002 | Password masking          | System SHALL menyembunyikan karakter password dengan opsi toggle show/hide              | High      | Karakter password ditampilkan sebagai ● secara default; toggle 👁 mengungkap plaintext     |
| FR-003 | Pesan error generik       | System SHALL menampilkan pesan generik "Username atau password salah" tanpa mengungkap field mana yang salah | High | Pesan error tidak mengandung kata "username" atau "password" secara spesifik             |
| FR-004 | Lockout mekanisme         | System SHALL mengunci akun setelah 5 percobaan login gagal berturutan                  | High      | Percobaan ke-6 mengembalikan status 423 dengan pesan "Akun dikunci sementara"              |
| FR-005 | Session management        | System SHALL mempertahankan sesi user selama 7 hari sejak login terakhir                | High      | Token session expired setelah 7 hari tidak aktif; user diarahkan ke halaman login         |
| FR-006 | Logout                    | User SHALL dapat logout dan menginvalidasi sesi aktif                                   | Critical  | Setelah logout, token session tidak valid; akses ke halaman protected diredirect ke /login |
| FR-007 | Ganti password            | User SHALL dapat mengganti password dengan verifikasi password lama                     | High      | Password lama yang salah menghasilkan error 401; password berhasil diubah dalam < 2 detik |
| FR-008 | Role-based redirect       | System SHALL mengarahkan user ke dashboard yang sesuai berdasarkan role setelah login   | High      | Super Admin → /admin/units; Komandan → /dashboard; Anggota → /dashboard                   |

### 8.2 MODULE ORGANISASI — Manajemen Satuan

| ID     | Fitur                          | Deskripsi                                                                              | Prioritas | Acceptance Criteria                                                                     |
|--------|--------------------------------|----------------------------------------------------------------------------------------|-----------|-----------------------------------------------------------------------------------------|
| FR-009 | Tampil tree organisasi         | Admin SHALL melihat seluruh struktur hierarki satuan dalam tampilan tree expandable    | Critical  | Tree menampilkan semua satuan dari root hingga leaf; bisa expand/collapse per node      |
| FR-010 | Cari satuan/anggota            | Admin SHALL dapat mencari satuan atau anggota berdasarkan nama dalam tampilan tree     | High      | Hasil pencarian meng-highlight node yang cocok dalam tree dalam < 500ms               |
| FR-011 | Buat satuan baru               | Admin SHALL dapat membuat satuan baru sebagai child dari satuan manapun                | Critical  | Satuan baru muncul di tree sebagai child node; `path` dan `depthLevel` terupdate otomatis |
| FR-012 | Edit satuan                    | Admin SHALL dapat mengubah nama, deskripsi, dan komandan satuan                        | High      | Perubahan tersimpan dan tampil di tree tanpa refresh halaman                            |
| FR-013 | Hapus satuan                   | Admin SHALL dapat menghapus satuan dengan validasi                                     | High      | Satuan dengan assignment aktif tidak dapat dihapus; sistem menampilkan pesan penjelasan |
| FR-014 | Assign komandan                | Admin SHALL dapat menunjuk user sebagai komandan satuan                                | High      | User yang ditunjuk memiliki akses Komandan untuk satuan tersebut                       |
| FR-015 | Assign anggota ke satuan       | Admin SHALL dapat menambahkan user ke satuan tertentu                                  | Critical  | User berhasil bergabung ke satuan dan mulai menerima perintah dari satuan tersebut     |
| FR-016 | Pindah anggota antar satuan    | Admin SHALL dapat memindahkan user dari satu satuan ke satuan lain                     | High      | Histori keanggotaan lama tersimpan; anggota mulai menerima perintah dari satuan baru   |

### 8.3 MODULE USER — Manajemen User

| ID     | Fitur                     | Deskripsi                                                                               | Prioritas | Acceptance Criteria                                                                     |
|--------|---------------------------|-----------------------------------------------------------------------------------------|-----------|-----------------------------------------------------------------------------------------|
| FR-017 | Daftar user dengan filter | Admin SHALL melihat daftar semua user dengan filter: nama, NIP, satuan, role, status akun, platform sosmed | Critical | Filter diterapkan dalam < 500ms; pagination berfungsi dengan benar                   |
| FR-018 | Buat user baru            | Admin SHALL dapat membuat akun user baru dengan username, nama, NIP, password awal, dan satuan | Critical | User baru dapat login dengan kredensial yang ditentukan admin; username unik divalidasi |
| FR-019 | Edit data user            | Admin SHALL dapat mengubah nama, NIP, dan satuan user                                   | High      | Perubahan tersimpan dan tampil pada daftar user                                        |
| FR-020 | Nonaktifkan user          | Admin SHALL dapat menonaktifkan user (soft delete) tanpa menghapus data historis        | High      | User yang dinonaktifkan tidak dapat login; data riwayat tetap tersimpan                |
| FR-021 | Buka kunci akun           | Admin SHALL dapat membuka kunci akun yang dikunci karena percobaan login berlebih       | High      | Setelah di-unlock, user dapat login kembali                                            |
| FR-022 | Reset password            | Admin SHALL dapat mereset password user ke nilai baru                                   | High      | User dapat login dengan password baru yang di-set Admin                                |

### 8.4 MODULE SOSMED — Manajemen Akun Sosial Media

| ID     | Fitur                          | Deskripsi                                                                           | Prioritas | Acceptance Criteria                                                                     |
|--------|--------------------------------|-------------------------------------------------------------------------------------|-----------|-----------------------------------------------------------------------------------------|
| FR-023 | Daftar akun sosmed sendiri     | User SHALL melihat daftar seluruh akun sosmed yang pernah didaftarkan               | Critical  | Daftar tampil dengan platform, username, URL, dan tanggal didaftarkan                  |
| FR-024 | Tambah akun sosmed             | User SHALL dapat mendaftarkan akun sosmed baru dengan memilih platform, isi username, dan URL profil | Critical | Akun tersimpan dan tampil dalam daftar; notifikasi sukses ditampilkan                 |
| FR-025 | Edit akun sosmed               | User SHALL dapat mengubah username, URL, dan catatan akun sosmed yang dimiliki      | High      | Perubahan tersimpan; hanya pemilik akun atau Admin yang dapat mengedit                 |
| FR-026 | Hapus akun sosmed              | User SHALL dapat menghapus akun sosmed yang dimiliki                                | High      | Akun dihapus (soft delete) setelah konfirmasi; data submission terkait tetap tersimpan |
| FR-027 | Filter akun sosmed sendiri     | User SHALL dapat memfilter daftar akun sosmed berdasarkan platform                  | Medium    | Filter platform berfungsi dengan quick chip dan dropdown                               |
| FR-028 | Lihat akun sosmed bawahan      | Komandan SHALL dapat melihat akun sosmed seluruh anggota dalam lingkup hierarkinya  | High      | Komandan hanya melihat anggota dalam scope hierarki; anggota di luar scope tidak tampil |

### 8.5 MODULE PERINTAH — Manajemen Perintah

| ID     | Fitur                          | Deskripsi                                                                           | Prioritas | Acceptance Criteria                                                                        |
|--------|--------------------------------|-------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------|
| FR-029 | Buat perintah (4 jenis)        | Komandan SHALL dapat membuat perintah dengan jenis: Posting, Engagement, Komentar, Report Akun | Critical | Form menampilkan field kondisional sesuai jenis yang dipilih; validasi berjalan sebelum submit |
| FR-030 | Field kondisional per jenis    | System SHALL menampilkan field tambahan sesuai jenis perintah yang dipilih          | Critical  | Posting: narasi + hashtag; Engagement: checkbox like/share/repost; Komentar: narasi + sentimen; Report: alasan |
| FR-031 | Validasi deadline minimal      | System SHALL menolak perintah dengan deadline kurang dari 1 jam dari waktu pengiriman | High    | Error "Deadline minimal 1 jam dari sekarang" ditampilkan; form tidak dapat disubmit       |
| FR-032 | Pilih target perintah          | Komandan SHALL dapat memilih target perintah berupa satuan (multi-select) dan/atau anggota individu | Critical | Preview jumlah anggota yang terdampak tampil real-time saat satuan/anggota dipilih      |
| FR-033 | Preview target rekursif        | Saat Komandan memilih satuan, system SHALL menampilkan preview jumlah total anggota termasuk sub-satuan | High | Counter "X anggota dari Y satuan" diperbarui real-time saat checkbox berubah           |
| FR-034 | Simpan sebagai draft           | Komandan SHALL dapat menyimpan perintah tanpa mengirimkan ke anggota                | High      | Draft tersimpan dengan status `draft`; tidak ada assignment dibuat; perintah bisa diedit |
| FR-035 | Kirim perintah                 | Komandan SHALL dapat mengirim perintah aktif; system SHALL broadcast otomatis ke semua anggota target | Critical | Status berubah ke `aktif`; task_assignments dibuat untuk semua anggota target dalam < 5 detik |
| FR-036 | Broadcast rekursif             | System SHALL membuat assignment untuk SEMUA anggota dalam satuan target secara rekursif (termasuk sub-satuan n-level) | Critical | Anggota di level paling dalam tetap menerima assignment; tidak ada duplikasi assignment |
| FR-037 | Edit draft perintah            | Komandan SHALL dapat mengedit perintah berstatus `draft`                            | High      | Semua field dapat diubah selama status masih `draft`                                      |
| FR-038 | Batalkan perintah aktif        | Komandan SHALL dapat membatalkan perintah berstatus `aktif`                         | High      | Status berubah ke `dibatalkan`; assignment yang belum dikerjakan dihapus; yang sudah submit tetap tersimpan |
| FR-039 | Konfirmasi sebelum kirim       | System SHALL menampilkan halaman konfirmasi ringkasan perintah sebelum pengiriman final | High  | Ringkasan menampilkan: judul, jenis, target, jumlah anggota, deadline; ada tombol kembali dan kirim |

### 8.6 MODULE ASSIGNMENT — Perintah Diterima & Submission

| ID     | Fitur                          | Deskripsi                                                                           | Prioritas | Acceptance Criteria                                                                        |
|--------|--------------------------------|-------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------|
| FR-040 | Lihat daftar perintah diterima | Anggota/Komandan SHALL melihat daftar perintah yang di-assign kepadanya             | Critical  | Daftar diurutkan deadline terdekat; status setiap perintah tampil dengan badge berwarna    |
| FR-041 | Visual alert deadline mepet    | System SHALL menampilkan visual alert untuk perintah dengan deadline < 24 jam        | High      | Label "⚠️ X jam lagi" dengan warna merah tampil; perintah urgent muncul di atas dashboard |
| FR-042 | Filter perintah diterima       | Anggota SHALL dapat memfilter daftar perintah berdasarkan jenis, status, periode, dan dari siapa | High | Semua filter berfungsi dan dapat dikombinasikan; reset filter mengembalikan tampilan penuh |
| FR-043 | Lihat detail perintah          | Anggota SHALL melihat detail lengkap perintah: instruksi, narasi, link target, deadline | Critical | Detail perintah menampilkan semua field yang diisi Komandan; ada tombol "Buka di Tab Baru" untuk link target |
| FR-044 | Salin narasi                   | System SHALL menyediakan tombol salin untuk narasi komentar/posting                 | Medium    | Klik tombol "Salin Narasi" menyalin teks narasi ke clipboard; notifikasi "Tersalin!" muncul |
| FR-045 | Tampil akun sosmed relevan     | System SHALL menampilkan daftar akun sosmed milik anggota di halaman detail perintah | Medium  | Akun sosmed anggota tampil di bawah instruksi sebagai referensi untuk pelaksanaan         |
| FR-046 | Submit bukti (link Drive)      | Anggota SHALL dapat mengisi link Google Drive sebagai bukti pelaksanaan             | Critical  | Link tersimpan; status assignment berubah ke `selesai` atau `terlambat` secara otomatis  |
| FR-047 | Validasi URL submission        | System SHALL memvalidasi bahwa link yang disubmit adalah URL yang valid             | High      | URL kosong atau format tidak valid ditolak dengan pesan error spesifik                    |
| FR-048 | Status selesai vs terlambat    | System SHALL menentukan status `selesai` atau `terlambat` berdasarkan waktu submit vs deadline | Critical | Submit sebelum/tepat deadline → `selesai`; submit setelah deadline → `terlambat`         |
| FR-049 | Resubmit bukti                 | Anggota SHALL dapat mengganti bukti yang sudah disubmit sebelumnya                  | Medium    | Submission lama tersimpan sebagai histori; submission baru menjadi `isLatest: true`      |

### 8.7 MODULE MONITORING — Dashboard & Progress

| ID     | Fitur                          | Deskripsi                                                                           | Prioritas | Acceptance Criteria                                                                        |
|--------|--------------------------------|-------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------|
| FR-050 | Dashboard stats Komandan       | Komandan SHALL melihat ringkasan statistik: perintah aktif, total anggota, total submit, total pending | Critical | Stats card tampil dan terupdate real-time; angka akurat sesuai data aktual             |
| FR-051 | Daftar perintah aktif di dashboard | Dashboard SHALL menampilkan daftar perintah aktif beserta progress bar masing-masing | Critical | Progress bar menunjukkan persentase submission; warna berubah merah jika deadline < 24 jam |
| FR-052 | Filter lengkap di dashboard    | Komandan SHALL dapat memfilter dashboard berdasarkan satuan, jenis perintah, status, periode, rentang tanggal, dan progress range | High | Semua filter berfungsi; URL search params diperbarui sehingga filter bisa di-share      |
| FR-053 | Quick filter chips             | System SHALL menyediakan quick filter chip: "Hampir Deadline", "Belum Ada Submit", "Selesai", "Ada yang Terlambat" | High | Klik chip langsung memfilter tanpa membuka dropdown                                   |
| FR-054 | Detail progress per perintah   | Komandan SHALL melihat breakdown progress per satuan dan per anggota untuk setiap perintah | Critical | Tampilan tree satuan → anggota dengan status, waktu submit, dan link Drive per anggota  |
| FR-055 | Filter di halaman detail progress | Komandan SHALL dapat memfilter daftar anggota berdasarkan nama, satuan, dan status submission | High | Filter nama berfungsi real-time; filter satuan menggunakan dropdown hierarki            |
| FR-056 | Buka link Drive                | Komandan SHALL dapat mengklik link Drive submission anggota untuk membukanya di tab baru | High   | Link Drive yang disubmit anggota terklik langsung membuka Google Drive di tab baru     |
| FR-057 | Export progress ke Excel       | Komandan SHALL dapat mengekspor data progress perintah ke file .xlsx                | Medium    | File xlsx berisi kolom: No, Nama Anggota, Satuan, Status, Waktu Submit, Link Drive, Terlambat |
| FR-058 | Dashboard stats Anggota        | Anggota SHALL melihat ringkasan: total pending, total selesai, total terlambat, dan perintah urgent | High | Stats card tampil; perintah urgent (deadline < 24 jam) di-highlight di atas            |

---

## 9. Non-Functional Requirements

### 9.1 Performance

| ID      | Kategori    | Requirement                                                                           |
|---------|-------------|---------------------------------------------------------------------------------------|
| NFR-001 | Latency     | API response time (p95) SHALL < 500ms untuk semua endpoint di bawah beban normal     |
| NFR-002 | Latency     | API response time (p95) untuk endpoint broadcast rekursif SHALL < 5 detik untuk 500 anggota |
| NFR-003 | Load time   | Largest Contentful Paint (LCP) halaman dashboard SHALL < 2 detik pada koneksi 4G     |
| NFR-004 | Database    | Query database dengan filter kombinasi SHALL memanfaatkan composite index; query time < 200ms |
| NFR-005 | Concurrency | System SHALL mendukung minimal 500 concurrent users tanpa degradasi performa signifikan |
| NFR-006 | Export      | Export file Excel dengan 1000+ baris SHALL selesai dalam < 10 detik                  |

### 9.2 Security

| ID      | Kategori        | Requirement                                                                        |
|---------|-----------------|------------------------------------------------------------------------------------|
| NFR-007 | Authentication  | System SHALL menggunakan Better Auth dengan session-based cookie (HTTP-only, Secure, SameSite=Lax) |
| NFR-008 | Password        | Password SHALL di-hash menggunakan bcrypt dengan minimum cost factor 10            |
| NFR-009 | Authorization   | System SHALL memvalidasi lingkup hierarki pada SETIAP request yang mengakses data anggota/satuan |
| NFR-010 | Rate limiting   | Endpoint login SHALL dibatasi 10 request/menit per IP; endpoint lain 300 request/menit per token |
| NFR-011 | CSRF            | System SHALL mengaktifkan proteksi CSRF bawaan Better Auth (disableCSRFCheck: false) |
| NFR-012 | Lockout         | System SHALL mengunci akun setelah 5 percobaan login gagal berturutan; admin dapat membuka kunci |
| NFR-013 | Input validation| Semua request body SHALL divalidasi menggunakan Zod schema sebelum diproses        |
| NFR-014 | Secret rotation | BETTER_AUTH_SECRET SHALL memiliki minimum 32 karakter dan tidak pernah di-commit ke repository |
| NFR-015 | SQL injection   | System SHALL menggunakan Prisma ORM parameterized queries; raw query dilarang kecuali path query |
| NFR-016 | Env vars        | Semua credential dan secret SHALL disimpan di environment variables, bukan hardcoded |

### 9.3 Availability & Reliability

| ID      | Kategori     | Requirement                                                                         |
|---------|--------------|-------------------------------------------------------------------------------------|
| NFR-017 | Uptime       | System SHALL memiliki uptime ≥ 99.5% per bulan (planned downtime dikecualikan)     |
| NFR-018 | Data integrity | Database transaction SHALL digunakan untuk operasi broadcast yang menciptakan banyak assignment sekaligus |
| NFR-019 | Soft delete  | System SHALL menggunakan soft delete (deleted_at) untuk semua entitas utama; data tidak benar-benar dihapus |
| NFR-020 | Error handling| Semua unhandled error SHALL di-catch dan mengembalikan response 500 dengan format envelope standard |

### 9.4 Usability

| ID      | Kategori    | Requirement                                                                            |
|---------|-------------|----------------------------------------------------------------------------------------|
| NFR-021 | Responsif   | UI SHALL responsif dan dapat digunakan pada viewport minimum 375px (mobile) dan 1280px (desktop) |
| NFR-022 | Aksesibilitas| UI SHALL memenuhi standar WCAG 2.1 Level AA minimum — contrast ratio ≥ 4.5:1 untuk body text |
| NFR-023 | Filter URL  | State filter dan sorting SHALL disimpan dalam URL search params sehingga halaman dapat di-bookmark dan di-share |
| NFR-024 | Empty states| Semua halaman daftar SHALL memiliki empty state yang informatif dengan call-to-action  |
| NFR-025 | Loading states| Semua data fetching SHALL menampilkan skeleton screen atau loading indicator         |
| NFR-026 | Error states| Semua error fetch SHALL menampilkan pesan error dan tombol "Coba Lagi"               |
| NFR-027 | Toast notif | Feedback aksi sukses (submit bukti, buat perintah, dll.) SHALL ditampilkan sebagai toast notification selama 3–5 detik |

### 9.5 Maintainability

| ID      | Kategori        | Requirement                                                                      |
|---------|-----------------|----------------------------------------------------------------------------------|
| NFR-028 | TypeScript      | Seluruh codebase SHALL menggunakan TypeScript dengan strict mode; tidak ada penggunaan `any` yang eksplisit |
| NFR-029 | Code structure  | API Route Handlers SHALL mengikuti pola: validate → authenticate → authorize → query → serialize → respond |
| NFR-030 | Schema migration| Semua perubahan database schema SHALL menggunakan Prisma Migrate dengan file migration yang di-commit |
| NFR-031 | Environment     | System SHALL memiliki file `.env.example` yang lengkap sebagai template environment variables |

---

## 10. Autentikasi — Detail Implementasi Better Auth

### 10.1 Konfigurasi Server (`src/lib/auth.ts`)

Better Auth dikonfigurasi dengan:

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { username } from "better-auth/plugins"
import { db } from "@/lib/db"

export const auth = betterAuth({
  appName: "Komando Center",
  database: prismaAdapter(db, { provider: "postgresql" }),

  // Login menggunakan username (bukan email)
  plugins: [username()],

  emailAndPassword: {
    enabled: false, // Dinonaktifkan — login pakai username plugin
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 hari
    updateAge: 60 * 60 * 24,        // Refresh setiap 1 hari aktif
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,               // Cache 5 menit
      strategy: "jwe",              // Enkripsi penuh untuk sistem sensitif
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",            // Persistent rate limit (bukan memory)
    customRules: {
      "/sign-in/username": { window: 60, max: 10 },
    },
  },

  advanced: {
    useSecureCookies: true,
    cookiePrefix: "komando",
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL!],
})
```

### 10.2 Mount Handler (`src/app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { POST, GET } = toNextJsHandler(auth)
```

### 10.3 Middleware Auth Guard (`src/middleware.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/auth-middleware"

const PUBLIC_PATHS = ["/login", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Izinkan public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Validasi session cookie
  const session = await getSessionFromCookie(request)
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Guard halaman admin
  if (pathname.startsWith("/admin") && session.user.role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
```

### 10.4 Tabel Database Better Auth

Better Auth akan membuat tabel berikut secara otomatis via `npx @better-auth/cli generate`:

| Tabel       | Keterangan                                         |
|-------------|----------------------------------------------------|
| `user`      | Data user Better Auth (terintegrasi dengan tabel `users` custom) |
| `session`   | Sesi aktif setiap user                             |
| `account`   | Akun auth (untuk username plugin)                  |
| `verification` | Token verifikasi (jika diaktifkan)              |

> **Integrasi dengan tabel `users` custom**: Better Auth membuat tabel `user` sendiri. Tabel `users` custom di ERD akan di-extend atau dihubungkan via relasi `userId` referencing `user.id` dari Better Auth.

### 10.5 Custom Fields pada User Better Auth

Untuk menyimpan field tambahan (nip, role, dll.), gunakan `user.additionalFields`:

```typescript
export const auth = betterAuth({
  // ...
  user: {
    additionalFields: {
      nip: {
        type: "string",
        required: false,
        unique: true,
        input: true,
      },
      role: {
        type: "string",
        defaultValue: "member",
        input: false, // Hanya bisa di-set oleh server
      },
    },
  },
})
```

---

## 11. Database Schema Overview

Schema menggunakan **Prisma** dengan PostgreSQL. Entitas utama dan relasinya (detail lengkap di ERD v1.0):

```
users ──────────────────┬── unit_members (junction)
                        │
units (self-ref tree) ──┘
  │ (materialized path)
  └── units (children)

users ──── social_accounts

users (komandan) ──── orders
                        │
                        ├── order_targets (unit atau individual)
                        │
                        └── task_assignments (1 per anggota)
                                │
                                └── submissions (bukti link Drive)
```

**Strategi hierarki**: Tabel `units` menggunakan **materialized path** (kolom `path VARCHAR`) untuk mendukung query rekursif yang efisien:

```sql
-- Broadcast: ambil semua anggota di bawah satuan target
SELECT DISTINCT um.user_id
FROM unit_members um
JOIN units u ON um.unit_id = u.id
WHERE u.path LIKE '/uuid-target-unit/%'
  AND um.removed_at IS NULL;
```

---

## 12. API Design Conventions

Semua API endpoint mengikuti konvensi berikut (detail lengkap di API Spec v1.0):

| Aspek                | Konvensi                                                      |
|----------------------|---------------------------------------------------------------|
| **Base path**        | `/api/v1/`                                                    |
| **Auth endpoint**    | `/api/auth/` (dikelola Better Auth)                           |
| **HTTP methods**     | GET (baca), POST (buat/aksi), PATCH (update partial), DELETE (hapus) |
| **Response format**  | `{ success, data, message, meta?, timestamp }`                |
| **Error format**     | `{ success: false, error: { code, message, details? } }`     |
| **Pagination**       | Query params: `page`, `limit`, `sortBy`, `sortOrder`         |
| **Filter params**    | Semua filter menggunakan query params dengan nama deskriptif  |
| **Status codes**     | 200/201/204 sukses · 400 validasi · 401 unauth · 403 forbidden · 404 not found · 422 business rule · 500 server error |

---

## 13. Assumptions & Dependencies

### 13.1 Asumsi

| ID    | Asumsi                                                                                       |
|-------|----------------------------------------------------------------------------------------------|
| A-01  | User tidak mendaftar sendiri — semua akun dibuat oleh Super Admin                           |
| A-02  | Struktur hierarki organisasi sudah ditentukan sebelum sistem digunakan; Admin yang menyusunnya |
| A-03  | Anggota memiliki akses ke Google Drive dan mampu mengupload file serta membuat shareable link |
| A-04  | Verifikasi konten bukti (apakah link Drive benar-benar berisi bukti yang valid) dilakukan secara manual oleh Komandan |
| A-05  | Satu user hanya aktif di satu satuan pada satu waktu                                        |
| A-06  | Komandan di level tertinggi tidak memiliki atasan dan tidak menerima perintah                |
| A-07  | Tidak ada autentikasi dua faktor (2FA) pada versi 1.0                                       |
| A-08  | Sistem digunakan oleh organisasi tunggal (single-tenant)                                    |

### 13.2 Dependencies External

| Dependency       | Keterangan                                                          | Risiko jika Tidak Tersedia        |
|------------------|---------------------------------------------------------------------|-----------------------------------|
| Google Drive     | Anggota menggunakan Drive pribadi untuk menyimpan dan share bukti  | Anggota tidak dapat submit bukti  |
| PostgreSQL 16.x  | Database utama                                                      | Sistem tidak dapat berjalan       |
| Node.js 22.x LTS | Runtime Next.js                                                     | Sistem tidak dapat berjalan       |

---

## 14. Risks & Mitigations

| ID    | Risk                                         | Likelihood | Impact | Mitigation Strategy                                                                    |
|-------|----------------------------------------------|------------|--------|----------------------------------------------------------------------------------------|
| R-01  | Broadcast ke ribuan anggota menyebabkan timeout | Medium  | High   | Gunakan database transaction + batched insert (1000 record per batch); pisahkan proses broadcast ke background queue jika volume > 1000 |
| R-02  | Link Google Drive tidak bisa diakses          | Medium    | Medium | Dokumentasikan panduan untuk user agar selalu set sharing ke "Anyone with link"; tidak ada validasi otomatis di v1.0 |
| R-03  | Hierarki organisasi sangat dalam (>10 level) menyebabkan query lambat | Low | Medium | Materialized path + index `path` mencegah recursive CTE; monitor query time dan tambahkan index jika perlu |
| R-04  | Session cookie dicuri (MITM)                 | Low        | High   | Enforced HTTPS + HTTP-only + SameSite=Lax cookie; trusted origins dikonfigurasi ketat |
| R-05  | PostgreSQL `path LIKE` query lambat pada dataset besar | Medium | Medium | Index `path` dengan operator class `text_pattern_ops` untuk mendukung prefix LIKE query |
| R-06  | Konflik penentuan "isCommander" jika user memimpin beberapa satuan | Low | Medium | Tetapkan aturan: user adalah Komandan jika memimpin minimal 1 satuan aktif; tampilkan semua satuan yang dipimpin |
| R-07  | Data filter state hilang saat halaman di-refresh | Low    | Low    | Filter state disimpan di URL search params (bukan React state) sehingga persist saat refresh |

---

## 15. Milestones & Timeline (Estimasi)

| Milestone | Deliverable                                          | Estimasi Durasi |
|-----------|------------------------------------------------------|-----------------|
| **M1**    | Setup project, database schema, Better Auth konfigurasi | 1 minggu     |
| **M2**    | Backend API Module 1–3 (Auth, Organisasi, User)      | 1.5 minggu      |
| **M3**    | Backend API Module 4–5 (Sosmed, Perintah + Broadcast)| 1.5 minggu      |
| **M4**    | Backend API Module 6–9 (Assignment, Submission, Monitoring, Dashboard) | 1.5 minggu |
| **M5**    | Frontend — Layout, Auth, Dashboard, Admin pages      | 2 minggu        |
| **M6**    | Frontend — Order creation wizard, Assignment pages   | 2 minggu        |
| **M7**    | Frontend — Detail progress, filter, export Excel     | 1.5 minggu      |
| **M8**    | Integration testing, bug fix, performance tuning     | 1 minggu        |
| **M9**    | Deployment, seeding data awal, user acceptance testing | 1 minggu      |
| **Total** |                                                      | **~13 minggu**  |

---

## 16. Environment Variables

Semua environment variable yang dibutuhkan (template `.env.example`):

```env
# ── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME="Komando Center"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── Better Auth ────────────────────────────────────────
BETTER_AUTH_SECRET="<min 32 karakter, generate: openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"
# Untuk rotasi secret tanpa invalidasi semua sesi:
# BETTER_AUTH_SECRETS='[{"id":"v1","secret":"..."},{"id":"v2","secret":"..."}]'

# ── Database ───────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/komando_center"
# Untuk connection pooling (production):
# DIRECT_DATABASE_URL="postgresql://user:password@localhost:5432/komando_center"

# ── Node Environment ───────────────────────────────────
NODE_ENV="development"
```

---

## 17. Glossary

| Istilah             | Definisi                                                                              |
|---------------------|---------------------------------------------------------------------------------------|
| **Komando Center**  | Nama produk — platform web manajemen operasi sosial media                            |
| **Satuan**          | Node dalam hierarki organisasi yang dapat berisi sub-satuan dan/atau anggota          |
| **Anggota**         | User yang berada di leaf node hierarki — tidak memiliki bawahan                       |
| **Komandan**        | User yang memiliki bawahan (satuan atau anggota) dalam hierarki                       |
| **Perintah (Order)**| Instruksi aksi sosial media yang diterbitkan oleh Komandan                           |
| **Assignment**      | Record penugasan perintah kepada anggota individual hasil broadcast                   |
| **Submission**      | Bukti pelaksanaan perintah berupa link Google Drive yang disubmit anggota            |
| **Broadcast**       | Proses distribusi perintah ke seluruh anggota dalam satuan target secara rekursif     |
| **Materialized Path** | Teknik penyimpanan hierarki tree menggunakan kolom path string untuk query cepat   |
| **Soft Delete**     | Penandaan data sebagai terhapus (deleted_at) tanpa benar-benar menghapus dari database |
| **Better Auth**     | Library autentikasi TypeScript yang digunakan untuk manajemen session dan user        |
| **Route Handler**   | File `route.ts` dalam Next.js App Router yang berfungsi sebagai API endpoint         |
| **PRD**             | Product Requirements Document — dokumen ini                                           |
| **FR**              | Functional Requirement — kebutuhan fungsional sistem                                  |
| **NFR**             | Non-Functional Requirement — kebutuhan non-fungsional sistem                          |

---

## 18. Dokumen Terkait

| Dokumen                   | File                                 | Versi |
|---------------------------|--------------------------------------|-------|
| Use Case & Use Scenario   | `komando-center-usecase.md`          | v1.0  |
| ERD                       | `komando-center-erd.md`              | v1.0  |
| Wireframe & UI Flow       | `komando-center-wireframe-ui-flow.md`| v1.0  |
| API Specification         | `komando-center-api-spec.md`         | v1.0  |
| **PRD (dokumen ini)**     | `komando-center-prd.md`              | v1.0  |
