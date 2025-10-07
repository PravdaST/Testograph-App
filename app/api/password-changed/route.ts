import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPasswordChangedEmail } from '@/lib/email/password-changed'

/**
 * API endpoint to send password changed notification email
 * Called after user successfully changes their password
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current timestamp in Bulgarian format
    const now = new Date()
    const timestamp = now.toLocaleString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Sofia',
    })

    // Send email notification
    const emailSent = await sendPasswordChangedEmail({
      email: user.email,
      timestamp,
    })

    if (!emailSent) {
      console.error('Failed to send password changed email')
      // Don't fail the request - password was already changed
      return NextResponse.json(
        {
          success: true,
          message: 'Password changed but email notification failed',
        },
        { status: 200 }
      )
    }

    console.log(`✅ Password changed email sent to ${user.email}`)

    return NextResponse.json(
      {
        success: true,
        message: 'Password changed and email sent successfully',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error in password-changed endpoint:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
