import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkSalesApiAccess } from '@/lib/auth/salesApiAccess'
import { sendEmail } from '@/lib/email/resend'
import { getTemplate, renderTemplate } from '@/lib/email/templates'
import { randomUUID } from 'crypto'

/**
 * POST /api/sales/team/invite - Send an invite to join the sales team
 */
export async function POST(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    // Only admins can send invites
    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { email, name, role = 'sales_rep' } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'email and name are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Check if already a team member
    const { data: existing } = await supabase
      .from('sales_team')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'This email is already on the sales team' }, { status: 400 })
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabase
      .from('sales_invites')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'An invite is already pending for this email' }, { status: 400 })
    }

    // Generate invite token
    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Create invite record
    const { data: invite, error: inviteError } = await supabase
      .from('sales_invites')
      .insert({
        email: email.toLowerCase(),
        name,
        role,
        token,
        invited_by: access.salesMember?.id,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Failed to create invite:', inviteError)
      return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
    }

    // Send invite email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://geospark.app'}/auth/accept-invite?token=${token}`
    
    const template = getTemplate('sales-team-invite')
    if (!template) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 500 })
    }

    const { subject, html, text } = renderTemplate(template, {
      invitee_name: name,
      inviter_name: access.salesMember?.name || 'GeoSpark Admin',
      invite_link: inviteLink
    })

    const emailResult = await sendEmail({
      to: email,
      subject,
      html,
      text,
      tags: [
        { name: 'type', value: 'sales-invite' },
        { name: 'invite_id', value: invite.id }
      ]
    })

    if (!emailResult.success) {
      // Update invite status to failed
      await supabase
        .from('sales_invites')
        .update({ status: 'failed' })
        .eq('id', invite.id)

      return NextResponse.json({ 
        error: `Failed to send email: ${emailResult.error}` 
      }, { status: 500 })
    }

    // Update invite with email ID
    await supabase
      .from('sales_invites')
      .update({ email_id: emailResult.id })
      .eq('id', invite.id)

    return NextResponse.json({ 
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        status: 'pending',
        expires_at: invite.expires_at
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/sales/team/invite - List pending invites
 */
export async function GET() {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('sales_invites')
      .select('*, inviter:sales_team!sales_invites_invited_by_fkey(name)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get invites error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/sales/team/invite?id=xxx - Cancel/revoke an invite
 */
export async function DELETE(request: NextRequest) {
  try {
    const access = await checkSalesApiAccess()
    if (!access.authorized) return access.errorResponse!

    if (access.salesMember?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const inviteId = request.nextUrl.searchParams.get('id')
    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID required' }, { status: 400 })
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('sales_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
