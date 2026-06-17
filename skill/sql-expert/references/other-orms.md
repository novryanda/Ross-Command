# ORM Lainnya — Quick Reference

---

## TypeORM (TypeScript/Node.js)

### Setup
```typescript
import { DataSource } from 'typeorm'
const AppDataSource = new DataSource({ type: 'postgres', ... })
```

### Repository Pattern
```typescript
const userRepo = AppDataSource.getRepository(User)

// Find
const users = await userRepo.find({
  where: { isActive: true },
  relations: ['posts', 'orders'],
  order: { createdAt: 'DESC' },
  skip: 0, take: 20
})

// Save (insert or update)
await userRepo.save({ id: 1, name: 'Updated' })
```

### QueryBuilder (untuk query kompleks)
```typescript
const result = await AppDataSource
  .createQueryBuilder('user', 'u')
  .select(['u.id', 'u.name', 'COUNT(o.id) as orderCount'])
  .leftJoin('u.orders', 'o')
  .where('u.createdAt >= :start', { start: startDate })
  .andWhere('u.deletedAt IS NULL')
  .groupBy('u.id')
  .having('COUNT(o.id) > :min', { min: 5 })
  .orderBy('orderCount', 'DESC')
  .getRawMany()

// Raw Query
const result = await AppDataSource.query(
  `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
  [userId]
)
```

### Transactions
```typescript
await AppDataSource.transaction(async (manager) => {
  await manager.save(Order, orderData)
  await manager.decrement(Product, { id: productId }, 'stock', 1)
})
```

---

## Sequelize (JavaScript/TypeScript)

### Basic Queries
```javascript
// FindAll dengan kondisi
const users = await User.findAll({
  where: {
    isActive: true,
    createdAt: { [Op.gte]: new Date('2024-01-01') }
  },
  include: [{
    model: Post,
    as: 'posts',
    required: false, // LEFT JOIN
    where: { published: true }
  }],
  order: [['createdAt', 'DESC']],
  limit: 20, offset: 0,
  attributes: ['id', 'name', 'email'] // SELECT spesifik
})

// FindOrCreate
const [user, created] = await User.findOrCreate({
  where: { email: 'budi@example.com' },
  defaults: { name: 'Budi' }
})

