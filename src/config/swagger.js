const apiDoc = {
  openapi: "3.0.3",
  info: {
    title: "SEAPEDIA API",
    version: "1.0.0",
    description:
      "E-commerce multi-role marketplace API — **Buyer**, **Seller**, **Driver**, **Admin**.\n\nEvery protected endpoint requires:\n- `Authorization: Bearer <token>`\n- `X-Active-Role`: one of `Buyer`, `Seller`, `Driver`, `Admin` (must match a role your account owns)",
  },
  servers: [
    { url: "http://localhost:5000", description: "Local development" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token from /api/auth/login",
      },
    },
    parameters: {
      RoleBuyer: {
        name: "X-Active-Role",
        in: "header",
        required: true,
        description: "Active role — must have `Buyer` in your account",
        schema: { type: "string", enum: ["Buyer"] },
      },
      RoleSeller: {
        name: "X-Active-Role",
        in: "header",
        required: true,
        description: "Active role — must have `Seller` in your account",
        schema: { type: "string", enum: ["Seller"] },
      },
      RoleDriver: {
        name: "X-Active-Role",
        in: "header",
        required: true,
        description: "Active role — must have `Driver` in your account",
        schema: { type: "string", enum: ["Driver"] },
      },
      RoleAdmin: {
        name: "X-Active-Role",
        in: "header",
        required: true,
        description: "Active role — must have `Admin` in your account",
        schema: { type: "string", enum: ["Admin"] },
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["username", "email", "password", "roles"],
        properties: {
          username: { type: "string", example: "johndoe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          password: { type: "string", example: "Password123" },
          roles: {
            type: "array",
            items: { type: "string", enum: ["Buyer", "Seller", "Driver"] },
            example: ["Buyer"],
          },
        },
      },
      LoginInput: {
        type: "object",
        required: ["identifier", "password"],
        properties: {
          identifier: { type: "string", example: "buyer1" },
          password: { type: "string", example: "User1234" },
        },
      },
      ActiveRoleInput: {
        type: "object",
        required: ["activeRole"],
        properties: {
          activeRole: { type: "string", enum: ["Buyer", "Seller", "Driver", "Admin"] },
        },
      },
      ReviewInput: {
        type: "object",
        required: ["reviewerName", "rating", "comment"],
        properties: {
          reviewerName: { type: "string", example: "Andi" },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
          comment: { type: "string", example: "Great app!" },
        },
      },
      StoreInput: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", example: "Toko Jaya" } },
      },
      ProductInput: {
        type: "object",
        required: ["name", "price", "stock"],
        properties: {
          name: { type: "string", example: "Product Name" },
          description: { type: "string", example: "Description" },
          price: { type: "number", example: 50000 },
          stock: { type: "integer", example: 100 },
        },
      },
      ProductUpdateInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          stock: { type: "integer" },
        },
      },
      TopUpInput: {
        type: "object",
        required: ["amount"],
        properties: { amount: { type: "number", example: 100000 } },
      },
      AddressInput: {
        type: "object",
        required: ["label", "recipient", "phone", "addressLine", "city", "postalCode"],
        properties: {
          label: { type: "string", example: "Rumah" },
          recipient: { type: "string", example: "Budi" },
          phone: { type: "string", example: "081234567890" },
          addressLine: { type: "string", example: "Jl. Merdeka No.1" },
          city: { type: "string", example: "Jakarta" },
          postalCode: { type: "string", example: "12345" },
          isPrimary: { type: "boolean", example: true },
        },
      },
      CartItemInput: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "integer", example: 1 },
          quantity: { type: "integer", example: 2 },
        },
      },
      CheckoutInput: {
        type: "object",
        required: ["addressId", "deliveryMethod"],
        properties: {
          addressId: { type: "integer", example: 1 },
          deliveryMethod: { type: "string", enum: ["Instant", "NextDay", "Regular"], example: "Regular" },
          discountCode: { type: "string", example: "FLAT50K" },
        },
      },
      VoucherInput: {
        type: "object",
        required: ["code", "discountType", "discountValue", "expiryDate", "usageLimit"],
        properties: {
          code: { type: "string", example: "HEMAT50" },
          discountType: { type: "string", enum: ["Percentage", "Fixed"] },
          discountValue: { type: "number", example: 10 },
          minOrder: { type: "number", example: 500000 },
          expiryDate: { type: "string", format: "date-time" },
          usageLimit: { type: "integer", example: 100 },
        },
      },
      PromoInput: {
        type: "object",
        required: ["code", "discountType", "discountValue", "expiryDate"],
        properties: {
          code: { type: "string", example: "GRANDLAUNCH" },
          discountType: { type: "string", enum: ["Percentage", "Fixed"] },
          discountValue: { type: "number", example: 20 },
          minOrder: { type: "number", example: 1000000 },
          expiryDate: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    // ── Auth ──
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user",
        description: "Create account with one or more roles (Buyer, Seller, Driver). Admin is separate.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
        },
        responses: {
          201: { description: "User registered — returns JWT token" },
          409: { description: "Username/email already taken" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Login with username or email. Returns JWT token and your role list.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: {
          200: { description: "Returns user + JWT token" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get profile",
        description: "Get current user's profile. No role header needed.",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "User profile" } },
      },
    },
    "/api/auth/active-role": {
      post: {
        tags: ["Auth"],
        summary: "Set active role",
        description: "Validate a role is owned by your account. (Client-side only — server ignores this; use `X-Active-Role` header per request.)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ActiveRoleInput" } } },
        },
        responses: { 200: { description: "Role is valid for this account" } },
      },
    },

    // ── Public ──
    "/api/public/products": {
      get: {
        tags: ["Public"],
        summary: "List products (paginated)",
        description: "Public — no auth required.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Product list" } },
      },
    },
    "/api/public/products/{id}": {
      get: {
        tags: ["Public"],
        summary: "Get product detail",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          200: { description: "Product detail" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/public/reviews": {
      get: {
        tags: ["Public"],
        summary: "List reviews",
        description: "Public — no auth required.",
        responses: { 200: { description: "Review list" } },
      },
      post: {
        tags: ["Public"],
        summary: "Submit a review (guest or logged-in)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewInput" } } },
        },
        responses: { 201: { description: "Review created" } },
      },
    },

    // ── Seller (role: Seller) ──
    "/api/seller/store": {
      get: {
        tags: ["Seller"],
        summary: "Get my store",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        responses: { 200: { description: "Store data" } },
      },
      post: {
        tags: ["Seller"],
        summary: "Create store",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StoreInput" } } },
        },
        responses: {
          201: { description: "Created" },
          409: { description: "Name already taken" },
        },
      },
      put: {
        tags: ["Seller"],
        summary: "Update store name",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/StoreInput" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
    },
    "/api/seller/products": {
      get: {
        tags: ["Seller"],
        summary: "List my products",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        responses: { 200: { description: "Product list" } },
      },
      post: {
        tags: ["Seller"],
        summary: "Create product",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductInput" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/api/seller/products/{id}": {
      put: {
        tags: ["Seller"],
        summary: "Update product",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleSeller" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ProductUpdateInput" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Seller"],
        summary: "Delete product",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleSeller" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/seller/orders": {
      get: {
        tags: ["Seller"],
        summary: "List incoming orders",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        responses: { 200: { description: "Order list" } },
      },
    },
    "/api/seller/orders/{id}/process": {
      put: {
        tags: ["Seller"],
        summary: "Process order → MenungguPengirim",
        description: "Only orders with status `SedangDikemas` can be processed.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleSeller" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Processed" } },
      },
    },
    "/api/seller/report": {
      get: {
        tags: ["Seller"],
        summary: "Income report",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleSeller" }],
        responses: { 200: { description: "Income report" } },
      },
    },

    // ── Buyer (role: Buyer) ──
    "/api/buyer/wallet": {
      get: {
        tags: ["Buyer"],
        summary: "Get wallet",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        responses: { 200: { description: "Wallet data" } },
      },
    },
    "/api/buyer/wallet/topup": {
      post: {
        tags: ["Buyer"],
        summary: "Top-up wallet (dummy)",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TopUpInput" } } },
        },
        responses: { 200: { description: "Topped up" } },
      },
    },
    "/api/buyer/wallet/transactions": {
      get: {
        tags: ["Buyer"],
        summary: "Transaction history",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        responses: { 200: { description: "Transaction list" } },
      },
    },
    "/api/buyer/addresses": {
      get: {
        tags: ["Buyer"],
        summary: "List addresses",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        responses: { 200: { description: "Address list" } },
      },
      post: {
        tags: ["Buyer"],
        summary: "Create address",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AddressInput" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/api/buyer/addresses/{id}": {
      put: {
        tags: ["Buyer"],
        summary: "Update address",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleBuyer" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AddressInput" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Buyer"],
        summary: "Delete address",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleBuyer" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/buyer/cart": {
      get: {
        tags: ["Buyer"],
        summary: "Get cart",
        description: "Cart can only hold items from ONE store.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        responses: { 200: { description: "Cart contents" } },
      },
    },
    "/api/buyer/cart/items": {
      post: {
        tags: ["Buyer"],
        summary: "Add to cart",
        description: "Product must be from the same store as existing cart items.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CartItemInput" } } },
        },
        responses: { 200: { description: "Item added" } },
      },
    },
    "/api/buyer/cart/items/{id}": {
      put: {
        tags: ["Buyer"],
        summary: "Update cart item quantity",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleBuyer" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { quantity: { type: "integer" } } } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Buyer"],
        summary: "Remove from cart",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleBuyer" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Removed" } },
      },
    },
    "/api/buyer/checkout/preview": {
      post: {
        tags: ["Buyer"],
        summary: "Checkout preview",
        description: "Shows subtotal, discount, PPN 12%, delivery fee, final total. Does NOT deduct anything.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CheckoutInput" } } },
        },
        responses: { 200: { description: "Price breakdown" } },
      },
    },
    "/api/buyer/checkout": {
      post: {
        tags: ["Buyer"],
        summary: "Execute checkout",
        description:
          "Deducts stock, deducts wallet, creates order. All in one Prisma transaction. Order starts as `SedangDikemas`.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CheckoutInput" } } },
        },
        responses: {
          201: { description: "Order created" },
          400: { description: "Insufficient balance/stock" },
        },
      },
    },
    "/api/buyer/orders": {
      get: {
        tags: ["Buyer"],
        summary: "My orders",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        responses: { 200: { description: "Order list" } },
      },
    },
    "/api/buyer/orders/{id}": {
      get: {
        tags: ["Buyer"],
        summary: "Order detail",
        description: "Includes items, status history timeline, delivery job.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleBuyer" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Order detail" } },
      },
    },
    "/api/buyer/report": {
      get: {
        tags: ["Buyer"],
        summary: "Spending report",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleBuyer" }],
        responses: { 200: { description: "Spending summary" } },
      },
    },

    // ── Driver (role: Driver) ──
    "/api/driver/jobs": {
      get: {
        tags: ["Driver"],
        summary: "Available jobs",
        description: "Orders with status `MenungguPengirim` that haven't been taken yet.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleDriver" }],
        responses: { 200: { description: "Job list" } },
      },
    },
    "/api/driver/jobs/{id}": {
      get: {
        tags: ["Driver"],
        summary: "Job detail",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleDriver" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Job detail" } },
      },
    },
    "/api/driver/jobs/{id}/take": {
      post: {
        tags: ["Driver"],
        summary: "Take job",
        description: "Atomic — uses Prisma transaction to prevent double-claim. Status → `SedangDikirim`.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleDriver" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Job taken" } },
      },
    },
    "/api/driver/jobs/{id}/complete": {
      post: {
        tags: ["Driver"],
        summary: "Complete job",
        description: "Status → `PesananSelesai`. Driver earns 50% of delivery fee.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleDriver" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Completed — includes earnings" } },
      },
    },
    "/api/driver/my-jobs": {
      get: {
        tags: ["Driver"],
        summary: "My jobs",
        description: "All jobs taken by this driver.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleDriver" }],
        responses: { 200: { description: "My jobs" } },
      },
    },
    "/api/driver/earnings": {
      get: {
        tags: ["Driver"],
        summary: "Earnings summary",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleDriver" }],
        responses: { 200: { description: "Total earnings + breakdown" } },
      },
    },

    // ── Admin (role: Admin) ──
    "/api/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Monitoring dashboard",
        description: "User/product/order counts + overdue order list.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        responses: { 200: { description: "Dashboard stats" } },
      },
    },
    "/api/admin/process-overdue": {
      post: {
        tags: ["Admin"],
        summary: "Process overdue orders",
        description:
          "Auto-refund orders that exceeded SLA (Instant: 1d, NextDay: 2d, Regular: 3d). Refunds wallet + restores stock.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        responses: { 200: { description: "Processed results" } },
      },
    },
    "/api/admin/simulate-next-day": {
      post: {
        tags: ["Admin"],
        summary: "Simulate next day",
        description: "Fast-forwards all active order timestamps by 24h, then runs overdue processor. For testing SLA.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        responses: { 200: { description: "Simulation result" } },
      },
    },
    "/api/admin/vouchers": {
      get: {
        tags: ["Admin"],
        summary: "List vouchers",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        responses: { 200: { description: "Voucher list" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create voucher",
        description: "Voucher has a usage limit.",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VoucherInput" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/api/admin/vouchers/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Voucher detail",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Voucher detail" } },
      },
      put: {
        tags: ["Admin"],
        summary: "Update voucher",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/VoucherInput" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete voucher",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/admin/promos": {
      get: {
        tags: ["Admin"],
        summary: "List promos",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        responses: { 200: { description: "Promo list" } },
      },
      post: {
        tags: ["Admin"],
        summary: "Create promo",
        description: "Promo has NO usage limit (unlimited until expiry).",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PromoInput" } } },
        },
        responses: { 201: { description: "Created" } },
      },
    },
    "/api/admin/promos/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Promo detail",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Promo detail" } },
      },
      put: {
        tags: ["Admin"],
        summary: "Update promo",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PromoInput" } } },
        },
        responses: { 200: { description: "Updated" } },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete promo",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Deleted" } },
      },
    },
    "/api/admin/products": {
      get: {
        tags: ["Admin"],
        summary: "List all products",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RoleAdmin" }],
        responses: { 200: { description: "Product list" } },
      },
    },
    "/api/admin/products/{id}/deal": {
      put: {
        tags: ["Admin"],
        summary: "Toggle deal of the day",
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: "#/components/parameters/RoleAdmin" },
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: { 200: { description: "Deal toggled" } },
      },
    },
  },
};

export default apiDoc;
