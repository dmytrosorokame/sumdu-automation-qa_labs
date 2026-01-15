# DAST Vulnerability Scanning Report

## Tools Used

**Nuclei** is a fast, template-based vulnerability scanner. It sends HTTP requests based on community templates and matches responses against known patterns. I used it with a limited set of templates focused on CVEs, misconfigurations, and exposures to keep the scan realistic for a student project. It is lightweight and easy to run in CI.

**Nikto** is a classic web server scanner that checks for common misconfigurations, dangerous files, and missing headers. It performs a wide set of heuristic checks and reports informational issues as well as potential vulnerabilities. I used it to quickly identify missing security headers and server information leakage. The output requires manual verification because it can produce false positives.

**Wapiti** is a web vulnerability scanner that crawls the application and tests discovered pages for common web flaws. It focuses on real HTTP interactions and produces a structured report. I ran a constrained scan (limited depth and time, only SQL/XSS modules) to keep it stable and reproducible. It supports authenticated scanning via cookies.

**SQLMap** is a specialized tool for detecting SQL injection. It tests parameters with multiple techniques and reports if an endpoint is injectable. I targeted a real API endpoint with a query parameter and provided the authenticated cookie so it could access protected resources if needed. It is useful for ruling out injection risks.

## Authenticated Access Method

Authenticated access was provided by generating a real session cookie:

1. Register a new user via `POST /api/auth/register`.
2. Fetch CSRF token from `GET /api/auth/csrf` and store the cookie.
3. Log in via `POST /api/auth/callback/credentials` using the CSRF token and cookie jar.
4. Pass the resulting `next-auth.session-token` cookie to each tool.

Implementation: `scripts/dast/get-auth-cookie.sh`.  
The cookie is injected with `Cookie:` header (Nuclei), `-C` (Nikto), `-C` (Wapiti), and `--cookie` (SQLMap).  
This allows scanning of routes that require authentication, such as `/api/profile` and protected post/comment actions.

## How the Scan Was Executed

Base URL: `http://localhost:3000`  
Runner script: `scripts/dast/run-dast.sh`  
Raw outputs: `docs/dast-results/`

## Scan Results (Program Reports)

**Nuclei**

- Output file: `docs/dast-results/nuclei.txt`
- Result: No findings (empty report).

**Nikto**

- Output file: `docs/dast-results/nikto.txt`
- Result: Found missing security headers and several CMS-specific XSS test paths.

**Wapiti**

- Output file: `docs/dast-results/wapiti.txt`
- Result: 0 vulnerabilities across tested modules (SQL/XSS).

**SQLMap**

- Output directory: `docs/dast-results/sqlmap/`
- Result: Parameter `search` on `GET /api/posts` not injectable; no SQL injection detected.

## Findings Analysis (Real vs False Positive)

1. **Missing X-Frame-Options header** (Nikto)  
   Real issue. Without this header, the app can be framed and is more vulnerable to clickjacking. Fixed in `next.config.js` by adding `X-Frame-Options: DENY`.

2. **Missing X-Content-Type-Options header** (Nikto)  
   Real issue. Without this header, some browsers can MIME-sniff responses. Fixed in `next.config.js` by adding `X-Content-Type-Options: nosniff`.

3. **X-Powered-By: Next.js** (Nikto)  
   Informational. It leaks the framework but is not a direct vulnerability. Mitigated by disabling the powered-by header in `next.config.js`.

4. **CMS-specific XSS paths (Drupal/eZ Publish/MyWebServer)** (Nikto)  
   False positives. These are generic test paths for unrelated platforms and do not exist in this project. The app returns standard Next.js pages; no real CMS code is present.

## Code Fixes Applied

- Added security headers and disabled the powered-by header in `next.config.js`.
- This closes the two real header-related findings from Nikto.

## CI/CD Integration

DAST scanning is integrated into GitHub Actions in `.github/workflows/ci.yml` under the `dast` job.
The job builds the app, starts it locally, generates an authenticated cookie, runs all 4 tools, and uploads the reports as artifacts.
