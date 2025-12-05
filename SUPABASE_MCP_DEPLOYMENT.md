# Supabase MCP Deployment Guide
## Alternative to CLI for Edge Functions

Since you've configured the Supabase MCP server, here are the deployment options:

---

## Option 1: Supabase Dashboard (Manual Deployment)

This is the easiest method without CLI:

### Step 1: Create Edge Functions in Dashboard

1. Go to: https://supabase.com/dashboard/project/odmwtcaqwodjvcdrirma/functions
2. Click **"Create a new function"**

### Step 2: Deploy create-checkout-session

1. Function name: `create-checkout-session`
2. Copy the entire code from: `supabase/functions/create-checkout-session/index.ts`
3. Paste it into the editor
4. Click **"Deploy function"**

### Step 3: Deploy stripe-webhook

1. Click **"Create a new function"** again
2. Function name: `stripe-webhook`
3. Copy the entire code from: `supabase/functions/stripe-webhook/index.ts`
4. Paste it into the editor
5. Click **"Deploy function"**

### Step 4: Set Environment Variables

1. In the Functions dashboard, click **"Function Settings"**
2. Go to **"Secrets"** section
3. Add these secrets:
   - `STRIPE_SECRET_KEY` = Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET` = (add after creating webhook)
   - `SUPABASE_URL` = https://odmwtcaqwodjvcdrirma.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key

---

## Option 2: Using MCP (If Available)

The Supabase MCP should provide database access tools. After Cursor restart, check if you have tools like:
- `supabase_query` - Run SQL queries
- `supabase_list_functions` - List edge functions
- `supabase_deploy_function` - Deploy functions

If these tools appear after restart, we can use them for deployment.

---

## Option 3: Keep CLI Method

The CLI deployment I outlined earlier is still the most reliable method for Edge Functions.

---

## Current MCP Configuration Status

Your MCP config at `C:\Users\Tuf Gamer\.cursor\mcp.json`:
```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "command": "npx",
        "args": [
          "-y",
          "@supabase/mcp-server-supabase",
          "--project-ref=odmwtcaqwodjvcdrirma"
        ],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN_HERE"
        }
      }
    }
  }
}
```

✅ Configuration looks correct
⚠️ May need Cursor restart to activate
⚠️ MCP tools may not include Edge Function deployment

---

## Recommended Next Steps

1. **Restart Cursor** - This may activate the MCP server
2. **After restart**, test if I have Supabase MCP tools
3. **If no MCP tools appear** - Use Dashboard method (easiest) or CLI method
4. Follow the rest of the Stripe setup from STRIPE_SETUP_GUIDE.md

---

## Quick Dashboard Deployment Commands

Here's what you need to copy from your local files:

### For create-checkout-session function:
```
File: supabase/functions/create-checkout-session/index.ts
Copy entire file contents to Dashboard
```

### For stripe-webhook function:
```
File: supabase/functions/stripe-webhook/index.ts
Copy entire file contents to Dashboard
```

Both files are ready to go - just copy and paste into the Dashboard editor.

---

## Advantages of Each Method

### Dashboard:
✅ No CLI installation needed
✅ Visual interface
✅ Easy secret management
❌ Manual copy-paste for updates

### CLI:
✅ Command-line deployment
✅ Easy updates (just redeploy)
✅ Version control friendly
❌ Requires CLI installation

### MCP:
✅ Integrated with Cursor
✅ Direct project access
❌ May not support Edge Function deployment
❌ Limited documentation

---

Choose the method that works best for your workflow. All three can achieve the same result.

