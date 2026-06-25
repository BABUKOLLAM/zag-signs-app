# WhatsApp Business API Integration - Complete Setup Guide

## Prerequisites
- Meta/Facebook Business Account (https://business.facebook.com)
- WhatsApp Business Account
- Registered phone number for sending messages
- Access to environment variables in Vercel

---

## Phase 1: Get API Credentials (20 minutes)

### Step 1: Create/Access Meta Business Manager
1. Go to https://business.facebook.com
2. Create account or login with Facebook account
3. Complete business verification

### Step 2: Create WhatsApp Business Account
1. In Business Manager → Accounts → WhatsApp Accounts
2. Click "Add Account" → "Create New Account"
3. Fill in business details
4. Add phone number (will send messages from this number)
5. Verify phone via SMS/Call code

### Step 3: Create Meta App
1. Go to https://developers.facebook.com
2. Click "Create App"
3. Select "Business" type
4. App Name: "ZAG SIGNS ERP"
5. Complete setup

### Step 4: Add WhatsApp Product
1. In App Dashboard → Products
2. Click "+" → Search "WhatsApp" → Add
3. Go to WhatsApp → API Setup

### Step 5: Copy Your Credentials
You'll see:
- **Phone Number ID**: `1234567890123` (COPY THIS)
- **Business Account ID**: `1234567890` (COPY THIS)
- Generate Access Token and copy

---

## Phase 2: Configure Environment Variables

### Add to .env.local (Local Development)
```env
WHATSAPP_PHONE_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID
WHATSAPP_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
WHATSAPP_API_VERSION=v18.0
WHATSAPP_WEBHOOK_TOKEN=whatsapp_webhook_token_zag_signs
```

### Add to Vercel (Production)
1. Go to Vercel → Project Settings → Environment Variables
2. Add each variable above
3. Select "Production" environment
4. Deploy to apply changes

---

## Phase 3: Set Up Webhook (For Receiving Messages)

### Step 1: Configure Webhook in Meta App
1. In Meta App → WhatsApp → Configuration
2. Webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
3. Verify Token: `whatsapp_webhook_token_zag_signs`
4. Subscribe to: `messages`, `message_status`

### Step 2: Deploy Your App
Make sure webhook route is deployed to Vercel:
```
POST /api/whatsapp/webhook
```

### Step 3: Test Webhook
Meta will send a verification request. If successful, webhook is active.

---

## Phase 4: Implementation

### 1. Replace WhatsAppShare Component
Replace old component with WhatsAppSharePro in:
- `app/quotations/page.tsx`
- `app/invoices/page.tsx`
- `app/work-order-tickets/page.tsx`

### 2. Update Imports
```tsx
import WhatsAppSharePro from "@/components/WhatsAppSharePro";
```

### 3. Use Component with PDF
```tsx
<WhatsAppSharePro
  documentType="quotation"
  documentNumber={q.number}
  customerName={q.customerName}
  customerPhone={q.customerPhone}
  documentDetails={`Total: ₹${q.total}`}
  pdfUrl={`/api/quotation/${q.id}/pdf`}  // URL to PDF
/>
```

---

## Phase 5: Test Locally

1. Add credentials to `.env.local`
2. Run `npm run dev`
3. Go to Quotations/Invoices
4. Click WhatsApp button
5. Enter test phone number (your number)
6. Click "Send"
7. Check your WhatsApp for message

---

## Phase 6: Go Live with Meta

### When Ready for Production:

1. **Go to Meta App → WhatsApp → Get Started**
2. **Submit for Review** (Meta may ask for screenshots)
3. **Meta reviews** (usually 24-48 hours)
4. **Approval received** (you get notification)
5. **Switch from Test to Production** mode
6. **Deploy to Vercel** with production credentials

---

## Pricing

- **Free Tier**: 1,000 messages/month
- **Paid**: ₹0.50-1 per message (India rates) after free tier
- **High Volume**: Contact Meta for enterprise pricing

---

## Features Available

✅ Send text messages
✅ Send PDF documents
✅ Send images  
✅ Pre-approved message templates
✅ Delivery/Read status tracking
✅ Incoming message webhook
✅ Bulk messaging (up to 1000/day)

---

## Troubleshooting

### Message Not Sending
- Check phone number format (should be 10 digits)
- Verify API credentials in environment
- Check token expiration (regenerate if needed)
- Review browser console for errors

### Webhook Not Working
- Verify webhook URL is correct
- Check verify token matches
- Ensure app is deployed to Vercel
- Check Vercel function logs

### Phone Number Not Verified
- Verify via SMS/Call on WhatsApp app
- Wait 30 seconds after verification
- Try sending message after verification

---

## Support

For WhatsApp Business API docs:
https://developers.facebook.com/docs/whatsapp/cloud-api/

---

## Next Steps

1. Get credentials from Meta
2. Add to Vercel environment
3. Update components with WhatsAppSharePro
4. Test locally
5. Deploy to production
6. Submit for Meta approval
7. Switch to production mode

Total time: **1-2 days** (including Meta approval)
