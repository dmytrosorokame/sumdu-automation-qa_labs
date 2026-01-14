# API Testing Report (Postman)

## Tools

- Postman (manual run and Collection Runner)

## Environment Setup

1. Start the app locally: `npm run dev`.
2. Import the collection: `tests/postman/SumDU-Blog.postman_collection.json`.
3. Import the environment: `tests/postman/SumDU-Blog.postman_environment.json`.
4. Select the `SumDU Blog Local` environment.

## Endpoint Coverage

- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password?token=...`
- `POST /api/auth/reset-password`
- `GET /api/auth/csrf`
- `POST /api/auth/callback/credentials`
- `GET /api/auth/session`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/posts`
- `POST /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts/:id/comments`

## Test Flow

1. Verify unauthorized access (401 for `GET /api/profile`, `POST /api/posts`).
2. Register a new user.
3. Fetch CSRF and log in with `credentials`.
4. Verify session.
5. Profile operations (read/update).
6. Posts operations (list/create/get by id).
7. Add a comment to a post.
8. Password recovery (forgot/reset) and login with the new password.

## Test Evidence (Screenshot)

![Postman run results](./postman-run.png)

## Test Files

- `tests/postman/SumDU-Blog.postman_collection.json`
- `tests/postman/SumDU-Blog.postman_environment.json`
