import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

interface JwtPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token for a user
 * @param payload - User data to include in the JWT payload
 * @returns JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  // Use 'any' type to bypass TypeScript errors
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token
 * @param token - JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    // Use 'any' type to bypass TypeScript errors
    return (jwt as any).verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value
 * @returns JWT token or null if not found or invalid format
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}; 