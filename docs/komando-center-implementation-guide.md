# Frontend Implementation Guide
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                                      |
|---------------|-------------------------------------------------------------|
| **Dokumen**   | Frontend Implementation & Slicing Guide                     |
| **Versi**     | v1.0                                                        |
| **Tanggal**   | 16 Juni 2026                                                |
| **Author**    | System Analyst                                              |
| **Status**    | Draft                                                       |
| **Referensi** | API Spec v1.1 · Wireframe v1.0 · PRD v1.0                  |
| **Template**  | Admin Template Next.js (struktur `src/` yang sudah ada)    |

### Revision History

| Versi | Tanggal    | Deskripsi               | Author         |
|-------|------------|-------------------------|----------------|
| v1.0  | 16-06-2026 | Initial guide           | System Analyst |

---

## 1. Konvensi Dokumen Ini

Setiap item dalam dokumen ini menggunakan label berikut:

| Label | Arti |
|-------|------|
| `[PAKAI]` | Copy-paste dari template, tanpa modifikasi apapun |
| `[SLICING]` | Ambil struktur/layout dari template, ganti konten & data |
| `[MODIFIKASI]` | File template sudah ada, tapi perlu perubahan signifikan di logic/koneksi API |
| `[BUAT]` | Tidak ada di template, harus dibuat dari nol |
| `[SKIP]` | Ada di template tapi tidak digunakan di Komando Center |

---

## 2. Role & Akses Halaman

Sebelum memulai slicing, pahami dulu pemetaan role ke halaman:

| Role | Deskripsi | Halaman yang Bisa Diakses |
|------|-----------|---------------------------|
| `super_admin` | Pengelola sistem | Dashboard Admin, Manajemen Organisasi, Manajemen User, Profil, Ganti Password |
| `member` (Komandan) | User yang memimpin satuan (`isCommander: true`) | Dashboard Komandan, Perintah Dibuat, Buat Perintah, Anggota Saya, Akun Sosmed, Profil, Ganti Password |
| `member` (Anggota) | User leaf node (`isCommander: false`) | Dashboard Anggota, Perintah Saya, Akun Sosmed, Profil, Ganti Password |

> Penentuan `isCommander` dilakukan secara runtime dari response `GET /api/v1/auth/me` — bukan dari field `role`, tapi dari field `isCommander: boolean`.

> Komandan yang juga punya atasan (bukan level tertinggi) akan mendapat menu "Perintah Saya" juga (sebagai penerima perintah dari atasnya).

---

## 3. Struktur Route Halaman Komando Center

```
src/app/
│
├── (auth)/                         ← Route group halaman auth (tidak ada sidebar)
│   ├── layout.tsx                  [SLICING] dari app/auth/layout.tsx
│   ├── login/page.tsx              [MODIFIKASI] dari app/auth/login/page.tsx
│   └── lock-screen/page.tsx        [MODIFIKASI] dari app/auth/lock-screen/page.tsx
│
├── (main)/                         ← Route group halaman utama (ada sidebar)
│   ├── layout.tsx                  [MODIFIKASI] dari app/dashboard/layout.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx                [BUAT] — 3 versi: admin / komandan / anggota
│   │
│   ├── orders/                     ← Hanya Komandan
│   │   ├── page.tsx                [BUAT] — daftar perintah yang dibuat
│   │   ├── new/
│   │   │   └── page.tsx            [BUAT] — wizard 3-step buat perintah baru
│   │   └── [orderId]/
│   │       └── page.tsx            [BUAT] — detail perintah + progress anggota
│   │
│   ├── assignments/                ← Anggota + Komandan yang punya atasan
│   │   ├── page.tsx                [BUAT] — daftar perintah yang diterima
│   │   └── [assignmentId]/
│   │       └── page.tsx            [BUAT] — detail assignment + submit bukti
│   │
│   ├── members/                    ← Hanya Komandan
│   │   ├── page.tsx                [BUAT] — daftar anggota dalam hierarki
│   │   └── [userId]/
│   │       └── page.tsx            [BUAT] — profil anggota + riwayat perintah
│   │
│   ├── social-accounts/
│   │   └── page.tsx                [BUAT] — daftar akun sosmed sendiri
│   │
│   ├── profile/
│   │   └── page.tsx                [SLICING] dari app/pages/profile/page.tsx
│   │
│   ├── settings/
│   │   └── page.tsx                [MODIFIKASI] dari app/pages/settings/page.tsx
│   │
│   └── admin/                      ← Hanya super_admin
│       ├── layout.tsx              [BUAT] — guard super_admin
│       ├── units/
│       │   └── page.tsx            [BUAT] — manajemen tree organisasi
│       └── users/
│           ├── page.tsx            [MODIFIKASI] dari app/pages/users-roles/page.tsx
│           └── [userId]/
│               └── page.tsx        [BUAT] — detail & edit user
│
└── api/
    ├── auth/
    │   └── [...all]/route.ts       [BUAT] — Better Auth handler
    └── v1/
        └── **                      [BUAT] — 39 custom Route Handlers
```

---

## 4. Navigasi — Label & Struktur per Role

Navigasi dikonfigurasi di `src/config/nav.ts` `[MODIFIKASI]`.

### 4.1 Navigasi Super Admin

```
📊  Dashboard
─────────────────────────
🏢  Manajemen Organisasi      → /admin/units
👤  Manajemen User            → /admin/users
─────────────────────────
👤  Profil Saya               → /profile
⚙️   Pengaturan               → /settings
🚪  Logout
```

**Koneksi API:**
- Dashboard: `GET /api/v1/dashboard/admin`
- Manajemen Organisasi: `GET /api/v1/units`
- Manajemen User: `GET /api/v1/users`

---

### 4.2 Navigasi Komandan (isCommander: true, punya atasan)

```
📊  Dashboard
─────────────────────────
📋  Perintah Saya            → /assignments   ← sebagai penerima perintah dari atasnya
─────────────────────────
📤  Perintah yang Dibuat     → /orders
👥  Anggota Saya             → /members
─────────────────────────
📱  Akun Sosmed              → /social-accounts
👤  Profil Saya              → /profile
⚙️   Pengaturan               → /settings
🚪  Logout
```

---

### 4.3 Navigasi Komandan (isCommander: true, level tertinggi — tidak punya atasan)

```
📊  Dashboard
─────────────────────────
📤  Perintah yang Dibuat     → /orders
👥  Anggota Saya             → /members
─────────────────────────
📱  Akun Sosmed              → /social-accounts
👤  Profil Saya              → /profile
⚙️   Pengaturan               → /settings
🚪  Logout
```

> Menu "Perintah Saya" tidak muncul untuk Komandan level tertinggi karena mereka tidak memiliki atasan.

---

### 4.4 Navigasi Anggota (isCommander: false)

```
📊  Dashboard
─────────────────────────
📋  Perintah Saya            → /assignments
─────────────────────────
📱  Akun Sosmed              → /social-accounts
👤  Profil Saya              → /profile
⚙️   Pengaturan               → /settings
🚪  Logout
```

**Koneksi API untuk semua navigasi:**
- Session & role: `GET /api/auth/get-session` atau `GET /api/v1/auth/me`
- Navigasi dirender secara kondisional berdasarkan `session.user.role` dan `session.user.isCommander`

---

### 4.5 Implementasi Nav Config

