'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='bg-card rounded-lg shadow-sm border p-8'>
        <div className='text-center'>
          <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold mb-2'>Check your email</h1>
          <p className='text-muted-foreground mb-6'>
            We sent a password reset link to {email}
          </p>
          <Link href='/auth/login' className='text-primary hover:underline'>
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-card rounded-lg shadow-sm border p-8'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold'>Forgot password?</h1>
        <p className='text-muted-foreground mt-2'>Enter your email to reset your password</p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && (
          <div className='bg-destructive/10 text-destructive text-sm p-3 rounded-md'>
            {error}
          </div>
        )}
        <div>
          <label htmlFor='email' className='block text-sm font-medium mb-2'>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='you@example.com'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50'
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className='text-center text-sm text-muted-foreground mt-6'>
        Remember your password?{' '}
        <Link href='/auth/login' className='text-primary hover:underline'>
          Sign in
        </Link>
      </p>
    </div>
  )
}
