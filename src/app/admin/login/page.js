'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', email: '', password: ''})
  const [error, setError] = useState('')
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
    const res = await fetch('/api/login-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        password: form.password,
      }),
    })
    if (res.ok) {
      // replace so login isn't retained in history
      router.replace('/admin/dashboard')
    } else {
      const data = await res.json()
      setError(data.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-charcoal text-center mb-1">Administrator Login</h1>
        <p className="text-charcoal text-center mb-6">AquaLeaf</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-charcoal">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-charcoal">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
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
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-charcoal focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          {error && <p className="text-charcoal text-sm">{error}</p>}
          <button
            type="submit"
            className="cursor-pointer w-full mt-4 bg-ocean hover:bg-ocean text-white font-medium py-2 rounded-md transition"
          >
            Login
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
    </div>
  )
}
