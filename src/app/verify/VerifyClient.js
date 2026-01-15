'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('pending') // 'pending' | 'success' | 'error'

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    fetch(`/api/verify?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        {status === 'pending' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Verifying your email...</h2>
            <p className="text-charcoal mb-6">Please wait while we confirm your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-green-600">Email verified!</h2>
            <p className="text-charcoal mb-6">Your email has been successfully verified.</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Proceed to Login
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-red-600">Verification failed</h2>
            <p className="text-charcoal mb-6">The link may be invalid or expired.</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-gray-200 text-charcoal mb-6 rounded-md hover:bg-gray-300 transition"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
