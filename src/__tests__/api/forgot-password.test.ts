/**
 * Unit tests for Forgot Password API Route (Controller)
 * Tests password reset token generation with mocked database
 */

import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";

// Mock crypto module
const mockRandomBytes = vi.fn();
vi.mock("crypto", () => ({
  default: {
    randomBytes: (...args: any[]) => mockRandomBytes(...args),
  },
  randomBytes: (...args: any[]) => mockRandomBytes(...args),
}));

// Mock dependencies
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

// Import handler after mocks are set up
import { POST } from "@/app/api/auth/forgot-password/route";

describe("Forgot Password API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper function to create mock request
  const createMockRequest = (body: any): Request => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Request;
  };

  describe("POST /api/auth/forgot-password", () => {
    test("should return error when email does not exist", async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const request = createMockRequest({ email: "nonexistent@example.com" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No account with that email address exists.");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    test("should generate reset token and update user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      };
      const mockToken = "abcdef1234567890";

      mockFindUnique.mockResolvedValueOnce(mockUser);
      mockRandomBytes.mockReturnValueOnce({
        toString: vi.fn().mockReturnValue(mockToken),
      });
      mockUpdate.mockResolvedValueOnce({});

      const request = createMockRequest({ email: "test@example.com" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe(
        "Password reset link has been sent to your email."
      );
      expect(data.token).toBe(mockToken);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(mockRandomBytes).toHaveBeenCalledWith(32);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          resetToken: mockToken,
          resetTokenExpiry: new Date("2024-06-01T13:00:00Z"), // 1 hour from now
        },
      });
    });

    test("should set token expiry to 1 hour from now", async () => {
      const mockUser = { id: "user-123", email: "test@example.com" };

      mockFindUnique.mockResolvedValueOnce(mockUser);
      mockRandomBytes.mockReturnValueOnce({
        toString: vi.fn().mockReturnValue("token"),
      });
      mockUpdate.mockResolvedValueOnce({});

      const request = createMockRequest({ email: "test@example.com" });
      await POST(request);

      const updateCall = mockUpdate.mock.calls[0][0];
      const expectedExpiry = new Date(Date.now() + 3600000); // 1 hour

      expect(updateCall.data.resetTokenExpiry).toEqual(expectedExpiry);
    });

    test("should return 500 error when database operation fails", async () => {
      mockFindUnique.mockRejectedValueOnce(new Error("Database error"));

      const request = createMockRequest({ email: "test@example.com" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Something went wrong");
    });
  });
});
