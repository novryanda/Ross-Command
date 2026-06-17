# Seed Data Document
# KOMANDO CENTER — Social Media Command Management System

---

| Field         | Detail                                              |
|---------------|-----------------------------------------------------|
| **Dokumen**   | Seed Data Specification & Implementation            |
| **Versi**     | v1.0                                                |
| **Tanggal**   | 16 Juni 2026                                        |
| **Author**    | System Analyst                                      |
| **Status**    | Draft                                               |
| **Referensi** | ERD v1.0 · API Spec v1.1 · PRD v1.0                |

### Revision History

| Versi | Tanggal    | Deskripsi              | Author         |
|-------|------------|------------------------|----------------|
| v1.0  | 16-06-2026 | Initial seed document  | System Analyst |

---

## 1. Tujuan Seed Data

Seed data ini digunakan untuk:

1. **Development** — tersedia data realistis saat pengembangan fitur sehingga developer tidak perlu buat data manual
2. **Testing** — semua skenario use case dapat diuji dengan data yang sudah tersedia (assignment pending, submission selesai, submission terlambat, dll.)
3. **Demo / UAT** — stakeholder dapat melihat tampilan sistem yang sudah terisi data nyata

---

## 2. Prinsip Penting — Pembuatan User dengan Better Auth

> ⚠️ **KRITIS**: User **TIDAK BOLEH** dibuat langsung via `prisma.user.create()` biasa.

Karena sistem menggunakan **Better Auth dengan username plugin**, pembuatan user harus melalui `auth.api.createUser()` agar:

- Password di-hash menggunakan **scrypt** (bukan bcrypt) — algoritma hash default Better Auth
- Record tabel `user` (Better Auth) dan tabel `account` (username plugin) dibuat secara bersamaan dan konsisten
- Field internal Better Auth (seperti `emailVerified`, `updatedAt`) terisi dengan benar

### 2.1 Cara Benar Membuat User di Seed

```typescript
// ✅ BENAR — melalui Better Auth API
await auth.api.createUser({
  body: {
    name: "Sersan Budi Santoso",   // → user.name di tabel Better Auth
    email: `budi_santoso@internal.komando`, // dummy email (required by Better Auth)
    username: "budi_santoso",      // → dari username plugin
    password: "Password123!",      // Better Auth hash dengan scrypt otomatis
    role: "member",                // custom field di user.additionalFields
  },
})

// ❌ SALAH — bypass Better Auth, password tidak di-hash dengan benar
await prisma.user.create({
  data: {
    name: "Budi",
    password: "Password123!", // plaintext! TIDAK AMAN
  },
})
```

### 2.2 Konvensi Email Dummy

Karena sistem Komando Center tidak menggunakan email sebagai identifier login (menggunakan username), field `email` di tabel Better Auth diisi dengan email dummy dalam format:

```
{username}@internal.komando
```

Contoh: username `budi_santoso` → email dummy `budi_santoso@internal.komando`

---

## 3. Struktur Hierarki Organisasi (Seed)

Seed data menggunakan struktur militer 3-level sebagai contoh:

```
🏢 KOMANDO PUSAT (Level 0 — Root)
│   Komandan: Jenderal Ahmad Wiranto
│
├── 🏢 BATALYON ALPHA (Level 1)
│   │  Komandan: Kolonel Budi Hartono
│   │
│   ├── 🏢 KOMPI A (Level 2)
│   │   │  Komandan: Kapten Sari Dewi
│   │   ├── 👤 Sersan Budi Santoso
│   │   ├── 👤 Kopral Andi Kurnia
│   │   ├── 👤 Prajurit Deni Pratama
│   │   └── 👤 Prajurit Eko Saputro
│   │
│   └── 🏢 KOMPI B (Level 2)
│       │  Komandan: Kapten Rudi Hermawan
│       ├── 👤 Sersan Tono Wijaya
│       ├── 👤 Kopral Yudi Prasetyo
│       └── 👤 Prajurit Agus Setiawan
│
└── 🏢 BATALYON BETA (Level 1)
    │  Komandan: Kolonel Hendra Kusuma
    │
    └── 🏢 KOMPI C (Level 2)
        │  Komandan: Kapten Lisa Amelia
        ├── 👤 Sersan Wahyu Nugroho
        └── 👤 Kopral Rina Marlina
```

---

## 4. Data Seed Lengkap

### 4.1 Daftar User

| No | Nama Lengkap           | Username          | Password        | Role        | Posisi dalam Hierarki                    | NIP          |
|----|------------------------|-------------------|-----------------|-------------|------------------------------------------|--------------|
| 1  | Super Admin Sistem     | `superadmin`      | `Admin@1234!`   | super_admin | Luar hierarki — pengelola sistem         | -            |
| 2  | Jenderal Ahmad Wiranto | `jend_ahmad`      | `Jenderal@123!` | member      | Komandan Komando Pusat (root)            | `NIP0000001` |
| 3  | Kolonel Budi Hartono   | `kol_budi`        | `Kolonel@123!`  | member      | Komandan Batalyon Alpha                  | `NIP0000002` |
| 4  | Kolonel Hendra Kusuma  | `kol_hendra`      | `Kolonel@123!`  | member      | Komandan Batalyon Beta                   | `NIP0000003` |
| 5  | Kapten Sari Dewi       | `kpt_sari`        | `Kapten@123!`   | member      | Komandan Kompi A (anggota Batalyon Alpha)| `NIP0000004` |
| 6  | Kapten Rudi Hermawan   | `kpt_rudi`        | `Kapten@123!`   | member      | Komandan Kompi B (anggota Batalyon Alpha)| `NIP0000005` |
| 7  | Kapten Lisa Amelia     | `kpt_lisa`        | `Kapten@123!`   | member      | Komandan Kompi C (anggota Batalyon Beta) | `NIP0000006` |
| 8  | Sersan Budi Santoso    | `budi_santoso`    | `Anggota@123!`  | member      | Anggota Kompi A                          | `NIP0000007` |
| 9  | Kopral Andi Kurnia     | `andi_kurnia`     | `Anggota@123!`  | member      | Anggota Kompi A                          | `NIP0000008` |
| 10 | Prajurit Deni Pratama  | `deni_pratama`    | `Anggota@123!`  | member      | Anggota Kompi A                          | `NIP0000009` |
| 11 | Prajurit Eko Saputro   | `eko_saputro`     | `Anggota@123!`  | member      | Anggota Kompi A                          | `NIP0000010` |
| 12 | Sersan Tono Wijaya     | `tono_wijaya`     | `Anggota@123!`  | member      | Anggota Kompi B                          | `NIP0000011` |
| 13 | Kopral Yudi Prasetyo   | `yudi_prasetyo`   | `Anggota@123!`  | member      | Anggota Kompi B                          | `NIP0000012` |
| 14 | Prajurit Agus Setiawan | `agus_setiawan`   | `Anggota@123!`  | member      | Anggota Kompi B                          | `NIP0000013` |
| 15 | Sersan Wahyu Nugroho   | `wahyu_nugroho`   | `Anggota@123!`  | member      | Anggota Kompi C                          | `NIP0000014` |
| 16 | Kopral Rina Marlina    | `rina_marlina`    | `Anggota@123!`  | member      | Anggota Kompi C                          | `NIP0000015` |

