# SumDU Blog

A simple blog application for QA testing course at SumDU.

[![CI Pipeline](https://github.com/YOUR_USERNAME/sumdu-automation-qa_labs/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/sumdu-automation-qa_labs/actions/workflows/ci.yml)

## Tech Stack

- **Framework**: Next.js 14 (fullstack)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, SonarCloud

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
- `npm run lint` - Run ESLint code style analysis
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:push` - Push schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:e2e:ui` - Run E2E tests with interactive UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:codegen` - Open Playwright Codegen for recording tests
- `npm run test:e2e:report` - Open Playwright HTML report

## CI/CD Pipeline

This project uses **GitHub Actions** for Continuous Integration. Every push or pull request triggers:

### 1. Code Style Analysis (ESLint)

- Checks code for style violations
- Enforces consistent code formatting
- Detects potential issues early

### 2. Unit & Integration Tests (Vitest)

- Runs all test suites
- Generates coverage reports
- Uploads coverage artifacts

### 3. E2E Tests (Playwright)

- Runs end-to-end browser tests
- Tests user flows: registration, login, posts, comments
- Uses record-and-play approach
- Generates HTML reports with screenshots and traces

### 4. TypeScript Type Check

- Validates type correctness
- Catches type errors before runtime

### 5. Build Verification

- Ensures the application builds successfully
- Runs after lint, test, and e2e jobs pass

### 6. Code Quality Analysis (SonarCloud)

- Detects code smells
- Finds duplicated code
- Identifies potential bugs
- Measures technical debt

## Setting Up CI for Your Fork

1. **GitHub Actions** - Works automatically when you push to GitHub

2. **SonarCloud** (optional, for code quality):
   - Create account at [sonarcloud.io](https://sonarcloud.io)
   - Import your repository
   - Add `SONAR_TOKEN` to GitHub Secrets
   - Update `sonar-project.properties` with your project details
