'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'expired' | 'accepted'>('loading')
  const [invite, setInvite] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }

    // Verify invite token
    fetch(`/api/auth/verify-invite?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          if (data.error.includes('expired')) {
            setStatus('expired')
          } else {
            setStatus('invalid')
          }
          setError(data.error)
        } else {
          setInvite(data.invite)
          setStatus('valid')
        }
      })
      .catch(() => {
        setStatus('invalid')
        setError('Failed to verify invite')
      })
  }, [token])

  const handleAccept = async () => {
    const supabase = createClient()
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to signup with invite token
      router.push(`/auth/signup?invite=${token}`)
      return
    }

    // Accept the invite
    const res = await fetch('/api/auth/accept-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })

    const data = await res.json()
    
    if (data.error) {
      setError(data.error)
    } else {
      setStatus('accepted')
      setTimeout(() => {
        router.push('/dashboard/sales')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying your invitation...</p>
          </>
        )}

        {status === 'valid' && invite && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h1>
            <p className="text-gray-600 mb-6">
              You've been invited to join the <strong>GeoSpark Sales Team</strong> as a {invite.role.replace('_', ' ')}.
            </p>
            
            <div className="bg-teal-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-teal-700">
                <strong>What you'll get:</strong>
              </p>
              <ul className="text-sm text-teal-600 mt-2 space-y-1">
                <li>✓ Access to the Power Dialer</li>
                <li>✓ AI Sales Coach assistance</li>
                <li>✓ Commission tracking dashboard</li>
                <li>✓ Sales training materials</li>
              </ul>
            </div>

            <button
              onClick={handleAccept}
              className="w-full py-3 px-4 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              Accept Invitation
            </button>
            
            {error && (
              <p className="text-red-600 text-sm mt-4">{error}</p>
            )}
          </>
        )}

        {status === 'invalid' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-6">
              This invitation link is invalid or has already been used.
            </p>
            <a
              href="/"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Go to Homepage
            </a>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="text-5xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h1>
            <p className="text-gray-600 mb-6">
              This invitation has expired. Please contact the person who invited you to send a new one.
            </p>
            <a
              href="/"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Go to Homepage
            </a>
          </>
        )}

        {status === 'accepted' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
            <p className="text-gray-600 mb-6">
              Redirecting you to the Sales Dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" />
          </>
        )}
      </div>
    </div>
  )
}