### 4.2 Daftar Satuan

| No | Nama               | Parent           | Level | Path                                         | Komandan        |
|----|--------------------|------------------|-------|----------------------------------------------|-----------------|
| 1  | Komando Pusat      | -                | 0     | `/{id-komando-pusat}/`                       | jend_ahmad      |
| 2  | Batalyon Alpha     | Komando Pusat    | 1     | `/{id-komando}/{id-batalyon-alpha}/`         | kol_budi        |
| 3  | Batalyon Beta      | Komando Pusat    | 1     | `/{id-komando}/{id-batalyon-beta}/`          | kol_hendra      |
| 4  | Kompi A            | Batalyon Alpha   | 2     | `/{id-komando}/{id-ba}/{id-kompi-a}/`        | kpt_sari        |
| 5  | Kompi B            | Batalyon Alpha   | 2     | `/{id-komando}/{id-ba}/{id-kompi-b}/`        | kpt_rudi        |
| 6  | Kompi C            | Batalyon Beta    | 2     | `/{id-komando}/{id-bb}/{id-kompi-c}/`        | kpt_lisa        |

### 4.3 Daftar Akun Sosial Media

| User           | Platform   | Username               | URL Profil                               |
|----------------|------------|------------------------|------------------------------------------|
| budi_santoso   | instagram  | @budi_santoso          | https://instagram.com/budi_santoso       |
| budi_santoso   | twitter_x  | @budi_tw               | https://twitter.com/budi_tw              |
| andi_kurnia    | instagram  | @andi.kurnia           | https://instagram.com/andi.kurnia        |
| andi_kurnia    | tiktok     | @andi_tiktok           | https://tiktok.com/@andi_tiktok          |
| deni_pratama   | instagram  | @deni_prtm             | https://instagram.com/deni_prtm          |
| tono_wijaya    | instagram  | @tono.wijaya           | https://instagram.com/tono.wijaya        |
| tono_wijaya    | facebook   | Tono Wijaya            | https://facebook.com/tono.wijaya         |
| yudi_prasetyo  | twitter_x  | @yudi_pras             | https://twitter.com/yudi_pras            |
| wahyu_nugroho  | instagram  | @wahyu_ngrh            | https://instagram.com/wahyu_ngrh         |
| wahyu_nugroho  | tiktok     | @wahyu.nugroho         | https://tiktok.com/@wahyu.nugroho        |
| rina_marlina   | instagram  | @rina_marlina          | https://instagram.com/rina_marlina       |

> `eko_saputro` dan `agus_setiawan` sengaja tidak mendaftarkan akun sosmed untuk mensimulasikan skenario "belum daftarkan akun sosmed".

### 4.4 Daftar Perintah (Orders)

| No | Judul                               | Jenis       | Pembuat    | Target            | Deadline (relatif) | Status    |
|----|-------------------------------------|-------------|------------|-------------------|--------------------|-----------|
| 1  | Serbu Postingan @target_akun        | komentar    | kol_budi   | Batalyon Alpha    | +3 jam dari now    | aktif     |
| 2  | Like & Share Postingan Resmi        | engagement  | kol_budi   | Batalyon Alpha    | +25 jam dari now   | aktif     |
| 3  | Upload Konten Kampanye Juni         | posting     | jend_ahmad | Komando Pusat     | -2 hari (lampau)   | expired   |
| 4  | Report Akun Penyebar Hoaks          | report_akun | kol_hendra | Batalyon Beta     | +48 jam dari now   | aktif     |
| 5  | Komentar Positif Kebijakan Baru     | komentar    | kpt_sari   | Kompi A           | -1 hari (lampau)   | expired   |
| 6  | Draft — Rencana Operasi Berikutnya  | posting     | kol_budi   | -                 | +7 hari dari now   | draft     |

### 4.5 Skenario Assignment & Submission

Skenario ini dirancang untuk memungkinkan testing semua state:

**Perintah 1 — Serbu Postingan @target_akun (AKTIF, deadline mepet):**

| Anggota        | Status              | Link Drive                                    | Keterangan             |
|----------------|---------------------|-----------------------------------------------|------------------------|
| budi_santoso   | selesai             | https://drive.google.com/file/d/seed-sub-001  | Submit tepat waktu     |
| andi_kurnia    | selesai             | https://drive.google.com/file/d/seed-sub-002  | Submit tepat waktu     |
| deni_pratama   | belum_dikerjakan    | -                                             | Belum submit           |
| eko_saputro    | belum_dikerjakan    | -                                             | Belum submit           |
| tono_wijaya    | selesai             | https://drive.google.com/file/d/seed-sub-003  | Submit tepat waktu     |
| yudi_prasetyo  | belum_dikerjakan    | -                                             | Belum submit           |
| agus_setiawan  | belum_dikerjakan    | -                                             | Belum submit           |

**Perintah 3 — Upload Konten Kampanye Juni (EXPIRED):**

