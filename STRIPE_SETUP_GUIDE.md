# 🎯 Stripe Integration Setup Guide - Work Local LMS
## Build 23 - Real Stripe Checkout Implementation

Welcome! This guide will walk you through setting up **REAL** Stripe payments for your LMS platform. Follow each step carefully.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- ✅ Stripe account (Test mode is fine to start)
- ✅ Supabase project set up
- ✅ Supabase CLI installed on your computer
- ✅ Node.js installed (for Supabase CLI)

---

## Part 1: Install Supabase CLI

### Step 1: Check if Supabase CLI is installed

Open PowerShell in your project directory and run:

```powershell
supabase --version
```

**If you see an error**, you need to install the CLI:

```powershell
# Install using npm (Node.js required)
npm install -g supabase

# OR using Scoop (Windows package manager)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```powershell
supabase login
```

This will open your browser. Login with your Supabase credentials.

---

## Part 2: Link Your Project

### Step 3: Link your local project to Supabase

You need your Supabase project ID. Find it at: https://supabase.com/dashboard/project/_/settings/general

```powershell
cd "C:\Users\Tuf Gamer\Desktop\Cursor Stuff\lms project"
supabase link --project-ref YOUR_PROJECT_REF_HERE
```

Replace `YOUR_PROJECT_REF_HERE` with your actual project ID (e.g., `odmwtcaqwodjvcdrirma`).

---

## Part 3: Get Your Stripe Keys

### Step 4: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`) - Already in your HTML ✓
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal" and copy it

⚠️ **NEVER share your Secret Key publicly!**

### Step 5: Get Stripe Webhook Secret (we'll set this up later)

We'll come back to this after deploying the functions.

---

## Part 4: Deploy Edge Functions to Supabase

### Step 6: Set Environment Variables (Secrets)

You need to set 3 secrets in Supabase:

```powershell
# Set your Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Set your Supabase URL (from your project)
supabase secrets set SUPABASE_URL=https://odmwtcaqwodjvcdrirma.supabase.co

# Set your Supabase Service Role Key (find in Project Settings > API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

**Where to find Service Role Key:**
1. Go to: https://supabase.com/dashboard/project/odmwtcaqwodjvcdrirma/settings/api
2. Under "Project API keys", find "service_role" key
3. Click to reveal and copy

### Step 7: Deploy the Edge Functions

```powershell
# Deploy the checkout session function
supabase functions deploy create-checkout-session

# Deploy the webhook handler function
supabase functions deploy stripe-webhook
```

**You should see output like:**
```
Deploying create-checkout-session (project ref: odmwtcaqwodjvcdrirma)
  function region: us-east-1
  function url: https://odmwtcaqwodjvcdrirma.supabase.co/functions/v1/create-checkout-session
✔ Deployed Function create-checkout-session successfully.
```

📝 **IMPORTANT:** Copy both function URLs! You'll need them.

---

## Part 5: Configure Stripe Webhooks

### Step 8: Create Webhook in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Enter your webhook URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
   Replace `YOUR_PROJECT_ID` with `odmwtcaqwodjvcdrirma`

4. Under **"Select events to listen to"**, click **"+ Select events"**
5. Search for and select: `checkout.session.completed`
6. Click **"Add endpoint"**

### Step 9: Get the Webhook Signing Secret

After creating the webhook:
1. Click on your newly created webhook endpoint
2. In the **"Signing secret"** section, click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)

### Step 10: Set the Webhook Secret

```powershell
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 11: Redeploy the webhook function with the new secret

```powershell
supabase functions deploy stripe-webhook
```

---

## Part 6: Update Frontend Configuration (Optional)

Your HTML file already has the Stripe publishable key. If you want to update it or use a different key:

1. Open `index.html`
2. Find line 1000 (search for `STRIPE_PUBLISHABLE_KEY`)
3. Replace with your key if needed

---

## Part 7: Test the Integration! 🎉

### Step 12: Test a Purchase

1. Open your LMS in a browser
2. Sign in as a student
3. Go to "Premium Content" section
4. Try to purchase an e-course
5. You should be redirected to Stripe Checkout

### Step 13: Use Stripe Test Card

Use these test card numbers:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

### Step 14: Verify Purchase

After successful payment:
1. You'll be redirected back to your LMS
2. Check the "Premium Content" section
3. The e-course should now show "✓ Purchased"
4. Click "Open E-Course" to access it

---

## Part 8: Switch to Live Mode (Production)

When you're ready to accept real payments:

### Step 15: Get Live Stripe Keys

1. In Stripe Dashboard, toggle from "Test mode" to "Live mode" (top right)
2. Go to https://dashboard.stripe.com/apikeys
3. Get your **Live Publishable Key** (`pk_live_...`)
4. Get your **Live Secret Key** (`sk_live_...`)

### Step 16: Update Secrets for Production

```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
```

### Step 17: Create Live Webhook

Repeat Step 8-11, but in **Live mode** instead of Test mode.

### Step 18: Update Frontend

In `index.html`, replace the test publishable key with your live key on line 1000.

---

## 🔍 Troubleshooting

### Function deployment fails
- Make sure you're logged in: `supabase login`
- Check your project is linked: `supabase projects list`

### Checkout session creation fails
- Verify STRIPE_SECRET_KEY is set correctly
- Check function logs: `supabase functions logs create-checkout-session`

### Webhook not working
- Verify STRIPE_WEBHOOK_SECRET is set
- Test webhook in Stripe Dashboard: Webhooks > Your endpoint > "Send test webhook"
- Check function logs: `supabase functions logs stripe-webhook`

### Purchase not appearing in database
- Check Supabase logs for the webhook function
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Manually test webhook: Stripe Dashboard > Webhooks > Send test event

---

## 📊 Monitoring

### View Function Logs

```powershell
# Real-time logs for checkout function
supabase functions logs create-checkout-session --follow

# Real-time logs for webhook function
supabase functions logs stripe-webhook --follow
```

### Check Stripe Dashboard

- View payments: https://dashboard.stripe.com/test/payments
- View webhooks: https://dashboard.stripe.com/test/webhooks
- View customers: https://dashboard.stripe.com/test/customers

---

## 🎓 What Each Component Does

### Frontend (index.html)
- Calls `create-checkout-session` Edge Function
- Redirects to Stripe Checkout
- Handles payment success/cancel redirects

### Edge Function: create-checkout-session
- Creates a Stripe Checkout Session
- Stores metadata (user_id, ecourse_id)
- Returns session URL for redirect

### Edge Function: stripe-webhook
- Receives payment confirmation from Stripe
- Verifies webhook signature for security
- Records purchase in Supabase `purchases` table

### Stripe Checkout
- Secure payment page hosted by Stripe
- Collects card information
- Processes payment
- Redirects back to your site

---

## ✅ Completion Checklist

Before going live, verify:

- [ ] Supabase CLI installed and logged in
- [ ] Project linked to Supabase
- [ ] All secrets set (STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_WEBHOOK_SECRET)
- [ ] Both Edge Functions deployed successfully
- [ ] Webhook endpoint created in Stripe
- [ ] Test purchase completed successfully
- [ ] Purchase appears in Supabase `purchases` table
- [ ] Purchased content is accessible

---

## 🚀 You're Done!

Your LMS now has **REAL** Stripe integration! Students can purchase e-courses with credit cards, and webhooks automatically unlock content.

**Need help?** Check the troubleshooting section or review Supabase/Stripe logs.

**Build 23** - Real Stripe Integration ✅

