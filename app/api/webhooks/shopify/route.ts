import { NextRequest, NextResponse } from 'next/server'
import { verifyShopifyWebhook } from '@/lib/shopify/verify'
import { getProductMapping } from '@/lib/config/products'
import { sendWelcomeEmail } from '@/lib/email/welcome'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * Shopify Webhook Handler
 * Triggered when a new order is created
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for HMAC verification
    const rawBody = await request.text()
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256')

    if (!hmacHeader) {
      return NextResponse.json({ error: 'Missing HMAC header' }, { status: 401 })
    }

    // Verify webhook authenticity
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('SHOPIFY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const isValid = verifyShopifyWebhook(rawBody, hmacHeader, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse order data
    const order = JSON.parse(rawBody)
    console.log('Processing Shopify order:', order.id)

    // Extract customer info
    const customerEmail = order.email || order.customer?.email
    const customerName = order.customer?.first_name
      ? `${order.customer.first_name} ${order.customer.last_name || ''}`.trim()
      : 'Потребител'

    if (!customerEmail) {
      console.error('No customer email in order')
      return NextResponse.json({ error: 'No customer email' }, { status: 400 })
    }

    // Extract product info
    const lineItems = order.line_items || []
    if (lineItems.length === 0) {
      console.error('No line items in order')
      return NextResponse.json({ error: 'No products in order' }, { status: 400 })
    }

    // Get the first line item (assuming single product purchases)
    const firstItem = lineItems[0]
    const productName = firstItem.title || firstItem.name
    const productMapping = getProductMapping(productName)

    if (!productMapping) {
      console.error('Unknown product:', productName)
      return NextResponse.json(
        { error: 'Product not found in mappings' },
        { status: 400 }
      )
    }

    // Initialize Supabase Admin Client (can create users)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users.find((u) => u.email === customerEmail)

    let userId: string

    if (userExists) {
      console.log('User already exists:', customerEmail)
      userId = userExists.id
    } else {
      // Generate secure password
      const generatedPassword = crypto.randomBytes(12).toString('base64')

      // Create new user account
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: customerEmail,
          password: generatedPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: customerName,
          },
        })

      if (createError || !newUser.user) {
        console.error('Failed to create user:', createError)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
      }

      userId = newUser.user.id
      console.log('Created new user:', customerEmail)

      // Update profile with name
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        full_name: customerName,
        updated_at: new Date().toISOString(),
      })

      // Send welcome email with credentials
      const emailSent = await sendWelcomeEmail({
        email: customerEmail,
        password: generatedPassword,
        productName: productMapping.nameBg,
        apps: productMapping.apps,
      })

      if (!emailSent) {
        console.error('Failed to send welcome email')
        // Don't fail the webhook, user is still created
      }
    }

    // Insert purchase record
    const { error: purchaseError } = await supabaseAdmin.from('purchases').insert({
      user_id: userId,
      shopify_order_id: order.id.toString(),
      product_type: 'bundle',
      product_name: productName,
      apps_included: productMapping.apps,
      amount: parseFloat(order.total_price || order.current_total_price || '0'),
      currency: order.currency || 'BGN',
      status: 'completed',
      purchased_at: order.created_at || new Date().toISOString(),
    })

    if (purchaseError) {
      console.error('Failed to insert purchase:', purchaseError)
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
    }

    console.log('Successfully processed order:', order.id)

    return NextResponse.json({
      success: true,
      userId,
      apps: productMapping.apps,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
