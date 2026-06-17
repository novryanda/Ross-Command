# NestJS RESTful API — Studi Kasus Contact Management

> Sumber: NestJS RESTful API (Eko Kurniawan Khannedy — Programmer Zaman Now)

---

## Daftar Isi

1. [Requirement Sistem](#1-requirement-sistem)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Setup Project](#3-setup-project)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Common Module](#5-common-module)
6. [User Management API](#6-user-management-api)
7. [Contact Management API](#7-contact-management-api)
8. [Address Management API](#8-address-management-api)
9. [Pola Umum yang Digunakan](#9-pola-umum-yang-digunakan)

---

## 1. Requirement Sistem

Sistem **Contact Management** dengan 3 domain utama:

### User Management
| Field | Tipe |
|-------|------|
| username | String (unique) |
| password | String (hashed bcrypt) |
| name | String |
| token | String (nullable, sesi login) |

**API:**
- `POST /api/users` — Register User
- `POST /api/users/login` — Login User
- `GET /api/users/current` — Get User (auth required)
- `PATCH /api/users/current` — Update User (auth required)
- `DELETE /api/users/current` — Logout User (auth required)

### Contact Management
| Field | Tipe |
|-------|------|
| id | Int (auto) |
| first_name | String |
| last_name | String (nullable) |
| email | String (nullable) |
| phone | String (nullable) |
| username | String (FK ke User) |

**API:**
- `POST /api/contacts` — Create Contact
- `GET /api/contacts/:contactId` — Get Contact
- `PUT /api/contacts/:contactId` — Update Contact
- `DELETE /api/contacts/:contactId` — Remove Contact
- `GET /api/contacts` — Search Contact (dengan pagination & filter)

### Address Management
| Field | Tipe |
|-------|------|
| id | Int (auto) |
| street | String (nullable) |
| city | String (nullable) |
| province | String (nullable) |
| country | String |
| postal_code | String |
| contact_id | Int (FK ke Contact) |

**API:**
- `POST /api/contacts/:contactId/addresses` — Create Address
- `GET /api/contacts/:contactId/addresses/:addressId` — Get Address
- `PUT /api/contacts/:contactId/addresses/:addressId` — Update Address
- `DELETE /api/contacts/:contactId/addresses/:addressId` — Remove Address
- `GET /api/contacts/:contactId/addresses` — List Address

---

## 2. Tech Stack & Dependencies

```bash
# Core
nest new belajar-nestjs-restful-api

# Validation
npm install zod

# Database
npm install --save-dev prisma
npm install @prisma/client
npx prisma init

# Logging
npm install nest-winston winston

# Auth
npm install bcrypt uuid
npm install --save-dev @types/bcrypt @types/uuid

# Config
npm install @nestjs/config
```

---

## 3. Setup Project

### Hapus file default yang tidak dipakai
```
❌ Hapus: app.controller.ts
❌ Hapus: app.service.ts
❌ Hapus: app.controller.spec.ts
```

### Struktur Project Final
```
src/
├── common/
│   ├── common.module.ts
│   ├── prisma.service.ts
│   └── validation.service.ts
├── user/
│   ├── user.module.ts
│   ├── user.controller.ts
│   └── user.service.ts
├── contact/
│   ├── contact.module.ts
│   ├── contact.controller.ts
│   └── contact.service.ts
├── address/
│   ├── address.module.ts
│   ├── address.controller.ts
│   └── address.service.ts
├── model/
│   ├── user.model.ts
│   ├── contact.model.ts
│   ├── address.model.ts
│   └── web.model.ts
└── app.module.ts
```

---

## 4. Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  username  String    @id @db.VarChar(100)
  password  String    @db.VarChar(100)
  name      String    @db.VarChar(100)
  token     String?   @db.VarChar(100)
  contacts  Contact[]

  @@map("users")
}

model Contact {
  id         Int       @id @default(autoincrement())
  first_name String    @db.VarChar(100)
  last_name  String?   @db.VarChar(100)
  email      String?   @db.VarChar(100)
  phone      String?   @db.VarChar(20)
  username   String    @db.VarChar(100)
  user       User      @relation(fields: [username], references: [username])
  addresses  Address[]

  @@map("contacts")
}

model Address {
  id          Int     @id @default(autoincrement())
  street      String? @db.VarChar(255)
  city        String? @db.VarChar(100)
  province    String? @db.VarChar(100)
  country     String  @db.VarChar(100)
  postal_code String  @db.VarChar(10)
  contact_id  Int
  contact     Contact @relation(fields: [contact_id], references: [id])

  @@map("addresses")
}
```

```bash
# Setelah schema dibuat
npx prisma migrate dev --name init
npx prisma generate
```

---

## 5. Common Module

### PrismaService
```typescript
// common/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: { url: configService.get('DATABASE_URL') },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
```

### ValidationService
```typescript
// common/validation.service.ts
@Injectable()
export class ValidationService {
  validate<T>(schema: ZodType, data: unknown): T {
    return schema.parse(data);
  }
}
```

### CommonModule
```typescript
// common/common.module.ts
@Global()  // ← Jadikan global agar tidak perlu import di setiap module
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [PrismaService, ValidationService],
  exports: [PrismaService, ValidationService, WinstonModule],
})
export class CommonModule {}
```

---

## 6. User Management API

### Model (Zod Schema + TypeScript Interface)
```typescript
// model/user.model.ts
export const RegisterUserRequest = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
});
export type RegisterUserRequest = z.infer<typeof RegisterUserRequest>;

