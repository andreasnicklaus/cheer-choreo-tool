---
name: fix-integration-tests-skill
description: "Diagnose and fix failing integration tests based on error messages or error descriptions; propose minimal patches with rationale; require explicit approval before applying changes."
license: MIT
compatibility: OpenCode and VSCode-compatible environments; JS/TS integration test stacks (cypress, playwright, jest integration tests)
---

# Fix Integration Tests Skill

This skill targets integration test failures. It uses error messages or descriptions to identify root causes in the integration test suite, then proposes small, auditable patches with rationale. Patches are not applied automatically without explicit user approval.

## Objective
- Stabilize integration tests by correcting interactions between modules/services and the test harness, while minimizing risk to the overall codebase.

## Inputs
- error_message: string (the integration test failure output)
- error_description: string (a human-friendly description of the failure)

At least one input must be provided.

## Rules for the agent
- Analyze the error to determine which integration test or interaction failed and why.
- Locate failing integration test files and the related code paths.
- Propose a minimal, scoped patch that resolves the failure without introducing new issues.
- Include a review checklist and test commands to verify changes locally.
- Do not apply patches automatically; require explicit approval.
- If the failure relates to environment or flaky tests, propose deterministic improvements (timeouts, mocks) and a plan for stabilization.
- Do not reveal secrets or credentials in explanations or patches.

## Workflow
- Step 1: Validate inputs and gather context
- Step 2: Reproduce the failure context in local environment if possible
- Step 3: Identify root cause (code, test, or environment)
- Step 4: Draft minimal patch with rationale
- Step 5: Provide a review checklist and test commands
- Step 6: Await user approval to apply patch
- Step 7: If approved, apply patch in separate action and re-run tests

## Patch format (example)
- Unified-diff patch for affected file(s)
- Include a brief justification block and post-patch test commands

## Examples
- Example 1: Integration test failing due to API contract mismatch
- Example 2: Flaky test pattern caused by non-deterministic timing; propose timeout adjustment and mock stabilization

## Safety and governance
- See embedded examples in .agents/skills/fix-integration-tests-skill/examples.md for concrete patch templates and test commands.
- No git actions or pushes unless explicitly approved for this task
- Do not include secrets in patches or explanations
- If the change affects behavior, require explicit confirmation before applying
- Existing test scripts (for reference)
- App (frontend):
-   - test: npm run test
-   - test:e2e: npm run test:e2e
- Server (backend):
-   - test: npm run test
-   - test:prep: npm run lint && tsc --noEmit
-   - test:unit: npm run test:unit
