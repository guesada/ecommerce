const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();
    
    db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    const db = getDatabase();
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email is already taken by another user
    db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
      
      // Update user profile
      db.run('UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, email, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile' });
        }
        
        // Get updated user
        db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId], (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to retrieve updated user' });
          }
          
          res.json({
            message: 'Profile updated successfully',
            user
          });
        });
      });
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const db = getDatabase();
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    // Get current user with password
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }
        
        res.json({ message: 'Password changed successfully' });
      });
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/admin/all', authenticateToken, isAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const { role, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT id, name, email, role, created_at FROM users WHERE 1=1';
    let params = [];
    
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(sql, params, (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
      let countParams = [];
      
      if (role) {
        countSql += ' AND role = ?';
        countParams.push(role);
      }
      
      db.get(countSql, countParams, (err, countResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.total,
            pages: Math.ceil(countResult.total / limit)
          }
        });
      });
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin only)
router.patch('/admin/:id/role', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const db = getDatabase();
    
    const validRoles = ['customer', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Prevent admin from changing their own role
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }
    
    db.run('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [role, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user role' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User role updated successfully' });
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/admin/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics (admin only)
router.get('/admin/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const db = getDatabase();
    
    const sql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customer_users,
        COUNT(CASE WHEN DATE(created_at) = DATE('now') THEN 1 END) as new_users_today,
        COUNT(CASE WHEN DATE(created_at) >= DATE('now', '-7 days') THEN 1 END) as new_users_week
      FROM users
    `;
    
    db.get(sql, (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        stats: {
          totalUsers: stats.total_users || 0,
          adminUsers: stats.admin_users || 0,
          customerUsers: stats.customer_users || 0,
          newUsersToday: stats.new_users_today || 0,
          newUsersWeek: stats.new_users_week || 0
        }
      });
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 