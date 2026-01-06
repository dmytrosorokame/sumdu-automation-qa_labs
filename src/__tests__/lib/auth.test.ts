/**
 * Unit tests for NextAuth configuration
 * Tests authentication logic, JWT callbacks, and session handling
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock Prisma client
const mockFindUnique = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
  compare: vi.fn(),
  hash: vi.fn(),
}))

describe('Auth Configuration', () => {
  let authOptions: any
  
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    // Import fresh to get clean state
    const authModule = await import('@/lib/auth')
    authOptions = authModule.authOptions
  })

  describe('authOptions structure', () => {
    test('should have correct providers configuration', () => {
      expect(authOptions.providers).toBeDefined()
      expect(authOptions.providers.length).toBe(1)
      expect(authOptions.providers[0].name).toBe('Credentials')
    })

    test('should have jwt session strategy', () => {
      expect(authOptions.session).toBeDefined()
      expect(authOptions.session.strategy).toBe('jwt')
    })

    test('should have custom sign-in page', () => {
      expect(authOptions.pages).toBeDefined()
      expect(authOptions.pages.signIn).toBe('/login')
    })

    test('should have callbacks defined', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(authOptions.callbacks.jwt).toBeDefined()
      expect(authOptions.callbacks.session).toBeDefined()
    })
  })

  describe('authorize function', () => {
    let authorize: any

    beforeEach(() => {
      // Get the authorize function from credentials provider
      authorize = authOptions.providers[0].options.authorize
    })

    test('should throw error when credentials are missing', async () => {
      await expect(authorize(null)).rejects.toThrow('Invalid username/password, Try again!')
      await expect(authorize({})).rejects.toThrow('Invalid username/password, Try again!')
      await expect(authorize({ username: 'test' })).rejects.toThrow('Invalid username/password, Try again!')
      await expect(authorize({ password: 'test' })).rejects.toThrow('Invalid username/password, Try again!')
    })

    test('should throw error when user is not found', async () => {
      mockFindUnique.mockResolvedValueOnce(null)

      await expect(
        authorize({ username: 'nonexistent', password: 'password123' })
      ).rejects.toThrow('Invalid username/password, Try again!')

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { username: 'nonexistent' },
      })
    })

    test('should throw error when password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
      }

      mockFindUnique.mockResolvedValueOnce(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never)

      await expect(
        authorize({ username: 'testuser', password: 'wrongpassword' })
      ).rejects.toThrow('Invalid username/password, Try again!')

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password')
    })

    test('should return user object when credentials are valid', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashed_password',
      }

      mockFindUnique.mockResolvedValueOnce(mockUser)
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(true as never)

      const result = await authorize({ username: 'testuser', password: 'correctpassword' })

      expect(result).toEqual({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
      })
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashed_password')
    })
  })

  describe('jwt callback', () => {
    test('should add user data to token when user is present', async () => {
      const jwtCallback = authOptions.callbacks.jwt
      
      const token = { sub: 'token-id' }
      const user = { id: 'user-123', username: 'testuser' }

      const result = await jwtCallback({ token, user })

      expect(result.userId).toBe('user-123')
      expect(result.username).toBe('testuser')
    })

    test('should return unchanged token when user is not present', async () => {
      const jwtCallback = authOptions.callbacks.jwt
      
      const token = { sub: 'token-id', userId: 'existing-user' }

      const result = await jwtCallback({ token, user: undefined })

      expect(result).toEqual(token)
    })
  })

  describe('session callback', () => {
    test('should add user data to session from token', async () => {
      const sessionCallback = authOptions.callbacks.session
      
      const session = { user: { name: 'Test User' }, expires: '2024-12-31' }
      const token = { userId: 'user-123', username: 'testuser' }

      const result = await sessionCallback({ session, token })

      expect(result.user.id).toBe('user-123')
      expect(result.user.username).toBe('testuser')
    })

    test('should return session unchanged when user is not present', async () => {
      const sessionCallback = authOptions.callbacks.session
      
      const session = { expires: '2024-12-31' }
      const token = { userId: 'user-123', username: 'testuser' }

      const result = await sessionCallback({ session, token })

      expect(result).toEqual(session)
    })
  })
})