| Anggota        | Status    | Link Drive                                    | Keterangan              |
|----------------|-----------|-----------------------------------------------|-------------------------|
| budi_santoso   | selesai   | https://drive.google.com/file/d/seed-sub-004  | Submit tepat waktu      |
| andi_kurnia    | terlambat | https://drive.google.com/file/d/seed-sub-005  | Submit setelah deadline |
| deni_pratama   | terlambat | https://drive.google.com/file/d/seed-sub-006  | Submit setelah deadline |
| eko_saputro    | belum_dikerjakan | -                                       | Tidak pernah submit     |
| wahyu_nugroho  | selesai   | https://drive.google.com/file/d/seed-sub-007  | Submit tepat waktu      |
| rina_marlina   | selesai   | https://drive.google.com/file/d/seed-sub-008  | Submit tepat waktu      |

**Perintah 5 — Komentar Positif Kebijakan Baru (EXPIRED, Kompi A saja):**

| Anggota        | Status    | Link Drive                                    | Keterangan              |
|----------------|-----------|-----------------------------------------------|-------------------------|
| budi_santoso   | selesai   | https://drive.google.com/file/d/seed-sub-009  | Submit tepat waktu      |
| andi_kurnia    | selesai   | https://drive.google.com/file/d/seed-sub-010  | Submit tepat waktu      |
| deni_pratama   | belum_dikerjakan | -                                       | Tidak pernah submit     |
| eko_saputro    | terlambat | https://drive.google.com/file/d/seed-sub-011  | Submit setelah deadline |

---

## 5. Implementasi Seed Script

### 5.1 Setup & Instalasi

```bash
# Di root project
pnpm add -D tsx
```

Buat file seed di:
```
prisma/
└── seed.ts
```

Tambahkan script di `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Jalankan seed:
```bash
npx prisma db seed
```

Atau reset + seed sekaligus:
```bash
npx prisma migrate reset
# (migrate reset otomatis menjalankan seed setelah reset)
```

---

### 5.2 File: `prisma/seed.ts`

```typescript
/**
 * KOMANDO CENTER — Seed Data
 *
 * PENTING: User dibuat melalui auth.api.createUser() bukan prisma.user.create()
 * agar password di-hash dengan scrypt (Better Auth default) dan tabel `account`
 * dari username plugin dibuat secara konsisten.
 *
 * Urutan seed:
 * 1. Users (via Better Auth API)
 * 2. Units (satuan hierarki — parent dulu, anak kemudian)
 * 3. Unit Members (assign user ke satuan)
 * 4. Social Accounts
 * 5. Orders (perintah)
 * 6. Task Assignments (broadcast manual untuk seed)
 * 7. Submissions (bukti pelaksanaan)
 */

import { PrismaClient } from "@/generated/prisma/client"
import { auth } from "@/lib/auth"

const db = new PrismaClient()

// ─────────────────────────────────────────────
// HELPER — buat user via Better Auth API
// Mengembalikan id user yang baru dibuat
// ─────────────────────────────────────────────
async function createUser(params: {
  username: string
  fullName: string
  password: string
  role: "super_admin" | "member"
  nip?: string
}): Promise<string> {
  const { username, fullName, password, role, nip } = params

  // Email dummy wajib karena Better Auth membutuhkannya secara internal
  // Format: {username}@internal.komando
  const dummyEmail = `${username}@internal.komando`

  const result = await auth.api.createUser({
    body: {
      name: fullName,
      email: dummyEmail,
      username,
      password,    // Better Auth hash dengan scrypt secara otomatis
      role,
      ...(nip ? { nip } : {}),
    },
  })

  if (!result?.user?.id) {
    throw new Error(`Gagal membuat user: ${username}`)
  }

  console.log(`  ✅ User dibuat: ${username} (${fullName})`)
  return result.user.id
}

// ─────────────────────────────────────────────
// HELPER — buat satuan dan hitung path otomatis
// ─────────────────────────────────────────────
async function createUnit(params: {
  name: string
  description?: string
  parentId?: string | null
  commanderId?: string | null
}): Promise<{ id: string; path: string; depthLevel: number }> {
  const { name, description, parentId, commanderId } = params

  let depthLevel = 0
  let parentPath = "/"

  // Jika ada parent, ambil path dan level parent
  if (parentId) {
    const parent = await db.unit.findUnique({
      where: { id: parentId },
      select: { path: true, depthLevel: true },
    })
    if (!parent) throw new Error(`Parent unit tidak ditemukan: ${parentId}`)
    parentPath = parent.path
    depthLevel = parent.depthLevel + 1
  }

  // Buat satuan dulu (tanpa path, untuk dapat id-nya)
  const unit = await db.unit.create({
    data: {
      name,
      description: description ?? null,
      parentId: parentId ?? null,
      commanderId: commanderId ?? null,
      depthLevel,
      path: "TEMP", // Placeholder — diupdate setelah dapat id
    },
  })

  // Update path dengan format: {parentPath}{unit.id}/
  const finalPath = `${parentPath}${unit.id}/`
  await db.unit.update({
    where: { id: unit.id },
    data: { path: finalPath },
  })

  console.log(`  ✅ Satuan dibuat: ${name} (level ${depthLevel}, path: ${finalPath})`)
  return { id: unit.id, path: finalPath, depthLevel }
}

// ─────────────────────────────────────────────
// HELPER — waktu relatif dari sekarang
// ─────────────────────────────────────────────
function hoursFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

