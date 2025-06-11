import { Request, Response } from 'express';
import { sequelize, Customer, Product, CustomerProduct, Promo, CustomerPromo } from '../models'; // Pastikan Promo dan CustomerPromo diimpor
import { Transaction, Op } from 'sequelize';
import { formatTransactionReference } from '../utils/transactionFormatter';

// --- Fungsi Helper untuk Validasi dan Kalkulasi Promo (Opsional, bisa diletakkan di sini atau di utils) ---
interface PromoValidationResult {
  isValid: boolean;
  appliedPromo: Promo | null;
  discountAmount: number;
  message?: string;
}

async function validateAndCalculatePromo(
  promoId: number | null,
  customerId: number,
  basePrice: number // Harga total sebelum diskon (misal: product.price * quantity)
): Promise<PromoValidationResult> {
  if (!promoId) {
    return { isValid: true, appliedPromo: null, discountAmount: 0 }; // Tidak ada promo, valid untuk lanjut
  }

  const promo = await Promo.findOne({
    where: {
      id: promoId,
      isActive: true,
      [Op.or]: [ // Promo valid jika tidak ada tanggal atau berada dalam rentang tanggal
        { startDate: null, endDate: null },
        { startDate: { [Op.lte]: new Date() }, endDate: null },
        { startDate: null, endDate: { [Op.gte]: new Date() } },
        { startDate: { [Op.lte]: new Date() }, endDate: { [Op.gte]: new Date() } }
      ]
    },
    include: [{
        model: Customer,
        as: 'eligibleCustomers', // Pastikan alias ini sesuai dengan definisi di model
        where: { id: customerId },
        attributes: [], // Tidak perlu atribut customer di sini, hanya untuk validasi join
        required: true // Pastikan join berhasil (promo ter-assign ke customer ini)
    }]
  });

  if (!promo) {
    return {
      isValid: false,
      appliedPromo: null,
      discountAmount: 0,
      message: `Promo with ID ${promoId} is not valid, not active, expired, or not assigned for this customer.`
    };
  }
  // Check if promo has already been used by this customer (for one-time use promos)
  const customerPromo = await CustomerPromo.findOne({
    where: {
      customerId: customerId,
      promoId: promoId,
      isUsed: true
    }
  });

  if (customerPromo) {
    return {
      isValid: false,
      appliedPromo: null,
      discountAmount: 0,
      message: `This promo has already been used and cannot be applied again.`
    };
  }

  let discount = 0;
  if (promo.type === 'percentage') {
    discount = basePrice * (promo.value / 100);
  } else if (promo.type === 'fixed_amount') {
    discount = promo.value;
  }

  // Pastikan diskon tidak melebihi harga dasar
  discount = Math.min(discount, basePrice);

  return { isValid: true, appliedPromo: promo, discountAmount: discount };
}
// --- Akhir Fungsi Helper ---

/**
 * Create a purchase (add a product to a customer's purchases)
 * @route POST /api/purchases
 */
