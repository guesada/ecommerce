const express = require('express');
const { getDatabase } = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all products (public)
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let sql = 'SELECT * FROM products WHERE 1=1';
    let params = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    db.all(sql, params, (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Get total count for pagination
      let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
      let countParams = [];
      
      if (category) {
        countSql += ' AND category = ?';
        countParams.push(category);
      }
      
      if (search) {
        countSql += ' AND (name LIKE ? OR description LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }
      
      db.get(countSql, countParams, (err, countResult) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({
          products,
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
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product (public)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ product });
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product (admin only)
router.post('/', authenticateToken, isAdmin, upload.single('image'), validateProduct, (req, res) => {
  try {
    const { name, description, price, stock, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const db = getDatabase();
    
    db.run(
      'INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock, category, image_url],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create product' });
        }
        
        // Get the created product
        db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to retrieve product' });
          }
          
          res.status(201).json({
            message: 'Product created successfully',
            product
          });
        });
      }
    );
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, isAdmin, upload.single('image'), validateProduct, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    const db = getDatabase();
    
    // Check if product exists
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, existingProduct) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Build update query dynamically
      let updateSql = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP';
      let params = [name, description, price, stock, category];
      
      if (image_url) {
        updateSql += ', image_url = ?';
        params.push(image_url);
      }
      
      updateSql += ' WHERE id = ?';
      params.push(id);
      
      db.run(updateSql, params, function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update product' });
        }
        
        // Get the updated product
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to retrieve updated product' });
          }
          
          res.json({
            message: 'Product updated successfully',
            product
          });
        });
      });
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete product' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully' });
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product categories (public)
router.get('/categories/list', (req, res) => {
  try {
    const db = getDatabase();
    
    db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""', (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        categories: categories.map(cat => cat.category)
      });
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 