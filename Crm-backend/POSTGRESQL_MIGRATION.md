# Migrasi Database ke PostgreSQL (Supabase)

## Overview
Project CRM Backend telah berhasil dimigrasi dari MySQL ke PostgreSQL menggunakan Supabase sebagai database hosting.

## Perubahan Yang Dilakukan

### 1. Package Dependencies
- **Dihapus**: `mysql2` 
- **Ditambah**: `pg` dan `@types/pg`

### 2. Konfigurasi Database (`config/database.ts`)
- Dialect diubah dari `mysql` ke `postgres`
- SSL configuration ditambahkan untuk Supabase
- Host, username, dan port diupdate sesuai dengan Supabase connection string

### 3. Environment Variables (`.env`)
```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.slmrcglupqfskshfcsut:ZxHI6aX3RmIKo0Sq@aws-0-us-east-2.pooler.supabase.com:5432/postgres
DB_HOST=aws-0-us-east-2.pooler.supabase.com
DB_USERNAME=postgres.slmrcglupqfskshfcsut
DB_PASSWORD=ZxHI6aX3RmIKo0Sq
DB_NAME=postgres
DB_PORT=5432
```

### 4. Docker Configuration
- MySQL service dihapus dari `docker-compose.yml`
- Environment variables diupdate untuk menggunakan Supabase
- Dependency pada MySQL container dihapus

### 5. Model Adjustments
- PostgreSQL tidak mendukung `INTEGER.UNSIGNED`, diubah menjadi `INTEGER` biasa
- Warning yang muncul saat migration adalah normal dan tidak mempengaruhi fungsionalitas

## Database Schema
Database memiliki tabel-tabel berikut:
- `admins` - User admin system
- `customers` - Data pelanggan
- `products` - Produk yang dijual
- `tasks` - Task management
- `promos` - Promosi dan diskon
- `customer_products` - Relasi many-to-many antara customer dan product (purchase history)
- `customer_promos` - Relasi many-to-many antara customer dan promo

## Sample Data
Database telah di-seed dengan data contoh:
- 2 Admin users (admin dan super_admin)
- 3 Customers
- 3 Products
- 2 Promos
- 3 Tasks
- 6 Purchase records

### Admin Credentials
```
Email: admin_new@example.com
Password: password123
Role: admin

Email: superadmin_new@example.com  
Password: superpassword123
Role: super_admin
```

## Cara Menjalankan

### Development
```bash
npm install
npm run migrate:ts
npm run seed:run
npm run dev
```

### Production (Docker)
```bash
docker-compose up --build
```

## Testing API
Server berjalan di `http://localhost:3000`

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin_new@example.com","password":"password123"}'
```

### Mengakses Data (dengan token)
```bash
curl -X GET http://localhost:3000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Migrasi Sukses ✅
- ✅ Database connection berhasil
- ✅ Migrations berjalan tanpa error
- ✅ Seeders berhasil mengisi data
- ✅ Server dapat start dan connect ke database
- ✅ Authentication working
- ✅ API endpoints accessible dengan token
- ✅ Data tersimpan dan bisa diakses dengan benar

## Catatan Penting
1. Connection string Supabase menggunakan connection pooler untuk performa yang lebih baik
2. SSL adalah required untuk Supabase
3. PostgreSQL syntax sedikit berbeda dari MySQL tapi Sequelize ORM menangani hal ini secara otomatis
4. Semua existing functionality tetap bekerja seperti sebelumnya
