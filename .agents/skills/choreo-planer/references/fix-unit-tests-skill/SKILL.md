---
name: fix-unit-tests-skill
description: "Diagnose and fix failing unit tests based on error messages or error descriptions; propose minimal patches with rationale; require explicit approval before applying changes."
license: MIT
compatibility: OpenCode and VSCode-compatible environments; JS/TS testing stacks (jest, vitest, mocha)
---

# Fix Unit Tests Skill

This skill focuses on diagnosing and fixing failing unit tests in a non-destructive, auditable way. It works from error messages or error descriptions and produces a concise patch with a rationale and a human-review checklist. It never applies patches automatically without explicit approval.

## Objective
- Correct a failing unit test by identifying the root cause and providing a minimal, well-scoped patch that resolves the failure while preserving existing behavior.

## Inputs (always provided as one of these)
- error_message: string (the runtime error or test failure message)
- error_description: string (a human-friendly description of the failure)

At least one of error_message or error_description must be provided.

## Rules for the agent
- Analyze the input to determine the failing test, location, and probable cause.
- Locate the relevant test file(s) and the corresponding source file(s).
- Propose a minimal patch (or patches) that fixes the root cause or the test expectation, with a clear justification.
- Include a human-review checklist that covers: test impact, regression risk, and updated/added tests.
- Do not apply patches automatically; present the patch and wait for explicit approval.
- If the failure cannot be resolved within a small patch, provide a plan describing investigation steps and potential refactors.
- If required context is missing (e.g., missing test file), request additional details.
- Do not reveal secrets or credentials in explanations or patches.
- Provide commands to reproduce the failure and to run unit tests locally.

## Workflow (step-by-step)
- Step 1: Input validation and context gathering
- Step 2: Identify failing test and location
- Step 3: Hypothesize root cause (code vs test vs environment)
- Step 4: Draft minimal patch with rationale
- Step 5: Produce a review checklist and test commands
- Step 6: Await user approval to apply patch
- Step 7: If approved, apply patch in a separate action and re-run tests

## Patch format (example)
- Patch should be a standard unified-diff showing changes to the affected file(s).
- Include a one-paragraph justification above the patch in the output.

## Examples
- Example 1: Resolve a failing assertion due to off-by-one
- Example 2: Fix a mock expectation that no longer matches API output

## Safety and governance
- See embedded examples in .agents/skills/fix-unit-tests-skill/examples.md for concrete patch templates and test commands.
- No git operations or pushes unless explicitly approved for this task.
- No secrets in patches or outputs.
- If a patch touches user-facing behavior, require explicit confirmation before applying.
- Existing test scripts (for reference)
- App (frontend):
-   - test: npm run test:unit && npm run test:e2e
-   - test:unit: npm run test:unit
-   - test:e2e:pretest: npm run test:e2e:pretest
-   - test:e2e: npm run test:e2e
- Server (backend):
-   - test: npm run test:prep && npm run test:unit
-   - test:prep: npm run lint && tsc --noEmit
-   - test:unit: npm run test:unit
