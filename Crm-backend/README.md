# CRM Backend

This is the backend API for the CRM application.

## Features

- 🔐 Admin authentication using JWT
- 📊 Customer CRUD operations
- 🔒 Role-based access control (Admin, Super Admin)
- 🛠️ Built with TypeScript for type safety
- 📦 Uses Sequelize ORM with MySQL 8
- User authentication and authorization
- Customer management
- Task management
- Product management
- Purchase tracking with customer-product relationships

## Prerequisites

- Node.js (v14+)
- MySQL 8
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crm-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=yourpassword
   DB_NAME=crm_db
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d

   # OAuth2 Configuration
   OAUTH2_CLIENT_ID=your_client_id
   OAUTH2_CLIENT_SECRET=your_client_secret
   OAUTH2_CALLBACK_URL=http://localhost:3000/api/auth/callback
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Create the database:
   ```sql
   CREATE DATABASE crm_db;
   ```

6. Run migrations to create tables:
   ```bash
   npm run migrate:run
   ```

7. (Optional) Seed the database with initial data:
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new admin
- `POST /api/auth/login` - Login as admin
- `GET /api/auth/profile` - Get admin profile (requires authentication)

### Customers

All customer endpoints require authentication:

- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a single customer
- `GET /api/customers/:id/purchases` - Get customer with purchase history
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Products

All product endpoints require authentication:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Purchases

All purchase endpoints require authentication:

- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/customer/:customerId` - Get purchases for specific customer
- `GET /api/purchases/product/:productId` - Get purchase history for specific product
- `POST /api/purchases` - Create a new purchase

## Docker Deployment

### Quick Start with Docker

1. **Build and start services:**
   ```bash
   docker-compose up --build -d
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Environment Configuration

The Docker setup includes:
- **MySQL 8.0** database with persistent storage
- **Node.js** backend application
- **Automatic migrations** on startup
- **Health checks** for reliability

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Production Deployment

For production use:
1. Update environment variables in `docker-compose.yml`
2. Change default passwords and secrets
3. Configure SSL/TLS
4. Set up proper monitoring and backups

## Default Admin User

After running seeds, you can use the following credentials to login:

- **Email**: admin@example.com
- **Password**: admin123

## License

This project is licensed under the ISC License. 