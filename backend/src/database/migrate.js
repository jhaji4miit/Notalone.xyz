require('dotenv').config();
const { sequelize } = require('./connection');
const models = require('./models');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync all models
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();

