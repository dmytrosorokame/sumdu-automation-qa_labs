'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Post {
  id: string
  title: string
  description: string
  createdAt: string
  comments: { id: string }[]
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard&error=SessionRequired')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/posts')
        .then((res) => res.json())
        .then((data) => {
          const userPosts = data.filter(
            (post: any) => post.author.username === session.user.username
          )
          setPosts(userPosts)
          setLoading(false)
        })
    }
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <Link href="/posts/new" className="btn-primary">
            Add New Post
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-[var(--text-secondary)] text-sm">Total Posts</h3>
            <p className="text-3xl font-bold mt-2">{posts.length}</p>
          </div>
          <div className="card">
            <h3 className="text-[var(--text-secondary)] text-sm">Total Comments</h3>
            <p className="text-3xl font-bold mt-2">
              {posts.reduce((acc, post) => acc + post.comments.length, 0)}
            </p>
          </div>
          <div className="card">
            <h3 className="text-[var(--text-secondary)] text-sm">Member Since</h3>
            <p className="text-lg font-medium mt-2">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">My Posts</h2>
        
        {posts.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-[var(--text-secondary)]">You haven&apos;t created any posts yet.</p>
            <Link href="/posts/new" className="link mt-2 inline-block">
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="card hover:border-[var(--accent)] transition-colors">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-[var(--text-secondary)] text-sm mt-1">{post.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-[var(--text-secondary)]">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>{post.comments.length} comments</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