// ─────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────
async function main() {
  console.log("🌱 Memulai seed data Komando Center...\n")

  // ─────────────────────────────────────────
  // STEP 1: BUAT SEMUA USER
  // ─────────────────────────────────────────
  console.log("📋 STEP 1: Membuat user...")

  const superAdminId = await createUser({
    username: "superadmin",
    fullName: "Super Admin Sistem",
    password: "Admin@1234!",
    role: "super_admin",
  })

  const jendAhmadId = await createUser({
    username: "jend_ahmad",
    fullName: "Jenderal Ahmad Wiranto",
    password: "Jenderal@123!",
    role: "member",
    nip: "NIP0000001",
  })

  const kolBudiId = await createUser({
    username: "kol_budi",
    fullName: "Kolonel Budi Hartono",
    password: "Kolonel@123!",
    role: "member",
    nip: "NIP0000002",
  })

  const kolHendraId = await createUser({
    username: "kol_hendra",
    fullName: "Kolonel Hendra Kusuma",
    password: "Kolonel@123!",
    role: "member",
    nip: "NIP0000003",
  })

  const kptSariId = await createUser({
    username: "kpt_sari",
    fullName: "Kapten Sari Dewi",
    password: "Kapten@123!",
    role: "member",
    nip: "NIP0000004",
  })

  const kptRudiId = await createUser({
    username: "kpt_rudi",
    fullName: "Kapten Rudi Hermawan",
    password: "Kapten@123!",
    role: "member",
    nip: "NIP0000005",
  })

  const kptLisaId = await createUser({
    username: "kpt_lisa",
    fullName: "Kapten Lisa Amelia",
    password: "Kapten@123!",
    role: "member",
    nip: "NIP0000006",
  })

  const budiSantosoId = await createUser({
    username: "budi_santoso",
    fullName: "Sersan Budi Santoso",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000007",
  })

  const andiKurniaId = await createUser({
    username: "andi_kurnia",
    fullName: "Kopral Andi Kurnia",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000008",
  })

  const deniPratamaId = await createUser({
    username: "deni_pratama",
    fullName: "Prajurit Deni Pratama",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000009",
  })

  const ekoSaputroId = await createUser({
    username: "eko_saputro",
    fullName: "Prajurit Eko Saputro",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000010",
  })

  const tonoWijayaId = await createUser({
    username: "tono_wijaya",
    fullName: "Sersan Tono Wijaya",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000011",
  })

  const yudiPrasetyoId = await createUser({
    username: "yudi_prasetyo",
    fullName: "Kopral Yudi Prasetyo",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000012",
  })

  const agusSetiawanId = await createUser({
    username: "agus_setiawan",
    fullName: "Prajurit Agus Setiawan",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000013",
  })

  const wahyuNugrohoId = await createUser({
    username: "wahyu_nugroho",
    fullName: "Sersan Wahyu Nugroho",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000014",
  })

  const rinaMarlinaId = await createUser({
    username: "rina_marlina",
    fullName: "Kopral Rina Marlina",
    password: "Anggota@123!",
    role: "member",
    nip: "NIP0000015",
  })

  // ─────────────────────────────────────────
  // STEP 2: BUAT SATUAN (urutan: parent → child)
  // ─────────────────────────────────────────
  console.log("\n🏢 STEP 2: Membuat struktur satuan...")

  // Level 0 — Root
  const komandoPusat = await createUnit({
    name: "Komando Pusat",
    description: "Satuan induk tertinggi",
    parentId: null,
    commanderId: jendAhmadId,
  })

  // Level 1 — Batalyon
  const batayonAlpha = await createUnit({
    name: "Batalyon Alpha",
    description: "Batalyon sektor utara",
    parentId: komandoPusat.id,
    commanderId: kolBudiId,
  })

  const batayonBeta = await createUnit({
    name: "Batalyon Beta",
    description: "Batalyon sektor selatan",
    parentId: komandoPusat.id,
    commanderId: kolHendraId,
  })

  // Level 2 — Kompi
  const kompiA = await createUnit({
    name: "Kompi A",
    description: "Kompi sektor barat",
    parentId: batayonAlpha.id,
    commanderId: kptSariId,
  })

  const kompiB = await createUnit({
    name: "Kompi B",
    description: "Kompi sektor timur",
    parentId: batayonAlpha.id,
    commanderId: kptRudiId,
  })

  const kompiC = await createUnit({
    name: "Kompi C",
    description: "Kompi sektor tengah",
    parentId: batayonBeta.id,
    commanderId: kptLisaId,
  })

  // ─────────────────────────────────────────
  // STEP 3: ASSIGN ANGGOTA KE SATUAN
  // ─────────────────────────────────────────
  console.log("\n👥 STEP 3: Assign anggota ke satuan...")

  // Komandan juga merupakan anggota dari satuan di atasnya
  // (kecuali jend_ahmad yang ada di root)
  const unitMembersData = [
    // Komandan sebagai anggota satuan masing-masing
    { unitId: komandoPusat.id, userId: jendAhmadId },
    { unitId: batayonAlpha.id, userId: kolBudiId },
    { unitId: batayonBeta.id, userId: kolHendraId },
    { unitId: kompiA.id, userId: kptSariId },
    { unitId: kompiB.id, userId: kptRudiId },
    { unitId: kompiC.id, userId: kptLisaId },
    // Anggota Kompi A
    { unitId: kompiA.id, userId: budiSantosoId },
    { unitId: kompiA.id, userId: andiKurniaId },
    { unitId: kompiA.id, userId: deniPratamaId },
    { unitId: kompiA.id, userId: ekoSaputroId },
    // Anggota Kompi B
    { unitId: kompiB.id, userId: tonoWijayaId },
    { unitId: kompiB.id, userId: yudiPrasetyoId },
    { unitId: kompiB.id, userId: agusSetiawanId },
    // Anggota Kompi C
    { unitId: kompiC.id, userId: wahyuNugrohoId },
    { unitId: kompiC.id, userId: rinaMarlinaId },
  ]

  await db.unitMember.createMany({
    data: unitMembersData.map((um) => ({
      unitId: um.unitId,
      userId: um.userId,
      joinedAt: new Date(),
    })),
  })
  console.log(`  ✅ ${unitMembersData.length} unit member berhasil di-assign`)

  // ─────────────────────────────────────────
  // STEP 4: BUAT AKUN SOSIAL MEDIA
  // ─────────────────────────────────────────
  console.log("\n📱 STEP 4: Membuat akun sosial media...")

  const socialAccountsData = [
    {
      userId: budiSantosoId,
      platform: "instagram",
      username: "@budi_santoso",
      profileUrl: "https://instagram.com/budi_santoso",
      notes: "Akun utama",
    },
    {
      userId: budiSantosoId,
      platform: "twitter_x",
      username: "@budi_tw",
      profileUrl: "https://twitter.com/budi_tw",
      notes: "Akun cadangan",
    },
    {
      userId: andiKurniaId,
      platform: "instagram",
      username: "@andi.kurnia",
      profileUrl: "https://instagram.com/andi.kurnia",
      notes: null,
    },
    {
      userId: andiKurniaId,
      platform: "tiktok",
      username: "@andi_tiktok",
      profileUrl: "https://tiktok.com/@andi_tiktok",
      notes: null,
    },
    {
      userId: deniPratamaId,
      platform: "instagram",
      username: "@deni_prtm",
      profileUrl: "https://instagram.com/deni_prtm",
      notes: null,
    },
    {
      userId: tonoWijayaId,
      platform: "instagram",
      username: "@tono.wijaya",
      profileUrl: "https://instagram.com/tono.wijaya",
      notes: null,
    },
    {
      userId: tonoWijayaId,
      platform: "facebook",
      username: "Tono Wijaya",
      profileUrl: "https://facebook.com/tono.wijaya",
      notes: null,
    },
    {
      userId: yudiPrasetyoId,
      platform: "twitter_x",
      username: "@yudi_pras",
      profileUrl: "https://twitter.com/yudi_pras",
      notes: null,
    },
    {
      userId: wahyuNugrohoId,
      platform: "instagram",
      username: "@wahyu_ngrh",
      profileUrl: "https://instagram.com/wahyu_ngrh",
      notes: null,
    },
    {
      userId: wahyuNugrohoId,
      platform: "tiktok",
      username: "@wahyu.nugroho",
      profileUrl: "https://tiktok.com/@wahyu.nugroho",
      notes: null,
    },
    {
      userId: rinaMarlinaId,
      platform: "instagram",
      username: "@rina_marlina",
      profileUrl: "https://instagram.com/rina_marlina",
      notes: null,
    },
  ]

  await db.socialAccount.createMany({ data: socialAccountsData })
  console.log(`  ✅ ${socialAccountsData.length} akun sosial media berhasil dibuat`)

  // ─────────────────────────────────────────
  // STEP 5: BUAT PERINTAH (ORDERS)
  // ─────────────────────────────────────────
  console.log("\n📋 STEP 5: Membuat perintah...")

  // Perintah 1 — AKTIF, deadline mepet (3 jam), Batalyon Alpha
  const order1 = await db.order.create({
    data: {
      createdBy: kolBudiId,
      title: "Serbu Postingan @target_akun",
      orderType: "komentar",
      description:
        "Segera kunjungi link target dan berikan komentar dengan narasi yang sudah ditentukan. " +
        "Gunakan narasi verbatim, jangan dimodifikasi.",
      targetUrl: "https://instagram.com/p/seed-target-post-001",
      narration:
        "Akun ini menyebarkan informasi yang tidak akurat dan menyesatkan masyarakat. " +
        "Harap waspada dan jangan percaya konten dari akun ini.",
      sentiment: "negative",
      engagementActions: null,
      reportReason: null,
      status: "aktif",
      deadline: hoursFromNow(3),
      sentAt: new Date(),
    },
  })

  // Perintah 2 — AKTIF, deadline besok, Batalyon Alpha
  const order2 = await db.order.create({
    data: {
      createdBy: kolBudiId,
      title: "Like & Share Postingan Resmi",
      orderType: "engagement",
      description:
        "Kunjungi link di bawah dan lakukan like, share, serta repost. " +
        "Pastikan semua akun sosmed kalian sudah melakukan ketiga aksi tersebut.",
      targetUrl: "https://instagram.com/p/seed-target-post-002",
      narration: null,
      sentiment: null,
      engagementActions: ["like", "share", "repost"],
      reportReason: null,
      status: "aktif",
      deadline: hoursFromNow(25),
      sentAt: new Date(),
    },
  })

  // Perintah 3 — EXPIRED, 2 hari lalu, Komando Pusat (semua anggota)
  const order3 = await db.order.create({
    data: {
      createdBy: jendAhmadId,
      title: "Upload Konten Kampanye Juni",
      orderType: "posting",
      description:
        "Upload konten kampanye Juni ke akun sosmed masing-masing. " +
        "Gunakan caption yang sudah disiapkan dan tambahkan hashtag yang ditentukan.",
      targetUrl: "https://drive.google.com/drive/folders/seed-konten-juni",
      narration:
        "Bersama membangun negeri yang lebih baik. Yuk dukung program pemerintah untuk kemajuan bersama! " +
        "#KampanyeJuni #BersamaKitaBisa #MajuBersama",
      sentiment: null,
      engagementActions: null,
      reportReason: null,
      status: "expired",
      deadline: daysAgo(2),
      sentAt: daysAgo(4),
    },
  })

  // Perintah 4 — AKTIF, Batalyon Beta
  const order4 = await db.order.create({
    data: {
      createdBy: kolHendraId,
      title: "Report Akun Penyebar Hoaks",
      orderType: "report_akun",
      description:
        "Lakukan report terhadap akun yang sudah disebutkan di link target. " +
        "Pilih alasan 'Informasi Palsu' saat melakukan report.",
      targetUrl: "https://instagram.com/seed_target_hoaks",
      narration: null,
      sentiment: null,
      engagementActions: null,
      reportReason: "Informasi Palsu / Hoaks",
      status: "aktif",
      deadline: hoursFromNow(48),
      sentAt: new Date(),
    },
  })

  // Perintah 5 — EXPIRED, 1 hari lalu, Kompi A saja
  const order5 = await db.order.create({
    data: {
      createdBy: kptSariId,
      title: "Komentar Positif Kebijakan Baru",
      orderType: "komentar",
      description:
        "Berikan komentar positif pada postingan kebijakan baru. " +
        "Gunakan narasi yang sudah disiapkan.",
      targetUrl: "https://twitter.com/status/seed-kebijakan-baru",
      narration:
        "Kebijakan ini sangat membantu masyarakat! Saya sangat mendukung langkah positif ini " +
        "untuk kemajuan bersama. Terima kasih atas kepeduliannya.",
      sentiment: "positive",
      engagementActions: null,
      reportReason: null,
      status: "expired",
      deadline: daysAgo(1),
      sentAt: daysAgo(2),
    },
  })

  // Perintah 6 — DRAFT, belum dikirim
  await db.order.create({
    data: {
      createdBy: kolBudiId,
      title: "Draft — Rencana Operasi Berikutnya",
      orderType: "posting",
      description: "Rancangan operasi untuk minggu depan. Belum final.",
      targetUrl: "https://instagram.com/p/seed-draft-target",
      narration: "Narasi yang masih dalam proses penulisan...",
      sentiment: null,
      engagementActions: null,
      reportReason: null,
      status: "draft",
      deadline: hoursFromNow(7 * 24),
      sentAt: null,
    },
  })

  console.log(`  ✅ 6 perintah berhasil dibuat (4 aktif/expired, 1 draft)`)

  // ─────────────────────────────────────────
  // STEP 6: BUAT ORDER TARGETS
  // Menyimpan record satuan mana yang jadi target per perintah
  // ─────────────────────────────────────────
  console.log("\n🎯 STEP 6: Membuat order targets...")

  await db.orderTarget.createMany({
    data: [
      // Order 1 — target Batalyon Alpha
      {
        orderId: order1.id,
        unitId: batayonAlpha.id,
        userId: null,
        targetType: "unit",
        resolvedMemberCount: 7, // kptSari + kptRudi + 4 anggota kompi A + 3 kompi B (tanpa komandan batalyon)
      },
      // Order 2 — target Batalyon Alpha
      {
        orderId: order2.id,
        unitId: batayonAlpha.id,
        userId: null,
        targetType: "unit",
        resolvedMemberCount: 7,
      },
      // Order 3 — target Komando Pusat (semua)
      {
        orderId: order3.id,
        unitId: komandoPusat.id,
        userId: null,
        targetType: "unit",
        resolvedMemberCount: 14, // semua anggota kecuali superadmin dan jend_ahmad sendiri
      },
      // Order 4 — target Batalyon Beta
      {
        orderId: order4.id,
        unitId: batayonBeta.id,
        userId: null,
        targetType: "unit",
        resolvedMemberCount: 3, // kptLisa + wahyu + rina
      },
      // Order 5 — target Kompi A
      {
        orderId: order5.id,
        unitId: kompiA.id,
        userId: null,
        targetType: "unit",
        resolvedMemberCount: 4, // kptSari + budi + andi + deni + eko
      },
    ],
  })
  console.log(`  ✅ Order targets berhasil dibuat`)

  // ─────────────────────────────────────────
  // STEP 7: BUAT TASK ASSIGNMENTS
  // Hasil broadcast — 1 record per anggota per perintah
  // ─────────────────────────────────────────
  console.log("\n📌 STEP 7: Membuat task assignments...")

  // Anggota Batalyon Alpha (target order 1 & 2):
  // kptSari, kptRudi, budi, andi, deni, eko, tono, yudi, agus
  const batayonAlphaMembers = [
    kptSariId, kptRudiId,
    budiSantosoId, andiKurniaId, deniPratamaId, ekoSaputroId,  // Kompi A
    tonoWijayaId, yudiPrasetyoId, agusSetiawanId,               // Kompi B
  ]

  // Anggota Batalyon Beta (target order 4):
  // kptLisa, wahyu, rina
  const batayonBetaMembers = [kptLisaId, wahyuNugrohoId, rinaMarlinaId]

  // Anggota Kompi A (target order 5):
  // kptSari, budi, andi, deni, eko
  const kompiAMembers = [kptSariId, budiSantosoId, andiKurniaId, deniPratamaId, ekoSaputroId]

  // Anggota semua (target order 3 — Komando Pusat):
  // Semua kecuali superadmin dan jend_ahmad (pembuat order)
  const semuaAnggota = [
    kolBudiId, kolHendraId,
    kptSariId, kptRudiId, kptLisaId,
    budiSantosoId, andiKurniaId, deniPratamaId, ekoSaputroId,
    tonoWijayaId, yudiPrasetyoId, agusSetiawanId,
    wahyuNugrohoId, rinaMarlinaId,
  ]

  // Status per skenario
  type AssignmentStatus = "belum_dikerjakan" | "selesai" | "terlambat"
  const statusMap: Record<string, Record<string, AssignmentStatus>> = {
    // Order 1 — Serbu Postingan (AKTIF, deadline mepet)
    [order1.id]: {
      [budiSantosoId]: "selesai",
      [andiKurniaId]: "selesai",
      [tonoWijayaId]: "selesai",
      // Sisanya: belum_dikerjakan (default)
    },
    // Order 3 — Upload Konten Kampanye Juni (EXPIRED)
    [order3.id]: {
      [budiSantosoId]: "selesai",
      [andiKurniaId]: "terlambat",
      [deniPratamaId]: "terlambat",
      [wahyuNugrohoId]: "selesai",
      [rinaMarlinaId]: "selesai",
      [kptSariId]: "selesai",
      [kptRudiId]: "selesai",
      [kptLisaId]: "selesai",
      [kolBudiId]: "selesai",
      [kolHendraId]: "selesai",
      // eko, tono, yudi, agus: belum_dikerjakan
    },
    // Order 5 — Komentar Positif (EXPIRED, Kompi A)
    [order5.id]: {
      [budiSantosoId]: "selesai",
      [andiKurniaId]: "selesai",
      [ekoSaputroId]: "terlambat",
      // deni, kptSari: belum_dikerjakan
    },
  }

  // Build semua assignments
  const allAssignments: {
    orderId: string
    userId: string
    status: AssignmentStatus
    assignedAt: Date
    completedAt: Date | null
  }[] = []

  const assignmentMap: Record<string, Record<string, string>> = {}

  const buildAssignments = (
    orderId: string,
    userIds: string[],
    assignedAt: Date
  ) => {
    if (!assignmentMap[orderId]) assignmentMap[orderId] = {}
    for (const userId of userIds) {
      const status: AssignmentStatus =
        statusMap[orderId]?.[userId] ?? "belum_dikerjakan"
      const completedAt = status !== "belum_dikerjakan" ? new Date() : null
      allAssignments.push({ orderId, userId, status, assignedAt, completedAt })
    }
  }

  buildAssignments(order1.id, batayonAlphaMembers, new Date())
  buildAssignments(order2.id, batayonAlphaMembers, new Date())
  buildAssignments(order3.id, semuaAnggota, daysAgo(4))
  buildAssignments(order4.id, batayonBetaMembers, new Date())
  buildAssignments(order5.id, kompiAMembers, daysAgo(2))

  // createMany tidak mengembalikan ids di PostgreSQL, jadi kita insert satu per satu
  // untuk bisa menyimpan id per (orderId, userId) di assignmentMap
  for (const a of allAssignments) {
    const created = await db.taskAssignment.create({
      data: {
        orderId: a.orderId,
        userId: a.userId,
        status: a.status,
        assignedAt: a.assignedAt,
        completedAt: a.completedAt,
      },
    })
    if (!assignmentMap[a.orderId]) assignmentMap[a.orderId] = {}
    assignmentMap[a.orderId][a.userId] = created.id
  }

  console.log(`  ✅ ${allAssignments.length} task assignment berhasil dibuat`)

  // ─────────────────────────────────────────
  // STEP 8: BUAT SUBMISSIONS (BUKTI)
  // Hanya untuk assignment yang status !== belum_dikerjakan
  // ─────────────────────────────────────────
  console.log("\n📎 STEP 8: Membuat submissions (bukti pelaksanaan)...")

  type SubmissionData = {
    assignmentId: string
    userId: string
    driveLink: string
    notes: string | null
    isLatest: boolean
    isLate: boolean
    submittedAt: Date
  }

  const submissions: SubmissionData[] = []

  const addSubmission = (
    orderId: string,
    userId: string,
    driveLink: string,
    isLate: boolean,
    submittedAt: Date,
    notes?: string
  ) => {
    const assignmentId = assignmentMap[orderId]?.[userId]
    if (!assignmentId) return
    submissions.push({
      assignmentId,
      userId,
      driveLink,
      notes: notes ?? null,
      isLatest: true,
      isLate,
      submittedAt,
    })
  }

  // Submission untuk Order 1 (AKTIF — yang sudah submit)
  addSubmission(order1.id, budiSantosoId, "https://drive.google.com/file/d/seed-sub-001/view", false, hoursFromNow(-1), "Sudah dikerjakan di 2 akun")
  addSubmission(order1.id, andiKurniaId,  "https://drive.google.com/file/d/seed-sub-002/view", false, hoursFromNow(-2))
  addSubmission(order1.id, tonoWijayaId,  "https://drive.google.com/file/d/seed-sub-003/view", false, hoursFromNow(-0.5))

  // Submission untuk Order 3 (EXPIRED)
  addSubmission(order3.id, budiSantosoId,  "https://drive.google.com/file/d/seed-sub-004/view", false, daysAgo(3))
  addSubmission(order3.id, andiKurniaId,   "https://drive.google.com/file/d/seed-sub-005/view", true,  daysAgo(1), "Terlambat karena kendala teknis")
  addSubmission(order3.id, deniPratamaId,  "https://drive.google.com/file/d/seed-sub-006/view", true,  daysAgo(1))
  addSubmission(order3.id, wahyuNugrohoId, "https://drive.google.com/file/d/seed-sub-007/view", false, daysAgo(3))
  addSubmission(order3.id, rinaMarlinaId,  "https://drive.google.com/file/d/seed-sub-008/view", false, daysAgo(3))
  addSubmission(order3.id, kptSariId,      "https://drive.google.com/file/d/seed-sub-009/view", false, daysAgo(3))
  addSubmission(order3.id, kptRudiId,      "https://drive.google.com/file/d/seed-sub-010/view", false, daysAgo(3))
  addSubmission(order3.id, kptLisaId,      "https://drive.google.com/file/d/seed-sub-011/view", false, daysAgo(3))
  addSubmission(order3.id, kolBudiId,      "https://drive.google.com/file/d/seed-sub-012/view", false, daysAgo(3))
  addSubmission(order3.id, kolHendraId,    "https://drive.google.com/file/d/seed-sub-013/view", false, daysAgo(3))

  // Submission untuk Order 5 (EXPIRED, Kompi A)
  addSubmission(order5.id, budiSantosoId, "https://drive.google.com/file/d/seed-sub-014/view", false, daysAgo(2))
  addSubmission(order5.id, andiKurniaId,  "https://drive.google.com/file/d/seed-sub-015/view", false, daysAgo(2))
  addSubmission(order5.id, ekoSaputroId,  "https://drive.google.com/file/d/seed-sub-016/view", true,  hoursFromNow(-12), "Maaf terlambat")

  await db.submission.createMany({ data: submissions })
  console.log(`  ✅ ${submissions.length} submission berhasil dibuat`)

  // ─────────────────────────────────────────
  // SELESAI
  // ─────────────────────────────────────────
  console.log("\n✨ Seed data selesai! Ringkasan:")
  console.log(`   👤 ${16} user (1 super admin + 15 member)`)
  console.log(`   🏢 ${6} satuan (1 root + 2 batalyon + 3 kompi)`)
  console.log(`   📱 ${socialAccountsData.length} akun sosial media`)
  console.log(`   📋 ${6} perintah (1 aktif mepet + 1 aktif + 2 expired + 1 draft + 1 aktif)`)
  console.log(`   📌 ${allAssignments.length} task assignment`)
  console.log(`   📎 ${submissions.length} submission`)
}

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────
main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed gagal:", e)
    await db.$disconnect()
    process.exit(1)
  })
