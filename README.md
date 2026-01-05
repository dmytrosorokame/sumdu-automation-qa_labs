# SumDU Blog

A simple blog application for QA testing course at SumDU.

## Tech Stack

- **Framework**: Next.js 14 (fullstack)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

## Features

- User registration and authentication
- Forgot/reset password functionality
- User profile management
- Create and view blog posts
- Add comments to posts
- Dashboard with user statistics

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Setup database:

```bash
npm run db:generate
npm run db:push
```

4. Run development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
