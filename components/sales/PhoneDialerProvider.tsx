'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import type { Call, Lead, CallOutcome } from '@/types/sales'

// Types for Twilio Device (loaded dynamically)
interface TwilioDevice {
  register: () => Promise<void>
  unregister: () => void
  connect: (params: { params: Record<string, string> }) => Promise<TwilioCall>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  state: string
}

interface TwilioCall {
  disconnect: () => void
  mute: (muted: boolean) => void
  isMuted: () => boolean
  on: (event: string, handler: (...args: unknown[]) => void) => void
  status: () => string
  parameters: { CallSid?: string }
}

interface PhoneDialerContextType {
  // Connection state
  isReady: boolean
  isConnecting: boolean
  error: string | null

  // Call state
  activeCall: {
    id: string | null
    twilioCall: TwilioCall | null
    lead: Lead | null
    status: string
    duration: number
    isMuted: boolean
  } | null

  // Actions
  connect: () => Promise<void>
  disconnect: () => void
  makeCall: (lead: Lead, phoneNumber: string) => Promise<void>
  hangUp: () => void
  toggleMute: () => void
  saveOutcome: (outcome: CallOutcome, notes?: string, followUpDate?: string) => Promise<void>
}

const PhoneDialerContext = createContext<PhoneDialerContextType | null>(null)

export function usePhoneDialer() {
  const context = useContext(PhoneDialerContext)
  if (!context) {
    throw new Error('usePhoneDialer must be used within PhoneDialerProvider')
  }
  return context
}

interface PhoneDialerProviderProps {
  children: ReactNode
}

export function PhoneDialerProvider({ children }: PhoneDialerProviderProps) {
  const [device, setDevice] = useState<TwilioDevice | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCall, setActiveCall] = useState<PhoneDialerContextType['activeCall']>(null)
  
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const callStartTimeRef = useRef<Date | null>(null)
  const deviceRef = useRef<TwilioDevice | null>(null)

  // Initialize Twilio Device
  const connect = useCallback(async () => {
    if (device && isReady) return

    setIsConnecting(true)
    setError(null)

    try {
      // Fetch token from our API
      console.log('Fetching Twilio token...')
      const tokenRes = await fetch('/api/sales/calls/token')
      if (!tokenRes.ok) {
        const data = await tokenRes.json()
        throw new Error(data.error || 'Failed to get token')
      }
      const tokenData = await tokenRes.json()
      console.log('Token received, identity:', tokenData.identity)
      
      if (!tokenData.token) {
        throw new Error('No token in response')
      }

      // Dynamically load Twilio SDK
      console.log('Loading Twilio SDK...')
      const { Device } = await import('@twilio/voice-sdk')
      
      // Create device with default options (Twilio SDK types are strict)
      console.log('Creating Twilio Device...')
      const newDevice = new Device(tokenData.token)

      // Register event handlers
      newDevice.on('registered', () => {
        console.log('Twilio Device registered successfully')
        setIsReady(true)
        setIsConnecting(false)
      })

      newDevice.on('error', (err: Error) => {
        console.error('Twilio Device error:', err)
        setError(`Device error: ${err.message}`)
        setIsConnecting(false)
      })

      newDevice.on('unregistered', () => {
        console.log('Twilio Device unregistered')
        setIsReady(false)
      })

      // Register the device
      console.log('Registering Twilio Device...')
      await newDevice.register()
      console.log('Device registration complete')
      deviceRef.current = newDevice as unknown as TwilioDevice
      setDevice(newDevice as unknown as TwilioDevice)
    } catch (err) {
      console.error('Connection error:', err)
      const message = err instanceof Error ? err.message : 'Failed to connect'
      setError(message)
      setIsConnecting(false)
    }
  }, [device, isReady])

  // Disconnect/cleanup
  const disconnect = useCallback(() => {
    if (deviceRef.current) {
      deviceRef.current.unregister()
      deviceRef.current = null
      setDevice(null)
      setIsReady(false)
    }
  }, [])

  // Make a call
  const makeCall = useCallback(async (lead: Lead, phoneNumber: string) => {
    // Use ref for immediate access (state might be stale in closure)
    let currentDevice = deviceRef.current
    
    if (!currentDevice || !isReady) {
      // Try to connect first
      await connect()
      // After connect, check ref again
      currentDevice = deviceRef.current
    }

    if (!currentDevice) {
      throw new Error('Phone not connected. Please click "Connect Phone" first.')
    }

    // Create call record in our database first
    const createRes = await fetch('/api/sales/calls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: lead.id,
        to_number: phoneNumber,
      }),
    })

    if (!createRes.ok) {
      const data = await createRes.json()
      throw new Error(data.error || 'Failed to create call')
    }

    const callRecord = await createRes.json()

    // Initiate call via Twilio Device (browser to phone)
    try {
      const twilioCall = await currentDevice.connect({
        params: {
          To: phoneNumber,
          callId: callRecord.id,
        },
      })

      // Set up call event handlers
      twilioCall.on('accept', () => {
        console.log('Call accepted')
        callStartTimeRef.current = new Date()
        // Start duration timer
        durationIntervalRef.current = setInterval(() => {
          if (callStartTimeRef.current) {
            const duration = Math.floor((Date.now() - callStartTimeRef.current.getTime()) / 1000)
            setActiveCall(prev => prev ? { ...prev, duration } : null)
          }
        }, 1000)
      })

      twilioCall.on('disconnect', () => {
        console.log('Call disconnected')
        // Clear duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
          durationIntervalRef.current = null
        }
        // Don't clear activeCall immediately - let user save outcome
        setActiveCall(prev => prev ? { ...prev, status: 'completed', twilioCall: null } : null)
      })

      twilioCall.on('cancel', () => {
        console.log('Call canceled')
        setActiveCall(null)
      })

      twilioCall.on('reject', () => {
        console.log('Call rejected')
        setActiveCall(prev => prev ? { ...prev, status: 'rejected' } : null)
      })

      setActiveCall({
        id: callRecord.id,
        twilioCall: twilioCall as unknown as TwilioCall,
        lead,
        status: 'connecting',
        duration: 0,
        isMuted: false,
      })
    } catch (err) {
      console.error('Call error:', err)
      throw err
    }
  }, [isReady, connect])

  // Hang up
  const hangUp = useCallback(() => {
    if (activeCall?.twilioCall) {
      activeCall.twilioCall.disconnect()
    }
    // Also notify our API to end the call
    if (activeCall?.id) {
      fetch(`/api/sales/calls/${activeCall.id}`, { method: 'DELETE' })
    }
  }, [activeCall])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (activeCall?.twilioCall) {
      const newMuted = !activeCall.isMuted
      activeCall.twilioCall.mute(newMuted)
      setActiveCall(prev => prev ? { ...prev, isMuted: newMuted } : null)
    }
  }, [activeCall])

  // Save call outcome
  const saveOutcome = useCallback(async (outcome: CallOutcome, notes?: string, followUpDate?: string) => {
    if (!activeCall?.id) return

    await fetch(`/api/sales/calls/${activeCall.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        outcome,
        outcome_notes: notes,
        follow_up_date: followUpDate,
      }),
    })

    // Clear active call after saving
    setActiveCall(null)
  }, [activeCall])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
      disconnect()
    }
  }, [disconnect])

  return (
    <PhoneDialerContext.Provider value={{
      isReady,
      isConnecting,
      error,
      activeCall,
      connect,
      disconnect,
      makeCall,
      hangUp,
      toggleMute,
      saveOutcome,
    }}>
      {children}
    </PhoneDialerContext.Provider>
  )
}
