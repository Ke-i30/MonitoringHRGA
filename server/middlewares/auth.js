const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Format token tidak valid.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hrga_super_secret_jwt_key_2026_x89a');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau telah kadaluwarsa.' });
  }
};

const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Otentikasi diperlukan.' });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({ 
        success: false, 
        message: `Akses ditolak. Peran '${req.user.role_name}' tidak memiliki wewenang untuk tindakan ini.` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
