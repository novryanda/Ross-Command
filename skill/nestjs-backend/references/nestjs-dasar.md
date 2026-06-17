# NestJS Dasar — Referensi Lengkap

> Sumber: NestJS Dasar (Eko Kurniawan Khannedy — Programmer Zaman Now)

---

## Daftar Isi

1. [Pengenalan NestJS](#1-pengenalan-nestjs)
2. [NestJS CLI & Setup Project](#2-nestjs-cli--setup-project)
3. [Decorator](#3-decorator)
4. [Module](#4-module)
5. [Controller](#5-controller)
6. [HTTP Method & Routing](#6-http-method--routing)
7. [HTTP Request](#7-http-request)
8. [HTTP Response](#8-http-response)
9. [Provider & Dependency Injection](#9-provider--dependency-injection)
10. [Configuration](#10-configuration)
11. [Middleware](#11-middleware)
12. [Exception Filter](#12-exception-filter)
13. [Pipe](#13-pipe)
14. [Interceptor](#14-interceptor)
15. [Custom Decorator](#15-custom-decorator)
16. [Guard](#16-guard)
17. [Lifecycle Event](#17-lifecycle-event)
18. [Reflector](#18-reflector)
19. [Global Provider](#19-global-provider)

---

## 1. Pengenalan NestJS

- NestJS adalah framework untuk membuat aplikasi server-side menggunakan **NodeJS** yang efisien
- Menggunakan **TypeScript** sebagai bahasa utama (bisa juga JavaScript)
- Sangat populer di kalangan programmer TypeScript
- Di balik layar menggunakan library populer: **ExpressJS** (HTTP), **Jest** (testing), **Prisma** (database), **Winston** (logging)

### Keuntungan Framework
- Semua developer mengikuti kerangka kerja yang sama
- Developer baru mudah beradaptasi karena konvensi sudah jelas
- Tidak ada perdebatan cara kerja antar tim

---

## 2. NestJS CLI & Setup Project

### Install CLI
```bash
npm install -g @nestjs/cli
nest --version
```

### Buat Project Baru
```bash
nest new nama-project
```

### Struktur Folder
```
nama-project/
├── src/          ← Kode aplikasi + unit test
├── test/         ← Integration test
├── package.json
└── README.md     ← Instruksi build/run/test
```

### Menjalankan Aplikasi
```bash
npm run start        # Production
npm run start:dev    # Development (watch mode)
npm run test         # Unit test
npm run test:e2e     # Integration test
```

---

## 3. Decorator

- Decorator adalah fitur untuk menambahkan **metadata** pada kode
- Ditulis dengan prefix `@` diikuti nama decorator (mirip annotation di Java)
- Bisa digunakan di: Class, Method, Parameter, Property, Constructor
- NestJS **sangat banyak** menggunakan decorator di semua bagian

```typescript
// Contoh decorator di controller
@Controller('users')         // ← Decorator class
export class UserController {
  @Get(':id')                // ← Decorator method
  getUser(@Param('id') id: string) {  // ← Decorator parameter
    return id;
  }
}
```

---

## 4. Module

- Module adalah class dengan decorator `@Module()`
- NestJS membagi aplikasi secara **modular**
- Setiap app punya 1 **AppModule** (root), lalu import module lainnya

### Properti @Module()
| Properti | Fungsi |
|----------|--------|
| `imports` | Import module lain yang dibutuhkan |
| `exports` | Export provider agar bisa dipakai module lain |
| `controllers` | Daftarkan controller di module ini |
| `providers` | Daftarkan service/provider di module ini |

### Generate Module
```bash
nest generate module user
# Otomatis membuat user.module.ts dan mendaftarkannya di AppModule
```

```typescript
@Module({
  imports: [UserModule],
})
export class AppModule {}

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

---

## 5. Controller

- Controller adalah class dengan decorator `@Controller()`
- Bertugas memproses **HTTP Request** masuk dan mengembalikan **HTTP Response**
- Wajib didaftarkan di Module

```bash
nest generate controller user
```

```typescript
@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}
}
```

---

## 6. HTTP Method & Routing

### Decorator HTTP Method
| Decorator | HTTP Method |
|-----------|-------------|
| `@Get(path)` | GET |
| `@Post(path)` | POST |
| `@Put(path)` | PUT |
| `@Delete(path)` | DELETE |
| `@Patch(path)` | PATCH |
| `@Head(path)` | HEAD |
| `@Options(path)` | OPTIONS |
| `@All(path)` | Semua method |

```typescript
@Controller('api/users')
export class UserController {
  @Get()        getAll()       { ... }
  @Get(':id')   getOne()       { ... }
  @Post()       create()       { ... }
  @Put(':id')   update()       { ... }
  @Delete(':id') remove()      { ... }
}
```

---

## 7. HTTP Request

### Rekomendasi: Gunakan Decorator Parameter
```typescript
@Param('id')           // req.params.id
@Body()                // req.body (seluruh body)
@Body('name')          // req.body.name
@Query('search')       // req.query.search
@Header('token')       // req.headers.token
@Ip()                  // req.ip
@HostParam()           // req.hosts
```

### Jika Terpaksa Pakai Express Request
```typescript
// TIDAK direkomendasikan, gunakan hanya jika sangat diperlukan
@Get()
getUser(@Req() req: Request) {
  return req.query.name;
}
```

---

## 8. HTTP Response

### Rekomendasi: Return Value Langsung
```typescript
@Get(':id')
getUser(@Param('id') id: string): UserResponse {
  return { id, name: 'Eko' };  // ← Otomatis jadi response body
}
```

### Override Status Code & Header
```typescript
@HttpCode(201)
@Header('X-Custom', 'value')
@Post()
create() { return 'created'; }
```

### Redirect
```typescript
@Redirect('https://nestjs.com', 301)
@Get('docs')
getDocs() {}
```

---

## 9. Provider & Dependency Injection

- Provider adalah class yang bisa di-inject ke class lain via **constructor**
- Gunakan decorator `@Injectable()` pada class yang ingin dijadikan provider

```bash
nest generate service user
```

### Tipe Provider

**1. Standard Provider (paling umum)**
```typescript
@Injectable()
export class UserService {}

@Module({ providers: [UserService] })  // shorthand
// sama dengan:
@Module({ providers: [{ provide: UserService, useClass: UserService }] })
```

**2. Value Provider**
```typescript
@Module({
  providers: [{ provide: 'CONFIG', useValue: { port: 3000 } }]
})
// Inject dengan:
constructor(@Inject('CONFIG') private config: any) {}
```

**3. Factory Provider**
```typescript
@Module({
  providers: [{
    provide: UserRepository,
    useFactory: (prisma: PrismaService) => new UserRepository(prisma),
    inject: [PrismaService],
  }]
})
```

**4. Existing/Alias Provider**
```typescript
@Module({
  providers: [{ provide: 'ALIAS', useExisting: UserService }]
})
```

---

## 10. Configuration

NestJS menyediakan `@nestjs/config` untuk membaca environment variables:

```bash
npm install @nestjs/config
```

```typescript
// app.module.ts
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})

// Di service
constructor(private configService: ConfigService) {}
getValue() { return this.configService.get('DATABASE_URL'); }
```

---

## 11. Middleware

- Mirip middleware di ExpressJS — dieksekusi **sebelum** request sampai ke Controller
- Mendukung Dependency Injection
- Gunakan untuk: logging, parsing, pre-auth check, dll

```bash
nest generate middleware log
```

```typescript
@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${req.method}] ${req.path}`);
    next();
  }
}

// Daftarkan di Module (bukan di @Module decorator)
@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
      // atau: .forRoutes(UserController)
  }
}
```

---

## 12. Exception Filter

- Menangkap **error yang tidak tertangani** dan mengubahnya menjadi HTTP Response
- Default NestJS: Global Exception Filter yang mengubah error menjadi JSON

### Membuat Custom Filter
```typescript
@Catch(ZodError)
export class ZodFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(400).json({
      statusCode: 400,
      errors: exception.errors,
    });
  }
}
```

### Penggunaan
```typescript
// Di method
@UseFilters(new ZodFilter())
@Post() create() { ... }

// Di controller (semua method)
@UseFilters(ZodFilter)
@Controller() export class UserController {}

// Global
app.useGlobalFilters(new ZodFilter());
```

### HttpException
```typescript
throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
throw new HttpException({ message: 'Invalid' }, 400);
```

---

## 13. Pipe

- Dieksekusi sebelum **Controller Method** dipanggil
- Fungsi: transformasi tipe data dan validasi input

### Built-in Pipe
`ParseIntPipe`, `ParseFloatPipe`, `ParseBoolPipe`, `ParseArrayPipe`, `ParseUUIDPipe`, `ParseEnumPipe`, `DefaultValuePipe`, `ParseFilePipe`

```typescript
// Gunakan langsung di parameter
@Get(':id')
getUser(@Param('id', ParseIntPipe) id: number) {
  // id sudah bertipe number
}
```

### Custom Pipe
```bash
nest generate pipe validation
```

```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // transformasi / validasi
    return value;
  }
}
```

### Global Pipe
```typescript
app.useGlobalPipes(new ValidationPipe());
// atau di module:
{ provide: APP_PIPE, useClass: ValidationPipe }
```

---

## 14. Interceptor

- Mirip middleware, tapi bisa **memodifikasi response** dari Controller
- Menggunakan **RxJS** (Reactive Extensions)
- Use case: logging response time, transform response format, caching

```bash
nest generate interceptor logging
```

```typescript
@Injectable()
export class TimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => console.log(`Response time: ${Date.now() - start}ms`))
    );
  }
}

// Penggunaan
@UseInterceptors(TimeInterceptor)
@Controller() export class UserController {}

// Global
app.useGlobalInterceptors(new TimeInterceptor());
```

---

## 15. Custom Decorator

- Buat parameter decorator sendiri untuk mengekstrak data dari request

```typescript
// Membuat decorator @User
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);

// Penggunaan di controller
@Get('profile')
getProfile(@User() user: UserModel) {
  return user;
}
```

---

## 16. Guard

- Menentukan apakah request **boleh dilanjutkan** ke Controller atau tidak
- Digunakan untuk **Authorization** (cek role/permission)
- Return `true` = lanjut, `false` = tolak (403 Forbidden)

```bash
nest generate guard role
```

```typescript
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return roles.includes(user?.role);
  }
}

// Custom decorator untuk roles
export const Roles = (...roles: string[]) =>
  SetMetadata('roles', roles);

// Penggunaan
@Roles('admin')
@UseGuards(RoleGuard)
@Delete(':id')
remove() { ... }
```

---

## 17. Lifecycle Event

| Interface | Kapan dipanggil |
|-----------|----------------|
| `OnModuleInit` | Setelah semua module di-load |
| `OnApplicationBootstrap` | Setelah inisialisasi, sebelum koneksi masuk |
| `OnModuleDestroy` | Saat sinyal shutdown diterima |
| `BeforeApplicationShutdown` | Setelah `OnModuleDestroy`, sebelum koneksi ditutup |
| `OnApplicationShutdown` | Setelah semua koneksi ditutup |

```typescript
// Penting untuk Prisma
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

// Enable shutdown hook di main.ts
app.enableShutdownHooks();
```

---

## 18. Reflector

- Digunakan bersama Custom Decorator untuk membaca **metadata**
- Solusi untuk Guard berbasis role agar **singleton** (hemat memory)

```typescript
// Buat decorator yang menyimpan metadata
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Baca metadata di Guard via Reflector
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', ctx.getHandler());
    // ...
  }
}
```

---

## 19. Global Provider

### Masalah Tanpa Global Provider
Menggunakan `app.useGlobalFilters(new Filter())` membuat object manual → DI tidak bekerja.

### Solusi: Alias Token NestJS
```typescript
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    { provide: APP_FILTER, useClass: ZodExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_PIPE, useClass: ValidationPipe },
  ],
})
export class AppModule {}
```

Provider yang didaftarkan dengan alias ini otomatis global DAN mendukung Dependency Injection penuh.
