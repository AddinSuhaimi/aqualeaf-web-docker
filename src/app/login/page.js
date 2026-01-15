'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState(null)
  const [resendLoading, setResendLoading] = useState(false);
  const [showResendPopup, setShowResendPopup] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter()

  useEffect(() => {
    // Clear any existing session immediately on mount
    fetch('/api/logout', { method: 'POST' })

    // Prepare history so that back/forward triggers popstate
    window.history.replaceState(null, '', window.location.href)
    window.history.pushState(null, '', window.location.href)

    function handlePopState() {
      // On back or forward, reload to re-run logout and redirect logic
      window.location.reload()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setUnverifiedEmail(null)
    setLoginLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: form.identifier,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        // replace so login isn't retained in history
        router.replace('/dashboard')
      } else {
        setError(data.message || 'Login failed')
        if (data.notVerified) {
          setUnverifiedEmail(data.email)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoginLoading(false);
    } 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-charcoal text-center mb-1">Login to Farm Account</h1>
        <p className="text-charcoal text-center mb-6">AquaLeaf</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-charcoal">
              Farm Name / Manager Email
            </label>
            <input
              id="identifier"
              type="text"
              value={form.identifier}
              onChange={e => setForm({ ...form, identifier: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-charcoal">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Checkbox to toggle password visibility */}
          <div className="flex items-center">
            <input
              id="showPassword"
              type="checkbox"
              checked={showPassword}
              onChange={e => setShowPassword(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showPassword" className="ml-2 block text-gray-700">
              Show Password
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {unverifiedEmail && (
            <button
              type="button"
              onClick={async () => {
                setResendLoading(true);
                try {
                  const res = await fetch('/api/resend-verification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: unverifiedEmail })
                  });

                  const data = await res.json();
                  setResendSuccess(res.ok);
                  setShowResendPopup(true);
                } catch (err) {
                  setResendSuccess(false);
                  setShowResendPopup(true);
                } finally {
                  setResendLoading(false);
                }
              }}
              className="mt-2 mb-2 text-sm text-ocean underline cursor-pointer"
            >
              Resend Verification Email
            </button>
          )}

          <button
            type="submit"
            className="cursor-pointer w-full mt-4 bg-ocean hover:bg-ocean text-white font-medium py-2 rounded-md transition"
          >
            Login
          </button>
        </form>
        
        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
          Forgot Password?
          </Link>
        </div>

        {/* Home Button */}
        <Link
          href="/"
          className="w-full mt-4 border border-gray-300 hover:bg-gray-100 text-charcoal font-medium py-2 rounded-md block text-center"
        >
          Home
        </Link>
      </div>

      {/* Loading Modal for Login */}
      {loginLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
        >
          <div className="flex flex-col items-center bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Logging in...</p>
          </div>
        </div>
      )}
      
      {/* Loading Modal for Resend */}
      {resendLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
        >
          <div className="flex flex-col items-center bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Sending verification email...</p>
          </div>
        </div>
      )}

      {/* Popup After Resend */}
      {showResendPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.25)]">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">

            {resendSuccess ? (
              <>
                <h2 className="text-xl font-semibold text-green-600 mb-4">
                  Verification Email Sent
                </h2>
                <p className="text-charcoal mb-6">
                  A new verification email has been sent to <b>{unverifiedEmail}</b>.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  Sending Failed
                </h2>
                <p className="text-charcoal mb-6">
                  We could not send the verification email. Please try again later.
                </p>
              </>
            )}

            <button
              onClick={() => setShowResendPopup(false)}
              className="px-4 py-2 bg-gray-200 text-charcoal rounded-md hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
