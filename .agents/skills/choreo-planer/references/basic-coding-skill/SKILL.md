---
name: basic-coding-skill
description: "Concrete, rule-based workflow for reading, understanding, and optionally patching small code changes (non-destructive)."
license: MIT
compatibility: OpenCode and VSCode-compatible environments; non-destructive, read-only by default
---

# Basic Coding Skill

This skill provides a concrete, rule-governed workflow for the agent to read, understand, summarize, and optionally propose patches for small, non-destructive code tasks. It is designed to be safe, reproducible, and auditable.

## Objective

- Help the user understand code with a structured explanation, and optionally generate a patch with explicit human approval prior to application.

## Preconditions

- A target file or code snippet is provided, or the agent has access to the repository context to fetch the code via the Read tool.
- The user or system will confirm before applying any patch.

## Rules and Workflow (operational)

1. Interpret the user request and determine the task scope (explanation, summary, or patch proposal).
2. If the task is analysis-only, read the specified file(s) and produce a structured report: high-level summary, line-by-line highlights, and edge cases.
3. If a patch is requested or beneficial, draft a minimal, well-scoped patch with a clear rationale. Include a unified-diff style patch and a one-paragraph justification.
4. Include a human-review checklist with criteria such as: no secrets exposed, tests updated or added, and no production-impact changes unless explicitly approved.
5. Do not apply patches automatically. Return the patch with the review checklist and ask for explicit approval before applying.
6. If the requested file is not found, report the gap and propose alternative fixes or clarifications.
7. Always quote file paths and content when presenting diffs; avoid leaking secrets in the patch or discussion.
8. If multiple files are affected, present a separate patch per file with concise explanations.
9. Validate that patch diffs are small and focused (1-2 logical changes per patch) to keep risk low.
10. Conclude with a brief summary of outcomes and suggested next steps.

## Inputs

- task: a structured prompt describing what to analyze or modify
- path/file: the target file path (optional if code is pasted directly)
- patch-request: boolean/flag requesting a patch; if true, provide patch and checklist for review

## Outputs

- summary: concise description of the task outcome
- details: expanded explanation or analysis
- patch (optional): a unified-diff patch suitable for patching a single file
- review: a checklist for human review before applying changes

## Decision criteria

- If the change is trivial (e.g., comment addition) and non-functional, include as a suggested non-patch example unless the user explicitly asks for changes.
- If the change touches user-facing behavior or data handling, require explicit user confirmation before applying.

## Edge cases

- Binary files: skip patch generation; provide a summary and guidance.
- Large files: summarize at a high level and focus patch on a small, testable slice.
- Missing tests: propose new tests but do not modify the test suite unless approved.

## Examples

- Input: Explain function add(a, b) in src/math.js
- Output: Summary, edge cases, and a brief explanation of the logic.
- Input: Patch the function add to handle negative numbers properly
- Output: Patch diff and a review checklist.

## Safety notes

- Do not perform git operations or push changes unless the user explicitly approves per task.
- Do not reveal secrets or credentials in patches or explanations.
- When in doubt, ask for clarification rather than making assumptions.