```

---

## 6. Teardown — Reset Seed Data

Untuk menghapus semua data dan menjalankan ulang seed:

```bash
# Reset database + jalankan seed ulang secara otomatis
npx prisma migrate reset

# Atau hanya truncate data tanpa reset schema (development)
# Jalankan script berikut sebelum seed ulang:
```

Tambahkan function `teardown` opsional di awal `main()` untuk development:

```typescript
// Tambahkan di awal main() hanya untuk development
async function teardown() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Teardown TIDAK boleh dijalankan di production!")
  }

  console.log("🗑️  Membersihkan data lama...")

  // Urutan penghapusan: child dulu, kemudian parent (ikuti foreign key)
  await db.submission.deleteMany()
  await db.taskAssignment.deleteMany()
  await db.orderTarget.deleteMany()
  await db.order.deleteMany()
  await db.socialAccount.deleteMany()
  await db.unitMember.deleteMany()
  await db.unit.deleteMany()

  // Hapus Better Auth tables — user, session, account
  // CATATAN: nama tabel mengikuti output `npx @better-auth/cli generate`
  await db.session.deleteMany()
  await db.account.deleteMany()
  await db.verification.deleteMany()
  await db.user.deleteMany()

  console.log("  ✅ Data lama berhasil dihapus\n")
}

