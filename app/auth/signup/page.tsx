'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else if (data?.user?.identities?.length === 0) {
        // User already exists
        setError('An account with this email already exists. Please sign in instead.')
      } else if (data?.session) {
        // Auto-confirmed (email confirmation disabled in Supabase)
        router.push('/dashboard')
        router.refresh()
      } else {
        // Email confirmation required
        setEmailSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show success message after signup
  if (emailSent) {
    return (
      <div className='bg-card rounded-lg shadow-sm border p-8'>
        <div className='text-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Check your email</h1>
          <p className='text-gray-600 mb-4'>
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className='text-sm text-gray-500 mb-6'>
            Click the link in your email to activate your GeoSpark account. If you don't see it, check your spam folder.
          </p>
          <Link 
            href='/auth/login' 
            className='text-teal-600 hover:text-teal-700 font-medium'
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-card rounded-lg shadow-sm border p-8'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold'>Create your account</h1>
        <p className='text-muted-foreground mt-2'>Start your free 14-day trial</p>
      </div>
      <form onSubmit={handleSubmit} className='space-y-4'>
        {error && (
          <div className='bg-destructive/10 text-destructive text-sm p-3 rounded-md'>
            {error}
          </div>
        )}
        <div>
          <label htmlFor='name' className='block text-sm font-medium mb-2'>
            Full Name
          </label>
          <input
            id='name'
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className='w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='John Doe'
          />
        </div>
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
        <div>
          <label htmlFor='password' className='block text-sm font-medium mb-2'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className='w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Min 8 characters'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50'
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className='text-center text-sm text-muted-foreground mt-6'>
        Already have an account?{' '}
        <Link href='/auth/login' className='text-primary hover:underline'>
          Sign in
        </Link>
      </p>
    </div>
  )
}