```typescript
// src/config/nav.ts [MODIFIKASI]

import { Session } from "@/lib/auth-client"

export function getNavItems(session: Session | null) {
  const role = session?.user?.role
  const isCommander = session?.user?.isCommander
  const hasParent = session?.user?.unit?.depthLevel > 0 // bukan root

  const common = [
    { label: "Dashboard",     href: "/dashboard",        icon: "ti-layout-dashboard" },
  ]

  const memberItems = [
    { label: "Perintah Saya", href: "/assignments",       icon: "ti-clipboard-list" },
  ]

  const commanderItems = [
    { label: "Perintah yang Dibuat", href: "/orders",    icon: "ti-send" },
    { label: "Anggota Saya",         href: "/members",   icon: "ti-users" },
  ]

  const sharedBottom = [
    { label: "Akun Sosmed",   href: "/social-accounts",  icon: "ti-brand-instagram" },
    { label: "Profil Saya",   href: "/profile",           icon: "ti-user" },
    { label: "Pengaturan",    href: "/settings",          icon: "ti-settings" },
  ]

  const adminItems = [
    { label: "Manajemen Organisasi", href: "/admin/units",  icon: "ti-building" },
    { label: "Manajemen User",       href: "/admin/users",  icon: "ti-user-cog" },
  ]

  if (role === "super_admin") {
    return [...common, ...adminItems, ...sharedBottom]
  }

  if (isCommander && hasParent) {
    // Komandan yang juga punya atasan
    return [...common, ...memberItems, ...commanderItems, ...sharedBottom]
  }

  if (isCommander && !hasParent) {
    // Komandan tertinggi — tidak punya perintah yang diterima
    return [...common, ...commanderItems, ...sharedBottom]
  }

  // Anggota biasa
  return [...common, ...memberItems, ...sharedBottom]
}
```

---

## 5. Auth Pages

---

### 5.1 Login Page `[MODIFIKASI]`

**File:** `src/app/(auth)/login/page.tsx`
**Sumber template:** `src/app/auth/login/page.tsx`

**Yang dimodifikasi dari template:**
- Hapus field "Email" → ganti dengan field "Username"
- Hapus link "Forgot password" (reset dilakukan admin)
- Hapus link "Register" (tidak ada self-registration)
- Sambungkan form ke Better Auth client

**Koneksi API:** `POST /api/auth/sign-in/username`

```typescript
// Implementasi form submit
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const router = useRouter()

async function handleLogin(values: { username: string; password: string }) {
  const { data, error } = await authClient.signIn.username({
    username: values.username,
    password: values.password,
  })

  if (error) {
    // Handle: INVALID_CREDENTIALS → "Username atau password salah"
    // Handle: ACCOUNT_LOCKED → redirect /lock-screen
    // Handle: RATE_LIMIT_EXCEEDED → "Terlalu banyak percobaan"
    return
  }

  // Redirect berdasarkan role
  if (data.user.role === "super_admin") router.push("/admin/units")
  else router.push("/dashboard")
}
```

**States yang harus ditangani:**
- Default: form login
- Loading: tombol "Masuk" → spinner + disabled
- Error credentials: banner merah "Username atau password salah"
- Error locked: redirect ke `/lock-screen`
- Error rate limit: banner oranye "Terlalu banyak percobaan. Coba lagi nanti."

---

### 5.2 Lock Screen Page `[MODIFIKASI]`

**File:** `src/app/(auth)/lock-screen/page.tsx`
**Sumber template:** `src/app/auth/lock-screen/page.tsx`

**Yang dimodifikasi:**
- Tampilkan nama user yang dikunci (dari URL params atau localStorage sementara)
- Ubah pesan menjadi: "Akun kamu dikunci sementara karena terlalu banyak percobaan login. Hubungi Admin untuk membuka akses."
- Hapus field PIN/password — cukup tampilkan pesan dan tombol "Kembali ke Login"

**Tidak perlu koneksi API** — halaman ini statis informasional.

---

### 5.3 Auth Pages yang Di-skip

```
src/app/auth/register/        [SKIP] — tidak ada self-registration
src/app/auth/forgot-password/ [SKIP] — reset dilakukan admin
src/app/auth/reset-password/  [SKIP] — reset dilakukan admin
src/app/auth/otp-verification/[SKIP] — tidak ada email OTP
src/app/auth/verify-email/    [SKIP] — tidak ada email verification
```

---

## 6. Main Layout `[MODIFIKASI]`

**File:** `src/app/(main)/layout.tsx`
**Sumber template:** `src/app/dashboard/layout.tsx`

**Yang dimodifikasi:**
1. Baca session di server component menggunakan `auth.api.getSession()`
2. Redirect ke `/login` jika tidak ada session
3. Pass session ke client untuk render navigasi kondisional
4. Inject nav items yang sesuai berdasarkan role dan `isCommander`

```typescript
// src/app/(main)/layout.tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getNavItems } from "@/config/nav"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/login")

  // Ambil data me untuk isCommander
  const meResponse = await fetch(`${process.env.BETTER_AUTH_URL}/api/v1/auth/me`, {
    headers: await headers(),
    cache: "no-store",
  })
  const me = await meResponse.json()

  const navItems = getNavItems(me.data)

  return (
    <AppShell navItems={navItems} user={me.data}>
      {children}
    </AppShell>
  )
}
```

---

### 6.1 Admin Layout Guard `[BUAT]`

**File:** `src/app/(main)/admin/layout.tsx`

```typescript
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== "super_admin") {
    redirect("/dashboard")
  }

  return <>{children}</>
}
```

---

## 7. Dashboard Pages

### 7.1 Dashboard — Router `[BUAT]`

**File:** `src/app/(main)/dashboard/page.tsx`

Dashboard adalah server component yang membaca role user dan merender komponen dashboard yang sesuai:

```typescript
// src/app/(main)/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { DashboardAdmin }     from "@/components/features/dashboard/dashboard-admin"
import { DashboardCommander } from "@/components/features/dashboard/dashboard-commander"
import { DashboardMember }    from "@/components/features/dashboard/dashboard-member"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const meRes   = await fetch(`${process.env.BETTER_AUTH_URL}/api/v1/auth/me`, {
    headers: await headers(), cache: "no-store",
  })
  const me = (await meRes.json()).data

  if (session?.user.role === "super_admin") return <DashboardAdmin />
  if (me.isCommander) return <DashboardCommander />
  return <DashboardMember />
}
```

---

### 7.2 Dashboard Super Admin `[BUAT]`

**File:** `src/components/features/dashboard/dashboard-admin.tsx`
**Sumber template:** `src/app/dashboard/page.tsx` (ambil pola stats card-nya)

**Koneksi API:** `GET /api/v1/dashboard/admin`

**Komponen yang ditampilkan:**
- Stats cards: Total User, Total Satuan, Perintah Aktif, Submit Hari Ini
- Stats cards alert: Akun Dikunci, User Tanpa Satuan, User Belum Daftar Sosmed
- Recent Activity list: log aktivitas terbaru (buat perintah baru, user baru, dll.)
- Quick links: tombol menuju Manajemen Organisasi dan Manajemen User

**Query TanStack Query:**
```typescript
const { data } = useQuery({
  queryKey: ["dashboard", "admin"],
  queryFn: () => apiFetch("/api/v1/dashboard/admin").then(r => r.json()),
})
```

---

### 7.3 Dashboard Komandan `[BUAT]`

**File:** `src/components/features/dashboard/dashboard-commander.tsx`
**Sumber template:** `src/app/dashboard/page.tsx` (ambil pola stats card + list-nya)

**Koneksi API:** `GET /api/v1/dashboard/commander`

