# SEAPEDIA Backend

Multi-role e-commerce marketplace API — **Buyer**, **Seller**, **Driver**, **Admin**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22 (ESM) |
| Framework | Express 5 |
| ORM | Prisma 7 + PostgreSQL (Neon) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Joi |
| Media | Cloudinary SDK (automatic webp conversion) |
| Docs | Swagger (OpenAPI 3.0) |
| Runner | tsx |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with DATABASE_URL, JWT_SECRET, CLOUDINARY_* vars

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
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
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
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | List products (search, sort, category filter, pagination) |
| GET | `/api/products/:id` | No | Product detail with reviews |
| GET | `/api/reviews` | No | List reviews |
| POST | `/api/reviews` | Optional | Submit review |
| GET | `/api/stores` | No | List stores |
| GET | `/api/stores/:id` | No | Store detail with products |
| GET | `/api/deals` | No | Deal of the Day |
| GET | `/api/hero` | No | Hero section content |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | Bearer | Upload image to Cloudinary (multipart, field: `image`) |

Uploads are stored in Cloudinary under `seapedia/` folder with automatic webp conversion (800×800 max). Temp files are cleaned up after upload.

### Seller
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT | `/api/seller/store` | Store CRUD |
| GET/POST | `/api/seller/products` | Product list / create |
| PUT/DELETE | `/api/seller/products/:id` | Update / delete product |
| GET | `/api/seller/orders` | Incoming orders |
| PUT | `/api/seller/orders/:id/process` | Process to next status |
| GET | `/api/seller/report` | Sales report (daily/monthly) |

### Buyer
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

### Driver
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/driver/jobs` | Available delivery jobs |
| GET | `/api/driver/jobs/:id` | Job detail |
| POST | `/api/driver/jobs/:id/take` | Accept job |
| POST | `/api/driver/jobs/:id/complete` | Complete delivery |
| GET | `/api/driver/my-jobs` | Driver's active jobs |
| GET | `/api/driver/earnings` | Earnings summary & history |

### Admin
| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/dashboard` |
| POST | `/api/admin/process-overdue` |
| POST | `/api/admin/simulate-next-day` |
| GET/POST | `/api/admin/vouchers` |
| GET/PUT/DELETE | `/api/admin/vouchers/:id` |
| GET/POST | `/api/admin/promos` |
| GET/PUT/DELETE | `/api/admin/promos/:id` |
| POST | `/api/admin/deals` |
| GET/PUT | `/api/admin/hero` |

Every protected endpoint requires:
- `Authorization: Bearer <role-scoped token>` (obtained via `/api/auth/active-role` after login)
- Role is embedded in JWT `activeRole` claim — no `X-Active-Role` header needed

## Business Rules

### Single-Store Cart
Cart only accepts products from **one store**. Cross-store add attempts are rejected.

### PPN 12%
`finalTotal = (subtotal - discount) × 1.12 + shipping`

### Discount (Voucher & Promo)
| Type | Limit | Behavior |
|------|-------|----------|
| Voucher | `usageLimit` counter | `usedCount` increments per checkout |
| Promo | `expiryDate` only | No usage cap |
| Both | — | Only **one** discount code per checkout |
| Diskon | Percentage or Fixed | Cannot exceed subtotal (auto-capped) |

### Delivery Fees
| Method | Fee |
|--------|-----|
| Instant | Rp 25,000 |
| NextDay | Rp 15,000 |
| Regular | Rp 10,000 |

### Driver Earnings
Drivers receive **50% of delivery fee** per completed order.

### Overdue SLA & Auto-Refund
| Method | SLA (from `SedangDikirim`) |
|--------|---------------------------|
| Instant | 1 day (2 simulate cycles) |
| NextDay | 2 days (3 simulate cycles) |
| Regular | 3 days (4 simulate cycles) |

On overdue:
- Order → `Dikembalikan`
- Buyer fully refunded
- Product stock restored
- Log entry: "Overdue auto-refund"

### Order Status Flow
```
SedangDikemas → MenungguPengirim → SedangDikirim → PesananSelesai
                                                        ↓
                                                   Dikembalikan (overdue)
```

## Project Structure

```
src/
├── app.js              ← Entry point (Express config, middleware, routes)
├── config/             ← Prisma client, env loader, JWT config, Swagger setup
├── controllers/        ← Route handlers (auth, public, seller, buyer, driver, admin, general)
├── middleware/         ← Auth (JWT verify), role guard, validation (Joi), sanitize, rate limiter, error handler
├── routes/            ← Express routers (auth, public, seller, buyer, driver, admin, upload)
├── services/          ← Business logic (auth, store, product, cart, checkout, order, wallet, delivery, review, discount, admin)
└── utils/             ← Cloudinary SDK, errors, response helpers, token utils, validation schemas, sanitize helpers
prisma/
├── schema.prisma       ← Data models (User, Store, Product, Order, Cart, Wallet, Voucher, Promo, etc.)
└── seed.js             ← Demo data seeder
```

## Security

| Layer | Implementation |
|-------|---------------|
| Passwords | bcrypt (cost factor 12) |
| Tokens | JWT with role-based expiry: Buyer 4h, Driver 2d, Seller 7d, Admin 7d. General token: 15m |
| Active Role | Embedded in JWT `activeRole` claim |
| SQL Injection | Prisma ORM (parameterized queries) |
| XSS | HTML entity encoding on user-content output |
| Input Validation | Joi schemas on every endpoint |
| Rate Limiting | Login: 5 req/min; General: 200 req/min |
| RBAC | `authorize()` middleware verifies role from JWT |

## Demo Flow (End-to-End)

```bash
# 1. Login as buyer
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"buyer1","password":"User1234"}'

# 2. Add items to cart
curl -s -X POST http://localhost:5000/api/buyer/cart/items \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}'

# 3. Checkout with discount
curl -s -X POST http://localhost:5000/api/buyer/checkout \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"addressId":1,"deliveryMethod":"Regular","discountCode":"FLAT50K"}'

# 4. Seller processes order
curl -s -X PUT http://localhost:5000/api/seller/orders/1/process \
  -H "Authorization: Bearer <SELLER_TOKEN>"

# 5. Driver takes & completes job
curl -s -X POST http://localhost:5000/api/driver/jobs/1/take \
  -H "Authorization: Bearer <DRIVER_TOKEN>"
curl -s -X POST http://localhost:5000/api/driver/jobs/1/complete \
  -H "Authorization: Bearer <DRIVER_TOKEN>"
```