export const createPurchase = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  let transactionCompleted = false;
  try {
    const { customerId, productId, quantity = 1, promoId, promoCode } = req.body; // Ambil promoId atau promoCode dari body

    console.log('Purchase request received:', req.body);
    console.log('PromoId received:', promoId, 'Type:', typeof promoId);
    console.log('PromoCode received:', promoCode, 'Type:', typeof promoCode);

    const customerIdNum = parseInt(customerId, 10);
    const productIdNum = parseInt(productId, 10);
    const quantityNum = parseInt(quantity, 10);

    if (isNaN(customerIdNum) || customerIdNum <= 0) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(400).json({ success: false, message: 'Invalid Customer ID' });
    }
    if (isNaN(productIdNum) || productIdNum <= 0) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }
    if (isNaN(quantityNum) || quantityNum <= 0) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    const customer = await Customer.findByPk(customerIdNum, { transaction: t });
    const product = await Product.findByPk(productIdNum, { transaction: t });

    if (!customer) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(404).json({ success: false, message: `Customer with ID ${customerIdNum} not found` });
    }
    if (!product) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(404).json({ success: false, message: `Product with ID ${productIdNum} not found` });
    }    if (product.stock < quantityNum) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(400).json({ success: false, message: `Not enough stock. Requested: ${quantityNum}, Available: ${product.stock}` });
    }

    const productPrice = parseFloat(product.price?.toString() || '0');
    const basePurchaseTotal = productPrice * quantityNum;

    // Resolve promo: if promoCode is provided, find the corresponding promoId
    let resolvedPromoId = promoId ? parseInt(promoId, 10) : null;
    
    if (promoCode && !resolvedPromoId) {
      console.log('Looking up promo by code:', promoCode);
      const promoByCode = await Promo.findOne({
        where: { name: promoCode }, // Using name field as the code
        transaction: t
      });
      
      if (promoByCode) {
        resolvedPromoId = promoByCode.id;
        console.log('Found promo by code:', promoByCode.id, promoByCode.name);
      } else {
        await t.rollback();
        transactionCompleted = true;
        return res.status(400).json({ success: false, message: `Promo code '${promoCode}' not found` });
      }
    }

    // Validasi dan kalkulasi promo
    const promoDetails = await validateAndCalculatePromo(resolvedPromoId, customerIdNum, basePurchaseTotal);

    if (!promoDetails.isValid) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(400).json({ success: false, message: promoDetails.message });
    }

    const finalPurchaseTotal = basePurchaseTotal - promoDetails.discountAmount;

    const purchase = await CustomerProduct.create({
      customerId: customerIdNum,
      productId: productIdNum,
      quantity: quantityNum,
      price: productPrice, // Harga asli produk per unit
      purchaseDate: new Date(),
      promoId: promoDetails.appliedPromo ? promoDetails.appliedPromo.id : null,
      discountAmount: promoDetails.discountAmount,
    }, { transaction: t });

    console.log('Purchase record created:', purchase);

    await product.update({
      stock: Math.max(0, product.stock - quantityNum)
    }, { transaction: t });

    let currentTotalSpent = parseFloat(customer.totalSpent?.toString() || '0');
    let currentPurchaseCount = parseInt(customer.purchaseCount?.toString() || '0', 10);    await customer.update({
      totalSpent: currentTotalSpent + finalPurchaseTotal, // totalSpent adalah setelah diskon
      purchaseCount: currentPurchaseCount + 1
    }, { transaction: t });

    // Mark promo as used if a promo was applied
    if (promoDetails.appliedPromo) {
      await CustomerPromo.update(
        { 
          isUsed: true, 
          usedAt: new Date() 
        },
        { 
          where: { 
            customerId: customerIdNum, 
            promoId: promoDetails.appliedPromo.id 
          },
          transaction: t 
        }
      );
    }

    await t.commit();
    transactionCompleted = true;    return res.status(201).json({
      success: true,
      message: `Purchase completed successfully. Transaction ${formatTransactionReference(purchase.id)} created.`,
      data: {
        purchase,
        customer: {
          id: customer.id,
          totalSpent: customer.totalSpent, // Ambil dari instance customer yang sudah di-update
          purchaseCount: customer.purchaseCount
        },
        product: {
          id: product.id,
          name: product.name,
          stock: product.stock // Ambil dari instance product yang sudah di-update
        },
        appliedPromo: promoDetails.appliedPromo ? {
            id: promoDetails.appliedPromo.id,
            name: promoDetails.appliedPromo.name,
            discountApplied: promoDetails.discountAmount
        } : null
      }
    });

  } catch (error) {
    if (!transactionCompleted) { // Cek apakah transaksi belum di-commit atau di-rollback
        try {
            await t.rollback();
        } catch (rollbackError) {
            console.error('Error rolling back transaction:', rollbackError);
        }
    }
    console.error('Error creating purchase:', error);
    return res.status(500).json({ success: false, message: 'Failed to create purchase', error: (error as Error).message });
  }
};

/**
 * Add product to customer from dropdown selection (mirip createPurchase)
 * @route POST /api/purchases/add-to-customer
 */