export const LoginUserRequest = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});
export type LoginUserRequest = z.infer<typeof LoginUserRequest>;

export interface UserResponse {
  username: string;
  name: string;
  token?: string;
}
```

### UserService
```typescript
// user/user.service.ts
@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    const req = this.validationService.validate(RegisterUserRequest, request);

    const existingUser = await this.prismaService.user.findUnique({
      where: { username: req.username },
    });
    if (existingUser) throw new HttpException('Username already exists', 400);

    req.password = await bcrypt.hash(req.password, 10);

    const user = await this.prismaService.user.create({ data: req });
    return { username: user.username, name: user.name };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    const req = this.validationService.validate(LoginUserRequest, request);

    const user = await this.prismaService.user.findUnique({
      where: { username: req.username },
    });
    if (!user) throw new HttpException('Invalid credentials', 401);

    const valid = await bcrypt.compare(req.password, user.password);
    if (!valid) throw new HttpException('Invalid credentials', 401);

    const token = uuidv4();
    await this.prismaService.user.update({
      where: { username: user.username },
      data: { token },
    });

    return { username: user.username, name: user.name, token };
  }

  async get(user: User): Promise<UserResponse> {
    return { username: user.username, name: user.name };
  }

  async logout(user: User): Promise<UserResponse> {
    await this.prismaService.user.update({
      where: { username: user.username },
      data: { token: null },
    });
    return { username: user.username, name: user.name };
  }
}
```

### AuthGuard — Token-based Authentication
```typescript
// common/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    if (!token) throw new HttpException('Unauthorized', 401);

    const user = await this.prismaService.user.findFirst({
      where: { token },
    });
    if (!user) throw new HttpException('Unauthorized', 401);

    request.user = user;  // Simpan user di request
    return true;
  }
}
```

### Custom @Auth() Decorator
```typescript
// common/auth.decorator.ts
export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  }
);
```

### UserController
```typescript
// user/user.controller.ts
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async register(@Body() request: RegisterUserRequest): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return { data: result };
  }

  @Post('/login')
  async login(@Body() request: LoginUserRequest): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request);
    return { data: result };
  }

  @Get('/current')
  @UseGuards(AuthGuard)
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);
    return { data: result };
  }

  @Patch('/current')
  @UseGuards(AuthGuard)
  async update(
    @Auth() user: User,
    @Body() request: UpdateUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.update(user, request);
    return { data: result };
  }

  @Delete('/current')
  @UseGuards(AuthGuard)
  async logout(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.logout(user);
    return { data: result };
  }
}
```

---

## 7. Contact Management API

### Schema Validasi
```typescript
export const CreateContactRequest = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().max(100).optional(),
  email: z.string().email().max(200).optional(),
  phone: z.string().max(20).optional(),
});

