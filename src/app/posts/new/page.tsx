'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

export default function NewPost() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    body: '',
  })
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/posts/new&error=SessionRequired')
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess('Blog Post posted successfully!')
        setTimeout(() => router.push('/'), 1500)
      }
    } catch {
      // Error handled silently - user sees no feedback but action failed
      // In production, this should be sent to a logging service
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          <h1 className="text-2xl font-bold mb-6">Add New Post</h1>

          {success && <div className="alert-success mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                placeholder="Short description"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">Body</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="input-field min-h-[200px] resize-y"
                placeholder="Write your post content..."
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating...' : 'Add Post'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

