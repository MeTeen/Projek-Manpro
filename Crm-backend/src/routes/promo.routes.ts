// src/routes/promo.routes.ts
import { Router } from 'express';
// Pastikan path ke controller dan middleware sudah benar
import * as promoController from '../controllers/promo.controller';
import { 
    authenticateJWT, 
    isAdmin,        // Digunakan untuk akses yang memerlukan peran admin atau super_admin
    isSuperAdmin    // Digunakan untuk akses yang khusus memerlukan peran super_admin
} from '../middlewares/auth.middleware'; 

const router = Router();

// Semua rute di bawah ini akan diautentikasi terlebih dahulu
router.use(authenticateJWT as any); // (as any) jika ada masalah tipe dengan Express Router

// === Rute Khusus Super Admin ===
// Membuat promo baru
router.post(
    '/', 
    isSuperAdmin as any,        // Hanya super_admin yang bisa membuat promo
    promoController.createPromo as any
);

// Mengupdate promo berdasarkan ID
router.put(
    '/:id', 
    isSuperAdmin as any,        // Hanya super_admin yang bisa mengupdate promo
    promoController.updatePromo as any
);

// Menghapus promo berdasarkan ID
router.delete(
    '/:id', 
    isSuperAdmin as any,        // Hanya super_admin yang bisa menghapus promo
    promoController.deletePromo as any
);

// === Rute untuk Admin dan Super Admin ===
// Mendapatkan semua promo
router.get(
    '/', 
    isAdmin as any,             // Admin dan super_admin bisa melihat semua promo
    promoController.getAllPromos as any
);

// Mendapatkan promo spesifik berdasarkan ID
router.get(
    '/:id', 
    isAdmin as any,             // Admin dan super_admin bisa melihat detail promo
    promoController.getPromoById as any
);

// Menetapkan promo ke pelanggan
router.post(
    '/assign', 
    isAdmin as any,             // Admin dan super_admin bisa menetapkan promo
    promoController.assignPromoToCustomer as any
);

// Melepaskan promo dari pelanggan
router.post( // Anda bisa juga menggunakan metode DELETE di sini jika lebih sesuai semantiknya
    '/remove', 
    isAdmin as any,             // Admin dan super_admin bisa melepaskan promo
    promoController.removePromoFromCustomer as any
);

// Mendapatkan promo yang tersedia untuk pelanggan tertentu (digunakan saat input pembelian)
router.get(
    '/customer/:customerId/available', 
    isAdmin as any,             // Admin dan super_admin bisa memeriksa promo tersedia untuk pelanggan
    promoController.getAvailablePromosForCustomer as any
);

export default router;