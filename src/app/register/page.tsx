'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      newErrors.username = 'The username is required and cannot be empty'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'The email is required and cannot be empty'
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'The email address is not valid'
    }
    if (!formData.password) {
      newErrors.confirmPassword = 'The password and its confirm are not the same'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'The confirm password is required and cannot be empty'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'The password and its confirm are not the same'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    return (
      formData.username.trim() &&
      formData.email.trim() &&
      formData.email.includes('@') &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ form: data.error })
        return
      }

      setSuccess('Congrats! Your registration has been successful.')
      
      await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      })

      setTimeout(() => router.push('/'), 1500)
    } catch (error) {
      setErrors({ form: 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        {success && <div className="alert-success mb-4">{success}</div>}
        {errors.form && <div className="alert-error mb-4">{errors.form}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input-field"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input-field"
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className="btn-primary w-full"
          >
            {loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <p className="text-center text-[var(--text-secondary)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="link">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}

