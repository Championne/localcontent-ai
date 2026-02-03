'use client'

import { useState } from 'react'
import { usePhoneDialer } from './PhoneDialerProvider'
import type { Lead } from '@/types/sales'

interface CallButtonProps {
  lead: Lead
  phoneNumber?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'icon'
  className?: string
}

export function CallButton({ 
  lead, 
  phoneNumber, 
  size = 'md',
  variant = 'primary',
  className = ''
}: CallButtonProps) {
  const { isReady, isConnecting, activeCall, connect, makeCall } = usePhoneDialer()
  const [isInitiating, setIsInitiating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const phone = phoneNumber || lead.contact_phone
  const isInCall = activeCall !== null
  const isCallingThisLead = activeCall?.lead?.id === lead.id

  const handleClick = async () => {
    if (!phone) {
      setError('No phone number')
      return
    }

    if (isInCall && !isCallingThisLead) {
      setError('Already in a call')
      return
    }

    setError(null)
    setIsInitiating(true)

    try {
      // Connect if not ready
      if (!isReady) {
        await connect()
      }
      await makeCall(lead, phone)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call failed')
    } finally {
      setIsInitiating(false)
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    icon: 'bg-green-50 hover:bg-green-100 text-green-600 p-2',
  }

  if (!phone) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium opacity-50 cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      >
        <PhoneIcon className="w-4 h-4" />
        {variant !== 'icon' && 'No phone'}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isInitiating || isConnecting || (isInCall && !isCallingThisLead)}
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        title={phone}
      >
        {isInitiating || isConnecting ? (
          <LoadingSpinner className="w-4 h-4" />
        ) : (
          <PhoneIcon className="w-4 h-4" />
        )}
        {variant !== 'icon' && (isInitiating ? 'Calling...' : 'Call')}
      </button>
      {error && (
        <div className="absolute top-full mt-1 left-0 text-xs text-red-600 whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}
