# Load Testing Report (k6)

## Tool Overview (k6)

k6 is a developer-focused load testing tool that runs JavaScript scenarios from the CLI. I used it because it is lightweight and easy to automate with the project. The script supports environment variables so the same test can run locally or in CI. I used checks to validate login, data reads, and writes so a request is only considered successful if the API behaves correctly. Custom Trend metrics were added to capture a user-style "page load" proxy and total scenario time. k6 provides built-in percentile statistics, which I used to report median, p95, and p99. The output summary gives request counts, failure rate, and throughput without extra plugins. The tool keeps cookie jars per virtual user, so the auth flow stays realistic. The test duration and VU count are easy to adjust from the options block. Overall, k6 gives a simple, reproducible way to measure backend performance for the blog.

## Load Profile

- Load model: 5 virtual users (normal load requirement).
- Duration: 1 minute.
- Base URL: `http://localhost:3000`.
- Command: `BASE_URL=http://localhost:3000 k6 run --summary-trend-stats "avg,med,p(95),p(99),min,max" tests/k6/blog-load-test.js`.

## Implemented Scenarios

1) Login → open posts list → open a post → logout.  
2) Login → open a post → return to list → open another post → add comment → logout.  
3) Login → create new post → logout.  
4) Login → view profile → update profile → logout.

## Measured Performance Metric

Primary metric: `page_load_time_ms` (sum of `GET /api/posts` + `GET /api/posts/:id`).
This is an API-level proxy for page load, not a real browser paint/interaction time.

Success criteria for a "loaded page": the API returns HTTP 200 with valid JSON and the checks pass.
Client-side rendering, JS execution, images, and layout are not measured by k6.

## Results Summary

- Total HTTP requests: 1284
- Failed requests: 0 (0.00%)
- Successful requests: 1284 (100.00%)
- Throughput: 21.28 req/s

**page_load_time_ms**
- Avg: 166.84 ms
- Median: 181.25 ms
- p95: 330.31 ms
- p99: 353.98 ms

**http_req_duration** (overall API response time)
- Avg: 74.36 ms
- Median: 19.39 ms
- p95: 303.75 ms
- p99: 323.38 ms

## Failures Analysis

No failed requests were observed in this run. All checks passed.

## "Honesty" of the Measurement (Trigger → Display Cycle)

Analyzed correctly:
- Network request time and server processing (k6 measures request duration).

Not analyzed or only partially analyzed:
- Browser parsing, rendering, layout, image loading, and time to interactive.
- Client CPU delays and real user bandwidth variability.
- Visual completion and progressive rendering stages.

Therefore, the k6 result is accurate for backend/API performance but does not fully represent perceived page load for real users.

## Test Files

- `tests/k6/blog-load-test.js`
