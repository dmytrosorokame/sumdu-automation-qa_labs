/**
 * Unit tests for Post by ID API Route (Controller)
 * Tests single post retrieval logic with mocked database
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

// Mock dependencies
const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}));

// Import handler after mocks are set up
import { GET } from "@/app/api/posts/[id]/route";

describe("Post by ID API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/posts/[id]", () => {
    test("should return 404 when post does not exist", async () => {
      mockFindUnique.mockResolvedValueOnce(null);

      const request = {} as Request;
      const params = { params: { id: "non-existent-id" } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Post not found");
    });

    test("should return post with author and comments when found", async () => {
      const mockPost = {
        id: "post-123",
        title: "Test Post",
        description: "Test Description",
        body: "Test Body Content",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
        authorId: "user-123",
        author: { username: "testuser" },
        comments: [
          {
            id: "comment-1",
            name: "Commenter",
            message: "Great post!",
            createdAt: new Date("2024-01-03"),
            author: { username: "commenter1" },
          },
        ],
      };

      mockFindUnique.mockResolvedValueOnce(mockPost);

      const request = {} as Request;
      const params = { params: { id: "post-123" } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(mockPost.id);
      expect(data.title).toBe(mockPost.title);
      expect(data.author.username).toBe(mockPost.author.username);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: "post-123" },
        include: {
          author: {
            select: { username: true },
          },
          comments: {
            include: {
              author: {
                select: { username: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    });

    test("should return post with empty comments array", async () => {
      const mockPost = {
        id: "post-456",
        title: "Post without comments",
        description: "Description",
        body: "Body",
        author: { username: "author" },
        comments: [],
      };

      mockFindUnique.mockResolvedValueOnce(mockPost);

      const request = {} as Request;
      const params = { params: { id: "post-456" } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(data.comments).toEqual([]);
    });

    test("should order comments by createdAt descending", async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: "post-123",
        comments: [],
        author: { username: "user" },
      });

      const request = {} as Request;
      const params = { params: { id: "post-123" } };

      await GET(request, params);

      const queryArgs = mockFindUnique.mock.calls[0][0];
      expect(queryArgs.include.comments.orderBy).toEqual({ createdAt: "desc" });
    });

    test("should select only username from author", async () => {
      mockFindUnique.mockResolvedValueOnce({
        id: "post-123",
        author: { username: "user" },
        comments: [],
      });

      const request = {} as Request;
      const params = { params: { id: "post-123" } };

      await GET(request, params);

      const queryArgs = mockFindUnique.mock.calls[0][0];
      expect(queryArgs.include.author.select).toEqual({ username: true });
    });
  });
});
