---

# Project-Manpro CRM 💼

This is a **Customer Relationship Management (CRM)** application designed to help manage customers, products, transactions, tasks, and admin users efficiently.

---

## 💡 Main Features

* **Customer Management** - Complete customer profiles and tracking
* **Product Management** - Inventory with customer assignments
* **Purchase/Transaction Management** - Transaction processing and history
* **Promo Management** - Advanced promotional campaigns with status tracking
* **Task Management** - Team collaboration and workflow
* **Role-based Admin Management** - JWT authentication with user roles
* **Analytics Dashboard** - Real-time KPIs with interactive charts

---

## 🧰 Tech Stack

* **Backend**: Node.js, Express.js, TypeScript, Sequelize ORM, PostgreSQL/Supabase
* **Frontend**: React, TypeScript, Vite, Material-UI, Recharts
* **Others**: Axios, JWT Authentication, Docker
* **Database**: PostgreSQL with Supabase integration

---

## 🏁 Setup Instructions

### ✅ Step 0: Create the Database

Make sure your PostgreSQL server is running, then create the `crm_db` database (or use Supabase):

```sql
CREATE DATABASE crm_db;
```

---

### ⚙️ Step 1: Installing Backend Packages

Navigate to the backend directory and install the dependencies:

```bash
cd ./Crm-backend
npm install
npm run migrate:ts
npm run seed:ts
```

> ⚠️ If `npm run seed:ts` throws a conflict (e.g., duplicate data), undo the seeds first:
>
> ```bash
> npm run seed:ts undo
> ```

---

### 🖥️ Step 2: Installing Frontend Packages

Navigate to the frontend directory:

```bash
cd ../Crm-frontend
npm install
```

---

### 🚀 Step 3: Running the App (Backend & Frontend)

From the **main/root folder** (one level above `Crm-backend` and `Crm-frontend`):

```bash
cd ..
npm install
npm run dev
```

> Alternatively, open two terminals:
>
> * Terminal 1:
>
>   ```bash
>   cd Crm-backend
>   npm run dev
>   ```
> * Terminal 2:
>
>   ```bash
>   cd Crm-frontend
>   npm run dev
>   ```

---

## 🌐 API Endpoints (Examples)

* `POST /api/auth/login` - User authentication
* `POST /api/auth/signup` - User registration
* `GET /api/customers` - Customer management
* `GET /api/products` - Product catalog
* `GET /api/promos` - Promotional campaigns
* `POST /api/purchases` - Transaction processing
* `GET /api/tasks` - Task management
* `GET /api/analytics` - Dashboard analytics

---

## 📁 Project Structure Overview

```
Projek-Manpro/
├── Crm-backend/
│   ├── config/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeders/
│   │   └── middlewares/
│   ├── scripts/
│   ├── .env
│   ├── package.json (backend)
│   └── tsconfig.json
├── Crm-frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   └── pages/
│   ├── .env
│   ├── package.json (frontend)
│   └── tsconfig.json
└── package.json (root)
```

---

## 🎯 Key Features

### Promotional System
* **Status Tracking**: Expired, Inactive, Scheduled, Available, Assigned, Partially Used, Fully Used
* **Color-coded Badges**: Visual status indicators
* **Customer Assignment**: Track promo allocations and usage

### Analytics Dashboard
* **Interactive Charts**: Line, Bar, Pie, and Area charts using Recharts
* **Real-time KPIs**: Customer metrics, revenue tracking, product performance
* **Performance Analytics**: Comprehensive business insights

### Advanced Features
* **File Uploads**: Avatar and document management
* **Role-based Access**: Admin and user permissions
* **Performance Optimization**: Caching and database indexing
* **Docker Support**: Containerized deployment

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 👥 Contributors

* Marsellino Vlyzer S - C14200076
* Ezra Brilliant Konterliem - C14220315
* Audric Matthew Wirawan - C14220332

---