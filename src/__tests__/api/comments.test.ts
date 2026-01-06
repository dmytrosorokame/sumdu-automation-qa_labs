/**
 * Unit tests for Comments API Route (Controller)
 * Tests comment creation logic with mocked database and session
 */

import { describe, test, expect, beforeEach, vi } from "vitest";

// Mock dependencies
const mockCreate = vi.fn();
const mockGetServerSession = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    comment: {
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

// Import handler after mocks are set up
import { POST } from "@/app/api/posts/[id]/comments/route";

describe("Comments API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create mock request
  const createMockRequest = (body: any): Request => {
    return {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Request;
  };

  describe("POST /api/posts/[id]/comments", () => {
    test("should return 401 when user is not authenticated", async () => {
      mockGetServerSession.mockResolvedValueOnce(null);

      const request = createMockRequest({
        name: "Comment Author",
        message: "This is a comment",
      });
      const params = { params: { id: "post-123" } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
      expect(mockCreate).not.toHaveBeenCalled();
    });

    test("should create a comment when user is authenticated", async () => {
      const mockSession = {
        user: { id: "user-123", username: "testuser" },
      };
      const mockComment = {
        id: "comment-1",
        name: "Comment Author",
        message: "This is a comment",
        postId: "post-123",
        authorId: "user-123",
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockCreate.mockResolvedValueOnce(mockComment);

      const request = createMockRequest({
        name: "Comment Author",
        message: "This is a comment",
      });
      const params = { params: { id: "post-123" } };

      const response = await POST(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Comment added to the Post successfully!");
      expect(data.comment).toEqual(mockComment);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          name: "Comment Author",
          message: "This is a comment",
          postId: "post-123",
          authorId: "user-123",
        },
      });
    });

    test("should use correct postId from URL params", async () => {
      const mockSession = {
        user: { id: "user-123" },
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockCreate.mockResolvedValueOnce({ id: "comment-1" });

      const request = createMockRequest({
        name: "Author",
        message: "Message",
      });
      const params = { params: { id: "specific-post-id" } };

      await POST(request, params);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          postId: "specific-post-id",
        }),
      });
    });

    test("should use correct authorId from session", async () => {
      const mockSession = {
        user: { id: "specific-user-id", username: "specificuser" },
      };

      mockGetServerSession.mockResolvedValueOnce(mockSession);
      mockCreate.mockResolvedValueOnce({ id: "comment-1" });

      const request = createMockRequest({
        name: "Author",
        message: "Message",
      });
      const params = { params: { id: "post-123" } };

      await POST(request, params);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          authorId: "specific-user-id",
        }),
      });
    });
  });
});
