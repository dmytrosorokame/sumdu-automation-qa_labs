/**
 * Unit tests for Reset Password API Route (Controller)
 * Tests password reset validation and update logic with mocked database
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'

// Mock dependencies
const mockFindFirst = vi.fn()
const mockUpdate = vi.fn()
const mockHash = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: (...args: any[]) => mockFindFirst(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  default: {
    hash: (...args: any[]) => mockHash(...args),
  },
  hash: (...args: any[]) => mockHash(...args),
}))

// Import handlers after mocks are set up
import { POST, GET } from '@/app/api/auth/reset-password/route'

describe('Reset Password API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to create mock request with body
  const createMockRequest = (body: any): Request => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Request
  }

  // Helper function to create mock request with URL params
  const createMockRequestWithUrl = (url: string): Request => {
    return {
      url,
    } as unknown as Request
  }

  describe('POST /api/auth/reset-password', () => {
    test('should return error when token is invalid', async () => {
      mockFindFirst.mockResolvedValueOnce(null)

      const request = createMockRequest({
        token: 'invalid-token',
        password: 'newpassword123',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password reset token is invalid or has expired.')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    test('should return error when token is expired', async () => {
      // Token exists but expired - findFirst returns null due to gt: new Date()
      mockFindFirst.mockResolvedValueOnce(null)

      const request = createMockRequest({
        token: 'expired-token',
        password: 'newpassword123',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Password reset token is invalid or has expired.')
    })

    test('should reset password when token is valid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      }

      mockFindFirst.mockResolvedValueOnce(mockUser)
      mockHash.mockResolvedValueOnce('new_hashed_password')
      mockUpdate.mockResolvedValueOnce({})

      const request = createMockRequest({
        token: 'valid-token',
        password: 'newpassword123',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Password has been reset successfully.')
      expect(mockHash).toHaveBeenCalledWith('newpassword123', 10)
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          password: 'new_hashed_password',
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
    })

    test('should clear reset token after successful password reset', async () => {
      const mockUser = {
        id: 'user-123',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000),
      }

      mockFindFirst.mockResolvedValueOnce(mockUser)
      mockHash.mockResolvedValueOnce('hashed')
      mockUpdate.mockResolvedValueOnce({})

      const request = createMockRequest({
        token: 'valid-token',
        password: 'password',
      })
      await POST(request)

      const updateData = mockUpdate.mock.calls[0][0].data
      expect(updateData.resetToken).toBeNull()
      expect(updateData.resetTokenExpiry).toBeNull()
    })

    test('should return 500 error when database operation fails', async () => {
      mockFindFirst.mockRejectedValueOnce(new Error('Database error'))

      const request = createMockRequest({
        token: 'token',
        password: 'password',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Something went wrong')
    })
  })

  describe('GET /api/auth/reset-password', () => {
    test('should return valid: false when token is missing', async () => {
      const request = createMockRequestWithUrl('http://localhost:3000/api/auth/reset-password')
      const response = await GET(request)
      const data = await response.json()

      expect(data.valid).toBe(false)
    })

    test('should return valid: false when token is invalid', async () => {
      mockFindFirst.mockResolvedValueOnce(null)

      const request = createMockRequestWithUrl(
        'http://localhost:3000/api/auth/reset-password?token=invalid-token'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.valid).toBe(false)
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          resetToken: 'invalid-token',
          resetTokenExpiry: { gt: expect.any(Date) },
        },
      })
    })

    test('should return valid: true when token is valid', async () => {
      const mockUser = {
        id: 'user-123',
        resetToken: 'valid-token',
        resetTokenExpiry: new Date(Date.now() + 3600000),
      }

      mockFindFirst.mockResolvedValueOnce(mockUser)

      const request = createMockRequestWithUrl(
        'http://localhost:3000/api/auth/reset-password?token=valid-token'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.valid).toBe(true)
    })
  })
})
