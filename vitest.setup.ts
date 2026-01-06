// Setup environment variables for tests
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-vitest'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'file:./test.db'

