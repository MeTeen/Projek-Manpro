// config/database-wrapper.js
'use strict';

// Daftarkan ts-node di sini juga untuk memastikan file .ts bisa di-require
require('ts-node/register'); 

// Impor konfigurasi dari file .ts Anda
const tsConfig = require('../dist/config/database.js'); // Path relatif ke file database.ts Anda

// Sequelize CLI mengharapkan objek dengan environment keys (development, production, dll.)
// Jika tsConfig.default adalah objek konfigurasi Anda:
module.exports = tsConfig.default || tsConfig;