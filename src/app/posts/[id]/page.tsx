'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Comment {
  id: string
  name: string
  message: string
  createdAt: string
  author: { username: string }
}

interface Post {
  id: string
  title: string
  description: string
  body: string
  createdAt: string
  author: { username: string }
  comments: Comment[]
}

export default function PostPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({ name: '', message: '' })
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/posts/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push('/')
        } else {
          setPost(data)
        }
        setLoading(false)
      })
  }, [params.id, router])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/login?callbackUrl=/posts/' + params.id + '&error=SessionRequired')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      })

      if (res.ok) {
        setSuccess('Comment added to the Post successfully!')
        setCommentForm({ name: '', message: '' })
        
        const updatedPost = await fetch(`/api/posts/${params.id}`).then((r) => r.json())
        setPost(updatedPost)
        
        setTimeout(() => {
          setSuccess('')
          router.push('/')
        }, 1500)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="card mb-8">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-[var(--accent)] mt-2">{post.description}</p>
          <div className="flex gap-4 text-sm text-[var(--text-secondary)] mt-4">
            <span>By {post.author.username}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <hr className="border-[var(--border)] my-6" />
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {post.body}
          </div>
        </article>

        <section className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Add Comment</h2>
          
          {success && <div className="alert-success mb-4">{success}</div>}

          {session ? (
            <form onSubmit={handleComment} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={commentForm.name}
                  onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Message</label>
                <textarea
                  name="message"
                  value={commentForm.message}
                  onChange={(e) => setCommentForm({ ...commentForm, message: e.target.value })}
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Write your comment..."
                  required
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          ) : (
            <p className="text-[var(--text-secondary)]">
              Please <a href="/login" className="link">log in</a> to leave a comment.
            </p>
          )}
        </section>

        <section className="card">
          <h2 className="text-xl font-bold mb-4">Comments ({post.comments.length})</h2>
          
          {post.comments.length === 0 ? (
            <p className="text-[var(--text-secondary)]">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="bg-[var(--bg-secondary)] rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-[var(--accent)]">{comment.name}</span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-[var(--text-secondary)]">{comment.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

