// import { Request, Response } from 'express';
// import { Admin } from '../models';
// import { generateToken } from '../utils/jwt';
// import { Op } from 'sequelize';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { User } from '../models/User';
// /**
//  * Register a new admin user
//  * @route POST /api/auth/signup
//  */
// export const signup = async (req: Request, res: Response) => {
//   try {
//     const { username, email, password, role } = req.body;

//     // Validate request
//     if (!username || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username, email, and password are required',
//       });
//     }


//     // Mengecek apakah email customer sudah didaftarkan admin
// export const checkEmailTerdaftar = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (user) {
//       return res.json({ terdaftar: true });
//     } else {
//       return res.json({ terdaftar: false });
//     }
//   } catch (err) {
//     console.error('Gagal cek email:', err);
//     return res.status(500).json({ message: 'Terjadi kesalahan server' });
//   }
// };

// // Signup pertama kali oleh customer (email sudah diset oleh admin)
// export const signupCustomer = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(400).json({ message: 'Email belum terdaftar oleh admin' });
//     }

//     if (user.password) {
//       return res.status(400).json({ message: 'Akun sudah memiliki password' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     user.password = hashedPassword;
//     await user.save();

//     // Optional: generate token langsung
//     const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
//       expiresIn: '1d',
//     });

//     return res.json({
//       message: 'Signup berhasil',
//       token,
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         username: user.username
//       }
//     });
//   } catch (err) {
//     console.error('Signup gagal:', err);
//     return res.status(500).json({ message: 'Terjadi kesalahan saat signup' });
//   }
// };

//     // Check if username or email already exists
//     const existingUser = await Admin.findOne({ 
//       where: { 
//         [Op.or]: [
//           { username },
//           { email }
//         ] 
//       } 
//     });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Username or email already exists',
//       });
//     }

//     // Create new admin with type casting to avoid TS issues
//     const admin = await Admin.create({
//       username,
//       email,
//       password,
//       role: role || 'admin',
//     } as any);

//     // Generate JWT token
//     const token = generateToken({
//       id: admin.id,
//       username: admin.username,
//       email: admin.email,
//       role: admin.role,
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Admin registered successfully',
//       data: {
//         id: admin.id,
//         username: admin.username,
//         email: admin.email,
//         role: admin.role,
//         token,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error registering admin',
//       error: (error as Error).message,
//     });
//   }
// };

// /**
//  * Login an admin user
//  * @route POST /api/auth/login
//  */
// export const login = async (req: Request, res: Response) => {
//   try {
//     const { email, password } = req.body;

//     // Validate request
//     if (!email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email and password are required',
//       });
//     }

//     // Find admin by email
//     const admin = await Admin.findOne({ where: { email } });

//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }

//     // Validate password
//     const isPasswordValid = await admin.validatePassword(password);

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid email or password',
//       });
//     }

//     // Generate JWT token
//     const token = generateToken({
//       id: admin.id,
//       username: admin.username,
//       email: admin.email,
//       role: admin.role,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       data: {
//         id: admin.id,
//         username: admin.username,
//         email: admin.email,
//         role: admin.role,
//         token,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error logging in',
//       error: (error as Error).message,
//     });
//   }
// };

// /**
//  * Get current admin user profile
//  * @route GET /api/auth/profile
//  */
// export const getProfile = async (req: Request, res: Response) => {
//   try {
//     // req.user is set by the authenticateJWT middleware
//     res.status(200).json({
//       success: true,
//       data: req.user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching profile',
//       error: (error as Error).message,
//     });
//   }
// }; 


import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const checkEmailTerdaftar = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    return res.json({ terdaftar: !!user });
  } catch (err) {
    console.error('Gagal mengecek email:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

export const signupCustomer = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email belum didaftarkan oleh admin' });
    }

    if (user.password) {
      return res.status(400).json({ message: 'Akun sudah memiliki password' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Signup berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Signup gagal:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan saat signup' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Akun tidak valid atau belum terdaftar' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Password salah' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Login gagal', details: err });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk((req as any).user.id);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil profil', details: err });
  }
};
