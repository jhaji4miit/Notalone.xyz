const axios = require('axios');
const logger = require('./logger');

// Payment Service Provider (PSP/Custodian) Integration
class PSPService {
  constructor() {
    this.apiKey = process.env.PSP_API_KEY;
    this.apiSecret = process.env.PSP_API_SECRET;
    this.apiUrl = process.env.PSP_API_URL || 'https://api.psp-provider.com';
    this.webhookSecret = process.env.PSP_WEBHOOK_SECRET;
    this.primaryCurrency = process.env.PRIMARY_CURRENCY || 'AED';
  }

  async createAccount(userId, userData) {
    // Create account with PSP/Custodian
    if (!this.apiKey || process.env.NODE_ENV === 'development') {
      logger.info('PSP Service: Stubbed mode - Account creation', { userId, userData });
      
      return {
        success: true,
        accountId: `PSP-ACC-${Date.now()}-${userId.substring(0, 8)}`,
        status: 'pending',
        message: 'PSP account created (stubbed)'
      };
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/accounts`,
        {
          userId,
          currency: this.primaryCurrency,
          ...userData
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          auth: {
            username: this.apiKey,
            password: this.apiSecret
          }
        }
      );

      return {
        success: true,
        accountId: response.data.accountId,
        status: response.data.status,
        message: 'PSP account created'
      };
    } catch (error) {
      logger.error('PSP account creation error:', error);
      throw new Error('Failed to create PSP account');
    }
  }

  async initiateDeposit(accountId, amount, currency, metadata = {}) {
    // Initiate deposit intent
    if (!this.apiKey || process.env.NODE_ENV === 'development') {
      logger.info('PSP Service: Stubbed mode - Deposit initiation', { accountId, amount, currency });
      
      return {
        success: true,
        transactionId: `DEP-${Date.now()}`,
        status: 'pending',
        redirectUrl: `${process.env.APP_URL}/payment/deposit?ref=stub-${Date.now()}`,
        message: 'Deposit initiated (stubbed)'
      };
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/deposits`,
        {
          accountId,
          amount,
          currency,
          metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status,
        redirectUrl: response.data.redirectUrl,
        message: 'Deposit initiated'
      };
    } catch (error) {
      logger.error('PSP deposit initiation error:', error);
      throw new Error('Failed to initiate deposit');
    }
  }

  async initiateWithdrawal(accountId, amount, currency, destination, metadata = {}) {
    // Initiate withdrawal intent
    if (!this.apiKey || process.env.NODE_ENV === 'development') {
      logger.info('PSP Service: Stubbed mode - Withdrawal initiation', { accountId, amount, currency });
      
      return {
        success: true,
        transactionId: `WD-${Date.now()}`,
        status: 'pending',
        message: 'Withdrawal initiated (stubbed)'
      };
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/withdrawals`,
        {
          accountId,
          amount,
          currency,
          destination,
          metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        transactionId: response.data.transactionId,
        status: response.data.status,
        message: 'Withdrawal initiated'
      };
    } catch (error) {
      logger.error('PSP withdrawal initiation error:', error);
      throw new Error('Failed to initiate withdrawal');
    }
  }

  async checkTransactionStatus(transactionId) {
    // Poll transaction status
    if (!this.apiKey || process.env.NODE_ENV === 'development') {
      logger.info('PSP Service: Stubbed mode - Transaction status check', { transactionId });
      return {
        status: 'completed',
        message: 'Transaction status check (stubbed)'
      };
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/transactions/${transactionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return {
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      logger.error('PSP transaction status check error:', error);
      throw new Error('Failed to check transaction status');
    }
  }

  async verifyWebhook(signature, payload) {
    // Verify webhook signature from PSP
    if (!this.webhookSecret) {
      logger.warn('PSP webhook secret not configured');
      return false;
    }

    // Add webhook verification logic here based on provider's method
    return true;
  }

  async handleWebhook(payload) {
    // Process webhook from PSP
    const { transactionId, status, amount, currency, type } = payload;

    return {
      transactionId,
      status,
      amount,
      currency,
      type,
      processed: true
    };
  }
}

module.exports = new PSPService();