// Di awal main():
async function main() {
  await teardown() // ← aktifkan saat development
  // ... sisa seed
}
```

---

## 7. Verifikasi Seed Data

Setelah seed berhasil, lakukan verifikasi dengan query berikut di `psql` atau Prisma Studio:

```bash
# Buka Prisma Studio untuk inspeksi visual
npx prisma studio
```

### 7.1 Query Verifikasi — psql

```sql
-- Cek jumlah user (harus 16)
SELECT COUNT(*) FROM "user";

-- Cek user beserta username (dari tabel account Better Auth)
SELECT u.name, u.email, a.provider_account_id AS username, u.role
FROM "user" u
JOIN account a ON a."userId" = u.id
WHERE a."providerId" = 'username'
ORDER BY u."createdAt";

-- Cek struktur tree satuan (materialized path)
SELECT name, "depthLevel", path, "parentId"
FROM unit
WHERE "deletedAt" IS NULL
ORDER BY path;

-- Cek progress order 1 (Serbu Postingan)
SELECT
  u.name AS anggota,
  ta.status,
  ta."completedAt",
  s."driveLink"
FROM task_assignment ta
JOIN "user" u ON ta."userId" = u.id
LEFT JOIN submission s ON s."assignmentId" = ta.id AND s."isLatest" = TRUE
WHERE ta."orderId" = '<uuid-order-1>'
ORDER BY ta.status;

