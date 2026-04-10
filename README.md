Node.js REST API for managing orders with authentication, using SQLite as a simple persistence layer. This document is a walkthrough for testers and documents the essential files in the project.

---

### Tech stack

- **Runtime**: Node.js (CommonJS)
- **Web framework**: `express`
- **Database**: `sqlite3` (file `orders.db`)
- **Auth**: `jsonwebtoken` (JWT) + `bcryptjs`
- **Config**: `dotenv`
- **Testing**: `jest`
- **API Documentation**: `swagger-ui-express` + `swagger-jsdoc`

---

### Requirements

- **Node.js**: v18+ (recommended)
- **npm**: v9+ (comes with Node)

---

### Setup

1. **Clone the project**

   ```bash
   git clone <your-repo-url>
   cd Jitterbit_case
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root with at least:

   ```bash
   JWT_SECRET=your_jwt_secret_here
   ```

   - **`JWT_SECRET`**: arbitrary non-empty string used to sign JWT tokens.

4. **Database**

   - The app uses a local SQLite file **`orders.db`** in the project root.
   - On first run, tables are created automatically by `config/database.js`:
     - Table `"Order"`: stores order header (id, value, creationDate).
     - Table `Items`: stores order line items.

---

### How to run the API

From the project root:

```bash
node index.js
```

- The server starts on **port 3000**.
- Console output:
  - `API running on port 3000`
  - `Swagger documentation available at http://localhost:3000/docs`
  - `Banco conectado.` (database connection)

### API Documentation (Swagger)

Once the server is running, you can access the interactive Swagger documentation at:

**http://localhost:3000/docs**

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality to test endpoints directly from the browser
- Authentication support (use the "Authorize" button to add your JWT token)

---

### How to run tests

From the project root:

```bash
npm test
```

- Uses `jest` with configuration in `package.json`.
- Test files are in the `tests/` folder:
  - `authService.test.js`
  - `orderService.test.js`
  - `setup.js` (loads `.env`).

---

### Walkthrough for testers

This section describes how to exercise the API step by step using any HTTP client (Postman, Insomnia, curl, etc.).

#### 1. Obtain a JWT token (login)

- **Endpoint**: `POST /auth/login`
- **Auth**: none
- **Body (JSON)**:

```json
{
  "username": "admin",
  "password": "123456"
}
```

- **Expected behavior**:
  - On success: `200 OK` with

    ```json
    {
      "token": "<JWT_TOKEN>"
    }
    ```

  - On invalid credentials: `401 Unauthorized` with

    ```json
    { "error": "Invalid credentials" }
    ```

> Use the returned `token` as a Bearer token in all `/order` endpoints:
> `Authorization: Bearer <JWT_TOKEN>`.

#### 2. Create an order

- **Endpoint**: `POST /order`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body (JSON)** – note the field names in Portuguese as required by the mapper:

```json
{
  "numeroPedido": "123-1",
  "dataCriacao": "2024-01-01T10:00:00.000Z",
  "valorTotal": 1000.5,
  "items": [
    {
      "idItem": "1",
      "quantidadeItem": 2,
      "valorItem": 500.25
    }
  ]
}
```

- **Expected behavior**:
  - On success: `201 Created` with the normalized order object:

    - `orderId`: extracted from `numeroPedido` before the first `-` (e.g. `"123"`).
    - `value`: from `valorTotal`.
    - `creationDate`: ISO string from `dataCriacao`.
    - `items`: array with `{ productId, quantity, price }`.

  - If an order with the same `orderId` already exists: `409 Conflict` with

    ```json
    { "error": "Order with this ID already exists" }
    ```

#### 3. List all orders

- **Endpoint**: `GET /order/list`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`

- **Expected behavior**:
  - `200 OK` with an array of orders.
  - Orders are ordered by `creationDate DESC`.

#### 4. Get a single order by id

- **Endpoint**: `GET /order/:id`
  - Example: `GET /order/123`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`

- **Expected behavior**:
  - If exists: `200 OK` with order header + items.
  - If not found: `404 Not Found` with

    ```json
    { "error": "Order not found" }
    ```

#### 5. Update an order

