# KYC Integration Guide

## Overview

The platform includes KYC/AML integration that is stubbed for M1 and ready for full API integration in M2.

## Current Implementation (M1 - Stubbed)

In M1, the KYC service operates in stubbed mode:
- Returns mock responses
- No actual API calls to KYC provider
- Suitable for development and testing

## Integration for M2

### Configuration

Set the following environment variables:

```bash
KYC_API_KEY=your-kyc-provider-api-key
KYC_API_URL=https://api.kyc-provider.com
KYC_WEBHOOK_SECRET=your-webhook-secret
```

### API Integration

The KYC service (`backend/src/utils/kyc.js`) needs to be updated with:

1. **Initiate KYC** - Make actual API call to provider
2. **Check Status** - Poll provider for status updates
3. **Webhook Verification** - Verify webhook signatures
4. **Webhook Processing** - Handle status updates

### Webhook Setup

1. Configure webhook URL in KYC provider dashboard:
   ```
   https://yourdomain.com/api/webhooks/kyc
   ```

2. Set webhook secret for signature verification

3. Webhook payload format (example):
   ```json
   {
     "reference": "kyc-reference-id",
     "status": "approved|rejected|pending",
     "data": {
       "reason": "Rejection reason if applicable"
     }
   }
   ```

### Implementation Steps

1. Update `initiateKYC` method with actual API call
2. Update `checkKYCStatus` method with actual API call
3. Implement `verifyWebhook` with provider's signature verification
4. Update `handleWebhook` to process actual webhook data
5. Test integration in staging environment
6. Update error handling for API failures

### Testing

1. Test KYC initiation flow
2. Test status polling
3. Test webhook processing
4. Test error scenarios
5. Verify data persistence

## Supported Providers

The integration is designed to work with any KYC provider that offers:
- REST API for initiation
- Status checking endpoint
- Webhook notifications
- Signature verification

Common providers:
- Jumio
- Onfido
- Sumsub
- Trulioo

## Security Considerations

- Never log sensitive user data
- Verify webhook signatures
- Use HTTPS for all API calls
- Store API keys securely
- Implement rate limiting
- Handle API failures gracefully