**Query params yang didukung di halaman ini (URL search params):**
- `unitId` — filter satuan
- `orderType` — filter jenis perintah
- `status` — filter status perintah
- `startDate`, `endDate` — rentang tanggal
- `nearDeadline` — filter deadline mepet
- `noSubmit` — filter belum ada submit
- `hasLate` — filter ada yang terlambat
- `sortBy`, `sortOrder` — urutan

**Komponen yang ditampilkan:**

**Section 1 — Stats Cards (4 card):**
- Total Perintah Aktif
- Total Anggota di Bawah
- Total Submit Hari Ini
- Total Belum Submit Hari Ini

**Section 2 — Filter Bar:**
```
[Satuan ▼]  [Jenis Perintah ▼]  [Status ▼]  [Periode ▼]  [Tanggal s/d Tanggal]
Quick chips: [⚠️ Hampir Deadline] [🚨 Belum Ada Submit] [✅ Selesai] [⏰ Ada Terlambat]
```

**Section 3 — Daftar Perintah Aktif (cards):**
- Setiap card: judul, jenis, deadline countdown, progress bar (X/Y anggota)
- Badge merah jika deadline < 24 jam
- Tombol "Lihat Detail →" → `/orders/{orderId}`
- Tombol "+ Buat Perintah Baru" di kanan atas

**Query TanStack Query:**
```typescript
const { data } = useQuery({
  queryKey: ["dashboard", "commander", filters],
  queryFn: () => apiFetch(`/api/v1/dashboard/commander?${buildQueryString(filters)}`).then(r => r.json()),
})
```

---

### 7.4 Dashboard Anggota `[BUAT]`

**File:** `src/components/features/dashboard/dashboard-member.tsx`
**Sumber template:** `src/app/dashboard/page.tsx` (pola stats card sederhana)

**Koneksi API:** `GET /api/v1/dashboard/member`

**Komponen yang ditampilkan:**

**Section 1 — Stats Cards (4 card):**
- Belum Dikerjakan
- Selesai
- Terlambat
- Total Perintah

**Section 2 — Alert Urgent (jika ada deadline < 24 jam):**
- Card merah/oranye yang highlight perintah paling mepet deadlinenya
- Tombol "Submit Sekarang" → modal submit langsung dari dashboard

**Section 3 — Daftar Perintah Terbaru (5 item terakhir):**
- Status badge per item
- Tombol "Lihat Semua →" → `/assignments`

**Section 4 — Akun Sosmed Saya (ringkasan):**
- Tampilkan platform yang sudah terdaftar
- Jika belum ada: "Daftarkan akun sosmedmu agar atasan mengetahui akun mana yang kamu gunakan" + tombol → `/social-accounts`

---

## 8. Orders — Halaman Perintah (Komandan)

---

### 8.1 Daftar Perintah yang Dibuat `[BUAT]`

**File:** `src/app/(main)/orders/page.tsx`

**Koneksi API:** `GET /api/v1/orders`

**Query params (dari URL search params):**
- `search`, `orderType`, `status`, `targetUnitId`
- `startDate`, `endDate`, `deadlineStart`, `deadlineEnd`
- `progressMin`, `progressMax`
- `nearDeadline`, `noSubmit`, `hasLate`
- `sortBy`, `sortOrder`, `page`, `limit`

**Layout halaman:**

```
[Judul Halaman: Perintah yang Saya Buat]          [+ Buat Perintah Baru]
────────────────────────────────────────────────────────────────────────
FILTER BAR
[Cari judul...]  [Jenis ▼]  [Status ▼]  [Target Satuan ▼]  [Periode ▼]
[Tanggal s/d Tanggal]  [Progress 0-100%]  [Urut: ▼]  [Reset] [Terapkan]
Quick chips: [⚠️ Hampir Deadline] [🚨 Belum Ada Submit] [📋 Draft] [✅ Selesai]
────────────────────────────────────────────────────────────────────────
VIEW TOGGLE: [Kartu] [Tabel]
────────────────────────────────────────────────────────────────────────
[Daftar perintah — tabel atau kartu]
[Pagination]
```

**Komponen yang dipakai dari template:**
- `[PAKAI]` `components/data-table/data-table.tsx` untuk mode tabel
- `[PAKAI]` `components/ui/pagination.tsx`
- `[PAKAI]` `components/ui/badge.tsx` untuk status badge
- `[PAKAI]` `components/ui/input.tsx`, `select.tsx`, `button.tsx` untuk filter

**Kolom tabel (mode tabel):**
| Kolom | Tipe | Sortable |
|-------|------|----------|
| Judul Perintah | text + jenis badge | Ya |
| Jenis | badge warna | Ya |
| Target | satuan yang dituju | - |
| Deadline | tanggal + countdown | Ya |
| Progress | `X / Y anggota` + bar | Ya |
| Status | badge | Ya |
| Aksi | tombol detail | - |