export const addProductToCustomer = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  let transactionCompleted = false;
  try {
    const { customerId, productId, quantity = 1, promoId } = req.body; // Ambil promoId

    const customerIdNum = parseInt(customerId.toString(), 10);
    const productIdNum = parseInt(productId.toString(), 10);
    const quantityNum = parseInt(quantity.toString(), 10);

    // ... (Validasi input seperti di createPurchase) ...
    if (isNaN(customerIdNum) || customerIdNum <= 0) { /* ... */ await t.rollback(); transactionCompleted = true; return res.status(400).json({/*...*/}); }
    if (isNaN(productIdNum) || productIdNum <= 0) { /* ... */ await t.rollback(); transactionCompleted = true; return res.status(400).json({/*...*/}); }
    if (isNaN(quantityNum) || quantityNum <= 0) { /* ... */ await t.rollback(); transactionCompleted = true; return res.status(400).json({/*...*/}); }


    const customer = await Customer.findByPk(customerIdNum, { transaction: t });
    const product = await Product.findByPk(productIdNum, { transaction: t });

    if (!customer) { /* ... */ await t.rollback(); transactionCompleted = true; return res.status(404).json({/*...*/}); }
    if (!product) { /* ... */ await t.rollback(); transactionCompleted = true; return res.status(404).json({/*...*/}); }
    if (product.stock < quantityNum) { /* ... */ await t.rollback(); transactionCompleted = true; return res.status(400).json({/*...*/}); }

    const productPrice = parseFloat(product.price?.toString() || '0');
    const basePurchaseTotal = productPrice * quantityNum;

    // Validasi dan kalkulasi promo
    const promoDetails = await validateAndCalculatePromo(promoId ? parseInt(promoId, 10) : null, customerIdNum, basePurchaseTotal);

    if (!promoDetails.isValid) {
      await t.rollback();
      transactionCompleted = true;
      return res.status(400).json({ success: false, message: promoDetails.message });
    }

    const finalPurchaseTotal = basePurchaseTotal - promoDetails.discountAmount;

    const purchase = await CustomerProduct.create({
      customerId: customerIdNum,
      productId: productIdNum,
      quantity: quantityNum,
      price: productPrice,
      purchaseDate: new Date(),
      promoId: promoDetails.appliedPromo ? promoDetails.appliedPromo.id : null,
      discountAmount: promoDetails.discountAmount,
    }, { transaction: t });

    const newStock = Math.max(0, product.stock - quantityNum);
    await product.update({ stock: newStock }, { transaction: t });

    let currentTotalSpent = parseFloat(customer.totalSpent?.toString() || '0');
    let currentPurchaseCount = parseInt(customer.purchaseCount?.toString() || '0', 10);    await customer.update({
      totalSpent: currentTotalSpent + finalPurchaseTotal,
      purchaseCount: currentPurchaseCount + 1
    }, { transaction: t });

    // Mark promo as used if a promo was applied
    if (promoDetails.appliedPromo) {
      await CustomerPromo.update(
        { 
          isUsed: true, 
          usedAt: new Date() 
        },
        { 
          where: { 
            customerId: customerIdNum, 
            promoId: promoDetails.appliedPromo.id 
          },
          transaction: t 
        }
      );
    }

    await t.commit();
    transactionCompleted = true;

    return res.status(201).json({
      success: true,
      message: 'Product added to customer successfully',
      data: {
        purchase,
        customer: {
          id: customer.id,
          totalSpent: customer.totalSpent,
          purchaseCount: customer.purchaseCount
        },
        product: {
          id: product.id,
          name: product.name,
          stock: newStock
        },
        appliedPromo: promoDetails.appliedPromo ? {
            id: promoDetails.appliedPromo.id,
            name: promoDetails.appliedPromo.name,
            discountApplied: promoDetails.discountAmount
        } : null
      }
    });
  } catch (error) {
    if (!transactionCompleted) {
        try { await t.rollback(); } catch (rbError) { console.error('Rollback error:', rbError); }
    }
    console.error('Error adding product to customer:', error);
    return res.status(500).json({ success: false, message: 'Failed to add product to customer', error: (error as Error).message });
  }
};

// Get all purchases (mungkin perlu join dengan Promo jika ingin menampilkan promo yang digunakan)
export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await CustomerProduct.findAll({
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Promo, as: 'appliedPromoDetails', attributes: ['id', 'name', 'type', 'value'] }
      ],
      order: [['purchaseDate', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch purchases', error: (error as Error).message });
  }
};

// Get purchases for a specific customer
export const getCustomerPurchases = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const customerIdNum = parseInt(customerId, 10);

    if (isNaN(customerIdNum)) {
        return res.status(400).json({ success: false, message: 'Invalid Customer ID' });
    }

    const customer = await Customer.findByPk(customerIdNum);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const purchases = await CustomerProduct.findAll({
      where: { customerId: customerIdNum },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Promo, as: 'appliedPromoDetails', attributes: ['id', 'name', 'type', 'value'] } // Tambahkan ini
      ],
      order: [['purchaseDate', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: {
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          totalSpent: customer.totalSpent,
          purchaseCount: customer.purchaseCount
        },
        purchases
      }
    });
  } catch (error) {
    console.error('Error fetching customer purchases:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer purchases', error: (error as Error).message });
  }
};

// Get purchase history for a specific product
export const getProductPurchaseHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const productIdNum = parseInt(productId, 10);

    if (isNaN(productIdNum)) {
        return res.status(400).json({ success: false, message: 'Invalid Product ID' });
    }

    const product = await Product.findByPk(productIdNum);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const purchases = await CustomerProduct.findAll({
      where: { productId: productIdNum },
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Promo, as: 'appliedPromoDetails', attributes: ['id', 'name', 'type', 'value'] } // Tambahkan ini
      ],
      order: [['purchaseDate', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: {
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock
        },
        purchases
      }
    });
  } catch (error) {
    console.error('Error fetching product purchase history:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch product purchase history', error: (error as Error).message });
  }
};
