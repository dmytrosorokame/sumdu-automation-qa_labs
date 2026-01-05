'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
      } else {
        setSuccess(data.message)
        setResetToken(data.token)
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
        <p className="text-[var(--text-secondary)] text-center mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {error && <div className="alert-error mb-4">{error}</div>}
        {success && (
          <div className="alert-success mb-4">
            {success}
            {resetToken && (
              <div className="mt-2">
                <Link href={`/reset-password?token=${resetToken}`} className="link font-medium">
                  Click here to reset your password
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending...' : 'Submit'}
          </button>
        </form>

        <p className="text-center text-[var(--text-secondary)] mt-6">
          Remember your password?{' '}
          <Link href="/login" className="link">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

