"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/promo.routes.ts
const express_1 = require("express");
// Pastikan path ke controller dan middleware sudah benar
const promoController = __importStar(require("../controllers/promo.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Semua rute di bawah ini akan diautentikasi terlebih dahulu
router.use(auth_middleware_1.authenticateJWT); // (as any) jika ada masalah tipe dengan Express Router
// === Rute Khusus Super Admin ===
// Membuat promo baru
router.post('/', auth_middleware_1.isSuperAdmin, // Hanya super_admin yang bisa membuat promo
promoController.createPromo);
// Mengupdate promo berdasarkan ID
router.put('/:id', auth_middleware_1.isSuperAdmin, // Hanya super_admin yang bisa mengupdate promo
promoController.updatePromo);
// Menghapus promo berdasarkan ID
router.delete('/:id', auth_middleware_1.isSuperAdmin, // Hanya super_admin yang bisa menghapus promo
promoController.deletePromo);
// === Rute untuk Admin dan Super Admin ===
// Mendapatkan semua promo
router.get('/', auth_middleware_1.isAdmin, // Admin dan super_admin bisa melihat semua promo
promoController.getAllPromos);
// Mendapatkan promo spesifik berdasarkan ID
router.get('/:id', auth_middleware_1.isAdmin, // Admin dan super_admin bisa melihat detail promo
promoController.getPromoById);
// Menetapkan promo ke pelanggan
router.post('/assign', auth_middleware_1.isAdmin, // Admin dan super_admin bisa menetapkan promo
promoController.assignPromoToCustomer);
// Melepaskan promo dari pelanggan
router.post(// Anda bisa juga menggunakan metode DELETE di sini jika lebih sesuai semantiknya
'/remove', auth_middleware_1.isAdmin, // Admin dan super_admin bisa melepaskan promo
promoController.removePromoFromCustomer);
// Mendapatkan promo yang tersedia untuk pelanggan tertentu (digunakan saat input pembelian)
router.get('/customer/:customerId/available', auth_middleware_1.isAdmin, // Admin dan super_admin bisa memeriksa promo tersedia untuk pelanggan
promoController.getAvailablePromosForCustomer);
exports.default = router;
//# sourceMappingURL=promo.routes.js.map