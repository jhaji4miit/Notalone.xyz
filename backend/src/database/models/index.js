const User = require('./User');
const Profile = require('./Profile');
const KYC = require('./KYC');
const Wallet = require('./Wallet');
const Transaction = require('./Transaction');
const Product = require('./Product');
const Portfolio = require('./Portfolio');

// Define associations
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(KYC, { foreignKey: 'userId', as: 'kyc' });
KYC.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Wallet.hasMany(Transaction, { foreignKey: 'walletId', as: 'transactions' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId', as: 'wallet' });

User.hasMany(Portfolio, { foreignKey: 'userId', as: 'portfolios' });
Portfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Portfolio, { foreignKey: 'productId', as: 'portments' });
Portfolio.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  User,
  Profile,
  KYC,
  Wallet,
  Transaction,
  Product,
  Portfolio
};

