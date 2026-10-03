import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kkrius-super-secret-jwt-key-2026-minimalist';
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  static login(email, password) {
    if (!email || !password) {
      throw new Error('Email y contraseña requeridos');
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }

  static getUserById(id) {
    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
    return user || null;
  }
}
