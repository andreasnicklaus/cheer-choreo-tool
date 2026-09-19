## Examples (Integration Tests)

Example 1: Fix a failing integration test due to API contract mismatch

Patch:
```diff
*** Begin Patch
*** Update File: tests/integration/api.test.js
-   const resp = await apiClient.get('/users/123')
-   expect(resp.status).toBe(200)
-   expect(resp.body).toEqual({ id: 123, name: 'Alice' })
*** End Patch
```

Rationale: Aligns the integration test with the actual API contract and expected payload.

Test commands:
- Integration tests: npm run test:e2e
- Full suite: npm run test

Example 2: Stabilize flaky integration test by adding deterministic timing

Patch:
```diff
*** Begin Patch
*** Update File: tests/integration/auth.test.js
-    await waitFor(() => server.isReady())
-    const res = await request(server).get('/auth/status')
-    expect(res.status).toBe(200)
+    await waitFor(() => server.isReady({ timeout: 15000 }))
    const res = await request(server).get('/auth/status')
    expect(res.status).toBe(200)
```

Rationale: Reduces flakiness by ensuring the server is fully ready before the request.

Test commands:
- Integration tests: npm run test:e2e

Notes: Use these patterns to guide future integration-test fixes with small, auditable patches.
