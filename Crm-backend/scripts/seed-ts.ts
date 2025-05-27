// scripts/seed-ts.ts
import { execSync } from 'child_process';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0] || 'all';
const environment = process.env.NODE_ENV || 'development';

// Path ke skrip sequelize-cli di node_modules
const sequelizeCliJsPath = path.resolve(__dirname, '..', 'node_modules', 'sequelize-cli', 'lib', 'sequelize.js');
// Atau jika versi CLI berbeda, path bisa juga ke 'node_modules/sequelize-cli/bin/sequelize'
// Namun, 'lib/sequelize.js' adalah entry point yang lebih umum untuk pemanggilan programatik.
// Atau, yang lebih sederhana dan sering berhasil:
// const sequelizeCliJsPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'sequelize');
// Jika .bin/sequelize tidak ada, coba path di atasnya.
// Untuk Windows, path ke .bin mungkin tidak memerlukan .js dan bisa berupa file batch/cmd.
// Cara paling robust adalah menggunakan 'npx' tapi jika itu bermasalah, kita coba ini.

// Kita akan menggunakan ts-node untuk menjalankan skrip CLI Sequelize
// Ini membantu jika CLI itu sendiri atau konfigurasinya perlu diproses oleh ts-node
const tsNodePath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'ts-node');
// Untuk Windows, path .bin mungkin memiliki ekstensi .cmd atau .ps1, node akan menanganinya.
// Jika Anda menggunakan 'npx ts-node', itu lebih portabel.

let operation; // Perintah untuk CLI nya sendiri seperti db:seed:all

if (command === 'all') {
  operation = `db:seed:all --env ${environment} --debug`;
} else if (command === 'undo') {
  if (args[1]) {
    operation = `db:seed:undo --seed ${args[1]} --env ${environment} --debug`;
  } else {
    operation = `db:seed:undo --env ${environment} --debug`;
  }
} else { // Asumsikan 'command' adalah nama file seeder spesifik
  operation = `db:seed --seed ${command} --env ${environment} --debug`;
}

// Perintah lengkap untuk dieksekusi
// Menggunakan 'npx ts-node' lalu path ke sequelize-cli dan operasinya
// atau langsung 'npx sequelize-cli' jika .sequelizerc sudah benar-benar efektif
// Kita kembali ke 'npx sequelize-cli' karena .sequelizerc seharusnya sudah cukup.
// Masalahnya mungkin bukan pada pemanggilan ts-node untuk skrip seed-ts.ts,
// tapi bagaimana sequelize-cli sendiri memuat konfigurasinya.

// Mari kita pastikan .sequelizerc dibaca. Sequelize CLI mencari .sequelizerc di CWD.
// Skrip NPM dijalankan dari root proyek, jadi CWD seharusnya sudah benar.

// Jika .sequelizerc Anda sudah benar, masalahnya mungkin ts-node/register di dalamnya
// tidak efektif pada saat config-helper.js di sequelize-cli mencoba membaca config.
// Alternatif lain adalah memaksa penggunaan file konfigurasi .js
const cmd = `npx sequelize-cli ${operation}`;

console.log(`Executing Seeder Command: ${cmd}`);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('Seeding process completed!');
} catch (error) {
  console.error('Seeding process failed:', error);
  process.exit(1);
}