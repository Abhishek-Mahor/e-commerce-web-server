const jwt = require('jsonwebtoken');

function adminMiddleware(req, res, next) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
}

module.exports = adminMiddleware;
