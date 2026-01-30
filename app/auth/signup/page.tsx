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
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
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
        <h1 className='text-2xl font-bold'>Create your account</h1>
        <p className='text-muted-foreground mt-2'>Start your free trial today</p>
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
