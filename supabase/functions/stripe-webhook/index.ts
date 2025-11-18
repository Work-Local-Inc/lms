// Import Stripe library and Supabase client
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.9.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing signature or webhook secret' }),
      { status: 400 }
    )
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Get the raw body for signature verification
    const body = await req.text()
    
    // Verify the webhook signature (using async method for Deno)
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    )

    console.log('Webhook event type:', event.type)

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Extract metadata
      const ecourseId = session.metadata?.ecourse_id
      const userId = session.metadata?.user_id
      const amountPaid = session.metadata?.amount_paid
      const stripePaymentId = session.payment_intent as string

      console.log('Payment completed:', { ecourseId, userId, amountPaid, stripePaymentId })

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Insert the purchase record into the database
      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          user_id: userId,
          ecourse_id: ecourseId,
          stripe_payment_id: stripePaymentId,
          amount_paid: amountPaid,
          purchased_at: new Date().toISOString(),
        }])

      if (error) {
        console.error('Error inserting purchase:', error)
        throw error
      }

      console.log('Purchase recorded successfully:', data)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200 }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorName: error.name,
        errorType: error.type || 'unknown'
      }),
      { status: 400 }
    )
  }
})

