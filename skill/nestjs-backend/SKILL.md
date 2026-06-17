---
name: nestjs-backend
description: >
  Panduan lengkap membangun backend berbasis NestJS menggunakan TypeScript.
  Gunakan skill ini SELALU ketika user menyebut NestJS, ingin membuat backend API,
  RESTful API dengan NestJS, ingin tahu cara membuat Controller/Provider/Module/Guard/Pipe/
  Interceptor/Middleware/Decorator di NestJS, setup Prisma + NestJS, integrasi Zod validation,
  bcrypt, Winston logging, atau struktur project NestJS. Juga trigger saat user bertanya
  "bagaimana cara membuat X di NestJS", "tolong buatkan backend NestJS", "setup NestJS project",
  atau kata kunci: nest generate, @Module, @Controller, @Injectable, @Guard, @Pipe, @UseFilters,
  RESTful API contact management, user management dengan NestJS.
---

# NestJS Backend Skill

Skill ini mencakup dua level penguasaan NestJS:
1. **NestJS Dasar** — Fondasi arsitektur, building blocks, dan fitur inti
2. **NestJS RESTful API** — Implementasi nyata Contact Management System end-to-end

Untuk detail tiap topik, baca file referensi di bawah:
- [`references/nestjs-dasar.md`](references/nestjs-dasar.md) — Konsep dasar, semua building blocks
- [`references/nestjs-restful.md`](references/nestjs-restful.md) — Studi kasus RESTful API lengkap

---

## Alur Kerja (Gunakan Selalu)

### Fase 1 — Pahami Kebutuhan
Sebelum menulis kode apapun, tanyakan:
1. Apakah ini project baru atau menambah fitur ke project yang ada?
2. Database apa yang digunakan (default: PostgreSQL via Prisma)?
3. Apakah butuh authentication? (default: token-based via header)
4. Apakah ada spesifikasi API (path, method, request/response body)?

### Fase 2 — Setup Project (Project Baru)
```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Buat project
nest new nama-project

# Package wajib untuk RESTful API production-grade
npm install zod                          # Validasi schema
npm install --save-dev prisma            # ORM database
npm install @prisma/client               # Prisma client
npm install nest-winston winston         # Logging
npm install bcrypt uuid                  # Auth utilities
npm install --save-dev @types/bcrypt @types/uuid
npm install @nestjs/config               # Konfigurasi environment
```

### Fase 3 — Struktur Module
Setiap fitur = 1 module. Gunakan pola ini:
```
src/
├── common/           ← Prisma, Logger, Validation (shared)
│   ├── common.module.ts
│   ├── prisma.service.ts
│   └── validation.service.ts
├── user/             ← Satu module per domain/fitur
│   ├── user.module.ts
│   ├── user.controller.ts
│   └── user.service.ts
└── app.module.ts     ← Root module, import semua module
```

### Fase 4 — Generate Komponen
```bash
nest generate module nama
nest generate controller nama path
nest generate service nama path
nest generate middleware nama path
nest generate guard nama path
nest generate pipe nama path
nest generate interceptor nama path
```

---

## Quick Reference — Building Blocks

| Komponen | Decorator | Fungsi |
|----------|-----------|--------|
| Module | `@Module()` | Wadah organisasi kode |
| Controller | `@Controller('path')` | Handle HTTP Request/Response |
| Provider/Service | `@Injectable()` | Business logic, Dependency Injection |
| Middleware | `NestMiddleware` | Pre-processing request (logging, dsb) |
| Guard | `CanActivate` | Authorization/authentication check |
| Pipe | `PipeTransform` | Transformasi & validasi input |
| Interceptor | `NestInterceptor` | Modifikasi request/response (RxJS) |
| Exception Filter | `ExceptionFilter` | Handle error → HTTP response |
| Custom Decorator | `createParamDecorator` | Ekstrak data custom dari request |

---

## Pola Request → Response

```
Request → Middleware → Guard → Interceptor → Pipe → Controller → Service
                                                                    ↓
Response ← ExceptionFilter ← Interceptor ← Controller ← Service (response)
```

---

