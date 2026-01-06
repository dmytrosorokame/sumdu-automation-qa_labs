/**
 * Unit tests for Posts API Route (Controller)
 * Tests posts listing and creation logic with mocked database and session
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

// Mock dependencies
const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockGetServerSession = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: (...args: any[]) => mockFindMany(...args),
      create: (...args: any[]) => mockCreate(...args),
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
import { GET, POST } from "@/app/api/posts/route";

describe("Posts API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock request
  const createMockRequest = (body?: any): Request => {
    return {
      json: vi.fn().mockResolvedValue(body || {}),
    } as unknown as Request;
  };

  describe("GET /api/posts", () => {
    test("should return all posts with authors and comments", async () => {
      const mockPosts = [
        {
          id: "post-1",
          title: "First Post",
          description: "Description 1",
          body: "Body 1",
          createdAt: new Date("2024-01-01"),
          author: { username: "user1" },
          comments: [],
        },
        {
          id: "post-2",
          title: "Second Post",
          description: "Description 2",
          body: "Body 2",
          createdAt: new Date("2024-01-02"),
          author: { username: "user2" },
          comments: [{ id: "comment-1", message: "Great post!" }],
        },
      ];

      mockFindMany.mockResolvedValueOnce(mockPosts);

      const response = await GET();
      const data = await response.json();

      expect(data.length).toBe(mockPosts.length);
      expect(data[0].id).toBe(mockPosts[0].id);
      expect(data[0].title).toBe(mockPosts[0].title);
      expect(mockFindMany).toHaveBeenCalledWith({
        include: {
          author: {
            select: { username: true },
          },
          comments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    });

    test("should return empty array when no posts exist", async () => {
      mockFindMany.mockResolvedValueOnce([]);

      const response = await GET();
      const data = await response.json();

      expect(data).toEqual([]);
    });
  });

  describe("POST /api/posts", () => {
    test("should return 401 when user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const request = createMockRequest({
        title: "New Post",
        description: "Description",
        body: "Body content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    test("should create a new post when user is authenticated", async () => {
      const mockSession = {
        user: { id: "user-123", username: "testuser" },
      };
      const mockPost = {
        id: "new-post-id",
        title: "New Post",
        description: "Description",
        body: "Body content",
        authorId: "user-123",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockCreate.mockResolvedValueOnce(mockPost);

      const request = createMockRequest({
        title: "New Post",
        description: "Description",
        body: "Body content",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Blog Post posted successfully!");
      expect(data.post).toEqual(mockPost);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          title: "New Post",
          description: "Description",
          body: "Body content",
          authorId: "user-123",
        },
      });
    });

    test("should use correct authorId from session", async () => {
      const mockSession = {
        user: { id: "specific-user-id", username: "specificuser" },
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockCreate.mockResolvedValueOnce({ id: "post-id" });

      const request = createMockRequest({
        title: "Test",
        description: "Test",
        body: "Test",
      });

      await POST(request);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          authorId: "specific-user-id",
        }),
      });
    });
  });
});
