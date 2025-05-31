// config/database-wrapper.js
'use strict';

// Import configuration from compiled JavaScript file
const tsConfig = require('../dist/config/database.js'); // Path to compiled database config

// Sequelize CLI mengharapkan objek dengan environment keys (development, production, dll.)
// Jika tsConfig.default adalah objek konfigurasi Anda:
module.exports = tsConfig.default || tsConfig;