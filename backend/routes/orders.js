const express = require('express');
const { getDatabase } = require('../config/database');
const { authenticateToken, isCustomer, isAdmin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

const router = express.Router();

// Get user's orders
router.get('/', authenticateToken, isCustomer, (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();
    
    const sql = `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        o.updated_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    
    db.all(sql, [userId], (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ orders });
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single order with items
router.get('/:id', authenticateToken, isCustomer, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDatabase();
    
    // Get order details
    db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId], (err, order) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order items
      const itemsSql = `
        SELECT 
          oi.quantity,
          oi.price,
          p.id as product_id,
          p.name,
          p.description,
          p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
      
      db.all(itemsSql, [id], (err, items) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          order: {
            ...order,
            items
          }
        });
      });
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new order from cart
router.post('/', authenticateToken, isCustomer, validateOrder, (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_address, items } = req.body;
    const db = getDatabase();
    
    // Start transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      // Calculate total and validate stock
      let total = 0;
      let hasError = false;
      let errorMessage = '';
      
      // Validate each item
      items.forEach((item, index) => {
        db.get('SELECT price, stock FROM products WHERE id = ?', [item.product_id], (err, product) => {
          if (err || !product) {
            hasError = true;
            errorMessage = 'Product not found';
            return;
          }
          
          if (product.stock < item.quantity) {
            hasError = true;
            errorMessage = `Insufficient stock for product ID ${item.product_id}`;
            return;
          }
          
          total += product.price * item.quantity;
          
          // Check if this is the last item
          if (index === items.length - 1) {
            if (hasError) {
              db.run('ROLLBACK');
              return res.status(400).json({ error: errorMessage });
            }
            
            // Create order
            db.run(
              'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
              [userId, total, shipping_address],
              function(err) {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Failed to create order' });
                }
                
                const orderId = this.lastID;
                let itemsCreated = 0;
                
                // Create order items and update stock
                items.forEach((item) => {
                  db.run(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price],
                    function(err) {
                      if (err) {
                        hasError = true;
                        errorMessage = 'Failed to create order item';
                        return;
                      }
                      
                      // Update product stock
                      db.run(
                        'UPDATE products SET stock = stock - ? WHERE id = ?',
                        [item.quantity, item.product_id],
                        function(err) {
                          if (err) {
                            hasError = true;
                            errorMessage = 'Failed to update product stock';
                            return;
                          }
                          
                          itemsCreated++;
                          
                          if (itemsCreated === items.length) {
                            if (hasError) {
                              db.run('ROLLBACK');
                              return res.status(500).json({ error: errorMessage });
                            }
                            
                            // Clear user's cart
                            db.run('DELETE FROM cart WHERE user_id = ?', [userId], function(err) {
                              if (err) {
                                console.warn('Failed to clear cart after order creation');
                              }
                              
                              db.run('COMMIT');
                              
                              res.status(201).json({
                                message: 'Order created successfully',
                                orderId,
                                total: parseFloat(total.toFixed(2))
                              });
                            });
                          }
                        }
                      );
                    }
                  );
                });
              }
            );
          }
        });
      });
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = getDatabase();
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update order status' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({ message: 'Order status updated successfully' });
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticateToken, isAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const { status, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    let params = [];
    
    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(sql, params, (err, orders) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
      let countParams = [];
      
      if (status) {
        countSql += ' AND status = ?';
        countParams.push(status);
      }
      
      db.get(countSql, countParams, (err, countResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          orders,
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
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order statistics (admin only)
router.get('/admin/stats', authenticateToken, isAdmin, (req, res) => {
  try {
    const db = getDatabase();
    
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
    `;
    
    db.get(sql, (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        stats: {
          totalOrders: stats.total_orders || 0,
          totalRevenue: parseFloat((stats.total_revenue || 0).toFixed(2)),
          avgOrderValue: parseFloat((stats.avg_order_value || 0).toFixed(2)),
          pendingOrders: stats.pending_orders || 0,
          processingOrders: stats.processing_orders || 0,
          shippedOrders: stats.shipped_orders || 0,
          deliveredOrders: stats.delivered_orders || 0,
          cancelledOrders: stats.cancelled_orders || 0
        }
      });
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 