- **Endpoint**: `PUT /order/:id`
  - Example: `PUT /order/123`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>`
- **Body (JSON)**: same shape as `POST /order` (the `:id` in the URL is used as `orderId`).

- **Expected behavior**:
  - On success: `200 OK` with the updated normalized order.
  - If order does not exist: `404 Not Found` with

    ```json
    { "error": "Order not found" }
    ```

#### 6. Delete an order

- **Endpoint**: `DELETE /order/:id`
  - Example: `DELETE /order/123`
- **Headers**:
  - `Authorization: Bearer <JWT_TOKEN>`

- **Expected behavior**:
  - On success: `204 No Content`.
  - If order does not exist: `404 Not Found` with

    ```json
    { "error": "Order not found" }
    ```

---

### Error handling

- **Custom errors**:
  - `AppError` (in `middlewares/AppError.js`) is used to represent application-level errors with an HTTP status code.
- **Global error middleware**:
  - `errorHandler` (in `middlewares/errorHandler.js`) catches errors:
    - If `instanceof AppError`: returns `{ error: message }` with its status code.
    - Otherwise: logs the error and returns `500 Internal server error`.
- **Auth errors**:
  - Missing token: `401 { "error": "Token not provided" }`.
  - Invalid token: `401 { "error": "Invalid token" }`.

---

### Project structure and essential files

Below is a high-level description of the main modules for quick navigation.

- **`index.js`**
  - Entry point.
  - Loads environment variables, creates the Express app, wires JSON parsing, mounts Swagger UI at `/docs`, mounts `authRoutes` on `/auth`, `orderRoutes` on `/order`, and applies the global `errorHandler`.

- **`config/swagger.js`**
  - Swagger/OpenAPI configuration.
  - Defines API schemas, security schemes (JWT Bearer), and server information.
  - Uses `swagger-jsdoc` to generate the OpenAPI specification from JSDoc comments in route files.

- **`config/database.js`**
  - Creates the SQLite connection (`orders.db`).
  - Ensures tables `"Order"` and `Items` exist on startup.

- **Routes (`routes/`)**
  - **`authRoutes.js`**
    - `POST /auth/login` → `AuthController.login`.
    - Contains Swagger JSDoc annotations for API documentation.
  - **`orderRoutes.js`**
    - Applies `authMiddleware` to all order routes.
    - Defines:
      - `POST /order` → `OrderController.create`
      - `GET /order/list` → `OrderController.list`
      - `GET /order/:id` → `OrderController.get`
      - `PUT /order/:id` → `OrderController.update`
      - `DELETE /order/:id` → `OrderController.delete`
    - Contains Swagger JSDoc annotations for API documentation.

- **Controllers (`controllers/`)**
  - **`authController.js`**
    - Validates login payload via `LoginDTO`.
    - Calls `AuthService.login` and returns a token or `401` on error.
  - **`orderController.js`**
    - Thin HTTP layer over `OrderService`.
    - Wraps calls in `try/catch` and delegates errors to `next(error)` so they reach `errorHandler`.

- **Services (`services/`)**
  - **`authService.js`**
    - Simulates a single user:
      - `username`: `admin`
      - `password`: `123456`
    - Validates credentials with `bcryptjs` and returns a JWT from `jwt.generateToken`.
  - **`orderService.js`**
    - Orchestrates order operations.
    - Uses `mapOrderRequest` to convert incoming JSON into the internal order model.
    - Calls `orderRepository` for persistence.
    - Throws `AppError` when an order is not found or similar business issues.

- **Repositories (`repositories/`)**
  - **`baseRepository.js`**
    - Generic CRUD helper for SQLite:
      - `transaction(callback)`
      - `findOne`, `findAll`
      - `insert`, `update`, `delete`
    - Builds simple `WHERE` clauses based on filter objects.
  - **`orderRepository.js`**
    - Concrete repository for the `"Order"` and `Items` tables.
    - Handles:
      - Existence check before insert (`AppError` 409).
      - Creating, listing, deleting, and updating orders and their items within transactions.

- **Middlewares (`middlewares/`)**
  - **`AppError.js`**
    - Custom error class with `message` and `statusCode`.
  - **`errorHandler.js`**
    - Global error middleware used at the end of the middleware chain in `index.js`.
  - **`authMiddleware.js`**
    - Extracts the Bearer token from the `Authorization` header.
    - Uses `jwt.verifyToken` to decode and attaches the user to `req.user`.

- **DTOs (`dtos/`)**
  - **`loginDTO.js`**
    - Simple DTO that maps `username` and `password` from the request body.

- **Utils (`utils/`)**
  - **`jwt.js`**
    - `generateToken(payload)`: signs payload with `JWT_SECRET`, expiration `1h`.
    - `verifyToken(token)`: verifies token and returns decoded payload.
  - **`mapper.js`**
    - `mapOrderRequest(data)`: converts the incoming order body (with `numeroPedido`, `dataCriacao`, `valorTotal`, `items`) into the internal format used by services and repositories.

- **Tests (`tests/`)**
  - **`setup.js`**
    - Loads environment variables (`dotenv.config()`).
  - **`authService.test.js`**
    - Verifies that valid credentials generate a token.
  - **`orderService.test.js`**
    - Mocks `orderRepository` and checks that `createOrder` calls the repository correctly.

---

### Quick checklist for testers

- **Before running**:
  - [ ] `npm install`
  - [ ] `.env` with `JWT_SECRET` created
  - [ ] `node index.js` running (port 3000)
  - [ ] Access Swagger docs at http://localhost:3000/docs (optional but recommended)
- **Test flow**:
  - [ ] `POST /auth/login` with `admin / 123456`
  - [ ] Use returned token in `Authorization: Bearer <token>`
  - [ ] `POST /order` with a valid payload
  - [ ] `GET /order/list`
  - [ ] `GET /order/:id`
  - [ ] `PUT /order/:id`
  - [ ] `DELETE /order/:id`

  - **If you wish, you can use an already built Postman Collection**
  - **https://documenter.getpostman.com/view/36394362/2sBXcLgctJ**