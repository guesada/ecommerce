const express = require('express');
const { getDatabase } = require('../config/database');
const { authenticateToken, isCustomer } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validation');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, isCustomer, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();
    
    const sql = `
      SELECT 
        c.id,
        c.quantity,
        c.created_at,
        p.id as product_id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.stock
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `;
    
    db.all(sql, [userId], (err, cartItems) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      res.json({
        items: cartItems,
        total: parseFloat(total.toFixed(2)),
        itemCount: cartItems.length
      });
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, isCustomer, validateCartItem, (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;
    const db = getDatabase();
    
    // Check if product exists and has enough stock
    db.get('SELECT id, stock FROM products WHERE id = ?', [product_id], (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (product.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      // Check if item already exists in cart
      db.get('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?', [userId, product_id], (err, existingItem) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          
          if (newQuantity > product.stock) {
            return res.status(400).json({ error: 'Insufficient stock for requested quantity' });
          }
          
          db.run('UPDATE cart SET quantity = ? WHERE id = ?', [newQuantity, existingItem.id], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update cart' });
            }
            
            res.json({ message: 'Cart updated successfully', quantity: newQuantity });
          });
        } else {
          // Add new item
          db.run('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [userId, product_id, quantity], function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to add item to cart' });
            }
            
            res.status(201).json({ message: 'Item added to cart successfully' });
          });
        }
      });
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, isCustomer, (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    const db = getDatabase();
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity required' });
    }
    
    // Check if cart item exists and belongs to user
    db.get('SELECT c.id, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?', [id, userId], (err, item) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!item) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      
      if (quantity > item.stock) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      // Update quantity
      db.run('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update cart item' });
        }
        
        res.json({ message: 'Cart item updated successfully' });
      });
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, isCustomer, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDatabase();
    
    db.run('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove item from cart' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cart item not found' });
      }
      
      res.json({ message: 'Item removed from cart successfully' });
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear entire cart
router.delete('/', authenticateToken, isCustomer, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();
    
    db.run('DELETE FROM cart WHERE user_id = ?', [userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to clear cart' });
      }
      
      res.json({ message: 'Cart cleared successfully' });
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cart summary (count and total)
router.get('/summary', authenticateToken, isCustomer, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();
    
    const sql = `
      SELECT 
        COUNT(c.id) as item_count,
        SUM(c.quantity * p.price) as total
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;
    
    db.get(sql, [userId], (err, summary) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        itemCount: summary.item_count || 0,
        total: parseFloat((summary.total || 0).toFixed(2))
      });
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 