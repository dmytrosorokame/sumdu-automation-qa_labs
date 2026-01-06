/**
 * Unit tests for Profile API Route (Controller)
 * Tests profile retrieval and update logic with mocked database and session
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

// Mock dependencies
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockGetServerSession = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: (...args: any[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: { providers: [] },
}));

// Import handlers after mocks are set up
import { GET, PUT } from "@/app/api/profile/route";

describe("Profile API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock request
  const createMockRequest = (body?: any): Request => {
    return {
      json: vi.fn().mockResolvedValue(body || {}),
    } as unknown as Request;
  };

  describe("GET /api/profile", () => {
    test("should return 401 when user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    test("should return user profile when authenticated", async () => {
      const mockSession = {
        user: { id: "user-123", username: "testuser" },
      };
      const mockUser = {
        id: "user-123",
        username: "testuser",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        age: 25,
        gender: "male",
        address: "123 Test St",
        website: "https://example.com",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockFindUnique.mockResolvedValueOnce(mockUser);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          age: true,
          gender: true,
          address: true,
          website: true,
        },
      });
    });

    test("should select only allowed fields", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockFindUnique.mockResolvedValueOnce({});

      await GET();

      // Verify that password is NOT selected
      const selectArg = mockFindUnique.mock.calls[0][0].select;
      expect(selectArg.password).toBeUndefined();
      expect(selectArg.resetToken).toBeUndefined();
      expect(selectArg.resetTokenExpiry).toBeUndefined();
    });
  });

  describe("PUT /api/profile", () => {
    test("should return 401 when user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const request = createMockRequest({
        firstName: "New",
        lastName: "Name",
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    test("should update user profile when authenticated", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };
      const updateData = {
        firstName: "Updated",
        lastName: "Name",
        age: "30",
        gender: "male",
        address: "New Address",
        website: "https://new-site.com",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockUpdate.mockResolvedValueOnce({ id: "user-123", ...updateData });

      const request = createMockRequest(updateData);

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Profile updated successfully!");
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          firstName: "Updated",
          lastName: "Name",
          age: 30, // Should be parsed as integer
          gender: "male",
          address: "New Address",
          website: "https://new-site.com",
        },
      });
    });

    test("should handle null age correctly", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };
      const updateData = {
        firstName: "Test",
        lastName: "User",
        age: null,
        gender: "female",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockUpdate.mockResolvedValueOnce({});

      const request = createMockRequest(updateData);
      await PUT(request);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          age: null,
        }),
      });
    });

    test("should handle empty age string as null", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };
      const updateData = {
        firstName: "Test",
        age: "",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockUpdate.mockResolvedValueOnce({});

      const request = createMockRequest(updateData);
      await PUT(request);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          age: null,
        }),
      });
    });

    test("should parse numeric age string correctly", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };
      const updateData = {
        firstName: "Test",
        age: "42",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockUpdate.mockResolvedValueOnce({});

      const request = createMockRequest(updateData);
      await PUT(request);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: expect.objectContaining({
          age: 42,
        }),
      });
    });
  });
});
