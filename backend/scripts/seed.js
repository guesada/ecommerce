const bcrypt = require('bcryptjs');
const { initializeDatabase, getDatabase } = require('../config/database');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Initialize database first
    await initializeDatabase();
    
    const db = getDatabase();
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    db.run(
      'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@ecommerce.com', adminPassword, 'admin'],
      function(err) {
        if (err) {
          console.error('❌ Error creating admin user:', err);
        } else {
          console.log('✅ Admin user created/updated');
        }
      }
    );
    
    // Create sample customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    db.run(
      'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['John Customer', 'customer@ecommerce.com', customerPassword, 'customer'],
      function(err) {
        if (err) {
          console.error('❌ Error creating customer user:', err);
        } else {
          console.log('✅ Customer user created/updated');
        }
      }
    );
    
    // Create sample products
    const sampleProducts = [
      {
        name: 'Smartphone XYZ',
        description: 'Latest smartphone with advanced features and high-quality camera',
        price: 599.99,
        stock: 50,
        category: 'Electronics',
        image_url: 'https://via.placeholder.com/300x300?text=Smartphone'
      },
      {
        name: 'Laptop Pro',
        description: 'Professional laptop for work and gaming',
        price: 1299.99,
        stock: 25,
        category: 'Electronics',
        image_url: 'https://via.placeholder.com/300x300?text=Laptop'
      },
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones with premium sound quality',
        price: 199.99,
        stock: 100,
        category: 'Electronics',
        image_url: 'https://via.placeholder.com/300x300?text=Headphones'
      },
      {
        name: 'Running Shoes',
        description: 'Comfortable running shoes for all types of terrain',
        price: 89.99,
        stock: 75,
        category: 'Sports',
        image_url: 'https://via.placeholder.com/300x300?text=Running+Shoes'
      },
      {
        name: 'Coffee Maker',
        description: 'Automatic coffee maker with programmable settings',
        price: 79.99,
        stock: 30,
        category: 'Home',
        image_url: 'https://via.placeholder.com/300x300?text=Coffee+Maker'
      },
      {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat perfect for home workouts',
        price: 29.99,
        stock: 150,
        category: 'Sports',
        image_url: 'https://via.placeholder.com/300x300?text=Yoga+Mat'
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable Bluetooth speaker with amazing sound quality',
        price: 149.99,
        stock: 60,
        category: 'Electronics',
        image_url: 'https://via.placeholder.com/300x300?text=Speaker'
      },
      {
        name: 'Kitchen Knife Set',
        description: 'Professional kitchen knife set with wooden block',
        price: 199.99,
        stock: 40,
        category: 'Home',
        image_url: 'https://via.placeholder.com/300x300?text=Knife+Set'
      }
    ];
    
    sampleProducts.forEach((product, index) => {
      db.run(
        'INSERT OR IGNORE INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.stock, product.category, product.image_url],
        function(err) {
          if (err) {
            console.error(`❌ Error creating product ${index + 1}:`, err);
          } else {
            console.log(`✅ Product "${product.name}" created/updated`);
          }
        }
      );
    });
    
    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Default credentials:');
    console.log('👑 Admin: admin@ecommerce.com / admin123');
    console.log('👤 Customer: customer@ecommerce.com / customer123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 