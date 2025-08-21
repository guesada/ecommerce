const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      const db = getDatabase();
      
      // Verify user still exists in database
      db.get('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.userId], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user) {
          return res.status(403).json({ error: 'User no longer exists' });
        }
        
        req.user = user;
        next();
      });
    } catch (error) {
      return res.status(500).json({ error: 'Authentication error' });
    }
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

const isAdmin = requireRole(['admin']);
const isCustomer = requireRole(['customer', 'admin']);

module.exports = {
  authenticateToken,
  requireRole,
  isAdmin,
  isCustomer
}; 