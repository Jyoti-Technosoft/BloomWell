# Razorpay Payment Integration

This document explains the Razorpay payment integration implemented in the BloomWell application.

## Overview

The payment integration allows users to purchase medicines after completing the medical evaluation process. The flow is:

1. User views medicine details
2. User clicks "Claim Free Evaluation"
3. User completes medical questionnaire
4. User completes identity verification
5. User sees treatment recommendation
6. User proceeds to payment
7. Payment is processed via Razorpay
8. Order is confirmed

## Architecture

### Components

1. **PaymentModal** (`components/PaymentModal.tsx`)
   - Frontend payment interface
   - Handles Razorpay checkout
   - Shows payment methods and security info

2. **API Routes**
   - `/api/payments/create-order` - Creates Razorpay order
   - `/api/payments/verify` - Verifies payment signature

3. **Library Functions** (`app/lib/razorpay.ts`)
   - Razorpay initialization
   - Order creation
   - Payment verification
   - Payment details fetching

### Flow Integration

The payment modal is integrated into the medicine detail page (`app/medicines/[medicineId]/page.tsx`) and appears after the treatment recommendation step.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install razorpay
npm install @types/razorpay
```

### 2. Environment Configuration

Add the following to your `.env.local` file:

```env
# Razorpay Test Keys (for development)
RAZORPAY_KEY_ID=your_razorpay_test_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret_here
```

### 3. Get Razorpay Keys

1. Sign up at [Razorpay](https://razorpay.com/)
2. Complete KYC verification
3. Go to Settings → API Keys
4. Generate test keys for development
5. Generate live keys for production

## Payment Flow Details

### 1. Order Creation

When user clicks "Pay Now":
- Frontend calls `/api/payments/create-order`
- Backend creates Razorpay order with amount and medicine details
- Returns order ID and key ID to frontend

### 2. Payment Processing

- Frontend initializes Razorpay checkout with order details
- User selects payment method (Card, UPI, Net Banking)
- Razorpay handles the payment process
- On success, Razorpay returns payment ID and signature

### 3. Payment Verification

- Frontend sends payment details to `/api/payments/verify`
- Backend verifies payment signature using Razorpay secret
- If valid, updates order status and confirms payment

## Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256
2. **Environment Variables**: Sensitive keys are stored in environment variables
3. **HTTPS**: All payment communications use secure HTTPS
4. **Order Validation**: Each payment is tied to a specific order

## Supported Payment Methods

- Credit Cards (Visa, Mastercard, Rupay)
- Debit Cards
- UPI (all major apps)
- Net Banking (all major banks)
- Wallets (Paytm, PhonePe, etc.)

## Testing

### Test Cards

Use Razorpay test cards for development:
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `111111`

### Test UPI

Use test UPI ID: `success@razorpay`

## Error Handling

The system handles various error scenarios:
- Network failures
- Invalid payment signatures
- Insufficient funds
- Expired orders
- Payment cancellations

## Future Enhancements

1. **Order History**: Track user's payment history
2. **Refunds**: Implement refund functionality
3. **Subscription Payments**: Support for recurring payments
4. **Webhooks**: Real-time payment status updates
5. **Analytics**: Payment success rates and metrics

## Compliance

- PCI DSS compliant payment processing
- GDPR compliant data handling
- HIPAA compliant medical payment processing
- Indian payment regulations compliance

## Troubleshooting

### Common Issues

1. **Razorpay not loading**: Check internet connection and script loading
2. **Payment verification fails**: Check environment variables
3. **Order creation fails**: Verify Razorpay account status
4. **Invalid signature**: Ensure correct secret key usage

### Debug Mode

Enable debug mode by setting:
```env
RAZORPAY_DEBUG=true
```

## Support

For Razorpay-specific issues:
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com

For application-specific issues:
- Check application logs
- Verify environment configuration
- Test with different payment methods
