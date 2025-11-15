require('dotenv').config();
const { sequelize } = require('./connection');
const { User, Product } = require('./models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Create admin user (password: admin123 - change in production!)
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@investmentplatform.com' },
      defaults: {
        email: 'admin@investmentplatform.com',
        password: 'admin123',
        role: 'admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('Admin user created:', adminUser[0].email);

    // Create sample products
    const products = [
      {
        name: 'Conservative Growth Fund',
        description: 'A low-risk investment fund focused on stable returns',
        category: 'Mutual Fund',
        minInvestment: 1000,
        maxInvestment: 100000,
        currency: 'AED',
        expectedReturn: 5.5,
        riskLevel: 'low',
        isActive: true
      },
      {
        name: 'Balanced Portfolio',
        description: 'A balanced mix of stocks and bonds for moderate risk',
        category: 'Portfolio',
        minInvestment: 5000,
        maxInvestment: 500000,
        currency: 'AED',
        expectedReturn: 8.0,
        riskLevel: 'medium',
        isActive: true
      },
      {
        name: 'Aggressive Growth Fund',
        description: 'High-risk, high-reward investment opportunity',
        category: 'Equity Fund',
        minInvestment: 10000,
        currency: 'AED',
        expectedReturn: 12.5,
        riskLevel: 'high',
        isActive: true
      }
    ];

    for (const productData of products) {
      const [product] = await Product.findOrCreate({
        where: { name: productData.name },
        defaults: productData
      });
      console.log('Product created:', product.name);
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

