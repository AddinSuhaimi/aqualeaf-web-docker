'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [form, setForm] = useState({ farmName: '', location: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(null)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName: form.farmName,
          location: form.location,
          email: form.email,
          password: form.password,
        }),
      })
      const data = await res.json()
      setLoading(false)

      if (res.ok) {
        setShowPopup(true)
        setEmailSent(data.emailSent)
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      {/* Registration Form */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-charcoal text-center mb-1">Register Farm Account</h1>
        <p className="text-charcoal text-center mb-6">AquaLeaf</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="farmName" className="block text-charcoal">Farm Name</label>
            <input
              id="farmName"
              type="text"
              value={form.farmName}
              onChange={e => setForm({ ...form, farmName: e.target.value })}
              required
              disabled={loading}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-charcoal">Location</label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              required
              disabled={loading}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-charcoal">Manager Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-charcoal">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300 disabled:opacity-50"
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
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full mt-4 bg-leaf hover:bg-leaf text-white font-medium py-2 rounded-md transition disabled:opacity-50`}
          >
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>

        {/* Home Button */}
        <Link
          href="/"
          className="w-full mt-4 border border-gray-300 hover:bg-gray-100 text-charcoal font-medium py-2 rounded-md block text-center"
        >
          Home
        </Link>
      </div>

      {/* Loading Modal */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
        >
          <div className="flex flex-col items-center bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-700">Registering your farm...</p>
          </div>
        </div>
      )}

      {/* Popup Overlay */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.25)]">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center">

            {emailSent ? (
              <>
                <h2 className="text-xl font-semibold text-charcoal mb-4">
                  Registration Successful
                </h2>
                <p className="text-charcoal mb-6">
                  Please check your email for the verification link before logging in.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  Email Sending Failed
                </h2>
                <p className="text-charcoal mb-6">
                  Your account was created, but the verification email could not be sent.
                  You may try again later or use &quot;Resend Verification Email&quot; when available.
                </p>
              </>
            )}

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-gray-200 text-charcoal rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>

              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Go to Login
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