**Query TanStack Query:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["orders", filters],
  queryFn: () => apiFetch(`/api/v1/orders?${buildQueryString(filters)}`).then(r => r.json()),
})
```

---

### 8.2 Buat Perintah Baru — Wizard 3 Step `[BUAT]`

**File:** `src/app/(main)/orders/new/page.tsx`

**Komponen wizard:** `[PAKAI]` `src/components/wizard-stepper.tsx`

**Koneksi API:** `POST /api/v1/orders`

**Step 1 — Informasi Perintah:**

Field yang perlu dirender:
- `title` — Input text, wajib
- `orderType` — Radio group (4 opsi: Posting / Blasting / Counter / Report)
- Field kondisional berdasarkan `orderType`:
  - `orderType === "posting"` → textarea `narration` (caption), input `hashtag` (opsional)
  - `orderType === "engagement"` → checkbox group `engagementActions` (like / share / repost)
  - `orderType === "counter"` → textarea `narration`
  - `orderType === "report_akun"` → select `reportReason`, textarea catatan
- `targetUrl` — Input URL, wajib, validasi format URL
- `description` — Textarea instruksi tambahan
- `deadline` — Date picker + time picker, wajib, min: NOW + 1 jam

**Komponen dari template untuk Step 1:**
- `[PAKAI]` `components/ui/input.tsx`
- `[PAKAI]` `components/ui/textarea.tsx`
- `[PAKAI]` `components/ui/radio-group.tsx`
- `[PAKAI]` `components/ui/checkbox.tsx`
- `[PAKAI]` `components/ui/select.tsx`
- `[PAKAI]` `components/ui/form.tsx` + `label.tsx`
- `[PAKAI]` `components/ui/date-picker.tsx` (sudah ada di template)
- `[PAKAI]` `components/ui/calendar.tsx`

**Step 2 — Pilih Target:**

**Komponen ini HARUS DIBUAT dari nol:** `src/components/features/units/unit-tree-picker.tsx`

**Koneksi API untuk load tree:** tidak perlu API call terpisah — data tree satuan diload sekali dari `GET /api/v1/auth/me` (sudah ada `unit.path`) dan dari endpoint khusus untuk tree bawahan:

```typescript
// Fetch sub-tree di bawah Komandan yang login
// Tidak ada endpoint khusus — gunakan data dari GET /api/v1/commander/members/by-unit
// untuk mendapat struktur unit → members
const { data: treeData } = useQuery({
  queryKey: ["unit-tree"],
  queryFn: () => apiFetch("/api/v1/commander/members/by-unit").then(r => r.json()),
})
```

**Perilaku tree picker:**
- Tampilkan tree hierarki bawahan Komandan
- Checkbox pada satuan → auto-check semua anggota di dalamnya secara rekursif (visual)
- Summary real-time: "Perintah akan dikirim ke X anggota"
- Tombol "Pilih Semua" → pilih semua bawahan

**Step 3 — Konfirmasi:**
- Tampilkan ringkasan semua field yang diisi
- Tampilkan daftar target yang dipilih + jumlah anggota
- Tombol "Simpan Draft" → `POST /api/v1/orders` dengan `sendImmediately: false`
- Tombol "🚀 Kirim Perintah" → `POST /api/v1/orders` dengan `sendImmediately: true`

---

### 8.3 Detail Perintah + Progress `[BUAT]`

**File:** `src/app/(main)/orders/[orderId]/page.tsx`

**Koneksi API:**
- Detail perintah: `GET /api/v1/orders/:orderId`
- Progress flat: `GET /api/v1/orders/:orderId/assignments`
- Progress per satuan: `GET /api/v1/orders/:orderId/assignments/by-unit`
- Export: `GET /api/v1/orders/:orderId/assignments/export`

**Layout halaman:**

```
[← Kembali]   [Detail Perintah — Judul]   [✏️ Edit (hanya jika draft)] [🚫 Batalkan (hanya jika aktif)]
────────────────────────────────────────────────────────────────────────
INFO PERINTAH: jenis, link target, narasi, deadline, sentimen, dll.
────────────────────────────────────────────────────────────────────────
PROGRESS SUMMARY: 4 stats cards
[████████░░] 62/97 anggota (63.9%)
────────────────────────────────────────────────────────────────────────
FILTER + EXPORT
[Cari nama...]  [Satuan ▼]  [Status ▼]  [Urut ▼]
Quick: [⏳ Belum] [✅ Sudah] [⏰ Terlambat]          [📥 Export Excel]
────────────────────────────────────────────────────────────────────────
VIEW TOGGLE: [Per Satuan (tree)] [Semua Anggota (tabel)]
────────────────────────────────────────────────────────────────────────
[Konten tree atau tabel]
```

**Komponen khusus yang harus dibuat:**
- `[BUAT]` `src/components/features/orders/progress-tree.tsx` — tree collapsible satuan → anggota

**Perilaku progress tree:**
- Setiap node satuan bisa di-expand/collapse menggunakan `[PAKAI]` `components/ui/collapsible.tsx`
- Setiap baris anggota menampilkan: nama, status badge, waktu submit, link Drive (klikable)
- Link Drive membuka tab baru

**Koneksi untuk export:**
```typescript
async function handleExport() {
  const params = buildQueryString(filters)
  const response = await apiFetch(`/api/v1/orders/${orderId}/assignments/export?${params}`)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `progress-${orderId}.xlsx`
  a.click()
}
```

---

## 9. Assignments — Halaman Perintah Diterima (Anggota)

---

### 9.1 Daftar Perintah yang Diterima `[BUAT]`

**File:** `src/app/(main)/assignments/page.tsx`

**Koneksi API:** `GET /api/v1/assignments/me`

**Query params (dari URL search params):**
- `search`, `orderType`, `status`, `fromUserId`
- `startDate`, `endDate`, `deadlineStart`, `deadlineEnd`
- `nearDeadline`
- `sortBy`, `sortOrder`, `page`, `limit`

**Layout halaman:**

```
[Perintah Saya]
────────────────────────────────────────────────────────────────────────
STATS: [Belum Dikerjakan: 5] [Selesai: 18] [Terlambat: 2] [Total: 25]
────────────────────────────────────────────────────────────────────────
FILTER BAR
[Cari judul...]  [Jenis ▼]  [Status ▼]  [Dari Siapa ▼]  [Periode ▼]
[Tanggal s/d Tanggal]  [Urut ▼]  [Reset Filter]
Quick: [⏳ Belum Dikerjakan] [⚠️ Hampir Deadline] [✅ Selesai] [⏰ Terlambat]
────────────────────────────────────────────────────────────────────────
[Daftar assignment — card per item]
[Pagination]
```

**Pola card assignment:**
```
┌──────────────────────────────────────────────────────┐
│ [🔴 ⚠️ DEADLINE 3 JAM LAGI]  badge jenis perintah   │
│ Judul Perintah                                        │
│ Dari: Kolonel Budi · Deadline: 16 Jun 2026, 17.00   │
│ Status: ⏳ BELUM DIKERJAKAN                           │
│                          [Lihat Detail] [Submit ✅]   │
└──────────────────────────────────────────────────────┘
```

**States card:**
- `belum_dikerjakan` + deadline < 24 jam → border merah, badge "⚠️ X jam lagi"
- `belum_dikerjakan` + deadline normal → border normal
- `selesai` → border hijau, tampilkan link Drive yang disubmit
- `terlambat` → border oranye

**Tombol "Submit ✅"** → buka `SubmitModal` langsung dari halaman daftar (tidak perlu masuk ke detail dulu)

---

### 9.2 Detail Assignment + Submit Bukti `[BUAT]`

**File:** `src/app/(main)/assignments/[assignmentId]/page.tsx`

**Koneksi API:**
- Detail: `GET /api/v1/assignments/me/:assignmentId`
- Submit: `POST /api/v1/assignments/me/:assignmentId/submit`

**Layout halaman:**

```
[← Kembali ke Perintah Saya]
────────────────────────────────────────────────────────────────────────
HEADER: [Status badge]  [jenis perintah badge]  [deadline countdown]

