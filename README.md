
---

# Project-Manpro CRM 💼

This is a **Customer Relationship Management (CRM)** application designed to help manage customers, products, transactions, tasks, and admin users efficiently.

---

## 💡 Main Features

* Customer Management
* Product Management
* Purchase/Transaction Management
* Promo Management
* Task Management
* Role-based Admin Management
* Analytics Dashboard

---

## 🧰 Tech Stack

* **Backend**: Node.js, Express.js, Sequelize ORM, MySQL
* **Frontend**: React, TypeScript, Vite
* **Others**: Axios
* **Database**: MySQL

---

## 🏁 Setup Instructions

### ✅ Step 0: Create the Database

Make sure your MySQL server is running, then create the `crm_db` database (or the name used in your `.env` file):

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

* `POST /api/auth/login`
* `POST /api/auth/signup`
* `GET /api/customers`
* `GET /api/products`
* `POST /api/purchases`
* `GET /api/analytics`
* etc.

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

## 👥 Contributors

* Marsellino Vlyzer S - C14200076
* Ezra Brilliant Konterliem - C14220315
* Audric Matthew Wirawan - C14220332

---