require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./database/connection');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const kycRoutes = require('./routes/kyc');
const paymentRoutes = require('./routes/payments');
const walletRoutes = require('./routes/wallet');
const productRoutes = require('./routes/products');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhooks');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/products', productRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Sync database (use with caution in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Database models synchronized.');
    }

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;

