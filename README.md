# SEAPEDIA Backend

E-commerce multi-role marketplace API — **Buyer**, **Seller**, **Driver**, **Admin**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 (ESM) |
| Framework | Express 5 |
| ORM | Prisma 7 + PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Joi |
| Docs | Swagger (OpenAPI 3.0) |
| Runner | tsx |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and a strong JWT_SECRET

# 3. Push schema to database
npm run db:push

# 4. Generate Prisma client
npm run db:generate

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
```

API runs at `http://localhost:5000`  
Swagger docs at `http://localhost:5000/api-docs`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload (watch mode) |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:migrate` | Create and apply migration |
| `npm run db:studio` | Open Prisma Studio GUI |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Neon or local) |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | `development` or `production` |

## Demo Accounts

After running `npm run db:seed`:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Seller 1 | `seller1` | `User1234` |
| Seller 2 | `seller2` | `User1234` |
| Buyer 1 | `buyer1` | `User1234` (balance: 5,000,000) |
| Buyer 2 | `buyer2` | `User1234` (balance: 3,000,000) |
| Driver 1 | `driver1` | `User1234` |

## API Endpoints

### Auth
| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/profile` | Bearer |
| POST | `/api/auth/active-role` | Bearer |

### Public
| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/products` | No |
| GET | `/api/products/:id` | No |
| GET | `/api/reviews` | No |
| POST | `/api/reviews` | Optional |

### Seller (`X-Active-Role: Seller`)
| Method | Endpoint |
|--------|----------|
| GET/POST/PUT | `/api/seller/store` |
| GET/POST | `/api/seller/products` |
| PUT/DELETE | `/api/seller/products/:id` |
| GET | `/api/seller/orders` |
| PUT | `/api/seller/orders/:id/process` |
| GET | `/api/seller/report` |

### Buyer (`X-Active-Role: Buyer`)
| Method | Endpoint |
|--------|----------|
| GET | `/api/buyer/wallet` |
| POST | `/api/buyer/wallet/topup` |
| GET | `/api/buyer/wallet/transactions` |
| GET/POST | `/api/buyer/addresses` |
| PUT/DELETE | `/api/buyer/addresses/:id` |
| GET | `/api/buyer/cart` |
| POST | `/api/buyer/cart/items` |
| PUT/DELETE | `/api/buyer/cart/items/:id` |
| POST | `/api/buyer/checkout/preview` |
| POST | `/api/buyer/checkout` |
| GET | `/api/buyer/orders` |
| GET | `/api/buyer/orders/:id` |
| GET | `/api/buyer/report` |

### Driver (`X-Active-Role: Driver`)
| Method | Endpoint |
|--------|----------|
| GET | `/api/driver/jobs` |
| GET | `/api/driver/jobs/:id` |
| POST | `/api/driver/jobs/:id/take` |
| POST | `/api/driver/jobs/:id/complete` |
| GET | `/api/driver/my-jobs` |
| GET | `/api/driver/earnings` |

### Admin (`X-Active-Role: Admin`)
| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/dashboard` |
| POST | `/api/admin/process-overdue` |
| POST | `/api/admin/simulate-next-day` |
| GET/POST | `/api/admin/vouchers` |
| GET | `/api/admin/vouchers/:id` |
| GET/POST | `/api/admin/promos` |
| GET | `/api/admin/promos/:id` |

Every protected endpoint requires:
- `Authorization: Bearer <token>`
- `X-Active-Role: Buyer|Seller|Driver|Admin`

## Business Rules

### Single-Store Cart
Keranjang hanya boleh berisi produk dari **satu toko**. Menambahkan produk dari toko berbeda akan ditolak dengan pesan error.

### PPN 12%
PPN 12% dihitung dari **subtotal setelah diskon** (bukan sebelum diskon).  
Formula: `finalTotal = (subtotal - diskon) × 1.12 + ongkir`

### Discount (Voucher & Promo)
- **Voucher**: memiliki `usageLimit` (batas total pemakaian). Counter `usedCount` bertambah setiap checkout.
- **Promo**: tidak memiliki batas pemakaian, hanya dibatasi `expiryDate`.
- **Hanya satu kode diskon** per checkout (voucher DAN promo tidak bisa digabung).
- Diskon bisa `Percentage` (persen dari subtotal) atau `Fixed` (potongan nominal).
- Diskon tidak bisa melebihi subtotal (dipotong otomatis).

### Delivery Fees
| Method | Fee |
|--------|-----|
| Instant | Rp 25,000 |
| NextDay | Rp 15,000 |
| Regular | Rp 10,000 |

### Driver Earnings
Driver mendapat **50% dari ongkir** setiap menyelesaikan pengiriman.

### Overdue SLA & Auto-Refund
| Method | SLA |
|--------|-----|
| Instant | 1 hari |
| NextDay | 2 hari |
| Regular | 3 hari |

Waktu dihitung dari `updatedAt` saat order berstatus `SedangDikirim`.  
Admin dapat memproses overdue secara manual (`process-overdue`) atau menggunakan simulasi waktu (`simulate-next-day`) untuk testing.

Saat overdue diproses:
- Status order → `Dikembalikan`
- Saldo buyer dikembalikan (full refund)
- Stok produk dikembalikan
- Catatan histori: "Overdue auto-refund"

### Order Status Flow
```
SedangDikemas → MenungguPengirim → SedangDikirim → PesananSelesai
                                                       ↓
                                                  Dikembalikan (overdue)
```

## Project Structure

```
src/
├── app.js              ← Entry point
├── config/             ← Prisma client, env, JWT, Swagger
├── controllers/        ← Route handlers (auth, public, seller, buyer, driver, admin)
├── middleware/          ← Auth, role guard, validation, sanitize, rate limiter, error handler
├── routes/             ← Express routers
├── services/           ← Business logic
└── utils/              ← Errors, response helpers, token utils, validation schemas, sanitize
prisma/
├── schema.prisma       ← Data models
└── seed.js             ← Demo data seeder
```

## Security

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt (cost factor 12) |
| Tokens | JWT with 7-day expiry, strong secret from env |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | Output sanitization (HTML entity encoding) on user-content fields |
| Input Validation | Joi schemas on all endpoints |
| Rate Limiting | Login: 5 req/min; General: 200 req/min |
| RBAC | Role check via `X-Active-Role` header, verified against JWT token roles |

## Demo Flow (End-to-End)

```bash
# 1. Login as buyer
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"buyer1","password":"User1234"}'
# Save the token

# 2. Add items to cart (must be from same store)
curl -s -X POST http://localhost:5000/api/buyer/cart/items \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Active-Role: Buyer" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}'

# 3. Checkout with discount
curl -s -X POST http://localhost:5000/api/buyer/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Active-Role: Buyer" \
  -H "Content-Type: application/json" \
  -d '{"addressId":1,"deliveryMethod":"Regular","discountCode":"FLAT50K"}'

# 4. Login as seller, process order
curl -s -X PUT http://localhost:5000/api/seller/orders/1/process \
  -H "Authorization: Bearer <SELLER_TOKEN>" \
  -H "X-Active-Role: Seller"

# 5. Login as driver, take & complete job
curl -s -X POST http://localhost:5000/api/driver/jobs/1/take \
  -H "Authorization: Bearer <DRIVER_TOKEN>" \
  -H "X-Active-Role: Driver"

curl -s -X POST http://localhost:5000/api/driver/jobs/1/complete \
  -H "Authorization: Bearer <DRIVER_TOKEN>" \
  -H "X-Active-Role: Driver"
```
