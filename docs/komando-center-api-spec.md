# API Specification
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                              |
|---------------|-----------------------------------------------------|
| **Dokumen**   | REST API Specification                              |
| **Versi**     | v1.1                                                |
| **Tanggal**   | 16 Juni 2026                                        |
| **Author**    | System Analyst                                      |
| **Status**    | Draft                                               |
| **Referensi** | Use Case v1.0 · ERD v1.0 · Wireframe v1.0 · PRD v1.0 |

### Revision History

| Versi | Tanggal    | Deskripsi                                                       | Author         |
|-------|------------|-----------------------------------------------------------------|----------------|
| v1.0  | 16-06-2026 | Initial API spec draft                                          | System Analyst |
| v1.1  | 16-06-2026 | Update MODULE AUTH ke Better Auth conventions + session cookie  | System Analyst |

---

## 1. API Overview

### 1.1 Base URL

| Environment | Base URL                                  |
|-------------|-------------------------------------------|
| Development | `http://localhost:3000`                   |
| Staging     | `https://staging.komandocenter.id`        |
| Production  | `https://komandocenter.id`               |

Sistem menggunakan dua kelompok endpoint:

| Kelompok | Path Prefix    | Dikelola Oleh       | Keterangan                                    |
|----------|----------------|---------------------|-----------------------------------------------|
| Auth     | `/api/auth/*`  | **Better Auth**     | Login, logout, session, password — semua dihandle library |
| App API  | `/api/v1/*`    | **Next.js Route Handlers (custom)** | Semua logika bisnis aplikasi |

### 1.2 Autentikasi — Cookie-Based Session (Better Auth)

Berbeda dengan v1.0 yang menggunakan Bearer Token, sistem ini menggunakan **session cookie yang dikelola Better Auth** secara otomatis.

**Cara kerja:**
1. Client melakukan `POST /api/auth/sign-in/username`
2. Better Auth memvalidasi kredensial, membuat session record di database
3. Better Auth menyetel cookie HTTP-only ke browser secara otomatis:
   ```
   Set-Cookie: komando.session_token=<token>; HttpOnly; Secure; SameSite=Lax; Path=/
   ```
4. Browser mengirim cookie ini **secara otomatis** pada setiap request berikutnya
5. Semua Route Handler `/api/v1/*` membaca session dari cookie via `auth.api.getSession()`

**Implikasi untuk client:**
- Tidak perlu menyimpan token secara manual di `localStorage` atau `sessionStorage`
- Tidak perlu menambahkan header `Authorization` secara manual
- Semua request ke `/api/v1/*` harus menyertakan `credentials: 'include'` pada fetch:

```typescript
// Contoh fetch dari client
const response = await fetch('/api/v1/orders', {
  credentials: 'include', // ← WAJIB agar cookie dikirim
  headers: { 'Content-Type': 'application/json' },
})
```

**Menggunakan TanStack Query (recommended):**
```typescript
// lib/api.ts — fetch wrapper global dengan credentials
export const apiFetch = (url: string, options?: RequestInit) =>
  fetch(url, { ...options, credentials: 'include' })
```

### 1.3 Cookie Detail

| Atribut       | Nilai                          | Keterangan                                  |
|---------------|--------------------------------|---------------------------------------------|
| **Nama**      | `komando.session_token`        | Prefix "komando" dari `cookiePrefix` config |
| **HttpOnly**  | ✅ Ya                          | Tidak bisa diakses JavaScript (XSS protection) |
| **Secure**    | ✅ Ya (production)             | Hanya dikirim via HTTPS                     |
| **SameSite**  | `Lax`                          | CSRF protection bawaan                      |
| **Expired**   | 7 hari sejak login terakhir   | Diperbarui otomatis jika aktif setiap hari  |
| **Strategy**  | `jwe` (encrypted)              | Cookie cache terenkripsi, tidak bisa dibaca client |

### 1.4 Versioning

API custom menggunakan **URL versioning**: `/api/v1/...`
Better Auth endpoint tidak menggunakan versioning.

### 1.5 Rate Limiting

Rate limiting dikelola oleh Better Auth untuk endpoint auth, dan implementasi custom untuk endpoint `/api/v1/*`.

| Endpoint Group                    | Limit                          | Dikelola Oleh       |
|-----------------------------------|--------------------------------|---------------------|
| `POST /api/auth/sign-in/username` | 10 request/menit per IP       | Better Auth         |
| `POST /api/auth/sign-out`         | 30 request/menit per user     | Better Auth         |
| Semua `/api/v1/*`                 | 300 request/menit per session | Custom middleware   |