## Pola HTTP Method di Controller

```typescript
@Controller('api/users')
export class UserController {
  @Get()           // GET /api/users
  @Get(':id')      // GET /api/users/:id
  @Post()          // POST /api/users
  @Put(':id')      // PUT /api/users/:id
  @Patch(':id')    // PATCH /api/users/:id
  @Delete(':id')   // DELETE /api/users/:id
}
```

## Pola Request Decorator

```typescript
@Param('id')       // Path parameter
@Query('name')     // Query string
@Body()            // Request body
@Header('token')   // Header value
@Ip()              // Client IP
```

## Pola Response

```typescript
// Rekomendasi: gunakan return value langsung
@Get() getUser(): UserResponse { return user; }

// Override status code
@HttpCode(201) @Post() create() { ... }

// Set header
@Header('Cache-Control', 'none') @Get() ...
```

---

## Dependency Injection — Pola Dasar

```typescript
// Provider (Service)
@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}
}

// Module — wajib export jika dipakai module lain
@Module({
  providers: [UserService, PrismaService],
  controllers: [UserController],
  exports: [UserService],      // ← export agar bisa diimport module lain
  imports: [CommonModule],     // ← import module lain
})
export class UserModule {}
```

---

## Validation dengan Zod

```typescript
// validation.service.ts
@Injectable()
export class ValidationService {
  validate<T>(schema: ZodType, data: unknown): T {
    return schema.parse(data);
  }
}

// Di service
const request = this.validationService.validate(
  CreateUserSchema,
  rawData
);
```

---

## Exception Handling

```typescript
// Lempar error HTTP standard
throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
throw new HttpException('Unauthorized', 401);

// Custom Exception Filter
@Catch(ZodError)
export class ZodFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(400).json({ errors: exception.errors });
  }
}

// Daftarkan filter
@UseFilters(new ZodFilter())
@Controller() ...

// Global filter
app.useGlobalFilters(new ZodFilter());
```

---

## Guard — Authentication & Authorization

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    // validasi token...
    return !!token;
  }
}

// Gunakan di controller
@UseGuards(AuthGuard)
@Controller('api/users') ...
```

---

## Global Provider (tanpa kehilangan DI)

```typescript
// Di module — gunakan alias token bawaan NestJS
@Module({
  providers: [
    { provide: APP_FILTER, useClass: MyExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
```

---

## Lifecycle Events

| Hook | Kapan dipanggil |
|------|----------------|
| `OnModuleInit` | Setelah semua module di-load |
| `OnApplicationBootstrap` | Setelah inisialisasi, sebelum terima koneksi |
| `OnModuleDestroy` | Saat sinyal shutdown diterima |
| `OnApplicationShutdown` | Setelah semua koneksi ditutup |

```typescript
// Penting untuk Prisma — enable shutdown hook
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks(); // ← wajib untuk K8s/Ctrl+C
  await app.listen(3000);
}
```

---

## Tips & Best Practices

1. **Jangan gunakan `express.Request`/`express.Response` langsung** — gunakan decorator NestJS (`@Body()`, `@Param()`, dll)
2. **Service hanya boleh di-inject via constructor** — jangan buat `new Service()` manual
3. **Selalu export Provider** jika ingin digunakan module lain
4. **Common Module** untuk dependency yang dipakai banyak module (Prisma, Logger, ValidationService)
5. **Gunakan `APP_GUARD` / `APP_FILTER` / dll** untuk global provider agar DI tetap bekerja
6. **Reflector + Custom Decorator** untuk guard berbasis role yang lebih clean (singleton pattern)
7. **Pipe untuk transformasi input** — jangan lakukan transformasi di controller/service
8. **Interceptor untuk cross-cutting concerns** — logging response time, transform response format

---

## Referensi Lanjutan

- Detail konsep dasar → [`references/nestjs-dasar.md`](references/nestjs-dasar.md)
- Studi kasus RESTful API penuh → [`references/nestjs-restful.md`](references/nestjs-restful.md)
- Dokumentasi resmi: https://nestjs.com/
- NestJS CLI: https://github.com/nestjs/nest-cli
