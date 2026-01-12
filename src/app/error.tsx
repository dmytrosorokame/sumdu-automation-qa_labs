'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log only error digest (safe identifier) to avoid leaking sensitive information
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error occurred:', error.digest || 'Unknown error')
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card text-center">
        <h2 className="text-xl font-bold mb-4">Something went wrong!</h2>
        <button onClick={() => reset()} className="btn-primary">
          Try again
        </button>
      </div>
    </div>
  )
}

