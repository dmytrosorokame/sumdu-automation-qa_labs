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

This project uses **GitHub Actions** for Continuous Integration with a **three-tier architecture**:

### 🔍 GROUP 1: LINTERS - Static Code Analysis

**Purpose**: Catch syntax and style issues early

- **ESLint** - JavaScript/TypeScript code style and security rules
- **TypeScript Type Check** - Type safety validation

### 🧪 GROUP 2: TESTS - Comprehensive Testing

**Purpose**: Verify functionality and behavior

- **Unit Tests (Vitest)** - Component and function testing with coverage
- **E2E Tests (Playwright)** - End-to-end browser automation
- **Cucumber BDD Tests** - Behavior-driven development scenarios

### 🔒 GROUP 3: SECURITY & QUALITY - Analysis & Compliance

**Purpose**: Ensure code quality and security standards

- **Security Analysis (SAST/SCA)**
  - Semgrep - Pattern-based security scanning
  - npm audit - Dependency vulnerability checking
  - Trivy - Comprehensive security scanner
- **SonarCloud** - Code quality metrics and technical debt
- **Build Verification** - Final production build check

## Setting Up CI for Your Fork

1. **GitHub Actions** - Works automatically when you push to GitHub

2. **SonarCloud** (optional, for code quality):
   - Create account at [sonarcloud.io](https://sonarcloud.io)
   - Import your repository
   - Add `SONAR_TOKEN` to GitHub Secrets
   - Update `sonar-project.properties` with your project details
