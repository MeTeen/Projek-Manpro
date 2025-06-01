// src/controllers/promo.controller.ts
import { Request, Response } from 'express';
import { Promo, Customer, CustomerPromo, Admin } from '../models'; // Sesuaikan path
import { Op } from 'sequelize';

// Hanya Super Admin
export const createPromo = async (req: Request, res: Response) => {
  try {
    const { name, description, type, value, startDate, endDate, isActive } = req.body;
    const createdBy = (req.user as any).id; // Jika ingin mencatat siapa yang create

    if (!name || !type || value === undefined) {
      return res.status(400).json({ success: false, message: 'Name, type, and value are required for promo' });
    }

    const promo = await Promo.create({
      name,
      description,
      type,
      value,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
      createdBy
    });
    res.status(201).json({ success: true, message: 'Promo created successfully', data: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating promo', error: (error as Error).message });
  }
};

export const getAllPromos = async (req: Request, res: Response) => {
  try {
    // Optimize: Only fetch eligible customers if specifically requested
    const includeCustomers = req.query.includeCustomers === 'true';
    
    const promos = await Promo.findAll({
      include: includeCustomers ? [{ 
        model: Customer, 
        as: 'eligibleCustomers', 
        attributes: ['id', 'firstName', 'lastName'],
        through: {
          attributes: ['isUsed', 'usedAt'], // Include usage status
          as: 'promoAssignment'
        }
      }] : [],
      order: [['createdAt', 'DESC']] // Add ordering for consistent results
    });
    
    res.status(200).json({ success: true, count: promos.length, data: promos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching promos', error: (error as Error).message });
  }
};

export const getPromoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promo = await Promo.findByPk(id, { include: [{ model: Customer, as: 'eligibleCustomers', attributes: ['id', 'firstName', 'lastName'] }] });
    if (!promo) {
      return res.status(404).json({ success: false, message: `Promo with ID ${id} not found` });
    }
    res.status(200).json({ success: true, data: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching promo', error: (error as Error).message });
  }
};

// Hanya Super Admin
export const updatePromo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promo = await Promo.findByPk(id);
    if (!promo) {
      return res.status(404).json({ success: false, message: `Promo with ID ${id} not found` });
    }
    await promo.update(req.body);
    res.status(200).json({ success: true, message: 'Promo updated successfully', data: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating promo', error: (error as Error).message });
  }
};

// Hanya Super Admin
export const deletePromo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promo = await Promo.findByPk(id);
    if (!promo) {
      return res.status(404).json({ success: false, message: `Promo with ID ${id} not found` });
    }
    // Pertimbangkan apa yang terjadi pada CustomerPromo jika promo dihapus (cascade atau set null)
    await CustomerPromo.destroy({ where: { promoId: id } }); // Hapus dulu assignmentnya
    await promo.destroy();
    res.status(200).json({ success: true, message: 'Promo deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting promo', error: (error as Error).message });
  }
};

// Admin & Super Admin
export const assignPromoToCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId, promoId } = req.body;
    const assignedBy = (req.user as any).id; // Jika ingin mencatat siapa yang assign

    if (!customerId || !promoId) {
      return res.status(400).json({ success: false, message: 'Customer ID and Promo ID are required' });
    }

    const customer = await Customer.findByPk(customerId);
    const promo = await Promo.findByPk(promoId);

    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    if (!promo) return res.status(404).json({ success: false, message: 'Promo not found' });

    const existingAssignment = await CustomerPromo.findOne({ where: { customerId, promoId } });
    if (existingAssignment) {
      return res.status(400).json({ success: false, message: 'Promo already assigned to this customer' });
    }

    const assignment = await CustomerPromo.create({
      customerId,
      promoId,
      assignedBy
    });
    res.status(201).json({ success: true, message: 'Promo assigned to customer successfully', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error assigning promo to customer', error: (error as Error).message });
  }
};

// Admin & Super Admin
export const removePromoFromCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId, promoId } = req.body; // atau dari req.params jika URLnya /promos/assign/:customerId/:promoId

    if (!customerId || !promoId) {
      return res.status(400).json({ success: false, message: 'Customer ID and Promo ID are required' });
    }

    const result = await CustomerPromo.destroy({ where: { customerId, promoId } });
    if (result === 0) {
      return res.status(404).json({ success: false, message: 'Promo assignment not found for this customer' });
    }
    res.status(200).json({ success: true, message: 'Promo removed from customer successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing promo from customer', error: (error as Error).message });
  }
};

// Untuk UI Pembelian
export const getAvailablePromosForCustomer = async (req: Request, res: Response) => {
    try {
        const { customerId } = req.params;
        const customer = await Customer.findByPk(customerId, {
            include: [{
                model: Promo,
                as: 'availablePromos',
                through: { 
                    attributes: [],
                    where: { isUsed: false } // Only include unused promos
                },
                where: {
                    isActive: true,
                    [Op.or]: [ // Promo valid jika tidak ada tanggal atau berada dalam rentang tanggal
                        { startDate: null, endDate: null },
                        { startDate: { [Op.lte]: new Date() }, endDate: null },
                        { startDate: null, endDate: { [Op.gte]: new Date() } },
                        { startDate: { [Op.lte]: new Date() }, endDate: { [Op.gte]: new Date() } }
                    ]
                }
            }]
        });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({ success: true, data: (customer as any).availablePromos || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching available promos for customer', error: (error as Error).message });
    }
};