export const SearchContactRequest = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(10),
});
```

### ContactService — Search dengan Pagination
```typescript
async search(user: User, request: SearchContactRequest): Promise<Paging<ContactResponse>> {
  const req = this.validationService.validate(SearchContactRequest, request);

  const filters = [];
  if (req.name) {
    filters.push({
      OR: [
        { first_name: { contains: req.name } },
        { last_name: { contains: req.name } },
      ],
    });
  }
  if (req.email) filters.push({ email: { contains: req.email } });
  if (req.phone) filters.push({ phone: { contains: req.phone } });

  const [contacts, total] = await Promise.all([
    this.prismaService.contact.findMany({
      where: { username: user.username, AND: filters },
      skip: (req.page - 1) * req.size,
      take: req.size,
    }),
    this.prismaService.contact.count({
      where: { username: user.username, AND: filters },
    }),
  ]);

  return {
    data: contacts.map(toContactResponse),
    paging: {
      current_page: req.page,
      size: req.size,
      total_page: Math.ceil(total / req.size),
    },
  };
}
```

---

## 8. Address Management API

### AddressController — Nested Route
```typescript
@Controller('/api/contacts/:contactId/addresses')
@UseGuards(AuthGuard)
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  async create(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    const result = await this.addressService.create(user, contactId, request);
    return { data: result };
  }

  @Get(':addressId')
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponse>> {
    const result = await this.addressService.get(user, contactId, addressId);
    return { data: result };
  }

  @Get()
  async list(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<AddressResponse[]>> {
    const result = await this.addressService.list(user, contactId);
    return { data: result };
  }
}
```

---

## 9. Pola Umum yang Digunakan

### WebResponse — Format Response Standar
```typescript
// model/web.model.ts
export class WebResponse<T> {
  data?: T;
  errors?: string;
  paging?: Paging;
}

export class Paging {
  size: number;
  current_page: number;
  total_page: number;
}
```

### Exception Filter — Tangkap Error Zod & HttpException
```typescript
@Catch(ZodError)
export class ZodFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    res.status(400).json({
      errors: exception.errors.map(e => `${e.path.join('.')}: ${e.message}`),
    });
  }
}

// Global di AppModule
{ provide: APP_FILTER, useClass: ZodFilter }
```

### Verifikasi Ownership (Service Pattern)
```typescript
// Selalu cek bahwa resource milik user yang login
async checkContact(username: string, contactId: number): Promise<Contact> {
  const contact = await this.prismaService.contact.findFirst({
    where: { id: contactId, username },
  });
  if (!contact) throw new HttpException('Contact not found', 404);
  return contact;
}
```

### Struktur AppModule Final
```typescript
@Module({
  imports: [
    CommonModule,    // Prisma, Logger, Config — global
    UserModule,
    ContactModule,
    AddressModule,
  ],
})
export class AppModule {}
```

### main.ts
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
```

---

## Checklist Sebelum Deploy

- [ ] Semua route yang butuh auth sudah pakai `@UseGuards(AuthGuard)`
- [ ] Semua input di-validate dengan Zod sebelum diproses
- [ ] Password di-hash dengan bcrypt (salt rounds = 10)
- [ ] Token digenerate dengan `uuidv4()`
- [ ] Ownership check di setiap operasi contact/address
- [ ] Error response menggunakan format `WebResponse` yang konsisten
- [ ] `app.enableShutdownHooks()` diaktifkan
- [ ] Environment variable `DATABASE_URL` sudah terkonfigurasi
