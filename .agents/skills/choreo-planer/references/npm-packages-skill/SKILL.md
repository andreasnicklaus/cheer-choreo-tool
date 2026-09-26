---
name: npm-packages-skill
description: "Analyze npm workspace setups in a repository; explain workspaces, hoisting, and dependency strategies; provide recommended configurations and example configs for npm, yarn, or pnpm workspaces."
license: MIT
compatibility: OpenCode and VSCode-compatible; Node.js environments; parses package.json and workspace configs (npm, pnpm, yarn, lerna)
---

# NPM Packages Skill

This skill analyzes an npm-based monorepo or workspace setup and explains how workspaces are organized, how dependencies are hoisted or shared, and what configuration patterns are recommended for maintainability and performance.

## Objective
- Provide an actionable understanding of the repository's npm/workspaces setup and propose improvements or best-practice configurations.

## Inputs
- root_package_json: string (content or path to root package.json)
- workspace_config: string (content or path to workspace config if separate, e.g., pnpm-workspace.yaml, lerna.json)
- monorepo_type: string (e.g., "npm-workspaces", "pnpm-workspaces", "lerna")
- topic_hint: string (optional focus area, e.g., "scripts", "dependencies", "hoisting")

At least one input related to the repository's package layout should be provided.

## Rules for the agent
- Parse the root package.json and identify workspaces and package locations.
- Inspect each workspace's package.json to catalog scripts, dependencies, and devDependencies.
- Detect potential issues: version pinning inconsistencies, duplicate dependencies, mismatched React/Vue versions, etc.
- Provide guidance on workspace structure and dependency management (centralized vs. per-package).
- Propose a concrete set of improvements or a migration plan if appropriate (e.g., migrating from lerna to npm workspaces).
- Do not modify the codebase unless explicitly requested; propose patches only with explicit approval.
- If content is insufficient, request clarifications.

## Workflow (step-by-step)
- Step 1: Read root_package_json and workspace config
- Step 2: Enumerate packages and their dependencies
- Step 3: Evaluate workspace strategy (npm/yarn/pnpm workspaces, hoisting)
- Step 4: Propose improvements and provide example configs for the chosen toolchain
- Step 5: Output a structured report with recommended actions

## Outputs
- summary: high-level assessment of the workspace structure
- packages: list of packages with their key dependencies and scripts
- recommendations: concrete suggestions (e.g., consolidate versions, align tooling)
- example_configs: minimal example.json/yarn.lock/pnpm-workspace.yaml snippets to illustrate recommended setups
- notes: any caveats or caveats for migration

## Examples
- Example 1: Simple npm workspaces with two packages: apps/ and packages/
- Example 2: pnpm workspaces with shared dependencies and bootstrapping strategy

## Safety and governance
- No changes to code or repo without explicit approval
- No secrets in outputs or patches
- If changes affect behavior, require explicit confirmation before applying
