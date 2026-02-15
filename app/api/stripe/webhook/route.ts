import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, getPlanByPriceId } from '@/lib/stripe/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy-initialize admin client for webhook (bypasses RLS)
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan

        if (userId && plan) {
          // Get the subscription to check for trial
          const subscription = session.subscription 
            ? await stripe.subscriptions.retrieve(session.subscription as string)
            : null

          await getSupabaseAdmin().from('subscriptions').update({
            stripe_subscription_id: session.subscription as string,
            plan: plan,
            status: subscription?.status === 'trialing' ? 'trialing' : 'active',
            current_period_start: new Date().toISOString(),
            trial_end: subscription?.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
          }).eq('user_id', userId)

          // Mark onboarding payment complete
          await getSupabaseAdmin().from('profiles').update({
            onboarding_completed: true,
          }).eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        
        // Get price ID to determine plan
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? getPlanByPriceId(priceId) : null

        const { data: sub } = await getSupabaseAdmin()
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          await getSupabaseAdmin().from('subscriptions').update({
            status: subscription.status,
            plan: plan || undefined,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
          }).eq('user_id', sub.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: sub } = await getSupabaseAdmin()
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          await getSupabaseAdmin().from('subscriptions').update({
            plan: 'free',
            status: 'cancelled',
            stripe_subscription_id: null,
            trial_end: null,
          }).eq('user_id', sub.user_id)
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        // Trial ending soon - could send notification email here
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Trial ending for subscription: ${subscription.id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: sub } = await getSupabaseAdmin()
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          await getSupabaseAdmin().from('subscriptions').update({
            status: 'past_due',
          }).eq('user_id', sub.user_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
