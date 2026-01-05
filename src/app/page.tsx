'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Post {
  id: string
  title: string
  description: string
  body: string
  createdAt: string
  author: { username: string }
  comments: { id: string }[]
}

export default function Home() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
  }, [])

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
          <h1 className="text-3xl font-bold">Latest Posts</h1>
          {session && (
            <Link href="/posts/new" className="btn-primary">
              Add New Post
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[var(--text-secondary)] text-lg">No posts yet.</p>
            {session && (
              <Link href="/posts/new" className="link mt-4 inline-block">
                Create the first post!
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="card hover:border-[var(--accent)] transition-colors group">
                <h2 className="text-xl font-semibold group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h2>
                <p className="text-[var(--text-secondary)] mt-2">{post.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-secondary)]">
                  <span>By {post.author.username}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
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