-- Cek semua submission (harus 16)
SELECT COUNT(*) FROM submission;

-- Cek akun sosmed per user
SELECT u.name, sa.platform, sa.username
FROM social_account sa
JOIN "user" u ON sa."userId" = u.id
WHERE sa."deletedAt" IS NULL
ORDER BY u.name, sa.platform;
```

### 7.2 Test Login Semua Akun

Setelah seed, pastikan semua user bisa login dengan script berikut:

```typescript
// scripts/verify-logins.ts — jalankan dengan: tsx scripts/verify-logins.ts
import { auth } from "@/lib/auth"

const testAccounts = [
  { username: "superadmin",   password: "Admin@1234!" },
  { username: "jend_ahmad",   password: "Jenderal@123!" },
  { username: "kol_budi",     password: "Kolonel@123!" },
  { username: "kol_hendra",   password: "Kolonel@123!" },
  { username: "kpt_sari",     password: "Kapten@123!" },
  { username: "budi_santoso", password: "Anggota@123!" },
  { username: "rina_marlina", password: "Anggota@123!" },
]

async function verifyLogins() {
  console.log("🔐 Verifikasi login semua akun...\n")

  for (const account of testAccounts) {
    try {
      const result = await auth.api.signInUsername({
        body: { username: account.username, password: account.password },
      })
      if (result?.user) {
        console.log(`  ✅ ${account.username} — Login berhasil (id: ${result.user.id})`)
      } else {
        console.log(`  ❌ ${account.username} — Login gagal (tidak ada user di response)`)
      }
    } catch (err) {
      console.log(`  ❌ ${account.username} — Error: ${(err as Error).message}`)
    }
  }
}