INSTRUKSI LENGKAP:
- Judul perintah
- Dari: nama Komandan
- Deadline: tanggal jam + countdown
- Link Target: [URL klikable, buka tab baru]
- Narasi / Caption: [text box dengan tombol 📋 Salin]
- Sentimen: (jika ada)
- Aksi Engagement: like / share / repost (jika ada)
- Deskripsi tambahan Komandan
────────────────────────────────────────────────────────────────────────
AKUN SOSMED SAYA (yang relevan untuk perintah ini)
📷 @username_ig  [↗]    𝕏 @username_tw  [↗]
────────────────────────────────────────────────────────────────────────
[Jika belum submit]: tombol [🚀 Submit Bukti Pelaksanaan]
[Jika sudah submit]: tampilkan link Drive + tombol [Ganti Bukti]
```

**Fitur "Salin Narasi":**
```typescript
async function copyNarration(text: string) {
  await navigator.clipboard.writeText(text)
  toast.success("Narasi berhasil disalin!")
}
```

---

### 9.3 Submit Modal `[BUAT]`

**File:** `src/components/features/assignments/submit-modal.tsx`

**Komponen yang dipakai:** `[PAKAI]` `components/ui/dialog.tsx`

**Koneksi API:** `POST /api/v1/assignments/me/:assignmentId/submit`

**Form fields:**
- `driveLink` — Input URL, wajib, validasi `URL valid`
- `notes` — Textarea opsional, max 1000 char

**Validasi client-side (Zod):**
```typescript
const submitSchema = z.object({
  driveLink: z.string().url("Link tidak valid. Masukkan URL yang benar."),
  notes: z.string().max(1000).optional(),
})
```

**States modal:**
- Default: form kosong
- Loading: tombol "Kirim Bukti" → spinner + disabled
- Success: tutup modal → toast "Bukti berhasil dikirim! ✅" → invalidate query assignments
- Error URL tidak valid: inline error di bawah field
- Jika sudah pernah submit: form pre-filled dengan link lama, label berubah "Ganti Bukti"

**TanStack Query mutation:**
```typescript
const submitMutation = useMutation({
  mutationFn: (values: { driveLink: string; notes?: string }) =>
    apiFetch(`/api/v1/assignments/me/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: { "Content-Type": "application/json" },
    }).then(r => r.json()),
  onSuccess: () => {
    toast.success("Bukti berhasil dikirim! ✅")
    queryClient.invalidateQueries({ queryKey: ["assignments"] })
    onClose()
  },
})
```

---

## 10. Members — Anggota Saya (Komandan)

---

### 10.1 Daftar Anggota `[BUAT]`

**File:** `src/app/(main)/members/page.tsx`
**Referensi template:** `src/app/pages/team/page.tsx` (ambil pola card view-nya)

**Koneksi API:**
- Mode tabel: `GET /api/v1/commander/members`
- Mode tree: `GET /api/v1/commander/members/by-unit`

**Query params:**
- `search`, `unitId`, `directUnitOnly`, `socialPlatform`, `hasSocialAccount`
- `socialAccountMin`, `socialAccountMax`
- `sortBy`, `sortOrder`, `page`, `limit`

**Layout halaman:**

```
[Anggota Saya]
────────────────────────────────────────────────────────────────────────
FILTER BAR
[Cari nama...]  [Satuan ▼]  [Platform Sosmed ▼]  [Status Sosmed ▼]
[Jumlah Akun ▼]  [Urut ▼]
Quick: [✅ Punya Akun Sosmed] [⚠️ Belum Daftarkan Akun]
────────────────────────────────────────────────────────────────────────
VIEW TOGGLE: [🌳 Per Satuan] [📋 Tabel Semua]
────────────────────────────────────────────────────────────────────────
[Konten sesuai mode view]
```

**Mode 🌳 Per Satuan:** gunakan `[PAKAI]` `components/ui/collapsible.tsx` untuk tree node satuan → anggota

**Mode 📋 Tabel:** gunakan `[SLICING]` dari `components/data-table/data-table.tsx`

**Kolom tabel:**
| Kolom | Tipe |
|-------|------|
| Nama | text |
| Satuan | text |
| Akun Sosmed | icon platform + count |
| Aksi | tombol "Lihat →" |

---

### 10.2 Profil Anggota `[BUAT]`

**File:** `src/app/(main)/members/[userId]/page.tsx`
**Referensi template:** `src/app/pages/profile/page.tsx` (ambil layout umum kartu profil)

**Koneksi API:** `GET /api/v1/commander/members/:userId`

**Query params untuk riwayat perintah:**
- `status`, `orderType`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `page`, `limit`

**Layout halaman:**

```
[← Kembali ke Anggota Saya]
────────────────────────────────────────────────────────────────────────
KARTU PROFIL: Avatar, Nama Lengkap, NIP, Satuan, Bergabung sejak
────────────────────────────────────────────────────────────────────────
AKUN SOSIAL MEDIA
[Tabel: Platform | Username | URL | Aksi (buka profil)]
"Anggota ini belum mendaftarkan akun sosial media" (empty state)
────────────────────────────────────────────────────────────────────────
RIWAYAT PERINTAH
Summary: Total 25 · ✅ 22 selesai · ⏰ 2 terlambat · ⏳ 1 pending

FILTER RIWAYAT
[Status ▼]  [Jenis ▼]  [Periode ▼]  [Urut ▼]

[Tabel riwayat perintah]
```

**Kolom tabel riwayat perintah:**
| Kolom | Tipe |
|-------|------|
| Judul Perintah | text |
| Jenis | badge |
| Deadline | tanggal |
| Status | badge (Selesai / Terlambat / Belum) |
| Waktu Submit | tanggal jam |
| Bukti Drive | link klikable + icon |

---

## 11. Social Accounts `[BUAT]`

**File:** `src/app/(main)/social-accounts/page.tsx`

**Koneksi API:**
- List: `GET /api/v1/social-accounts`
- Tambah: `POST /api/v1/social-accounts`
- Edit: `PATCH /api/v1/social-accounts/:id`
- Hapus: `DELETE /api/v1/social-accounts/:id`

**Filter yang tersedia:**
- `platform` — filter berdasarkan platform
- `sortBy`, `sortOrder`

**Quick filter chips platform:**
```
[📷 Instagram] [𝕏 Twitter-X] [📘 Facebook] [🎵 TikTok] [▶️ YouTube] [Lainnya]
```

**Layout halaman:**

```
[Akun Sosial Media Saya]                    [+ Tambah Akun Baru]
────────────────────────────────────────────────────────────────────────
FILTER: [Platform ▼]  [Urut ▼]
Quick chips: [📷] [𝕏] [📘] [🎵] [▶️]
────────────────────────────────────────────────────────────────────────
[Grid card akun sosmed]

Empty state: "Kamu belum mendaftarkan akun sosial media. Atasan kamu perlu mengetahui
akun mana yang kamu gunakan." [+ Tambah Akun Sekarang]
```

**Card per akun sosmed:**
```
┌─────────────────────────────────────────────────┐
│ 📷 Instagram                                    │
│ @budi_santoso                                   │
│ instagram.com/budi_santoso  [↗ Buka Profil]    │
│ Catatan: Akun utama                             │
│ Didaftarkan: 12 Mar 2025    [✏️ Edit] [🗑️ Hapus]│
└─────────────────────────────────────────────────┘
```

**Form Tambah / Edit Akun — menggunakan `[PAKAI]` `components/ui/dialog.tsx`:**

```typescript
// Field form
const socialAccountSchema = z.object({
  platform: z.enum(["instagram","twitter_x","facebook","tiktok","youtube","other"]),
  username: z.string().min(1).max(150),
  profileUrl: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
})
```

---

## 12. Profile Page `[SLICING]`

**File:** `src/app/(main)/profile/page.tsx`
**Sumber template:** `src/app/pages/profile/page.tsx`

**Koneksi API:** `GET /api/v1/auth/me`

**Yang diambil dari template:** layout kartu profil (avatar, nama, info)

**Yang diganti:**
- Data fields: nama, username, NIP, satuan, role, bergabung sejak, login terakhir
- Hapus field yang tidak relevan (email, bio, website, dll.)
- Tidak ada fitur edit profil di halaman ini (edit profil dilakukan admin)

---

## 13. Settings Page `[MODIFIKASI]`

**File:** `src/app/(main)/settings/page.tsx`
**Sumber template:** `src/app/pages/settings/page.tsx`

**Koneksi API:** `POST /api/auth/change-password`

**Yang dipakai dari template:** layout halaman settings dengan card form

**Yang diganti:**
- Hanya tampilkan satu section: "Ganti Password"
- Hapus semua section lain (integrations, API keys, notification preferences, dll.)

**Form ganti password:**
```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Konfirmasi password tidak sesuai",
  path: ["confirmPassword"],
})

// Submit
const { data, error } = await authClient.changePassword({
  currentPassword: values.currentPassword,
  newPassword: values.newPassword,
})
```

---

## 14. Admin — Manajemen Organisasi `[BUAT]`

**File:** `src/app/(main)/admin/units/page.tsx`

**Koneksi API:**
- Tree: `GET /api/v1/units`
- Buat satuan: `POST /api/v1/units`
- Edit satuan: `PATCH /api/v1/units/:unitId`
- Hapus satuan: `DELETE /api/v1/units/:unitId`
- Assign anggota: `POST /api/v1/units/:unitId/members`
- Transfer anggota: `PATCH /api/v1/units/:unitId/members/:userId/transfer`

**Filter yang tersedia:**
- `search` — cari satuan/anggota
- `depthLevel` — filter level hierarki
- `nodeType` — all / unit / member
- `hasCommander` — ada komandan / belum

**Layout halaman:**

```
[Manajemen Organisasi]                    [+ Tambah Satuan Root]
────────────────────────────────────────────────────────────────────────
FILTER
[Cari satuan/anggota...]  [Level Hierarki ▼]  [Jenis Node ▼]  [Komandan ▼]
[Expand Semua]  [Collapse Semua]
────────────────────────────────────────────────────────────────────────
TREE ORGANISASI (recursive render)

▼ 🏢 Komando Pusat                    Komandan: Jend. Ahmad    [⚙️]
│   Anggota langsung: 1 · Sub-satuan: 2
│
│  ▼ 🏢 Batalyon Alpha               Komandan: Kol. Budi      [⚙️]
│  │   Anggota: 9 · Sub-satuan: 2
│  │
│  │  ▶ 🏢 Kompi A                   Komandan: Kpt. Sari      [⚙️]
│  │  ▶ 🏢 Kompi B                   Komandan: Kpt. Rudi      [⚙️]
│  │
│  ▶ 🏢 Batalyon Beta                Komandan: Kol. Hendra    [⚙️]
```

**Tombol `[⚙️]` per satuan membuka dropdown:**
- Edit satuan
- Tambah sub-satuan
- Tambah anggota
- Pindah satuan ke parent lain
- Hapus satuan

**Komponen:**
- `[PAKAI]` `components/ui/collapsible.tsx` untuk tree expand/collapse
- `[PAKAI]` `components/ui/dropdown-menu.tsx` untuk menu aksi per node
- `[PAKAI]` `components/ui/dialog.tsx` untuk form tambah/edit satuan
- `[BUAT]` `components/features/units/unit-tree.tsx` — recursive tree render

**Form dialog tambah/edit satuan:**
```typescript
const unitSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  commanderId: z.string().uuid().optional(),
})
```

---

## 15. Admin — Manajemen User `[MODIFIKASI]`

**File:** `src/app/(main)/admin/users/page.tsx`
**Sumber template:** `src/app/pages/users-roles/page.tsx`

**Koneksi API:**
- List: `GET /api/v1/users`
- Buat: `POST /api/v1/users`
- Edit: `PATCH /api/v1/users/:userId`
- Nonaktifkan: `DELETE /api/v1/users/:userId`
- Unlock: `POST /api/v1/auth/admin/unlock-user`
- Reset password: `PATCH /api/v1/auth/admin/reset-password`

**Query params:**
- `search`, `unitId`, `directUnitOnly`, `role`, `isActive`, `isLocked`
- `hasSocialAccount`, `socialPlatform`, `noUnit`
- `sortBy`, `sortOrder`, `page`, `limit`

**Filter yang ditampilkan:**
```
[Cari nama/NIP...]  [Satuan ▼]  [Role ▼]  [Status Akun ▼]  [Platform Sosmed ▼]
Quick: [⚠️ Akun Dikunci] [⚠️ Belum Daftar Sosmed] [👤 Tanpa Satuan]
```

**Yang diambil dari template:** struktur tabel dengan header, baris, pagination

**Yang diganti:**
- Kolom tabel: Nama, NIP, Satuan, Role, Sosmed (count + platform), Status Akun, Aksi
- Menu aksi per baris: Edit, Reset Password, Unlock (jika dikunci), Nonaktifkan
- Form buat user baru

**Form buat user baru:**
```typescript
const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  fullName: z.string().min(2).max(150),
  nip: z.string().max(50).optional(),
  password: z.string().min(8),
  unitId: z.string().uuid().optional(),
})
```

---

### 15.1 Detail User `[BUAT]`

**File:** `src/app/(main)/admin/users/[userId]/page.tsx`

**Koneksi API:** `GET /api/v1/users/:userId`

**Layout:** kartu profil + tabel akun sosmed + informasi satuan + tombol aksi (edit, reset password, unlock, nonaktifkan)

---

## 16. Komponen Global yang Digunakan

### 16.1 Deadline Badge `[BUAT]`

**File:** `src/components/features/orders/deadline-badge.tsx`

```typescript
// Logika: hitungan jam dari deadline
function DeadlineBadge({ deadline }: { deadline: string }) {
  const hours = differenceInHours(new Date(deadline), new Date())
  if (hours < 0)  return <Badge variant="destructive">EXPIRED</Badge>
  if (hours < 1)  return <Badge className="bg-red-600">⚠️ {Math.round(hours * 60)} menit lagi</Badge>
  if (hours < 24) return <Badge className="bg-red-500">⚠️ {hours} jam lagi</Badge>
  return <Badge variant="outline">{format(new Date(deadline), "dd MMM yyyy, HH.mm")}</Badge>
}
```

---

### 16.2 Status Badge `[BUAT]`

**File:** `src/components/features/assignments/status-badge.tsx`

| Status | Warna | Label |
|--------|-------|-------|
| `belum_dikerjakan` | Abu-abu | ⏳ Belum Dikerjakan |
| `selesai` | Hijau | ✅ Selesai |
| `terlambat` | Oranye | ⏰ Terlambat |
| `draft` | Abu-abu | 📋 Draft |
| `aktif` | Biru | 🔵 Aktif |
| `expired` | Merah | 🔴 Expired |
| `dibatalkan` | Merah | 🚫 Dibatalkan |

---

### 16.3 Filter URL State Hook `[BUAT]`

**File:** `src/hooks/use-filter-params.ts`

Semua halaman yang punya filter menyimpan state di URL search params agar bisa di-bookmark dan di-share.

```typescript
// src/hooks/use-filter-params.ts
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export function useFilterParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === "") params.delete(key)
    else params.set(key, value)
    // Reset ke page 1 saat filter berubah
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const resetFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  return { searchParams, setFilter, resetFilters }
}
```

---

### 16.4 API Fetch Wrapper `[BUAT]`

**File:** `src/lib/api.ts`

```typescript
// Semua fetch ke /api/v1/* harus pakai ini
// credentials: "include" wajib agar cookie Better Auth dikirim
export async function apiFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (response.status === 401) {
    // Session expired — redirect ke login
    window.location.href = "/login"
    throw new Error("Unauthorized")
  }

  return response
}

export function buildQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      qs.set(key, String(value))
    }
  }
  return qs.toString()
}
```

---

### 16.5 TanStack Query Provider `[BUAT]`

**File:** `src/providers/query-provider.tsx`

```typescript
"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,    // 30 detik
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

Mount di `src/app/layout.tsx`:
```typescript
// src/app/layout.tsx [MODIFIKASI]
import { QueryProvider } from "@/providers/query-provider"
export default function RootLayout({ children }) {
  return (
    <html><body>
      <QueryProvider>{children}</QueryProvider>
    </body></html>
  )
}
```

---

## 17. Middleware Auth Guard `[BUAT]`

**File:** `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const PUBLIC_PATHS = ["/login", "/lock-screen", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Guard /admin/* — hanya super_admin
  if (pathname.startsWith("/admin") && session.user.role !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
}
```

---

## 18. Better Auth Setup `[BUAT]`

### 18.1 Server Instance

**File:** `src/lib/auth.ts`

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { username } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { db } from "@/lib/db"

export const auth = betterAuth({
  appName: "Komando Center",
  database: prismaAdapter(db, { provider: "postgresql" }),

  plugins: [
    username(),    // Login pakai username, bukan email
    nextCookies(), // Wajib untuk server-side auth.api calls di Next.js — taruh paling akhir
  ],

  emailAndPassword: {
    enabled: false, // Dimatikan — login pakai username plugin
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwe",
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/username": { window: 60, max: 10 },
    },
  },

  user: {
    additionalFields: {
      nip:  { type: "string", required: false, unique: true, input: true },
      role: { type: "string", defaultValue: "member", input: false },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "komando",
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL!],
})
```

### 18.2 Client Instance

**File:** `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [usernameClient()],
})

export const { signIn, signOut, useSession } = authClient
```

### 18.3 Route Handler

**File:** `src/app/api/auth/[...all]/route.ts`

```typescript
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
export const { POST, GET } = toNextJsHandler(auth)
```

---

## 19. Prisma Client Singleton `[BUAT]`

**File:** `src/lib/db.ts`

```typescript
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

---

## 20. Response Helpers `[BUAT]`

**File:** `src/lib/helpers/response.ts`

```typescript
import { NextResponse } from "next/server"

export function successResponse<T>({
  data, message, meta, status = 200,
}: { data: T; message?: string; meta?: object; status?: number }) {
  return NextResponse.json({
    success: true,
    data,
    message: message ?? null,
    meta: meta ?? null,
    timestamp: new Date().toISOString(),
  }, { status })
}

export function errorResponse(code: string, message: string, status: number, details?: object[]) {
  return NextResponse.json({
    success: false,
    error: { code, message, details: details ?? [] },
    timestamp: new Date().toISOString(),
  }, { status })
}

export function unauthorized() {
  return errorResponse("UNAUTHORIZED", "Sesi tidak valid. Silakan login kembali.", 401)
}

export function forbidden() {
  return errorResponse("FORBIDDEN", "Kamu tidak memiliki akses ke resource ini.", 403)
}

export function notFound(resource = "Resource") {
  return errorResponse("NOT_FOUND", `${resource} tidak ditemukan.`, 404)
}

export function outOfHierarchy() {
  return errorResponse("OUT_OF_HIERARCHY", "Resource ini berada di luar lingkup hierarki kamu.", 403)
}

export function validationError(details: { field: string; message: string }[]) {
  return errorResponse("VALIDATION_ERROR", "Input tidak valid.", 400, details)
}

export function businessRuleViolated(message: string) {
  return errorResponse("BUSINESS_RULE_VIOLATED", message, 422)
}
```

---

## 21. Route Handlers — Daftar Implementasi

Semua file berikut harus **dibuat dari nol** di `src/app/api/v1/`.
Ikuti pola: `validate → getSession → checkPermission → queryDB → return response`

| No | File Route Handler | Method | Endpoint | Auth |
|----|-------------------|--------|----------|------|
| 1  | `auth/me/route.ts` | GET | `/api/v1/auth/me` | Session |
| 2  | `auth/admin/unlock-user/route.ts` | POST | `/api/v1/auth/admin/unlock-user` | Admin |
| 3  | `auth/admin/reset-password/route.ts` | PATCH | `/api/v1/auth/admin/reset-password` | Admin |
| 4  | `units/route.ts` | GET, POST | `/api/v1/units` | Admin |
| 5  | `units/[unitId]/route.ts` | GET, PATCH, DELETE | `/api/v1/units/:id` | Admin |
| 6  | `units/[unitId]/members/route.ts` | POST | `/api/v1/units/:id/members` | Admin |
| 7  | `units/[unitId]/members/[userId]/transfer/route.ts` | PATCH | `/api/v1/units/:id/members/:uid/transfer` | Admin |
| 8  | `users/route.ts` | GET, POST | `/api/v1/users` | Admin |
| 9  | `users/[userId]/route.ts` | GET, PATCH, DELETE | `/api/v1/users/:id` | Admin |
| 10 | `users/[userId]/social-accounts/route.ts` | GET | `/api/v1/users/:id/social-accounts` | Komandan |
| 11 | `social-accounts/route.ts` | GET, POST | `/api/v1/social-accounts` | Member |
| 12 | `social-accounts/[socialAccountId]/route.ts` | PATCH, DELETE | `/api/v1/social-accounts/:id` | Member |
| 13 | `orders/route.ts` | GET, POST | `/api/v1/orders` | Komandan |
| 14 | `orders/[orderId]/route.ts` | GET, PATCH | `/api/v1/orders/:id` | Komandan |
| 15 | `orders/[orderId]/send/route.ts` | POST | `/api/v1/orders/:id/send` | Komandan |
| 16 | `orders/[orderId]/cancel/route.ts` | POST | `/api/v1/orders/:id/cancel` | Komandan |
| 17 | `orders/[orderId]/assignments/route.ts` | GET | `/api/v1/orders/:id/assignments` | Komandan |
| 18 | `orders/[orderId]/assignments/by-unit/route.ts` | GET | `/api/v1/orders/:id/assignments/by-unit` | Komandan |
| 19 | `orders/[orderId]/assignments/export/route.ts` | GET | `/api/v1/orders/:id/assignments/export` | Komandan |
| 20 | `assignments/me/route.ts` | GET | `/api/v1/assignments/me` | Member |
| 21 | `assignments/me/[assignmentId]/route.ts` | GET | `/api/v1/assignments/me/:id` | Member |
| 22 | `assignments/me/[assignmentId]/submit/route.ts` | POST | `/api/v1/assignments/me/:id/submit` | Member |
| 23 | `dashboard/commander/route.ts` | GET | `/api/v1/dashboard/commander` | Komandan |
| 24 | `dashboard/member/route.ts` | GET | `/api/v1/dashboard/member` | Member |
| 25 | `dashboard/admin/route.ts` | GET | `/api/v1/dashboard/admin` | Admin |
| 26 | `commander/members/route.ts` | GET | `/api/v1/commander/members` | Komandan |
| 27 | `commander/members/by-unit/route.ts` | GET | `/api/v1/commander/members/by-unit` | Komandan |
| 28 | `commander/members/[userId]/route.ts` | GET | `/api/v1/commander/members/:id` | Komandan |

---

## 22. Urutan Prioritas Pengerjaan

Ikuti urutan ini agar setiap phase bisa langsung ditest:

### Phase 1 — Foundation (wajib selesai dulu sebelum UI apapun)
1. Setup Prisma schema + `npx @better-auth/cli generate` + `npx prisma migrate dev`
2. `src/lib/db.ts` — Prisma singleton
3. `src/lib/auth.ts` — Better Auth server
4. `src/lib/auth-client.ts` — Better Auth client
5. `src/app/api/auth/[...all]/route.ts` — Better Auth handler
6. `src/middleware.ts` — Auth guard
7. `prisma/seed.ts` — jalankan `npx prisma db seed`
8. `src/lib/api.ts` — fetch wrapper
9. `src/lib/helpers/response.ts` — response helpers
10. `src/providers/query-provider.tsx` — TanStack Query

### Phase 2 — Auth UI
11. `src/app/(auth)/layout.tsx` — SLICING
12. `src/app/(auth)/login/page.tsx` — MODIFIKASI
13. `src/app/(auth)/lock-screen/page.tsx` — MODIFIKASI
14. `src/config/nav.ts` — MODIFIKASI dengan getNavItems()

### Phase 3 — Layout & Dashboard
15. `src/app/(main)/layout.tsx` — MODIFIKASI
16. `src/app/(main)/admin/layout.tsx` — BUAT
17. `src/app/api/v1/auth/me/route.ts` — BUAT
18. `src/app/api/v1/dashboard/*/route.ts` — BUAT (3 dashboard)
19. `src/app/(main)/dashboard/page.tsx` — BUAT (router)
20. `src/components/features/dashboard/dashboard-*.tsx` — BUAT (3 komponen)

### Phase 4 — Orders (Komandan)
21. `src/app/api/v1/orders/**` — BUAT semua order Route Handlers
22. `src/components/features/units/unit-tree-picker.tsx` — BUAT
23. `src/app/(main)/orders/page.tsx` — BUAT
24. `src/app/(main)/orders/new/page.tsx` — BUAT
25. `src/app/(main)/orders/[orderId]/page.tsx` — BUAT
26. `src/components/features/orders/progress-tree.tsx` — BUAT

### Phase 5 — Assignments (Anggota)
27. `src/app/api/v1/assignments/**` — BUAT semua assignment Route Handlers
28. `src/app/(main)/assignments/page.tsx` — BUAT
29. `src/app/(main)/assignments/[assignmentId]/page.tsx` — BUAT
30. `src/components/features/assignments/submit-modal.tsx` — BUAT

### Phase 6 — Members & Social Accounts
31. `src/app/api/v1/commander/**` — BUAT
32. `src/app/api/v1/social-accounts/**` — BUAT
33. `src/app/(main)/members/page.tsx` — BUAT
34. `src/app/(main)/members/[userId]/page.tsx` — BUAT
35. `src/app/(main)/social-accounts/page.tsx` — BUAT

### Phase 7 — Admin Pages
36. `src/app/api/v1/units/**` — BUAT
37. `src/app/api/v1/users/**` — BUAT
38. `src/app/(main)/admin/units/page.tsx` — BUAT
39. `src/app/(main)/admin/users/page.tsx` — MODIFIKASI
40. `src/app/(main)/admin/users/[userId]/page.tsx` — BUAT

### Phase 8 — Profile & Settings
41. `src/app/(main)/profile/page.tsx` — SLICING
42. `src/app/(main)/settings/page.tsx` — MODIFIKASI

### Phase 9 — Polish & Testing
43. Error states semua halaman
44. Empty states semua halaman
45. Loading skeletons semua halaman
46. Toast notifications consistency
47. Mobile responsiveness check

---

## 23. Checklist File Template

Referensi cepat file dari template dan status penggunaannya:

| File Template | Status | Keterangan |
|---------------|--------|------------|
| `app/auth/login/page.tsx` | `[MODIFIKASI]` | Ganti email → username |
| `app/auth/lock-screen/page.tsx` | `[MODIFIKASI]` | Ubah pesan dikunci |
| `app/auth/layout.tsx` | `[SLICING]` | Ambil layout centered |
| `app/auth/register/page.tsx` | `[SKIP]` | Tidak dipakai |
| `app/auth/forgot-password/page.tsx` | `[SKIP]` | Tidak dipakai |
| `app/auth/reset-password/page.tsx` | `[SKIP]` | Tidak dipakai |
| `app/auth/otp-verification/page.tsx` | `[SKIP]` | Tidak dipakai |
| `app/auth/verify-email/page.tsx` | `[SKIP]` | Tidak dipakai |
| `app/dashboard/page.tsx` | `[SLICING]` | Ambil pola stats card |
| `app/dashboard/layout.tsx` | `[MODIFIKASI]` | Inject session + nav |
| `app/dashboard/loading.tsx` | `[PAKAI]` | Loading skeleton |
| `app/pages/datatable/page.tsx` | `[SLICING]` | Pola tabel + filter |
| `app/pages/users-roles/page.tsx` | `[MODIFIKASI]` | Untuk admin/users |
| `app/pages/profile/page.tsx` | `[SLICING]` | Kartu profil |
| `app/pages/settings/page.tsx` | `[MODIFIKASI]` | Hanya ganti password |
| `app/pages/form-examples/page.tsx` | `[REFERENSI]` | Pola form multi-field |
| `app/pages/team/page.tsx` | `[SLICING]` | Untuk halaman members |
| `app/pages/notifications/page.tsx` | `[REFERENSI]` | Pola notification |
| `app/pages/404/page.tsx` | `[PAKAI]` | Langsung pakai |
| `app/pages/500/page.tsx` | `[PAKAI]` | Langsung pakai |
| `components/app-shell/app-shell.tsx` | `[PAKAI]` | Shell utama |
| `components/app-shell/app-sidebar.tsx` | `[MODIFIKASI]` | Inject nav kondisional |
| `components/app-shell/app-header.tsx` | `[PAKAI]` | Header dengan avatar |
| `components/data-table/data-table.tsx` | `[PAKAI]` | Reusable table |
| `components/wizard-stepper.tsx` | `[PAKAI]` | Untuk wizard buat perintah |
| `components/auto-breadcrumb.tsx` | `[PAKAI]` | Breadcrumb otomatis |
| `components/ui/dialog.tsx` | `[PAKAI]` | Submit modal, form dialog |
| `components/ui/collapsible.tsx` | `[PAKAI]` | Tree expand/collapse |
| `components/ui/badge.tsx` | `[PAKAI]` | Status badges |
| `components/ui/progress.tsx` | `[PAKAI]` | Progress bar perintah |
| `components/ui/sonner.tsx` | `[PAKAI]` | Toast notifikasi |
| `components/ui/form.tsx` | `[PAKAI]` | Form + validasi |
| `components/ui/select.tsx` | `[PAKAI]` | Dropdown filter |
| `components/ui/checkbox.tsx` | `[PAKAI]` | Multi-select target |
| `components/ui/calendar.tsx` | `[PAKAI]` | Date picker deadline |
| `components/ui/sheet.tsx` | `[PAKAI]` | Side panel detail |
| `components/ui/dropdown-menu.tsx` | `[PAKAI]` | Aksi per baris tabel |
| `components/ui/textarea.tsx` | `[PAKAI]` | Field narasi |
| `components/ui/skeleton.tsx` | `[PAKAI]` | Loading states |
| `components/ui/tabs.tsx` | `[PAKAI]` | Toggle view mode |
| `components/ui/empty.tsx` | `[PAKAI]` | Empty states |
| `config/nav.ts` | `[MODIFIKASI]` | Ganti dengan getNavItems() |
| `hooks/use-pagination.ts` | `[PAKAI]` | Pagination hook |
| `app/dashboard-saas/` | `[SKIP]` | Tidak relevan |
| `app/analytics/` | `[SKIP]` | Tidak relevan |
| `app/charts/` | `[SKIP]` | Tidak relevan |
| `app/icons/` | `[SKIP]` | Referensi saja |
| `app/pages/activity/` | `[SKIP]` | Tidak dipakai |
| `app/pages/billing/` | `[SKIP]` | Tidak dipakai |
| `app/pages/calendar/` | `[SKIP]` | Tidak dipakai |
| `app/pages/chat/` | `[SKIP]` | Tidak dipakai |
| `app/pages/inbox/` | `[SKIP]` | Tidak dipakai |
| `app/pages/kanban/` | `[SKIP]` | Tidak dipakai |
| `app/pages/ecommerce/` | `[SKIP]` | Tidak dipakai |
| `app/pages/invoice/` | `[SKIP]` | Tidak dipakai |
| `app/pages/pricing/` | `[SKIP]` | Tidak dipakai |
| `app/pages/files/` | `[SKIP]` | Tidak dipakai v1.0 |
| `app/pages/help/` | `[SKIP]` | Tidak dipakai v1.0 |
| `app/pages/onboarding/` | `[SKIP]` | Tidak dipakai v1.0 |
| `app/pages/empty-states/` | `[REFERENSI]` | Contoh pola empty state |
