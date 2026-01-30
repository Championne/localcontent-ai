'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='bg-card rounded-lg shadow-sm border p-8'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold'>Welcome back</h1>
        <p className='text-muted-foreground mt-2'>Sign in to your account</p>
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
            className='w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary'
            placeholder='Enter your password'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50'
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className='text-center text-sm text-muted-foreground mt-6'>
        Do not have an account?{' '}
        <Link href='/auth/signup' className='text-primary hover:underline'>
          Sign up
        </Link>
      </p>
    </div>
  )
}
