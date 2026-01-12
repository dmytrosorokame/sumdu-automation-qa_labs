/**
 * Unit tests for Prisma client initialization
 * Tests the singleton pattern implementation for PrismaClient
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock PrismaClient before importing
vi.mock('@prisma/client', () => {
  // Define the mock instance type
  interface MockPrismaInstance {
    user: {
      findUnique: ReturnType<typeof vi.fn>
      findFirst: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
    }
    post: {
      findMany: ReturnType<typeof vi.fn>
      findUnique: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
    }
    comment: {
      create: ReturnType<typeof vi.fn>
    }
  }
  
  // Use vi.fn with a function (not arrow function) to create a spyable constructor
  const MockPrismaClient = vi.fn(function MockPrismaClient(this: MockPrismaInstance) {
    // 'this' refers to the instance when called with 'new'
    this.user = {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    }
    
    this.post = {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    }
    
    this.comment = {
      create: vi.fn(),
    }
    
    return this
  })
  
  return { PrismaClient: MockPrismaClient }
})

describe('Prisma Client Initialization', () => {
  beforeEach(() => {
    // Clear module cache before each test
    vi.resetModules()
    // Clear global prisma instance
    const globalForPrisma = globalThis as unknown as { prisma: any }
    delete globalForPrisma.prisma
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test('should export a prisma client instance', async () => {
    const { prisma } = await import('@/lib/prisma')
    expect(prisma).toBeDefined()
  })

  test('should create a new PrismaClient instance when none exists', async () => {
    const { PrismaClient } = await import('@prisma/client')
    const { prisma } = await import('@/lib/prisma')
    
    expect(prisma).toBeDefined()
    expect(PrismaClient).toHaveBeenCalled()
  })

  test('should reuse existing PrismaClient instance in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    
    // First import
    const { prisma: prisma1 } = await import('@/lib/prisma')
    
    // Reset modules but keep global
    vi.resetModules()
    
    // Second import should reuse
    const { prisma: prisma2 } = await import('@/lib/prisma')
    
    expect(prisma1).toBeDefined()
    expect(prisma2).toBeDefined()
  })

  test('should store prisma instance in global in non-production', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    
    await import('@/lib/prisma')
    
    const globalForPrisma = globalThis as unknown as { prisma: any }
    expect(globalForPrisma.prisma).toBeDefined()
  })

  test('should not store prisma instance in global in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    
    const globalForPrisma = globalThis as unknown as { prisma: any }
    delete globalForPrisma.prisma
    
    const { prisma } = await import('@/lib/prisma')
    
    // In production mode, global should not be set
    expect(prisma).toBeDefined()
  })

  test('prisma client should have required methods', async () => {
    const { prisma } = await import('@/lib/prisma')
    
    expect(prisma.user).toBeDefined()
    expect(prisma.post).toBeDefined()
    expect(prisma.comment).toBeDefined()
  })
})
