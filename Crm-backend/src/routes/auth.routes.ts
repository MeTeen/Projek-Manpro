import { Router, Request, Response } from 'express'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 
import * as authController from '../controllers/auth.controller';
import { authenticateJWT, isSuperAdmin } from '../middlewares/auth.middleware';
import User from '../models/user';

const router = Router();

// Signup
router.post('/signup', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' } // opsional, token expired 1 hari
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err });
  }
});

// Profile (protected)
router.get('/profile', authenticateJWT as any, authController.getProfile as any);

export default router;
