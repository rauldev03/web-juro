import { AuthService } from '../services/auth.service.js';

export function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token de acceso requerido.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    const user = AuthService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error interno en autenticación: ' + error.message });
  }
}
