/**
 * Unit tests for Register API Route (Controller)
 * Tests user registration logic with mocked database operations
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

// Mock dependencies
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockHash = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: (...args: any[]) => mockFindFirst(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: (...args: any[]) => mockHash(...args),
  },
  hash: (...args: any[]) => mockHash(...args),
}));

// Import the handler after mocks are set up
import { POST } from "@/app/api/auth/register/route";

describe("Register API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock request
  const createMockRequest = (body: any): Request => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Request;
  };

  describe("POST /api/auth/register", () => {
    test("should register a new user successfully", async () => {
      const requestBody = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      mockFindFirst.mockResolvedValueOnce(null); // No existing user
      mockHash.mockResolvedValueOnce("hashed_password_123");
      mockCreate.mockResolvedValueOnce({
        id: "new-user-id",
        username: "newuser",
        email: "newuser@example.com",
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Registration successful");
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ username: "newuser" }, { email: "newuser@example.com" }],
        },
      });
      expect(mockHash).toHaveBeenCalledWith("password123", 10);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          username: "newuser",
          email: "newuser@example.com",
          password: "hashed_password_123",
        },
      });
    });

    test("should return error when username already exists", async () => {
      const requestBody = {
        username: "existinguser",
        email: "new@example.com",
        password: "password123",
      };

      mockFindFirst.mockResolvedValueOnce({
        id: "existing-id",
        username: "existinguser",
        email: "existing@example.com",
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Username or email already exists");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    test("should return error when email already exists", async () => {
      const requestBody = {
        username: "brandnewuser",
        email: "existing@example.com",
        password: "password123",
      };

      mockFindFirst.mockResolvedValueOnce({
        id: "existing-id",
        username: "existinguser",
        email: "existing@example.com",
      });

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Username or email already exists");
    });

    test("should return 500 error when database operation fails", async () => {
      const requestBody = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      mockFindFirst.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Something went wrong");
    });

    test("should hash password with correct salt rounds", async () => {
      const requestBody = {
        username: "testuser",
        email: "test@example.com",
        password: "mySecurePassword",
      };

      mockFindFirst.mockResolvedValueOnce(null);
      mockHash.mockResolvedValueOnce("hashed_value");
      mockCreate.mockResolvedValueOnce({});

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockHash).toHaveBeenCalledWith("mySecurePassword", 10);
    });
  });
});
