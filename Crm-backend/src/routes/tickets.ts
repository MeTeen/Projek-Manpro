import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Ticket from '../models/TIcket';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch {
    res.sendStatus(403);
  }
};

// Customer: Buat tiket
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  const ticket = await Ticket.create({ ...req.body, userId: req.user.id });
  res.json(ticket);
});

// Admin: Lihat semua tiket
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const tickets = await Ticket.findAll();
  res.json(tickets);
});

// Admin: Update status tiket
router.put('/:id', auth, async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  await Ticket.update({ status: req.body.status }, { where: { id: req.params.id } });
  res.json({ message: 'Updated' });
});

export default router;