verifyLogins()
```

Jalankan:
```bash
tsx scripts/verify-logins.ts
```

---

## 8. Skenario Testing yang Tersedia Setelah Seed

Setelah seed berhasil, developer dapat menguji semua skenario berikut tanpa perlu buat data manual:

| Skenario                         | User yang digunakan         | Cara Test                                           |
|----------------------------------|-----------------------------|-----------------------------------------------------|
| Login sebagai Super Admin        | `superadmin`                | Login → akses `/admin/units`                        |
| Login sebagai Komandan top-level | `jend_ahmad`                | Login → dashboard menampilkan stats seluruh org     |
| Login sebagai Komandan menengah  | `kol_budi`                  | Login → dashboard menampilkan Batalyon Alpha saja   |
| Login sebagai Anggota            | `budi_santoso`              | Login → halaman Perintah Saya berisi 3 perintah     |
| Perintah dengan deadline mepet   | Login sebagai `budi_santoso`| Order "Serbu Postingan" menampilkan badge ⚠️ merah  |
| Submit bukti (belum submit)      | `deni_pratama`              | Order 1 — status belum_dikerjakan, bisa submit      |
| Resubmit bukti                   | `budi_santoso`              | Order 1 — sudah submit, coba submit lagi            |
| Perintah expired                 | `deni_pratama`              | Order 3 & 5 — expired, tapi masih bisa submit (terlambat) |
| Monitoring progress              | `kol_budi`                  | Detail Order 1 → progress 3/9, breakdown per satuan |
| Anggota belum daftar sosmed      | `eko_saputro`               | Halaman sosmed kosong — tampilkan empty state       |
| Draft perintah                   | `kol_budi`                  | Order "Draft Rencana" muncul di daftar dengan status Draft |
| Filter dashboard                 | `jend_ahmad`                | Filter per satuan, status, jenis → data berkurang   |
| Export Excel                     | `kol_budi`                  | Export progress Order 1 → file xlsx terdownload     |
| Hierarki tree satuan             | `superadmin`                | `/admin/units` menampilkan tree 3-level             |

---

## 9. Catatan Penting untuk Developer

| # | Catatan |
|---|---------|
| 1 | **Jangan pernah** seed di environment `production` — tambahkan guard `NODE_ENV` check |
| 2 | `auth.api.createUser()` adalah satu-satunya cara yang benar untuk membuat user — jangan bypass |
| 3 | Email dummy `{username}@internal.komando` tidak perlu benar-benar ada — hanya untuk memenuhi constraint Better Auth |
| 4 | Jika Better Auth diupgrade, jalankan ulang `npx @better-auth/cli generate` sebelum seed |
| 5 | Field `role` pada `auth.api.createUser()` hanya tersedia jika sudah dikonfigurasi di `user.additionalFields` di `auth.ts` |
| 6 | Prisma `createMany` di PostgreSQL tidak mengembalikan `id` — gunakan loop `create` jika butuh id untuk relasi berikutnya |
| 7 | Jalankan `npx prisma migrate dev` sebelum seed jika ada perubahan schema |
| 8 | Field `path` pada tabel `unit` dihitung secara programatis — tidak ada magic, hanya string concatenation `{parentPath}{id}/` |
