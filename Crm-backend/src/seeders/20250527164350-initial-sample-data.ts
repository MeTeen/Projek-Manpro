import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';
import * as bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    const now = new Date(); // Current timestamp
    let seededAdminIds: number[] = [];
    let seededCustomerIds: { [email: string]: number } = {}; // { email: id }
    let seededProductIds: { [name: string]: number } = {};  // { name: id }
    let seededPromoIds: { [name: string]: number } = {};    // { name: id }

    // --- 1. Admins ---
    console.log('Seeding Admins...');
    const adminsToSeed = [
      { username: 'admin_user_new', email: 'admin_new@example.com', passwordText: 'password123', role: 'admin' },
      { username: 'super_admin_new', email: 'superadmin_new@example.com', passwordText: 'superpassword123', role: 'super_admin' },
    ];
    
    const adminEmails = adminsToSeed.map(a => a.email);
    const existingAdmins = await queryInterface.sequelize.query(
      `SELECT id, email FROM admins WHERE email IN (:adminEmails)`,
      { 
        replacements: { adminEmails }, 
        type: QueryTypes.SELECT 
      }
    ) as Array<{ id: number; email: string }>;
    
    const existingAdminEmails = existingAdmins.map(a => a.email);
    seededAdminIds = existingAdmins.map(a => a.id);

    const newAdminsToInsert = [];
    for (const adminData of adminsToSeed) {
      if (!existingAdminEmails.includes(adminData.email)) {
        newAdminsToInsert.push({
          username: adminData.username,
          email: adminData.email,
          password: await hashPassword(adminData.passwordText),
          role: adminData.role,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        console.log(`Admin with email ${adminData.email} already exists. Skipping insertion.`);
      }
    }
    
    if (newAdminsToInsert.length > 0) {
      await queryInterface.bulkInsert('admins', newAdminsToInsert);
      console.log(`Seeded ${newAdminsToInsert.length} new admins.`);
      
      const newlyInsertedAdmins = await queryInterface.sequelize.query(
        `SELECT id, email FROM admins WHERE email IN (:newAdminEmails)`,
        { 
          replacements: { newAdminEmails: newAdminsToInsert.map(a => a.email) }, 
          type: QueryTypes.SELECT 
        }
      ) as Array<{ id: number; email: string }>;
      
      newlyInsertedAdmins.forEach(admin => {
        if (!seededAdminIds.includes(admin.id)) seededAdminIds.push(admin.id);
      });
    } else {
      console.log('No new admins to seed.');
    }
    
    let superAdminIdForPromo: number | null = null;
    const superAdminInstance = await queryInterface.sequelize.query(
      `SELECT id FROM admins WHERE email = 'superadmin_new@example.com' LIMIT 1;`,
      { type: QueryTypes.SELECT }
    ) as Array<{ id: number }>;
    
    if (superAdminInstance.length > 0) {
      superAdminIdForPromo = superAdminInstance[0].id;
    } else if (seededAdminIds.length > 0) { 
      superAdminIdForPromo = seededAdminIds[0];
      console.warn(`Superadmin 'superadmin_new@example.com' not found. Falling back to admin ID: ${superAdminIdForPromo} for promo 'created_by'.`);
    } else {
      console.error("CRITICAL: No admin ID available for promo 'created_by'. Promos might fail if 'created_by' is mandatory.");
    }

    // --- 2. Customers ---
    console.log('Seeding Customers...');
    const customersToSeed = [
      { firstName: 'Budi', lastName: 'Santoso', email: 'budi.s@example.com', phone: '08123456001', address: 'Jl. Merdeka No. 101', city: 'Jakarta Pusat', state: 'DKI Jakarta', zipCode: '10111', avatarUrl: null, totalSpent: 0, purchaseCount: 0 },
      { firstName: 'Ani', lastName: 'Wijaya', email: 'ani.w@example.com', phone: '08234567002', address: 'Jl. Pahlawan No. 25A', city: 'Surabaya Kota', state: 'Jawa Timur', zipCode: '60272', avatarUrl: null, totalSpent: 0, purchaseCount: 0 },
      { firstName: 'Citra', lastName: 'Lestari', email: 'citra.l@example.com', phone: '08345678003', address: 'Jl. Diponegoro No. 5B', city: 'Bandung Kota', state: 'Jawa Barat', zipCode: '40116', avatarUrl: null, totalSpent: 0, purchaseCount: 0 },
    ];
    
    const customerEmails = customersToSeed.map(c => c.email);
    const existingDbCustomers = await queryInterface.sequelize.query(
      `SELECT id, email FROM customers WHERE email IN (:customerEmails)`,
      { 
        replacements: { customerEmails }, 
        type: QueryTypes.SELECT 
      }
    ) as Array<{ id: number; email: string }>;
    
    existingDbCustomers.forEach(c => { seededCustomerIds[c.email] = c.id; });

    const newCustomersToInsert = customersToSeed
      .filter(c => !seededCustomerIds[c.email])
      .map(c => ({ 
        first_name: c.firstName, 
        last_name: c.lastName, 
        email: c.email, 
        phone: c.phone,
        address: c.address, 
        city: c.city, 
        state: c.state, 
        zip_code: c.zipCode,
        avatar_url: c.avatarUrl, 
        total_spent: c.totalSpent, 
        purchase_count: c.purchaseCount,
        created_at: now, 
        updated_at: now
      }));

    if (newCustomersToInsert.length > 0) {
      await queryInterface.bulkInsert('customers', newCustomersToInsert, {});
      console.log(`Seeded ${newCustomersToInsert.length} new customers.`);
      
      const newlyInsertedCustomers = await queryInterface.sequelize.query(
        `SELECT id, email FROM customers WHERE email IN (:newCustomerEmails)`,
        { 
          replacements: { newCustomerEmails: newCustomersToInsert.map(c => c.email) }, 
          type: QueryTypes.SELECT 
        }
      ) as Array<{ id: number; email: string }>;
      
      newlyInsertedCustomers.forEach(c => { seededCustomerIds[c.email] = c.id; });
    } else {
      console.log('No new customers to seed.');
    }

    // --- 3. Products ---
    console.log('Seeding Products...');
    const productsToSeed = [
      { name: 'Meja Belajar Jati Modern', stock: 50, price: 1250000.00, dimensions: '120x60x75 cm' },
      { name: 'Kursi Kantor Ergonomis Premium', stock: 30, price: 950000.00, dimensions: '60x60x110 cm' },
      { name: 'Lampu Meja LED Fleksibel Putih', stock: 100, price: 175000.00, dimensions: 'Tinggi 40cm' },
    ];
    
    const productNames = productsToSeed.map(p => p.name);
    const existingDbProducts = await queryInterface.sequelize.query(
      `SELECT id, name FROM products WHERE name IN (:productNames)`,
      { 
        replacements: { productNames }, 
        type: QueryTypes.SELECT 
      }
    ) as Array<{ id: number; name: string }>;
    
    existingDbProducts.forEach(p => { seededProductIds[p.name] = p.id; });
    const newProductsToInsert = productsToSeed
      .filter(p => !seededProductIds[p.name])
      .map(p => ({ 
        ...p, 
        created_at: now, 
        updated_at: now 
      }));

    if (newProductsToInsert.length > 0) {
      await queryInterface.bulkInsert('products', newProductsToInsert, {});
      console.log(`Seeded ${newProductsToInsert.length} new products.`);
      
      const newlyInsertedProducts = await queryInterface.sequelize.query(
        `SELECT id, name FROM products WHERE name IN (:newProductNames)`,
        { 
          replacements: { newProductNames: newProductsToInsert.map(p => p.name) }, 
          type: QueryTypes.SELECT 
        }
      ) as Array<{ id: number; name: string }>;
      
      newlyInsertedProducts.forEach(p => { seededProductIds[p.name] = p.id; });
    } else {
      console.log('No new products to seed.');
    }

    // --- 4. Promos ---
    console.log('Seeding Promos...');
    const startDatePromo = new Date(now); // Create new instance to avoid modifying 'now'
    startDatePromo.setMonth(startDatePromo.getMonth() - 2); // Promo started 2 months ago
    const endDatePromo = new Date(startDatePromo);
    endDatePromo.setDate(startDatePromo.getDate() + 60); // Promo valid for 60 days from start_date

    const promosToSeed = [
      { name: 'Diskon Kemerdekaan 12%', description: 'Nikmati diskon 12% untuk semua produk.', type: 'percentage', value: 12.00, startDate: startDatePromo, endDate: endDatePromo, isActive: true, created_by: superAdminIdForPromo },
      { name: 'Potongan Member Rp 30.000', description: 'Dapatkan potongan langsung Rp 30.000.', type: 'fixed_amount', value: 30000.00, startDate: null, endDate: null, isActive: true, created_by: superAdminIdForPromo },
    ];
    
    const promoNames = promosToSeed.map(p => p.name);
    const existingDbPromos = await queryInterface.sequelize.query(
      `SELECT id, name FROM promos WHERE name IN (:promoNames)`,
      { 
        replacements: { promoNames }, 
        type: QueryTypes.SELECT 
      }
    ) as Array<{ id: number; name: string }>;
    
    existingDbPromos.forEach(p => { seededPromoIds[p.name] = p.id; });

    const newPromosToInsert = promosToSeed
      .filter(p => !seededPromoIds[p.name])
      .map(p => ({
        name: p.name, 
        description: p.description, 
        type: p.type, 
        value: p.value,
        start_date: p.startDate, 
        end_date: p.endDate, 
        is_active: p.isActive,
        created_by: p.created_by, 
        created_at: now, 
        updated_at: now
      }));

    if (newPromosToInsert.length > 0) {
      await queryInterface.bulkInsert('promos', newPromosToInsert, {});
      console.log(`Seeded ${newPromosToInsert.length} new promos.`);
      
      const newlyInsertedPromos = await queryInterface.sequelize.query(
        `SELECT id, name FROM promos WHERE name IN (:newPromoNames)`,
        { 
          replacements: { newPromoNames: newPromosToInsert.map(p => p.name) }, 
          type: QueryTypes.SELECT 
        }
      ) as Array<{ id: number; name: string }>;
      
      newlyInsertedPromos.forEach(p => { seededPromoIds[p.name] = p.id; });
    } else {
      console.log('No new promos to seed.');
    }

    // --- 5. Tasks ---
    console.log('Seeding Tasks...');
    const taskDate = new Date();
    const tasksToSeed = [
      { date: new Date(taskDate.getTime() - 7 * 24 * 60 * 60 * 1000), content: 'Follow up customer Budi (Minggu Lalu)', isCompleted: true },
      { date: taskDate, content: 'Siapkan laporan bulanan (Hari Ini)', isCompleted: false },
      { date: new Date(taskDate.getTime() + 2 * 24 * 60 * 60 * 1000), content: 'Cek stok Kursi Ergonomis (Lusa)', isCompleted: false },
    ];
    
    const taskContents = tasksToSeed.map(t => t.content);
    const existingDbTasks = await queryInterface.sequelize.query(
      `SELECT content FROM tasks WHERE content IN (:taskContents)`,
      { 
        replacements: { taskContents }, 
        type: QueryTypes.SELECT 
      }
    ) as Array<{ content: string }>;
    
    const existingTaskContents = existingDbTasks.map(t => t.content);
    const newTasksToInsert = tasksToSeed
      .filter(t => !existingTaskContents.includes(t.content))
      .map(t => ({ 
        date: t.date,
        content: t.content,
        isCompleted: t.isCompleted,
        createdAt: now,
        updatedAt: now
      }));

    if (newTasksToInsert.length > 0) {
      await queryInterface.bulkInsert('tasks', newTasksToInsert, {});
      console.log(`Seeded ${newTasksToInsert.length} new tasks.`);
    } else {
      console.log('No new tasks to seed.');
    }

    // --- 6. CustomerProducts (Purchases) ---
    console.log('Seeding CustomerProducts (Purchases) with varied dates...');
    const purchasesData: Array<{
      customer_id: number;
      product_id: number;
      quantity: number;
      price: number;
      purchase_date: Date;
      promo_id: number | null;
      discount_amount: number;
      created_at: Date;
      updated_at: Date;
    }> = [];

    // Helper to create dates going back
    const getDateDaysAgo = (days: number): Date => {
      const date = new Date(now);
      date.setDate(now.getDate() - days);
      return date;
    };
    
    const getDateMonthsAgo = (months: number): Date => {
      const date = new Date(now);
      date.setMonth(now.getMonth() - months);
      // Randomize day within that month
      date.setDate(Math.floor(Math.random() * 28) + 1);
      return date;
    };

    const custBudiId = seededCustomerIds['budi.s@example.com'];
    const prodMejaId = seededProductIds['Meja Belajar Jati Modern'];
    const prodKursiId = seededProductIds['Kursi Kantor Ergonomis Premium'];
    const prodLampuId = seededProductIds['Lampu Meja LED Fleksibel Putih'];
    const custAniId = seededCustomerIds['ani.w@example.com'];
    const custCitraId = seededCustomerIds['citra.l@example.com'];
    const promoDiskon12Id = seededPromoIds['Diskon Kemerdekaan 12%'];
    const promoPotongan30Id = seededPromoIds['Potongan Member Rp 30.000'];
    
    // Transaction 1: Budi buys Meja (2 months ago)
    if (custBudiId && prodMejaId) {
      const purchaseDate = getDateMonthsAgo(2);
      purchasesData.push({
        customer_id: custBudiId, 
        product_id: prodMejaId, 
        quantity: 1,
        price: 1250000.00, 
        purchase_date: purchaseDate, 
        promo_id: null, 
        discount_amount: 0.00,
        created_at: purchaseDate, 
        updated_at: purchaseDate,
      });
    }

    // Transaction 2: Ani buys Kursi, uses 12% discount promo (1.5 months ago)
    if (custAniId && prodKursiId && promoDiskon12Id) {
      const hargaKursi = 950000.00;
      const purchaseDate = getDateDaysAgo(45); // ~1.5 months ago
      purchasesData.push({
        customer_id: custAniId, 
        product_id: prodKursiId, 
        quantity: 1,
        price: hargaKursi, 
        purchase_date: purchaseDate, 
        promo_id: promoDiskon12Id,
        discount_amount: hargaKursi * 0.12,
        created_at: purchaseDate, 
        updated_at: purchaseDate,
      });
    }
    
    // Transaction 3: Citra buys 2 Lampu, uses Rp 30.000 discount promo (20 days ago)
    if (custCitraId && prodLampuId && promoPotongan30Id) {
      const purchaseDate = getDateDaysAgo(20);
      purchasesData.push({
        customer_id: custCitraId, 
        product_id: prodLampuId, 
        quantity: 2,
        price: 175000.00, 
        purchase_date: purchaseDate, 
        promo_id: promoPotongan30Id,
        discount_amount: 30000.00,
        created_at: purchaseDate, 
        updated_at: purchaseDate,
      });
    }
    
    // Transaction 4: Budi buys Kursi again (10 days ago)
    if (custBudiId && prodKursiId) {
      const purchaseDate = getDateDaysAgo(10);
      purchasesData.push({
        customer_id: custBudiId, 
        product_id: prodKursiId, 
        quantity: 1,
        price: 950000.00, 
        purchase_date: purchaseDate, 
        promo_id: null, 
        discount_amount: 0.00,
        created_at: purchaseDate, 
        updated_at: purchaseDate,
      });
    }
    
    // Transaction 5: Ani buys Lampu (5 days ago)
    if (custAniId && prodLampuId) {
      const purchaseDate = getDateDaysAgo(5);
      purchasesData.push({
        customer_id: custAniId, 
        product_id: prodLampuId, 
        quantity: 1,
        price: 175000.00, 
        purchase_date: purchaseDate, 
        promo_id: null, 
        discount_amount: 0.00,
        created_at: purchaseDate, 
        updated_at: purchaseDate,
      });
    }
    
    // Transaction 6: Citra buys Meja (Today)
    if (custCitraId && prodMejaId) {
      const purchaseDate = now;
      purchasesData.push({
        customer_id: custCitraId, 
        product_id: prodMejaId, 
        quantity: 1,
        price: 1250000.00, 
        purchase_date: purchaseDate, 
        promo_id: null, 
        discount_amount: 0.00,
        created_at: purchaseDate, 
        updated_at: purchaseDate,
      });
    }

    if (purchasesData.length > 0) {
      console.log('Clearing existing customer_products data for fresh seeding...');
      await queryInterface.bulkDelete('customer_products', {}, {});
      await queryInterface.bulkInsert('customer_products', purchasesData, {});
      console.log(`Seeded ${purchasesData.length} purchases.`);
    } else {
      console.log('No new purchases to seed, possibly due to missing parent Customer/Product/Promo IDs.');
    }

    // --- 7. Update Customer total_spent and purchase_count ---
    console.log("Updating customer totals based on all purchases...");
    const allCustomersForUpdate = await queryInterface.sequelize.query(
      `SELECT id FROM customers WHERE email IN (:customerEmails)`, 
      { 
        replacements: { customerEmails }, 
        type: QueryTypes.SELECT 
      }
    ) as Array<{ id: number }>;

    for (const customer of allCustomersForUpdate) {
      const customerId = customer.id;
      const result = await queryInterface.sequelize.query(
        `SELECT
           COUNT(id) as purchase_count,
           SUM((price * quantity) - COALESCE(discount_amount, 0)) as total_spent
         FROM customer_products
         WHERE customer_id = :customerId`,
        {
          replacements: { customerId },
          type: QueryTypes.SELECT
        }
      ) as Array<{ purchase_count: number; total_spent: number }>;
      
      const stats = result[0] || { purchase_count: 0, total_spent: 0 };
      await queryInterface.bulkUpdate('customers', {
        total_spent: parseFloat(String(stats.total_spent || 0)),
        purchase_count: parseInt(String(stats.purchase_count || 0)),
        updated_at: now
      }, { id: customerId });
    }
    
    console.log("Customer totals updated.");
    console.log("Initial sample data seeding finished.");
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    console.log("Reverting initial sample data. This will delete all data from these tables.");
    await queryInterface.bulkDelete('customer_products', {}, {});
    await queryInterface.bulkDelete('tasks', {}, {});
    await queryInterface.bulkDelete('promos', {}, {});
    await queryInterface.bulkDelete('products', {}, {});
    await queryInterface.bulkDelete('customers', {}, {});
    await queryInterface.bulkDelete('admins', {}, {});
    console.log("Initial sample data reverted.");
  }
};