Response header rate limit (endpoint custom):
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1718500000
```

### 1.6 Pagination — Query Params Global

Semua endpoint yang mengembalikan list mendukung parameter berikut:

| Param       | Type    | Default | Keterangan                          |
|-------------|---------|---------|-------------------------------------|
| `page`      | integer | `1`     | Nomor halaman (1-based)             |
| `limit`     | integer | `20`    | Jumlah item per halaman (max: 100)  |
| `sortBy`    | string  | varies  | Field untuk sorting                 |
| `sortOrder` | string  | `desc`  | `asc` atau `desc`                   |

---

## 2. Global Response Format

### 2.1 Success Response — Endpoint Custom (`/api/v1/*`)

```json
{
  "success": true,
  "data": {},
  "message": "Pesan sukses",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

> `meta.pagination` hanya muncul pada endpoint yang mengembalikan list.

### 2.2 Error Response — Endpoint Custom (`/api/v1/*`)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error yang mudah dibaca",
    "details": []
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

### 2.3 Validation Error Response (400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": [
      { "field": "title", "message": "Judul perintah wajib diisi" },
      { "field": "deadline", "message": "Deadline minimal 1 jam dari sekarang" }
    ]
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

### 2.4 Response Format Better Auth (`/api/auth/*`)

Endpoint Better Auth mengembalikan format **native Better Auth** (bukan envelope custom):

```json
{
  "user": {
    "id": "uuid-001",
    "name": "Sersan Budi Santoso",
    "email": null,
    "username": "budi_santoso",
    "createdAt": "2026-06-16T10:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "session": {
    "id": "session-uuid",
    "userId": "uuid-001",
    "expiresAt": "2026-06-23T10:00:00Z",
    "token": "session-token-string",
    "createdAt": "2026-06-16T10:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  }
}
```

Error dari Better Auth:
```json
{
  "message": "Invalid username or password",
  "code": "INVALID_EMAIL_OR_PASSWORD",
  "status": 401
}
```

---

## 3. HTTP Status Code Reference

| Code | Meaning               | Kapan Digunakan                                          |
|------|-----------------------|----------------------------------------------------------|
| 200  | OK                    | GET, PUT, PATCH berhasil                                 |
| 201  | Created               | POST yang membuat resource baru                          |
| 204  | No Content            | DELETE berhasil                                          |
| 400  | Bad Request           | Validasi gagal, format request salah                     |
| 401  | Unauthorized          | Session tidak ada, tidak valid, atau expired             |
| 403  | Forbidden             | Session valid tapi tidak punya izin akses resource ini   |
| 404  | Not Found             | Resource tidak ditemukan                                 |
| 409  | Conflict              | Duplikat data (username sudah ada, dll.)                 |
| 422  | Unprocessable Entity  | Business rule dilanggar                                  |
| 423  | Locked                | Akun dikunci karena terlalu banyak percobaan login       |
| 429  | Too Many Requests     | Rate limit terlampaui                                    |
| 500  | Internal Server Error | Error server yang tidak terduga                          |

---

## 4. Global Error Codes

| Error Code                | HTTP | Keterangan                                             |
|---------------------------|------|--------------------------------------------------------|
| `VALIDATION_ERROR`        | 400  | Satu atau lebih field tidak valid                      |
| `UNAUTHORIZED`            | 401  | Session tidak ada atau tidak valid                     |
| `SESSION_EXPIRED`         | 401  | Session sudah kadaluarsa                               |
| `FORBIDDEN`               | 403  | Tidak punya akses ke resource ini                      |
| `OUT_OF_HIERARCHY`        | 403  | Resource di luar lingkup hierarki user                 |
| `NOT_FOUND`               | 404  | Resource tidak ditemukan                               |
| `CONFLICT`                | 409  | Data duplikat                                          |
| `BUSINESS_RULE_VIOLATED`  | 422  | Business rule dilanggar                                |
| `ACCOUNT_LOCKED`          | 423  | Akun dikunci (Better Auth)                             |
| `RATE_LIMIT_EXCEEDED`     | 429  | Terlalu banyak request                                 |
| `INTERNAL_ERROR`          | 500  | Error server internal                                  |

---

## 5. Role & Permission Matrix

| Endpoint Group                | super_admin | Komandan                    | Anggota |
|-------------------------------|-------------|-----------------------------|---------|
| Better Auth endpoints         | ✅           | ✅                           | ✅      |
| `/api/v1/auth/me`             | ✅           | ✅                           | ✅      |
| `/api/auth/change-password`   | ✅           | ✅                           | ✅      |
| Manajemen Organisasi          | ✅           | ❌                           | ❌      |
| Manajemen User                | ✅           | ❌                           | ❌      |
| Buat / Kelola Perintah        | ❌           | ✅ (milik sendiri)           | ❌      |
| Lihat Progress Perintah       | ❌           | ✅ (lingkup hierarki)        | ❌      |
| Perintah Diterima             | ❌           | ✅ (jika punya atasan)       | ✅      |
| Submit Bukti                  | ❌           | ✅ (jika punya atasan)       | ✅      |
| Akun Sosmed Sendiri           | ❌           | ✅                           | ✅      |
| Lihat Sosmed Bawahan          | ❌           | ✅ (lingkup hierarki)        | ❌      |
| Anggota Saya                  | ❌           | ✅ (lingkup hierarki)        | ❌      |
| Dashboard Stats               | ✅           | ✅                           | ✅      |

> **"Lingkup hierarki"**: Komandan hanya bisa mengakses data satuan/anggota yang berada di bawahnya dalam tree.

---

## 6. Endpoint Specifications

---

## MODULE 1 — BETTER AUTH ENDPOINTS (`/api/auth/*`)

Semua endpoint di modul ini **dikelola sepenuhnya oleh Better Auth** via handler:

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
export const { POST, GET } = toNextJsHandler(auth)
```

Developer **tidak perlu membuat Route Handler** untuk endpoint-endpoint ini — Better Auth mengelolanya secara otomatis.

---

### POST /api/auth/sign-in/username

**Summary:** Login menggunakan username dan password
**Auth:** ❌ Public
**Rate Limit:** 10 request/menit per IP (dikonfigurasi di Better Auth `customRules`)
**Dikelola:** Better Auth (username plugin)

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "budi_santoso",
  "password": "Password123!"
}
```

| Field      | Type   | Required | Validasi             |
|------------|--------|----------|----------------------|
| `username` | string | ✅       | string, tidak kosong |
| `password` | string | ✅       | string, tidak kosong |

#### Response 200 OK

Better Auth menyetel cookie `komando.session_token` secara otomatis via `Set-Cookie` header.

```json
{
  "user": {
    "id": "uuid-user-001",
    "name": "Sersan Budi Santoso",
    "username": "budi_santoso",
    "nip": "1234567890",
    "role": "member",
    "createdAt": "2026-06-16T10:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "session": {
    "id": "session-uuid-001",
    "userId": "uuid-user-001",
    "expiresAt": "2026-06-23T10:00:00Z",
    "token": "session_token_string",
    "createdAt": "2026-06-16T10:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  }
}
```

**Response Headers yang Disetel Better Auth:**
```
Set-Cookie: komando.session_token=<encrypted_jwe_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

#### Error Responses

| Status | Code Better Auth              | Message                            |
|--------|-------------------------------|------------------------------------|
| 400    | `INVALID_EMAIL_OR_PASSWORD`   | Username atau password tidak valid |
| 423    | `ACCOUNT_LOCKED`              | Akun dikunci sementara             |
| 429    | `RATE_LIMIT_EXCEEDED`         | Terlalu banyak percobaan login     |

**Catatan implementasi client:**

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [usernameClient()],
})

// Penggunaan di komponen login:
const { data, error } = await authClient.signIn.username({
  username: "budi_santoso",
  password: "Password123!",
})
// Cookie disetel otomatis oleh browser dari response Set-Cookie
```

---

### POST /api/auth/sign-out

**Summary:** Logout — menginvalidasi session aktif dan menghapus cookie
**Auth:** ✅ Cookie session
**Dikelola:** Better Auth

#### Request

Body kosong. Better Auth membaca session dari cookie secara otomatis.

```json
{}
```

#### Response 200 OK

Better Auth menghapus cookie session via `Set-Cookie` header dengan `Max-Age=0`.

```json
{
  "success": true
}
```

**Response Headers:**
```
Set-Cookie: komando.session_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

**Catatan implementasi client:**

```typescript
await authClient.signOut()
// Cookie dihapus otomatis oleh browser
// Redirect ke /login
```

---

### GET /api/auth/get-session

**Summary:** Ambil data session dan user yang sedang aktif
**Auth:** ✅ Cookie session
**Dikelola:** Better Auth

#### Response 200 OK (ada session aktif)

```json
{
  "user": {
    "id": "uuid-user-001",
    "name": "Sersan Budi Santoso",
    "username": "budi_santoso",
    "nip": "1234567890",
    "role": "member",
    "createdAt": "2026-06-16T10:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "session": {
    "id": "session-uuid-001",
    "userId": "uuid-user-001",
    "expiresAt": "2026-06-23T10:00:00Z",
    "createdAt": "2026-06-16T10:00:00Z",
    "updatedAt": "2026-06-16T10:00:00Z"
  }
}
```

#### Response 200 OK (tidak ada session — null)

```json
null
```

**Catatan implementasi:**

```typescript
// Client component — React hook
const { data: session, isPending } = authClient.useSession()

// Server component — langsung query
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect('/login')
```

---

### POST /api/auth/change-password

**Summary:** Ganti password user yang sedang login
**Auth:** ✅ Cookie session
**Dikelola:** Better Auth

#### Request Body

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

| Field             | Type   | Required | Validasi                  |
|-------------------|--------|----------|---------------------------|
| `currentPassword` | string | ✅       | wajib diisi               |
| `newPassword`     | string | ✅       | min 8 char                |

#### Response 200 OK

```json
{
  "status": true
}
```

#### Error Responses

| Status | Code Better Auth         | Message                       |
|--------|--------------------------|-------------------------------|
| 400    | `INVALID_PASSWORD`       | Password lama tidak sesuai    |
| 400    | `PASSWORD_TOO_SHORT`     | Password minimal 8 karakter   |
| 401    | `UNAUTHORIZED`           | Tidak ada session aktif       |

**Catatan:** Better Auth secara otomatis mencabut semua session lain milik user ini setelah password berhasil diubah (karena `revokeSessionsOnPasswordReset: true` dikonfigurasi di `auth.ts`).

**Catatan implementasi client:**

```typescript
const { data, error } = await authClient.changePassword({
  currentPassword: "OldPassword123!",
  newPassword: "NewPassword456!",
})
```

---

### POST /api/auth/revoke-session

**Summary:** Cabut session spesifik (logout dari perangkat tertentu)
**Auth:** ✅ Cookie session
**Dikelola:** Better Auth

#### Request Body

```json
{
  "token": "session_token_to_revoke"
}
```

#### Response 200 OK

```json
{
  "status": true
}
```

---

### POST /api/auth/revoke-sessions

**Summary:** Cabut semua session aktif milik user yang sedang login (logout dari semua perangkat)
**Auth:** ✅ Cookie session
**Dikelola:** Better Auth

#### Response 200 OK

```json
{
  "status": true
}
```

---

## MODULE 2 — CUSTOM AUTH ENDPOINTS (`/api/v1/auth/*`)

Endpoint custom yang dibuat di atas Better Auth untuk kebutuhan aplikasi spesifik yang tidak disediakan Better Auth secara built-in.

---

### GET /api/v1/auth/me

**Summary:** Ambil data profil lengkap user yang sedang login (termasuk field custom: unit, isCommander, socialAccountCount)
**Auth:** ✅ Cookie session
**Dikelola:** Custom Route Handler (membaca session via `auth.api.getSession()`)

**Perbedaan dengan `/api/auth/get-session`:** Endpoint ini mengembalikan data yang lebih lengkap (unit, role komandan, jumlah akun sosmed) yang tidak ada di response Better Auth bawaan.

#### Request

Tidak ada body. Session dibaca dari cookie otomatis.

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-user-001",
    "username": "budi_santoso",
    "fullName": "Sersan Budi Santoso",
    "nip": "1234567890",
    "role": "member",
    "isCommander": true,
    "unit": {
      "id": "uuid-kompi-a",
      "name": "Kompi A",
      "path": "/uuid-root/uuid-batalyon-alpha/uuid-kompi-a/",
      "depthLevel": 2
    },
    "commandingUnit": {
      "id": "uuid-kompi-a",
      "name": "Kompi A"
    },
    "socialAccountCount": 3,
    "lastLoginAt": "2026-06-16T09:00:00Z",
    "createdAt": "2025-03-12T00:00:00Z"
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code           | Message                         |
|--------|----------------|---------------------------------|
| 401    | `UNAUTHORIZED` | Tidak ada session aktif         |

**Implementasi Route Handler:**

```typescript
// src/app/api/v1/auth/me/route.ts
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { successResponse, unauthorized } from "@/lib/helpers/response"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      unitMembers: {
        where: { removedAt: null },
        include: { unit: true },
      },
      commandingUnits: {
        where: { deletedAt: null },
        take: 1,
      },
      _count: { select: { socialAccounts: { where: { deletedAt: null } } } },
    },
  })

  return successResponse({ data: transformUser(user) })
}
```

---

### POST /api/v1/auth/admin/unlock-user

**Summary:** Admin membuka kunci akun user yang dikunci
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Request Body

```json
{
  "userId": "uuid-user-001"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": null,
  "message": "Akun berhasil dibuka kuncinya",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

**Implementasi:** Route Handler ini memanggil `auth.api.unbanUser()` dari Better Auth Admin plugin, atau langsung update `lockedUntil = null` dan `failedLoginAttempts = 0` via Prisma.

---

### PATCH /api/v1/auth/admin/reset-password

**Summary:** Admin mereset password user
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Request Body

```json
{
  "userId": "uuid-user-001",
  "newPassword": "ResetPass123!"
}
```

| Field         | Type   | Required | Validasi      |
|---------------|--------|----------|---------------|
| `userId`      | uuid   | ✅       | UUID valid    |
| `newPassword` | string | ✅       | min 8 char    |

#### Response 200 OK

```json
{
  "success": true,
  "data": null,
  "message": "Password berhasil direset",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

## MODULE 3 — MANAJEMEN ORGANISASI (`/api/v1/units/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** super_admin

---

### GET /api/v1/units

**Summary:** Ambil seluruh struktur tree organisasi
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Query Params

| Param          | Type    | Default | Keterangan                                           |
|----------------|---------|---------|------------------------------------------------------|
| `search`       | string  | -       | Cari berdasarkan nama satuan atau nama user          |
| `depthLevel`   | integer | -       | Filter berdasarkan level kedalaman (0, 1, 2, dst.)  |
| `nodeType`     | string  | `all`   | `all` / `unit` / `member`                           |
| `hasCommander` | boolean | -       | `true` = ada komandan / `false` = belum ada         |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-root",
      "name": "Angkatan Darat",
      "description": "Satuan induk",
      "depthLevel": 0,
      "path": "/uuid-root/",
      "parentId": null,
      "commander": {
        "id": "uuid-user-general",
        "fullName": "Jenderal Ahmad",
        "username": "jend_ahmad"
      },
      "memberCount": 5,
      "subUnitCount": 3,
      "totalDescendantMembers": 145,
      "children": [
        {
          "id": "uuid-batalyon-alpha",
          "name": "Batalyon Alpha",
          "depthLevel": 1,
          "path": "/uuid-root/uuid-batalyon-alpha/",
          "parentId": "uuid-root",
          "commander": {
            "id": "uuid-user-kol",
            "fullName": "Kolonel Budi",
            "username": "kol_budi"
          },
          "memberCount": 48,
          "subUnitCount": 3,
          "totalDescendantMembers": 48,
          "children": []
        }
      ]
    }
  ],
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### POST /api/v1/units

**Summary:** Buat satuan baru
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Request Body

```json
{
  "name": "Kompi D",
  "description": "Kompi baru untuk sektor barat",
  "parentId": "uuid-batalyon-alpha",
  "commanderId": "uuid-user-kapten"
}
```

| Field         | Type   | Required | Validasi                                     |
|---------------|--------|----------|----------------------------------------------|
| `name`        | string | ✅       | min 2, max 150 char                          |
| `description` | string | ❌       | max 500 char                                 |
| `parentId`    | uuid   | ❌       | UUID satuan parent yang valid. `null` = root |
| `commanderId` | uuid   | ❌       | UUID user yang valid                         |

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "id": "uuid-kompi-d",
    "name": "Kompi D",
    "description": "Kompi baru untuk sektor barat",
    "parentId": "uuid-batalyon-alpha",
    "depthLevel": 2,
    "path": "/uuid-root/uuid-batalyon-alpha/uuid-kompi-d/",
    "commander": {
      "id": "uuid-user-kapten",
      "fullName": "Kapten Eko"
    },
    "createdAt": "2026-06-16T10:00:00Z"
  },
  "message": "Satuan berhasil dibuat",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code       | Message                                    |
|--------|------------|--------------------------------------------|
| 404    | `NOT_FOUND`| Satuan parent tidak ditemukan              |
| 409    | `CONFLICT` | Nama satuan sudah ada di level yang sama   |

---

### GET /api/v1/units/:unitId

**Summary:** Detail satu satuan beserta anggota langsungnya
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-kompi-a",
    "name": "Kompi A",
    "description": null,
    "depthLevel": 2,
    "path": "/uuid-root/uuid-batalyon-alpha/uuid-kompi-a/",
    "parentId": "uuid-batalyon-alpha",
    "parentName": "Batalyon Alpha",
    "commander": {
      "id": "uuid-kapten-sari",
      "fullName": "Kapten Sari",
      "username": "kpt_sari"
    },
    "directMembers": [
      {
        "id": "uuid-user-budi",
        "fullName": "Sersan Budi Santoso",
        "username": "budi_santoso",
        "nip": "1234567890",
        "joinedAt": "2025-03-12T00:00:00Z"
      }
    ],
    "subUnits": [
      {
        "id": "uuid-peleton-1",
        "name": "Peleton 1",
        "memberCount": 8
      }
    ],
    "totalDescendantMembers": 16,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2026-06-01T00:00:00Z"
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### PATCH /api/v1/units/:unitId

**Summary:** Update data satuan
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Request Body (semua field opsional)

```json
{
  "name": "Kompi Alpha Baru",
  "description": "Deskripsi diperbarui",
  "commanderId": "uuid-user-baru",
  "parentId": "uuid-unit-baru"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-kompi-a",
    "name": "Kompi Alpha Baru",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "message": "Satuan berhasil diperbarui",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### DELETE /api/v1/units/:unitId

**Summary:** Hapus satuan (soft delete, dengan validasi)
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Response 204 No Content

#### Error Responses

| Status | Code                      | Message                                                       |
|--------|---------------------------|---------------------------------------------------------------|
| 422    | `BUSINESS_RULE_VIOLATED`  | Satuan tidak dapat dihapus karena masih ada assignment aktif  |

---

### POST /api/v1/units/:unitId/members

**Summary:** Assign user ke satuan
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Request Body

```json
{
  "userId": "uuid-user-001"
}
```

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "unitId": "uuid-kompi-a",
    "userId": "uuid-user-001",
    "joinedAt": "2026-06-16T10:00:00Z"
  },
  "message": "Anggota berhasil ditambahkan ke satuan",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### PATCH /api/v1/units/:unitId/members/:userId/transfer

**Summary:** Pindahkan anggota ke satuan lain
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Request Body

```json
{
  "targetUnitId": "uuid-kompi-b"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "userId": "uuid-user-001",
    "fromUnit": { "id": "uuid-kompi-a", "name": "Kompi A" },
    "toUnit": { "id": "uuid-kompi-b", "name": "Kompi B" },
    "transferredAt": "2026-06-16T10:00:00Z"
  },
  "message": "Anggota berhasil dipindahkan",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

## MODULE 4 — MANAJEMEN USER (`/api/v1/users/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** super_admin

---

### GET /api/v1/users

**Summary:** Daftar semua user dengan filter lengkap
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Query Params

| Param              | Type    | Default    | Keterangan                                               |
|--------------------|---------|------------|----------------------------------------------------------|
| `search`           | string  | -          | Cari berdasarkan nama atau NIP                           |
| `unitId`           | uuid    | -          | Filter satuan (termasuk sub-satuan secara rekursif)      |
| `directUnitOnly`   | boolean | `false`    | `true` = hanya anggota langsung satuan, tanpa sub-satuan |
| `role`             | string  | -          | `super_admin` / `member`                                 |
| `isActive`         | boolean | `true`     | `true` = aktif / `false` = soft-deleted                  |
| `isLocked`         | boolean | -          | Filter akun yang dikunci                                 |
| `hasSocialAccount` | boolean | -          | `true` = sudah daftar sosmed / `false` = belum           |
| `socialPlatform`   | string  | -          | Filter platform: `instagram`, `twitter_x`, dll.          |
| `noUnit`           | boolean | -          | `true` = user yang belum masuk satuan manapun            |
| `sortBy`           | string  | `fullName` | `fullName` / `createdAt` / `socialAccountCount`         |
| `sortOrder`        | string  | `asc`      | `asc` / `desc`                                           |
| `page`             | integer | `1`        | -                                                        |
| `limit`            | integer | `20`       | -                                                        |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-user-001",
      "username": "budi_santoso",
      "fullName": "Sersan Budi Santoso",
      "nip": "1234567890",
      "role": "member",
      "isCommander": true,
      "isLocked": false,
      "unit": {
        "id": "uuid-kompi-a",
        "name": "Kompi A"
      },
      "socialAccountCount": 3,
      "socialPlatforms": ["instagram", "twitter_x", "tiktok"],
      "lastLoginAt": "2026-06-16T09:00:00Z",
      "createdAt": "2025-03-12T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### POST /api/v1/users

**Summary:** Buat user baru (Admin membuat akun untuk anggota — tidak ada self-registration)
**Auth:** ✅ Cookie session | **Role:** super_admin

**Catatan Better Auth:** Pembuatan user dilakukan via `auth.api.createUser()` atau `auth.api.signUpEmail()` dari server untuk memastikan password di-hash dengan benar oleh Better Auth (menggunakan scrypt).

#### Request Body

```json
{
  "username": "andi_kurnia",
  "fullName": "Kopral Andi Kurnia",
  "nip": "1234567891",
  "password": "InitialPass123!",
  "unitId": "uuid-kompi-a"
}
```

| Field      | Type   | Required | Validasi                      |
|------------|--------|----------|-------------------------------|
| `username` | string | ✅       | min 3, max 50 char, unik      |
| `fullName` | string | ✅       | min 2, max 150 char           |
| `nip`      | string | ❌       | max 50 char, unik jika diisi  |
| `password` | string | ✅       | min 8 char                    |
| `unitId`   | uuid   | ❌       | UUID satuan yang valid        |

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "id": "uuid-user-002",
    "username": "andi_kurnia",
    "fullName": "Kopral Andi Kurnia",
    "nip": "1234567891",
    "role": "member",
    "unit": {
      "id": "uuid-kompi-a",
      "name": "Kompi A"
    },
    "createdAt": "2026-06-16T10:00:00Z"
  },
  "message": "User berhasil dibuat",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code       | Message                      |
|--------|------------|------------------------------|
| 409    | `CONFLICT` | Username sudah digunakan     |
| 409    | `CONFLICT` | NIP sudah terdaftar          |

**Implementasi (penting):**
```typescript
// Gunakan Better Auth API untuk hash password
await auth.api.createUser({
  body: {
    name: fullName,
    username,
    password, // Better Auth akan hash dengan scrypt otomatis
    role: "member",
  }
})
// Kemudian assign ke unit via Prisma
```

---

### GET /api/v1/users/:userId

**Summary:** Detail satu user
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-user-001",
    "username": "budi_santoso",
    "fullName": "Sersan Budi Santoso",
    "nip": "1234567890",
    "role": "member",
    "isCommander": true,
    "isLocked": false,
    "lockedUntil": null,
    "unit": {
      "id": "uuid-kompi-a",
      "name": "Kompi A",
      "path": "/uuid-root/uuid-batalyon-alpha/uuid-kompi-a/"
    },
    "commandingUnit": {
      "id": "uuid-kompi-a",
      "name": "Kompi A"
    },
    "socialAccounts": [
      {
        "id": "uuid-sa-001",
        "platform": "instagram",
        "username": "@budi_santoso",
        "profileUrl": "https://instagram.com/budi_santoso"
      }
    ],
    "lastLoginAt": "2026-06-16T09:00:00Z",
    "createdAt": "2025-03-12T00:00:00Z"
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### PATCH /api/v1/users/:userId

**Summary:** Update data user (nama, NIP, satuan)
**Auth:** ✅ Cookie session | **Role:** super_admin

**Catatan:** Perubahan password dan unlock akun menggunakan endpoint terpisah.

#### Request Body (semua field opsional)

```json
{
  "fullName": "Sersan Kepala Budi Santoso",
  "nip": "1234567890",
  "unitId": "uuid-kompi-b"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-user-001",
    "fullName": "Sersan Kepala Budi Santoso",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "message": "User berhasil diperbarui",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### DELETE /api/v1/users/:userId

**Summary:** Nonaktifkan user (soft delete)
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Response 204 No Content

---

## MODULE 5 — AKUN SOSIAL MEDIA (`/api/v1/social-accounts/*`)

---

### GET /api/v1/social-accounts

**Summary:** Daftar akun sosmed milik user yang sedang login
**Auth:** ✅ Cookie session | **Role:** semua (member)

#### Query Params

| Param       | Type   | Default     | Keterangan                                                         |
|-------------|--------|-------------|--------------------------------------------------------------------|
| `platform`  | string | -           | Filter: `instagram`, `twitter_x`, `facebook`, `tiktok`, `youtube`, `other` |
| `sortBy`    | string | `createdAt` | `createdAt` / `platform`                                           |
| `sortOrder` | string | `desc`      | `asc` / `desc`                                                     |

**Session dibaca dari cookie:** `auth.api.getSession()` dipanggil di dalam Route Handler untuk mendapatkan `userId` user yang sedang login.

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-sa-001",
      "platform": "instagram",
      "platformLabel": "Instagram",
      "username": "@budi_santoso",
      "profileUrl": "https://instagram.com/budi_santoso",
      "notes": "Akun utama",
      "createdAt": "2025-03-12T00:00:00Z",
      "updatedAt": "2025-03-12T00:00:00Z"
    }
  ],
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### POST /api/v1/social-accounts

**Summary:** Daftarkan akun sosmed baru
**Auth:** ✅ Cookie session | **Role:** semua (member)

#### Request Body

```json
{
  "platform": "tiktok",
  "username": "@budi.tiktok",
  "profileUrl": "https://tiktok.com/@budi.tiktok",
  "notes": "Akun TikTok utama"
}
```

| Field        | Type   | Required | Validasi                                                            |
|--------------|--------|----------|---------------------------------------------------------------------|
| `platform`   | string | ✅       | enum: `instagram`, `twitter_x`, `facebook`, `tiktok`, `youtube`, `other` |
| `username`   | string | ✅       | max 150 char                                                        |
| `profileUrl` | string | ❌       | valid URL format                                                    |
| `notes`      | string | ❌       | max 500 char                                                        |

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "id": "uuid-sa-003",
    "platform": "tiktok",
    "platformLabel": "TikTok",
    "username": "@budi.tiktok",
    "profileUrl": "https://tiktok.com/@budi.tiktok",
    "notes": "Akun TikTok utama",
    "createdAt": "2026-06-16T10:00:00Z"
  },
  "message": "Akun sosial media berhasil didaftarkan",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code       | Message                                            |
|--------|------------|----------------------------------------------------|
| 409    | `CONFLICT` | Akun tiktok dengan username tersebut sudah terdaftar |

---

### PATCH /api/v1/social-accounts/:socialAccountId

**Summary:** Update data akun sosmed
**Auth:** ✅ Cookie session | **Role:** pemilik akun

**Authorization check:** Route Handler memverifikasi `socialAccount.userId === session.user.id`.

#### Request Body (semua field opsional)

```json
{
  "username": "@budi.tiktok_v2",
  "profileUrl": "https://tiktok.com/@budi.tiktok_v2",
  "notes": "Username baru"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-sa-003",
    "username": "@budi.tiktok_v2",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "message": "Akun sosial media berhasil diperbarui",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code        | Message                               |
|--------|-------------|---------------------------------------|
| 403    | `FORBIDDEN` | Kamu tidak memiliki akses ke akun ini |

---

### DELETE /api/v1/social-accounts/:socialAccountId

**Summary:** Hapus akun sosmed (soft delete)
**Auth:** ✅ Cookie session | **Role:** pemilik akun / super_admin

#### Response 204 No Content

---

### GET /api/v1/users/:userId/social-accounts

**Summary:** Lihat akun sosmed milik anggota tertentu (oleh Komandan)
**Auth:** ✅ Cookie session | **Role:** Komandan (lingkup hierarki)

**Authorization check:** Route Handler memverifikasi bahwa `userId` target berada dalam subtree hierarki milik Komandan yang sedang login menggunakan `path LIKE` query.

#### Query Params

| Param      | Type   | Keterangan                  |
|------------|--------|-----------------------------|
| `platform` | string | Filter berdasarkan platform |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-user-001",
      "fullName": "Sersan Budi Santoso",
      "unit": { "id": "uuid-kompi-a", "name": "Kompi A" }
    },
    "socialAccounts": [
      {
        "id": "uuid-sa-001",
        "platform": "instagram",
        "platformLabel": "Instagram",
        "username": "@budi_santoso",
        "profileUrl": "https://instagram.com/budi_santoso",
        "notes": "Akun utama"
      }
    ]
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code               | Message                                    |
|--------|--------------------|--------------------------------------------|
| 403    | `OUT_OF_HIERARCHY` | User ini bukan dalam lingkup hierarki kamu |

---

## MODULE 6 — MANAJEMEN PERINTAH (`/api/v1/orders/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** Komandan

---

### GET /api/v1/orders

**Summary:** Daftar perintah yang dibuat oleh Komandan yang sedang login
**Auth:** ✅ Cookie session | **Role:** Komandan

**Session:** Route Handler mengambil `session.user.id` dari cookie, lalu query `orders WHERE createdBy = session.user.id`.

#### Query Params

| Param          | Type    | Default    | Keterangan                                                     |
|----------------|---------|------------|----------------------------------------------------------------|
| `search`       | string  | -          | Cari berdasarkan judul perintah                                |
| `orderType`    | string  | -          | Nilai: `posting`, `engagement`, `blasting`, `counter`, `report_akun` |
| `status`       | string  | -          | Multi-value: `aktif,expired`. Nilai: `draft`, `aktif`, `selesai`, `expired`, `dibatalkan` |
| `targetUnitId` | uuid    | -          | Filter perintah yang menarget satuan tertentu                  |
| `startDate`    | date    | -          | `YYYY-MM-DD`. Filter rentang tanggal dibuat/dikirim            |
| `endDate`      | date    | -          | `YYYY-MM-DD`                                                   |
| `deadlineStart`| date    | -          | Filter rentang deadline awal                                   |
| `deadlineEnd`  | date    | -          | Filter rentang deadline akhir                                  |
| `progressMin`  | integer | `0`        | Filter % progress minimal (0–100)                              |
| `progressMax`  | integer | `100`      | Filter % progress maksimal (0–100)                             |
| `nearDeadline` | boolean | -          | `true` = deadline dalam 24 jam                                 |
| `noSubmit`     | boolean | -          | `true` = belum ada anggota yang submit                         |
| `hasLate`      | boolean | -          | `true` = ada anggota dengan status terlambat                   |
| `sortBy`       | string  | `deadline` | `deadline` / `createdAt` / `progress` / `title`               |
| `sortOrder`    | string  | `asc`      | `asc` / `desc`                                                 |
| `page`         | integer | `1`        | -                                                              |
| `limit`        | integer | `20`       | -                                                              |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-order-001",
      "title": "Serbu Postingan @target123",
      "orderType": "counter",
      "orderTypeLabel": "Counter",
      "status": "aktif",
      "deadline": "2026-06-16T10:00:00Z",
      "sentAt": "2026-06-15T09:00:00Z",
      "createdAt": "2026-06-15T08:00:00Z",
      "hoursUntilDeadline": 3,
      "isNearDeadline": true,
      "progress": {
        "totalAssigned": 97,
        "totalSubmitted": 62,
        "totalOnTime": 58,
        "totalLate": 4,
        "totalPending": 35,
        "percentageComplete": 63.9
      },
      "targets": [
        { "type": "unit", "id": "uuid-batalyon-alpha", "name": "Batalyon Alpha" }
      ]
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/orders/summary

**Summary:** Ringkasan analytics daftar perintah untuk overview atau halaman jenis tertentu
**Auth:** ✅ Cookie session | **Role:** Komandan

#### Query Params

| Param          | Type   | Default | Keterangan                                                            |
|----------------|--------|---------|-----------------------------------------------------------------------|
| `search`       | string | -       | Cari berdasarkan judul, deskripsi, narasi, atau alasan report         |
| `orderType`    | string | -       | Nilai: `posting`, `engagement`, `blasting`, `counter`, `report_akun` |
| `status`       | string | -       | Nilai: `draft`, `aktif`, `selesai`, `expired`, `dibatalkan`           |
| `submitDate`   | date   | -       | `YYYY-MM-DD`                                                          |
| `deadlineDate` | date   | -       | `YYYY-MM-DD`                                                          |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 12,
      "aktif": 6,
      "draft": 2,
      "selesai": 3,
      "expired": 1
    },
    "charts": {
      "orderStatus": {
        "total": 12,
        "aktif": 6,
        "draft": 2,
        "selesai": 3,
        "expired": 1
      },
      "progressDistribution": {
        "low": 3,
        "medium": 4,
        "high": 5
      },
      "weeklyOrders": [
        { "label": "02 Jun", "count": 1 },
        { "label": "09 Jun", "count": 4 },
        { "label": "16 Jun", "count": 7 }
      ]
    }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### POST /api/v1/orders

**Summary:** Buat perintah baru (simpan draft atau langsung kirim)
**Auth:** ✅ Cookie session | **Role:** Komandan

**Session:** `session.user.id` digunakan sebagai `createdBy` secara otomatis — tidak perlu dikirim di body.

#### Request Body

```json
{
  "title": "Serbu Postingan @target123",
  "orderType": "counter",
  "description": "Pastikan gunakan narasi yang sudah ditentukan",
  "targetUrl": "https://instagram.com/p/abc123",
  "narration": "Akun ini menyebarkan informasi tidak akurat",
  "engagementActions": null,
  "reportReason": null,
  "deadline": "2026-06-16T17:00:00Z",
  "targets": [
    { "type": "unit", "id": "uuid-batalyon-alpha" },
    { "type": "individual", "id": "uuid-user-letnan-sari" }
  ],
  "sendImmediately": true
}
```

| Field                | Type    | Required                     | Validasi                                                           |
|----------------------|---------|------------------------------|--------------------------------------------------------------------|
| `title`              | string  | ✅                           | min 3, max 255 char                                                |
| `orderType`          | string  | ✅                           | enum: `posting`, `engagement`, `blasting`, `counter`, `report_akun` |
| `description`        | string  | ✅                           | max 5000 char                                                      |
| `targetUrl`          | string  | ✅                           | valid URL format                                                   |
| `narration`          | string  | Jika `posting` / `counter`   | wajib untuk `counter`, opsional untuk `posting`                    |
| `engagementActions`  | array   | Jika `engagement`            | array min 1: `["like"]`, `["share"]`, `["repost"]`, kombinasi     |
| `reportReason`       | string  | Jika `report_akun`           | wajib diisi                                                        |
| `deadline`           | datetime| ✅                           | minimal `NOW() + 1 jam`                                            |
| `targets`            | array   | Jika `sendImmediately: true` | min 1 target; semua harus dalam lingkup hierarki Komandan          |
| `targets[].type`     | string  | ✅                           | `unit` atau `individual`                                           |
| `targets[].id`       | uuid    | ✅                           | UUID unit atau user yang valid                                     |
| `sendImmediately`    | boolean | ✅                           | `true` = kirim + broadcast sekarang / `false` = simpan draft       |

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "id": "uuid-order-001",
    "title": "Serbu Postingan @target123",
    "orderType": "counter",
    "status": "aktif",
    "deadline": "2026-06-16T17:00:00Z",
    "sentAt": "2026-06-16T10:00:00Z",
    "totalAssigned": 97,
    "targets": [
      { "type": "unit", "id": "uuid-batalyon-alpha", "name": "Batalyon Alpha", "resolvedMemberCount": 96 },
      { "type": "individual", "id": "uuid-user-letnan-sari", "name": "Letnan Sari", "resolvedMemberCount": 1 }
    ],
    "createdAt": "2026-06-16T10:00:00Z"
  },
  "message": "Perintah berhasil dikirim ke 97 anggota",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code                      | Message                                                |
|--------|---------------------------|--------------------------------------------------------|
| 400    | `VALIDATION_ERROR`        | Narasi wajib diisi untuk jenis perintah counter        |
| 403    | `OUT_OF_HIERARCHY`        | Satuan/anggota target bukan dalam lingkup hierarki kamu|
| 422    | `BUSINESS_RULE_VIOLATED`  | Deadline harus minimal 1 jam dari sekarang             |

---

### GET /api/v1/orders/:orderId

**Summary:** Detail satu perintah
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

**Authorization check:** `order.createdBy === session.user.id`

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-order-001",
    "title": "Serbu Postingan @target123",
    "orderType": "counter",
    "orderTypeLabel": "Counter",
    "description": "Pastikan gunakan narasi yang sudah ditentukan",
    "targetUrl": "https://instagram.com/p/abc123",
    "narration": "Akun ini menyebarkan informasi tidak akurat",
    "engagementActions": null,
    "reportReason": null,
    "status": "aktif",
    "deadline": "2026-06-16T17:00:00Z",
    "hoursUntilDeadline": 3,
    "isNearDeadline": true,
    "sentAt": "2026-06-15T09:00:00Z",
    "createdAt": "2026-06-15T08:00:00Z",
    "createdBy": {
      "id": "uuid-user-kol",
      "fullName": "Kolonel Budi"
    },
    "targets": [
      {
        "id": "uuid-ot-001",
        "type": "unit",
        "unit": { "id": "uuid-batalyon-alpha", "name": "Batalyon Alpha" },
        "resolvedMemberCount": 48
      }
    ],
    "progress": {
      "totalAssigned": 97,
      "totalSubmitted": 62,
      "totalOnTime": 58,
      "totalLate": 4,
      "totalPending": 35,
      "percentageComplete": 63.9
    }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### PATCH /api/v1/orders/:orderId

**Summary:** Update perintah (hanya jika status DRAFT)
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

#### Request Body (semua field opsional)

```json
{
  "title": "Judul diperbarui",
  "description": "Instruksi diperbarui",
  "deadline": "2026-06-17T17:00:00Z"
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-order-001",
    "title": "Judul diperbarui",
    "updatedAt": "2026-06-16T10:00:00Z"
  },
  "message": "Perintah berhasil diperbarui",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code                      | Message                                                   |
|--------|---------------------------|-----------------------------------------------------------|
| 422    | `BUSINESS_RULE_VIOLATED`  | Perintah aktif tidak dapat diedit, hanya dapat dibatalkan |

---

### POST /api/v1/orders/:orderId/send

**Summary:** Kirim perintah draft (DRAFT → AKTIF + broadcast)
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

#### Request Body

```json
{
  "targets": [
    { "type": "unit", "id": "uuid-batalyon-alpha" },
    { "type": "individual", "id": "uuid-user-letnan-sari" }
  ]
}
```

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-order-001",
    "status": "aktif",
    "totalAssigned": 97,
    "sentAt": "2026-06-16T10:00:00Z"
  },
  "message": "Perintah berhasil dikirim ke 97 anggota",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### POST /api/v1/orders/:orderId/cancel

**Summary:** Batalkan perintah aktif
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-order-001",
    "status": "dibatalkan",
    "cancelledAt": "2026-06-16T10:00:00Z",
    "removedAssignmentCount": 35
  },
  "message": "Perintah dibatalkan. 35 assignment yang belum dikerjakan dihapus.",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code                      | Message                                            |
|--------|---------------------------|----------------------------------------------------|
| 422    | `BUSINESS_RULE_VIOLATED`  | Perintah yang sudah selesai tidak dapat dibatalkan |

---

## MODULE 7 — TASK ASSIGNMENTS (`/api/v1/assignments/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** Anggota / Komandan (jika punya atasan)

---

### GET /api/v1/assignments/me

**Summary:** Daftar perintah yang diterima oleh user yang sedang login
**Auth:** ✅ Cookie session

**Session:** Route Handler mengambil `session.user.id` dari cookie, query `task_assignments WHERE userId = session.user.id`.

#### Query Params

| Param           | Type    | Default    | Keterangan                                                   |
|-----------------|---------|------------|--------------------------------------------------------------|
| `search`        | string  | -          | Cari berdasarkan judul perintah                              |
| `orderType`     | string  | -          | Nilai: `posting`, `engagement`, `blasting`, `counter`, `report_akun` |
| `status`        | string  | -          | Multi-value: `belum_dikerjakan,terlambat`                    |
| `fromUserId`    | uuid    | -          | Filter perintah dari Komandan tertentu                       |
| `startDate`     | date    | -          | Rentang tanggal diterima                                     |
| `endDate`       | date    | -          | Rentang tanggal diterima                                     |
| `deadlineStart` | date    | -          | Rentang deadline awal                                        |
| `deadlineEnd`   | date    | -          | Rentang deadline akhir                                       |
| `nearDeadline`  | boolean | -          | `true` = deadline < 24 jam dan belum dikerjakan              |
| `sortBy`        | string  | `deadline` | `deadline` / `assignedAt` / `status` / `title`              |
| `sortOrder`     | string  | `asc`      | `asc` / `desc`                                               |
| `page`          | integer | `1`        | -                                                            |
| `limit`         | integer | `20`       | -                                                            |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-assignment-001",
      "status": "belum_dikerjakan",
      "statusLabel": "Belum Dikerjakan",
      "assignedAt": "2026-06-15T09:00:00Z",
      "completedAt": null,
      "order": {
        "id": "uuid-order-001",
        "title": "Serbu Postingan @target123",
        "orderType": "counter",
        "orderTypeLabel": "Counter",
        "description": "Pastikan gunakan narasi yang sudah ditentukan",
        "targetUrl": "https://instagram.com/p/abc123",
        "narration": "Akun ini menyebarkan informasi tidak akurat",
        "engagementActions": null,
        "deadline": "2026-06-16T17:00:00Z",
        "hoursUntilDeadline": 3,
        "isNearDeadline": true,
        "createdBy": {
          "id": "uuid-user-kol",
          "fullName": "Kolonel Budi"
        }
      },
      "latestSubmission": null
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 },
    "summary": {
      "totalPending": 5,
      "totalDone": 18,
      "totalLate": 2,
      "total": 25
    }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/assignments/me/:assignmentId

**Summary:** Detail satu assignment beserta instruksi lengkap
**Auth:** ✅ Cookie session

**Authorization check:** `assignment.userId === session.user.id`

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "id": "uuid-assignment-001",
    "status": "belum_dikerjakan",
    "assignedAt": "2026-06-15T09:00:00Z",
    "completedAt": null,
    "order": {
      "id": "uuid-order-001",
      "title": "Serbu Postingan @target123",
      "orderType": "counter",
      "description": "Pastikan gunakan narasi yang sudah ditentukan. Jangan modifikasi teks.",
      "targetUrl": "https://instagram.com/p/abc123",
      "narration": "Akun ini menyebarkan informasi yang tidak akurat dan menyesatkan masyarakat. Harap waspada.",
      "engagementActions": null,
      "reportReason": null,
      "deadline": "2026-06-16T17:00:00Z",
      "hoursUntilDeadline": 3,
      "isNearDeadline": true,
      "createdBy": {
        "id": "uuid-user-kol",
        "fullName": "Kolonel Budi"
      }
    },
    "submissions": [
      {
        "id": "uuid-submission-001",
        "driveLink": "https://drive.google.com/file/d/abc123",
        "notes": "Sudah dikerjakan di 2 akun",
        "isLatest": true,
        "isLate": false,
        "submittedAt": "2026-06-16T14:22:00Z"
      }
    ],
    "mySocialAccounts": [
      {
        "platform": "instagram",
        "username": "@budi_santoso",
        "profileUrl": "https://instagram.com/budi_santoso"
      }
    ]
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### POST /api/v1/assignments/me/:assignmentId/submit

**Summary:** Submit bukti pelaksanaan berupa link Google Drive
**Auth:** ✅ Cookie session

**Authorization check:** `assignment.userId === session.user.id`

#### Request Body

```json
{
  "driveLink": "https://drive.google.com/file/d/abc123xyz/view",
  "notes": "Sudah dikerjakan di 2 akun sosmed saya"
}
```

| Field       | Type   | Required | Validasi                        |
|-------------|--------|----------|---------------------------------|
| `driveLink` | string | ✅       | valid URL format, max 2000 char |
| `notes`     | string | ❌       | max 1000 char                   |

#### Response 201 Created

```json
{
  "success": true,
  "data": {
    "id": "uuid-submission-002",
    "assignmentId": "uuid-assignment-001",
    "driveLink": "https://drive.google.com/file/d/abc123xyz/view",
    "notes": "Sudah dikerjakan di 2 akun sosmed saya",
    "isLatest": true,
    "isLate": false,
    "submittedAt": "2026-06-16T14:22:00Z",
    "assignmentStatus": "selesai"
  },
  "message": "Bukti berhasil dikirim! Perintah ditandai selesai.",
  "timestamp": "2026-06-16T10:00:00Z"
}
```

> Jika submit setelah deadline: response 201 tetap diterima, `isLate: true`, `assignmentStatus: "terlambat"`.

#### Error Responses

| Status | Code               | Message                                               |
|--------|--------------------|-------------------------------------------------------|
| 400    | `VALIDATION_ERROR` | Link tidak valid. Pastikan URL yang dimasukkan benar  |
| 403    | `FORBIDDEN`        | Assignment ini bukan milik kamu                       |
| 404    | `NOT_FOUND`        | Assignment tidak ditemukan                            |

---

## MODULE 8 — PROGRESS MONITORING (`/api/v1/orders/:orderId/assignments/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

---

### GET /api/v1/orders/:orderId/assignments

**Summary:** Daftar semua assignment per perintah dengan status per anggota
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

#### Query Params

| Param       | Type    | Default    | Keterangan                                               |
|-------------|---------|------------|----------------------------------------------------------|
| `search`    | string  | -          | Cari berdasarkan nama anggota                            |
| `unitId`    | uuid    | -          | Filter berdasarkan satuan (termasuk sub-satuan)          |
| `status`    | string  | -          | Multi-value: `belum_dikerjakan,selesai,terlambat`        |
| `sortBy`    | string  | `fullName` | `fullName` / `submittedAt` / `status` / `unitName`      |
| `sortOrder` | string  | `asc`      | `asc` / `desc`                                           |
| `page`      | integer | `1`        | -                                                        |
| `limit`     | integer | `50`       | -                                                        |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid-order-001",
      "title": "Serbu Postingan @target123",
      "orderType": "counter",
      "deadline": "2026-06-16T17:00:00Z",
      "status": "aktif"
    },
    "progress": {
      "totalAssigned": 97,
      "totalSubmitted": 62,
      "totalOnTime": 58,
      "totalLate": 4,
      "totalPending": 35,
      "percentageComplete": 63.9
    },
    "assignments": [
      {
        "id": "uuid-assignment-001",
        "status": "selesai",
        "statusLabel": "Selesai",
        "assignedAt": "2026-06-15T09:00:00Z",
        "completedAt": "2026-06-16T14:22:00Z",
        "user": {
          "id": "uuid-user-001",
          "fullName": "Sersan Budi Santoso",
          "username": "budi_santoso"
        },
        "unit": {
          "id": "uuid-kompi-a",
          "name": "Kompi A"
        },
        "latestSubmission": {
          "id": "uuid-sub-001",
          "driveLink": "https://drive.google.com/file/d/abc123",
          "notes": "Sudah dikerjakan di 2 akun",
          "isLate": false,
          "submittedAt": "2026-06-16T14:22:00Z"
        }
      }
    ]
  },
  "meta": {
    "pagination": { "page": 1, "limit": 50, "total": 97, "totalPages": 2 }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/orders/:orderId/assignments/by-unit

**Summary:** Progress dikelompokkan per satuan (tree view di halaman detail perintah)
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "unit": {
        "id": "uuid-batalyon-alpha",
        "name": "Batalyon Alpha",
        "depthLevel": 1
      },
      "progress": {
        "totalAssigned": 32,
        "totalSubmitted": 20,
        "totalOnTime": 18,
        "totalLate": 2,
        "totalPending": 12
      },
      "children": [
        {
          "unit": {
            "id": "uuid-kompi-a",
            "name": "Kompi A",
            "depthLevel": 2
          },
          "progress": {
            "totalAssigned": 16,
            "totalSubmitted": 12,
            "totalOnTime": 11,
            "totalLate": 1,
            "totalPending": 4
          },
          "members": [
            {
              "assignmentId": "uuid-assignment-001",
              "user": { "id": "uuid-user-001", "fullName": "Sersan Budi Santoso" },
              "status": "selesai",
              "submittedAt": "2026-06-16T14:22:00Z",
              "driveLink": "https://drive.google.com/file/d/abc123",
              "isLate": false
            }
          ],
          "children": []
        }
      ]
    },
    {
      "unit": null,
      "isDirectIndividual": true,
      "members": [
        {
          "assignmentId": "uuid-assignment-letnan",
          "user": { "id": "uuid-user-letnan", "fullName": "Letnan Sari" },
          "status": "selesai",
          "submittedAt": "2026-06-16T11:00:00Z",
          "driveLink": "https://drive.google.com/file/d/xyz456",
          "isLate": false
        }
      ]
    }
  ],
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/orders/:orderId/assignments/export

**Summary:** Export daftar assignment ke file Excel (.xlsx)
**Auth:** ✅ Cookie session | **Role:** Komandan (pembuat perintah)

Mendukung query params filter yang sama dengan `GET /api/v1/orders/:orderId/assignments`.

#### Response 200 OK

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="perintah-serbu-target123-2026-06-16.xlsx"

[Binary XLSX file]
```

> Kolom Excel: No · Nama Anggota · Username · Satuan · Status · Waktu Submit · Link Drive · Catatan · Terlambat (Ya/Tidak)

---

## MODULE 9 — DASHBOARD & STATISTIK (`/api/v1/dashboard/*`)

---

### GET /api/v1/dashboard/commander

**Summary:** Data dashboard untuk Komandan
**Auth:** ✅ Cookie session | **Role:** Komandan

**Session:** Semua data difilter berdasarkan `session.user.id` (hanya perintah yang dibuat oleh Komandan ini).

#### Query Params

| Param          | Type    | Default    | Keterangan                                               |
|----------------|---------|------------|----------------------------------------------------------|
| `unitId`       | uuid    | -          | Filter stats berdasarkan satuan dalam hierarki           |
| `orderType`    | string  | -          | Filter jenis perintah                                    |
| `status`       | string  | -          | Filter status perintah                                   |
| `startDate`    | date    | -          | Awal rentang periode                                     |
| `endDate`      | date    | -          | Akhir rentang periode                                    |
| `nearDeadline` | boolean | -          | `true` = hanya perintah hampir deadline                  |
| `noSubmit`     | boolean | -          | `true` = hanya perintah tanpa submission apapun          |
| `hasLate`      | boolean | -          | `true` = perintah yang ada anggota terlambat             |
| `sortBy`       | string  | `deadline` | Urutan daftar perintah aktif                             |
| `sortOrder`    | string  | `asc`      | `asc` / `desc`                                           |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalActiveOrders": 12,
      "totalMembersBelow": 145,
      "totalPendingAssignmentsToday": 58,
      "totalCompletedAssignmentsToday": 87,
      "totalLateAssignments": 12
    },
    "activeOrders": [
      {
        "id": "uuid-order-001",
        "title": "Serbu Postingan @target123",
        "orderType": "counter",
        "deadline": "2026-06-16T17:00:00Z",
        "isNearDeadline": true,
        "hoursUntilDeadline": 3,
        "progress": {
          "totalAssigned": 97,
          "totalSubmitted": 62,
          "percentageComplete": 63.9
        }
      }
    ]
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/dashboard/member

**Summary:** Data dashboard untuk Anggota
**Auth:** ✅ Cookie session | **Role:** semua member

**Session:** Data difilter berdasarkan `session.user.id` — hanya assignment milik user ini.

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPending": 5,
      "totalDone": 18,
      "totalLate": 2,
      "total": 25
    },
    "urgentAssignments": [
      {
        "id": "uuid-assignment-001",
        "status": "belum_dikerjakan",
        "order": {
          "id": "uuid-order-001",
          "title": "Serbu Postingan @target123",
          "orderType": "counter",
          "deadline": "2026-06-16T17:00:00Z",
          "hoursUntilDeadline": 3,
          "isNearDeadline": true
        }
      }
    ],
    "recentAssignments": [
      {
        "id": "uuid-assignment-003",
        "status": "selesai",
        "order": {
          "id": "uuid-order-003",
          "title": "Upload Konten Kampanye Juni",
          "orderType": "posting",
          "deadline": "2026-06-14T20:00:00Z"
        },
        "completedAt": "2026-06-14T14:22:00Z"
      }
    ],
    "mySocialAccountsSummary": {
      "totalAccounts": 3,
      "platforms": ["instagram", "twitter_x", "tiktok"]
    }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/dashboard/admin

**Summary:** Data dashboard untuk Super Admin
**Auth:** ✅ Cookie session | **Role:** super_admin

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalUnits": 12,
      "totalActiveOrders": 12,
      "totalAssignmentsToday": 145,
      "totalCompletedToday": 87,
      "totalLockedAccounts": 2,
      "totalUsersWithoutUnit": 3,
      "totalUsersWithoutSocialAccount": 18
    },
    "recentActivity": [
      {
        "type": "new_order",
        "description": "Kolonel Budi membuat perintah 'Serbu Postingan @target123'",
        "timestamp": "2026-06-16T09:00:00Z"
      },
      {
        "type": "new_user",
        "description": "User baru 'prajurit_eko' berhasil dibuat",
        "timestamp": "2026-06-16T08:00:00Z"
      }
    ]
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

## MODULE 10 — NOTIFIKASI (`/api/v1/notifications/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** Semua actor

Notifikasi v1 bersifat generated dari data operasional existing: assignment yang belum dikerjakan, deadline dekat/terlewat, submission terbaru, akun terkunci, user tanpa satuan, dan satuan tanpa komandan. Endpoint ini tidak membuat tabel inbox historis baru.

---

### GET /api/v1/notifications

**Summary:** Daftar notifikasi operasional user yang sedang login
**Auth:** ✅ Cookie session

#### Query Params

| Param   | Type    | Default | Keterangan                       |
|---------|---------|---------|----------------------------------|
| `limit` | integer | `20`    | Jumlah notifikasi, maksimum `50` |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "deadline:uuid-assignment-001",
      "category": "deadline",
      "severity": "warning",
      "title": "Perintah mendekati deadline",
      "description": "Serbu Postingan @target123 tersisa 8 jam.",
      "href": "/assignments/uuid-assignment-001",
      "createdAt": "2026-06-17T08:00:00Z",
      "readAt": null
    }
  ],
  "meta": {
    "unreadCount": 1,
    "generatedAt": "2026-06-17T10:00:00Z"
  },
  "timestamp": "2026-06-17T10:00:00Z"
}
```

#### Category

`assignment`, `deadline`, `submission`, `order`, `organization`, `account`, `system`

#### Severity

`info`, `success`, `warning`, `danger`

---

### GET /api/v1/notifications/summary

**Summary:** Ringkasan jumlah notifikasi belum dibaca/generated
**Auth:** ✅ Cookie session

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "unreadCount": 3,
    "generatedAt": "2026-06-17T10:00:00Z"
  },
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

### POST /api/v1/notifications/mark-all-read

**Summary:** Tandai notifikasi sebagai dibaca di UI client
**Auth:** ✅ Cookie session

Endpoint ini no-op di backend v1 karena notifikasi belum persisted sebagai inbox historis.

#### Response 200 OK

```json
{
  "success": true,
  "data": null,
  "message": "Notifikasi ditandai sudah dibaca",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

## MODULE 11 — ANGGOTA SAYA (`/api/v1/commander/members/*`)

**Auth semua endpoint:** ✅ Cookie session | **Role:** Komandan

**Session:** Semua query menggunakan `session.user.id` untuk menentukan komandan yang login, kemudian memfilter hanya anggota dalam lingkup hierarkinya via `path LIKE` query.

---

### GET /api/v1/commander/members

**Summary:** Daftar anggota dalam lingkup hierarki Komandan (tampilan tabel)
**Auth:** ✅ Cookie session | **Role:** Komandan

#### Query Params

| Param              | Type    | Default    | Keterangan                                                |
|--------------------|---------|------------|-----------------------------------------------------------|
| `search`           | string  | -          | Cari berdasarkan nama atau username                       |
| `unitId`           | uuid    | -          | Filter satuan tertentu (termasuk sub-satuan)              |
| `directUnitOnly`   | boolean | `false`    | `true` = hanya anggota langsung, tanpa sub-satuan         |
| `socialPlatform`   | string  | -          | Filter platform sosmed yang dimiliki                      |
| `hasSocialAccount` | boolean | -          | `true` = sudah daftar / `false` = belum daftar sosmed    |
| `socialAccountMin` | integer | -          | Min jumlah akun sosmed                                    |
| `socialAccountMax` | integer | -          | Max jumlah akun sosmed                                    |
| `sortBy`           | string  | `fullName` | `fullName` / `unitName` / `socialAccountCount`           |
| `sortOrder`        | string  | `asc`      | `asc` / `desc`                                            |
| `page`             | integer | `1`        | -                                                         |
| `limit`            | integer | `20`       | -                                                         |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-user-001",
      "fullName": "Sersan Budi Santoso",
      "username": "budi_santoso",
      "nip": "1234567890",
      "unit": {
        "id": "uuid-kompi-a",
        "name": "Kompi A",
        "depthLevel": 2
      },
      "socialAccountCount": 3,
      "socialPlatforms": ["instagram", "twitter_x", "tiktok"],
      "joinedAt": "2025-03-12T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 97, "totalPages": 5 }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/commander/members/by-unit

**Summary:** Anggota dikelompokkan per satuan (tree view)
**Auth:** ✅ Cookie session | **Role:** Komandan

#### Query Params

| Param              | Type    | Keterangan                          |
|--------------------|---------|-------------------------------------|
| `hasSocialAccount` | boolean | Filter anggota dalam setiap satuan  |
| `socialPlatform`   | string  | Filter platform sosmed              |

#### Response 200 OK

```json
{
  "success": true,
  "data": [
    {
      "unit": {
        "id": "uuid-batalyon-alpha",
        "name": "Batalyon Alpha",
        "depthLevel": 1,
        "commander": { "fullName": "Kolonel Budi" }
      },
      "directMembers": [],
      "children": [
        {
          "unit": {
            "id": "uuid-kompi-a",
            "name": "Kompi A",
            "depthLevel": 2,
            "commander": { "fullName": "Kapten Sari" }
          },
          "directMembers": [
            {
              "id": "uuid-user-001",
              "fullName": "Sersan Budi Santoso",
              "socialAccountCount": 3,
              "socialPlatforms": ["instagram", "twitter_x", "tiktok"]
            }
          ],
          "children": []
        }
      ]
    }
  ],
  "timestamp": "2026-06-16T10:00:00Z"
}
```

---

### GET /api/v1/commander/members/:userId

**Summary:** Detail profil anggota beserta akun sosmed dan riwayat perintah
**Auth:** ✅ Cookie session | **Role:** Komandan (lingkup hierarki)

**Authorization check:** Verifikasi bahwa `userId` target berada dalam subtree hierarki Komandan via `path LIKE`.

#### Query Params (untuk riwayat assignment)

| Param       | Type    | Default    | Keterangan                                              |
|-------------|---------|------------|---------------------------------------------------------|
| `status`    | string  | -          | Filter: `belum_dikerjakan`, `selesai`, `terlambat`     |
| `orderType` | string  | -          | Filter jenis perintah                                   |
| `startDate` | date    | -          | Rentang tanggal                                         |
| `endDate`   | date    | -          | Rentang tanggal                                         |
| `sortBy`    | string  | `deadline` | `deadline` / `status` / `submittedAt`                  |
| `sortOrder` | string  | `desc`     | `asc` / `desc`                                          |
| `page`      | integer | `1`        | Paginasi riwayat perintah                               |
| `limit`     | integer | `20`       | -                                                       |

#### Response 200 OK

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-user-001",
      "fullName": "Sersan Budi Santoso",
      "username": "budi_santoso",
      "nip": "1234567890",
      "unit": {
        "id": "uuid-kompi-a",
        "name": "Kompi A",
        "path": "/uuid-root/uuid-batalyon/uuid-kompi-a/"
      },
      "joinedAt": "2025-03-12T00:00:00Z"
    },
    "socialAccounts": [
      {
        "id": "uuid-sa-001",
        "platform": "instagram",
        "platformLabel": "Instagram",
        "username": "@budi_santoso",
        "profileUrl": "https://instagram.com/budi_santoso",
        "notes": "Akun utama"
      }
    ],
    "assignmentSummary": {
      "total": 25,
      "totalDone": 22,
      "totalLate": 2,
      "totalPending": 1
    },
    "assignments": [
      {
        "id": "uuid-assignment-001",
        "status": "selesai",
        "completedAt": "2026-06-16T14:22:00Z",
        "order": {
          "id": "uuid-order-001",
          "title": "Serbu Postingan @target123",
          "orderType": "counter",
          "deadline": "2026-06-16T17:00:00Z"
        },
        "latestSubmission": {
          "driveLink": "https://drive.google.com/file/d/abc123",
          "isLate": false,
          "submittedAt": "2026-06-16T14:22:00Z"
        }
      }
    ]
  },
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 }
  },
  "timestamp": "2026-06-16T10:00:00Z"
}
```

#### Error Responses

| Status | Code               | Message                                    |
|--------|--------------------|--------------------------------------------|
| 403    | `OUT_OF_HIERARCHY` | User ini bukan dalam lingkup hierarki kamu |

---

## 7. Data Models / Schema Reference

### 7.1 UserResponse

| Field               | Type      | Keterangan                                            |
|---------------------|-----------|-------------------------------------------------------|
| `id`                | uuid      | Primary key (dari Better Auth `user.id`)              |
| `username`          | string    | Username unik (dari Better Auth username plugin)      |
| `fullName`          | string    | Nama lengkap (mapped dari Better Auth `user.name`)    |
| `nip`               | string?   | Nomor identitas, nullable                             |
| `role`              | enum      | `super_admin` / `member`                              |
| `isCommander`       | boolean   | True jika memimpin minimal 1 satuan aktif             |
| `isLocked`          | boolean   | True jika `lockedUntil` > NOW()                       |
| `lastLoginAt`       | datetime? | Waktu login terakhir                                  |
| `createdAt`         | datetime  | Waktu akun dibuat                                     |

### 7.2 SessionInfo (Better Auth)

| Field       | Type     | Keterangan                                   |
|-------------|----------|----------------------------------------------|
| `id`        | string   | Session ID                                   |
| `userId`    | string   | Referensi ke `user.id`                       |
| `expiresAt` | datetime | Waktu session kadaluarsa (7 hari dari login) |
| `token`     | string   | Session token (tidak perlu disimpan client)  |

### 7.3 OrderResponse

| Field                | Type      | Keterangan                                                |
|----------------------|-----------|-----------------------------------------------------------|
| `id`                 | uuid      | Primary key                                               |
| `title`              | string    | Judul perintah                                            |
| `orderType`          | enum      | `posting` / `engagement` / `blasting` / `counter` / `report_akun` |
| `orderTypeLabel`     | string    | Label display                                             |
| `description`        | string    | Instruksi lengkap                                         |
| `targetUrl`          | string    | URL target                                                |
| `narration`          | string?   | Narasi (posting & counter)                                |
| `engagementActions`  | array?    | `["like","share","repost"]`                               |
| `reportReason`       | string?   | Alasan report                                             |
| `status`             | enum      | `draft` / `aktif` / `selesai` / `expired` / `dibatalkan` |
| `deadline`           | datetime  | Batas waktu                                               |
| `hoursUntilDeadline` | integer?  | Jam tersisa (null jika sudah lewat)                       |
| `isNearDeadline`     | boolean   | True jika deadline < 24 jam                               |
| `sentAt`             | datetime? | Waktu dikirim (null jika draft)                           |
| `createdBy`          | object    | Data Komandan pembuat                                     |
| `progress`           | object    | Stats progress assignment                                 |

### 7.4 AssignmentResponse

| Field              | Type      | Keterangan                                        |
|--------------------|-----------|---------------------------------------------------|
| `id`               | uuid      | Primary key                                       |
| `status`           | enum      | `belum_dikerjakan` / `selesai` / `terlambat`     |
| `statusLabel`      | string    | Label status                                      |
| `assignedAt`       | datetime  | Waktu assignment dibuat                           |
| `completedAt`      | datetime? | Waktu status berubah ke selesai/terlambat         |
| `order`            | object    | Data perintah terkait                             |
| `user`             | object    | Data anggota (hanya endpoint Komandan)            |
| `unit`             | object    | Data satuan anggota (hanya endpoint Komandan)     |
| `latestSubmission` | object?   | Submission terbaru (null jika belum submit)       |

### 7.5 SubmissionResponse

| Field         | Type      | Keterangan                         |
|---------------|-----------|------------------------------------|
| `id`          | uuid      | Primary key                        |
| `assignmentId`| uuid      | FK ke task_assignments             |
| `driveLink`   | string    | URL Google Drive                   |
| `notes`       | string?   | Catatan tambahan                   |
| `isLatest`    | boolean   | True = submission terbaru aktif    |
| `isLate`      | boolean   | True = submit setelah deadline     |
| `submittedAt` | datetime  | Waktu submit                       |

### 7.6 SocialAccountResponse

| Field          | Type      | Keterangan                                                   |
|----------------|-----------|--------------------------------------------------------------|
| `id`           | uuid      | Primary key                                                  |
| `platform`     | enum      | `instagram` / `twitter_x` / `facebook` / `tiktok` / `youtube` / `other` |
| `platformLabel`| string    | Label display ("Instagram", "Twitter / X", dll.)             |
| `username`     | string    | Username/handle                                              |
| `profileUrl`   | string?   | URL profil                                                   |
| `notes`        | string?   | Catatan                                                      |
| `createdAt`    | datetime  | Waktu didaftarkan                                            |

### 7.7 ProgressResponse

| Field                | Type    | Keterangan                              |
|----------------------|---------|-----------------------------------------|
| `totalAssigned`      | integer | Total anggota yang menerima assignment  |
| `totalSubmitted`     | integer | Total yang sudah submit                 |
| `totalOnTime`        | integer | Submit tepat waktu                      |
| `totalLate`          | integer | Submit terlambat                        |
| `totalPending`       | integer | Belum submit sama sekali                |
| `percentageComplete` | float   | `(totalSubmitted / totalAssigned) × 100`|

---

## 8. Pola Authorization di Route Handler

Setiap Route Handler mengikuti pola standar berikut:

```typescript
// Pola standar Route Handler (src/app/api/v1/orders/route.ts)
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { successResponse, errorResponse, unauthorized, forbidden } from "@/lib/helpers/response"
import { isInHierarchy } from "@/lib/helpers/permissions"

export async function GET(req: NextRequest) {
  // 1. Ambil session dari cookie (dikelola Better Auth)
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return unauthorized()

  // 2. Cek role jika diperlukan
  if (session.user.role !== "member") return forbidden()

  // 3. Parse & validasi query params
  const { searchParams } = new URL(req.url)
  // ... parse params dengan Zod

  // 4. Query database
  const orders = await db.order.findMany({
    where: { createdBy: session.user.id, deletedAt: null },
  })

  // 5. Return response
  return successResponse({ data: orders })
}
```

**Helper `isInHierarchy` untuk validasi scope:**

```typescript
// src/lib/helpers/permissions.ts
export async function isInHierarchy(
  commanderUserId: string,
  targetUserId: string
): Promise<boolean> {
  const commander = await db.user.findUnique({
    where: { id: commanderUserId },
    include: { commandingUnits: { select: { path: true } } }
  })
  if (!commander?.commandingUnits.length) return false

  const commanderPaths = commander.commandingUnits.map(u => u.path)

  const targetMembership = await db.unitMember.findFirst({
    where: {
      userId: targetUserId,
      removedAt: null,
      unit: {
        OR: commanderPaths.map(path => ({
          path: { startsWith: path }
        }))
      }
    }
  })

  return !!targetMembership
}
```

---

## 9. Endpoint Summary Table

| Method | Endpoint                                             | Summary                                    | Auth              |
|--------|------------------------------------------------------|--------------------------------------------|-------------------|
| POST   | `/api/auth/sign-in/username`                         | Login (Better Auth)                        | Public            |
| POST   | `/api/auth/sign-out`                                 | Logout (Better Auth)                       | Cookie session    |
| GET    | `/api/auth/get-session`                              | Ambil session aktif (Better Auth)          | Cookie session    |
| POST   | `/api/auth/change-password`                          | Ganti password (Better Auth)               | Cookie session    |
| POST   | `/api/auth/revoke-session`                           | Cabut satu session (Better Auth)           | Cookie session    |
| POST   | `/api/auth/revoke-sessions`                          | Cabut semua session (Better Auth)          | Cookie session    |
| GET    | `/api/v1/auth/me`                                    | Profil lengkap user (custom)               | Cookie session    |
| POST   | `/api/v1/auth/admin/unlock-user`                     | Buka kunci akun user                       | Admin             |
| PATCH  | `/api/v1/auth/admin/reset-password`                  | Reset password user                        | Admin             |
| GET    | `/api/v1/units`                                      | Tree organisasi                            | Admin             |
| POST   | `/api/v1/units`                                      | Buat satuan baru                           | Admin             |
| GET    | `/api/v1/units/:unitId`                              | Detail satuan                              | Admin             |
| PATCH  | `/api/v1/units/:unitId`                              | Update satuan                              | Admin             |
| DELETE | `/api/v1/units/:unitId`                              | Hapus satuan                               | Admin             |
| POST   | `/api/v1/units/:unitId/members`                      | Assign user ke satuan                      | Admin             |
| PATCH  | `/api/v1/units/:unitId/members/:userId/transfer`     | Pindah anggota ke satuan lain              | Admin             |
| GET    | `/api/v1/users`                                      | Daftar user                                | Admin             |
| POST   | `/api/v1/users`                                      | Buat user baru                             | Admin             |
| GET    | `/api/v1/users/:userId`                              | Detail user                                | Admin             |
| PATCH  | `/api/v1/users/:userId`                              | Update user                                | Admin             |
| DELETE | `/api/v1/users/:userId`                              | Nonaktifkan user                           | Admin             |
| GET    | `/api/v1/users/:userId/social-accounts`              | Lihat sosmed anggota                       | Komandan          |
| GET    | `/api/v1/social-accounts`                            | Daftar sosmed sendiri                      | Semua member      |
| POST   | `/api/v1/social-accounts`                            | Daftarkan sosmed baru                      | Semua member      |
| PATCH  | `/api/v1/social-accounts/:id`                        | Update sosmed                              | Pemilik / Admin   |
| DELETE | `/api/v1/social-accounts/:id`                        | Hapus sosmed                               | Pemilik / Admin   |
| GET    | `/api/v1/orders`                                     | Daftar perintah dibuat                     | Komandan          |
| POST   | `/api/v1/orders`                                     | Buat perintah baru                         | Komandan          |
| GET    | `/api/v1/orders/:orderId`                            | Detail perintah                            | Komandan          |
| PATCH  | `/api/v1/orders/:orderId`                            | Update draft perintah                      | Komandan          |
| POST   | `/api/v1/orders/:orderId/send`                       | Kirim draft perintah                       | Komandan          |
| POST   | `/api/v1/orders/:orderId/cancel`                     | Batalkan perintah aktif                    | Komandan          |
| GET    | `/api/v1/orders/:orderId/assignments`                | Progress semua anggota                     | Komandan          |
| GET    | `/api/v1/orders/:orderId/assignments/by-unit`        | Progress per satuan (tree)                 | Komandan          |
| GET    | `/api/v1/orders/:orderId/assignments/export`         | Export progress ke Excel                   | Komandan          |
| GET    | `/api/v1/assignments/me`                             | Perintah yang diterima                     | Semua member      |
| GET    | `/api/v1/assignments/me/:assignmentId`               | Detail satu assignment                     | Semua member      |
| POST   | `/api/v1/assignments/me/:assignmentId/submit`        | Submit bukti pelaksanaan                   | Semua member      |
| GET    | `/api/v1/dashboard/commander`                        | Dashboard Komandan                         | Komandan          |
| GET    | `/api/v1/dashboard/member`                           | Dashboard Anggota                          | Semua member      |
| GET    | `/api/v1/dashboard/admin`                            | Dashboard Admin                            | Admin             |
| GET    | `/api/v1/notifications`                              | Daftar notifikasi operasional              | Cookie session    |
| GET    | `/api/v1/notifications/summary`                      | Ringkasan notifikasi                       | Cookie session    |
| POST   | `/api/v1/notifications/mark-all-read`                | Tandai notifikasi dibaca                   | Cookie session    |
| GET    | `/api/v1/commander/members`                          | Daftar anggota dalam hierarki              | Komandan          |
| GET    | `/api/v1/commander/members/by-unit`                  | Anggota per satuan (tree)                  | Komandan          |
| GET    | `/api/v1/commander/members/:userId`                  | Profil anggota + riwayat perintah          | Komandan          |

**Total: 6 endpoint Better Auth + 41 endpoint custom = 47 endpoint**

---

## 10. Perbandingan v1.0 vs v1.1

| Aspek                   | v1.0 (lama)                             | v1.1 (Better Auth)                              |
|-------------------------|-----------------------------------------|-------------------------------------------------|
| **Auth endpoint prefix**| `/api/v1/auth/login`                    | `/api/auth/sign-in/username`                    |
| **Autentikasi**         | `Authorization: Bearer <jwt_token>`     | Cookie HTTP-only otomatis (`komando.session_token`) |
| **Login method**        | Custom Route Handler                    | Better Auth handler via `toNextJsHandler(auth)` |
| **Token storage**       | Client menyimpan token (localStorage/state) | Cookie HTTP-only, tidak perlu disimpan client |
| **Session management**  | Validasi JWT manual di setiap handler   | `auth.api.getSession({ headers })` di setiap handler |
| **Password hash**       | bcrypt (manual)                         | scrypt (Better Auth default, lebih kuat)        |
| **Logout**              | `POST /api/v1/auth/logout`              | `POST /api/auth/sign-out`                       |
| **Ganti password**      | `PATCH /api/v1/auth/change-password`    | `POST /api/auth/change-password`                |
| **Get session**         | `GET /api/v1/auth/me` (partial)         | `GET /api/auth/get-session` (Better Auth) + `GET /api/v1/auth/me` (custom, data lengkap) |
| **Rate limit auth**     | Custom middleware                       | Better Auth `rateLimit` config                  |
| **CSRF protection**     | Manual                                  | Bawaan Better Auth (origin check + SameSite)    |
| **Credentials di fetch**| Tidak perlu                             | Wajib `credentials: 'include'` di semua fetch  |