// Bulk Create
await User.bulkCreate(dataArray, { ignoreDuplicates: true })
```

### Aggregasi
```javascript
const stats = await Order.findAll({
  where: { status: 'completed' },
  attributes: [
    'categoryId',
    [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['categoryId'],
  having: sequelize.literal('COUNT(id) > 10'),
  order: [[sequelize.literal('revenue'), 'DESC']]
})
```

### Raw Query
```javascript
const [results] = await sequelize.query(
  'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
  { replacements: [userId], type: QueryTypes.SELECT }
)
```

### Transaction
```javascript
const t = await sequelize.transaction()
try {
  const order = await Order.create(data, { transaction: t })
  await Product.decrement('stock', { where: { id }, transaction: t })
  await t.commit()
} catch (e) {
  await t.rollback()
  throw e
}
```

---

## SQLAlchemy (Python)

### Setup
```python
from sqlalchemy import create_engine, select, and_, or_, func
from sqlalchemy.orm import Session, DeclarativeBase

engine = create_engine("postgresql://user:pass@localhost/db")
```

### ORM Queries (2.0 style)
```python
with Session(engine) as session:
    # Select
    stmt = (
        select(User)
        .where(and_(User.is_active == True, User.deleted_at.is_(None)))
        .order_by(User.created_at.desc())
        .limit(20).offset(0)
    )
    users = session.scalars(stmt).all()

    # JOIN dengan aggregasi
    stmt = (
        select(
            User.id, User.name,
            func.count(Order.id).label('order_count'),
            func.sum(Order.total).label('revenue')
        )
        .join(Order, User.id == Order.user_id, isouter=True)
        .where(User.deleted_at.is_(None))
        .group_by(User.id, User.name)
        .having(func.count(Order.id) > 5)
        .order_by(func.sum(Order.total).desc())
    )
    result = session.execute(stmt).all()

    # Upsert
    from sqlalchemy.dialects.postgresql import insert
    stmt = insert(UserSetting).values(user_id=uid, key='theme', value='dark')
    stmt = stmt.on_conflict_do_update(
        index_elements=['user_id', 'key'],
        set_={'value': stmt.excluded.value}
    )
    session.execute(stmt)
    session.commit()
```

### Raw SQL (SQLAlchemy)
```python
from sqlalchemy import text

with Session(engine) as session:
    result = session.execute(
        text("SELECT * FROM users WHERE id = :id AND deleted_at IS NULL"),
        {"id": user_id}
    ).fetchall()
```

### Async SQLAlchemy
```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")

async with AsyncSession(engine) as session:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
```

---

## Eloquent (PHP / Laravel)

### Basic
```php
// Fluent query builder
$users = User::where('is_active', true)
    ->whereNull('deleted_at')
    ->where('created_at', '>=', now()->subDays(30))
    ->with(['posts' => fn($q) => $q->where('published', true)])
    ->withCount('orders')
    ->orderByDesc('created_at')
    ->paginate(20);

// Upsert
User::updateOrCreate(
    ['email' => 'budi@example.com'],
    ['name' => 'Budi', 'updated_at' => now()]
);

// Bulk upsert (Laravel 8+)
User::upsert($data, ['email'], ['name', 'updated_at']);
```

### Aggregasi
```php
$stats = Order::select('category_id')
    ->selectRaw('SUM(total) as revenue, COUNT(id) as count')
    ->where('status', 'completed')
    ->groupBy('category_id')
    ->havingRaw('COUNT(id) > 10')
    ->orderByDesc('revenue')
    ->get();
```

### Raw Query
```php
// DB facade
$users = DB::select(
    'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
    [$userId]
);

// Join raw SQL ke dalam Eloquent
$users = User::select('users.*', DB::raw('COUNT(orders.id) as order_count'))
    ->leftJoin('orders', 'users.id', '=', 'orders.user_id')
    ->groupBy('users.id')
    ->get();
```

### Transaction
```php
DB::transaction(function () use ($data) {
    $order = Order::create($data);
    Product::where('id', $data['product_id'])->decrement('stock');
    return $order;
});
```

---

## GORM (Go)

### Basic
```go
import "gorm.io/gorm"

// Find
var users []User
db.Where("is_active = ? AND deleted_at IS NULL", true).
   Order("created_at desc").
   Limit(20).Offset(0).
   Preload("Posts", "published = ?", true).
   Find(&users)

// Create
result := db.Create(&User{Name: "Budi", Email: "budi@example.com"})

// Upsert
db.Save(&user) // insert or update based on primary key
db.Clauses(clause.OnConflict{
    Columns:   []clause.Column{{Name: "email"}},
    DoUpdates: clause.AssignmentColumns([]string{"name", "updated_at"}),
}).Create(&user)
```

### Join & Raw
```go
// Join
type Result struct {
    UserID     int
    Name       string
    OrderCount int
    Revenue    float64
}
var results []Result
db.Table("users u").
   Select("u.id, u.name, COUNT(o.id) as order_count, SUM(o.total) as revenue").
   Joins("LEFT JOIN orders o ON o.user_id = u.id").
   Where("u.deleted_at IS NULL").
   Group("u.id, u.name").
   Scan(&results)

// Raw SQL
db.Raw("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL", userID).
   Scan(&user)
```

### Transaction
```go
db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&order).Error; err != nil {
        return err
    }
    if err := tx.Model(&Product{}).Where("id = ?", productID).
        UpdateColumn("stock", gorm.Expr("stock - 1")).Error; err != nil {
        return err
    }
    return nil
})
```
