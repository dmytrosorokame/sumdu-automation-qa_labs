'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-[var(--accent)]">
            SumDU Blog
          </Link>

          <div className="flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/"
                  className={`${isActive('/') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--accent)] transition-colors`}
                >
                  Home
                </Link>
                <Link
                  href="/dashboard"
                  className={`${isActive('/dashboard') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--accent)] transition-colors`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`${isActive('/profile') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--accent)] transition-colors`}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${isActive('/login') ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'} hover:text-[var(--accent)] transition-colors`}
                >
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

