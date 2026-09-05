---
name: choreo-planer
description: "MUST be loaded first for any cheer-choreo-tool task. Provides project-specific context (layout, commands, conventions) and decision trees to route to specialized skills (Vue, Express, CI/CD, etc.). Do not load specialized skills directly—use this skill to ensure project standards are followed."
license: MIT
compatibility: OpenCode and VSCode-compatible environments; Node.js, npm, Docker
metadata:
  version: "1.1"
  author: Andreas Nicklaus
  project: cheer-choreo-tool
  technologies:
    - Vue 3
    - Vite
    - Express
    - Sequelize
    - Postgres
    - TypeScript
    - Docker
    - Vitest
    - Playwright
---

## ⚠️ Load This Skill First
- Includes project-specific `project-layout.md` and `commands.md` not available in generic specialized skills
- Enforces cheer-choreo-tool coding standards and safety rules
- Correctly routes tasks to specialized skills via decision trees

# Choreo Planer Skill

Consolidated skill for building and maintaining the Cheer Choreo Tool project.

## How to Use

**⚠️ IMPORTANT: This is the entry point for all cheer-choreo-tool tasks. Do NOT load reference skills directly.**

1. **Read the user task** — understand what the user is asking for
2. **Apply the decision tree** — match keywords in the task to identify the correct resource
3. **Load the resource** — open `references/<skill-name>/SKILL.md` for detailed guidance
4. **Follow the resource's workflow** — execute the task following the loaded skill's rules
5. **Return results** — provide output as specified by the resource (summary, patch, etc.)

## Project Structure

See [project-layout.md](references/project-layout.md) for the full directory structure.

## Quick Decision Trees

### "I need to work with tests"

```
Test task?
├─ Unit test (new, failing, or changes) → references/fix-unit-tests-skill/
├─ Integration/E2E test (new, failing, or changes) → references/fix-integration-tests-skill/
└─ Unknown → references/vitest/
```

### "I need to work with the frontend"

```
Frontend task?
├─ Vue component, composable, reactivity, state → references/vue-best-practices/
├─ TypeScript types, strict mode → references/typescript-expert/
└─ npm packages, workspaces → references/npm-packages-skill/
```

### "I need to work with the backend"

```
Backend task?
├─ Express routing, middleware, REST API → references/express-rest-api/
├─ Sequelize models, migrations, queries → references/sequelize/
├─ Postgres schema, RLS, performance → references/supabase-postgres-best-practices/
└─ TypeScript configuration → references/typescript-expert/
```

### "I need Docker, CI/CD, or deployment"

```
DevOps task?
├─ Dockerfile, container, image → references/docker-best-practices/
├─ Pipeline, GitHub Actions, deployment → references/cicd-expert/
└─ GitHub CLI, PRs, issues, repos → references/gh-cli/
```

### "I need to read documentation or explain concepts"

```
Documentation task?
├─ Read local/web docs, explain setup → references/read-docs-skill/
└─ npm workspaces, hoisting, dependencies → references/npm-packages-skill/
```

### "I need to write or modify code"

```
Coding task?
└─ General code analysis, patch proposal, refactoring → references/basic-skill/
```

## Product Index

### Testing & Quality

| Topic                                           | Resource                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| Unit test (new, failing, or changes)            | [references/fix-unit-tests-skill/](references/fix-unit-tests-skill/)               |
| Integration/E2E test (new, failing, or changes) | [references/fix-integration-tests-skill/](references/fix-integration-tests-skill/) |
| Vitest configuration, mocking, coverage         | [references/vitest/](references/vitest/)                                           |

### Frontend

| Topic                                      | Resource                                                         |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Vue 3, components, composables, reactivity | [references/vue-best-practices/](references/vue-best-practices/) |

### Backend

| Topic                                | Resource                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Express.js, REST APIs, middleware    | [references/express-rest-api/](references/express-rest-api/)                                 |
| Sequelize ORM, models, migrations    | [references/sequelize/](references/sequelize/)                                               |
| Postgres, RLS, security, performance | [references/supabase-postgres-best-practices/](references/supabase-postgres-best-practices/) |

### TypeScript

| Topic                          | Resource                                                       |
| ------------------------------ | -------------------------------------------------------------- |
| TypeScript, types, strict mode | [references/typescript-expert/](references/typescript-expert/) |

### DevOps & Infrastructure

| Topic                            | Resource                                                               |
| -------------------------------- | ---------------------------------------------------------------------- |
| Docker, containers, Dockerfile   | [references/docker-best-practices/](references/docker-best-practices/) |
| CI/CD, pipelines, GitHub Actions | [references/cicd-expert/](references/cicd-expert/)                     |

### Developer Tools

| Topic                                  | Resource                                                         |
| -------------------------------------- | ---------------------------------------------------------------- |
| GitHub CLI, PRs, issues, workflows     | [references/gh-cli/](references/gh-cli/)                         |
| npm workspaces, packages, dependencies | [references/npm-packages-skill/](references/npm-packages-skill/) |

### MCP Tools

The project has the following MCP (Model Context Protocol) tools configured in `opencode.json`:

| Tool              | Purpose                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `chrome-devtools` | Browser automation, testing, and inspection via Chrome DevTools Protocol |
| `github`          | GitHub operations (PRs, issues, repos, Actions) via GitHub MCP Server    |
| `context7`        | Documentation lookup and code search via Context7                        |

Use these tools when working with browser automation, GitHub operations, or documentation searches.

### General

| Topic                                | Resource                                                   |
| ------------------------------------ | ---------------------------------------------------------- |
| Documentation, concept explanation   | [references/read-docs-skill/](references/read-docs-skill/) |
| General coding, patches, refactoring | [references/basic-skill/](references/basic-skill/)         |

## Examples

### Example 1: Fix a failing unit test

User says: "My unit test in app/tests/unit/store.test.ts is failing with 'expected 200 but got 404'"

1. Decision: Contains "unit test" and "failing" → fix-unit-tests-skill
2. Load the skill and follow its workflow
3. Analyze error, locate failing test, propose patch

### Example 2: Add a new Vue component

User says: "I need to add a new form component for user input"

1. Decision: Contains "Vue" and "component" → vue-best-practices
2. Load the skill and follow its guidance for component patterns

### Example 3: Understand the project structure

User says: "What files are involved in the authentication flow?"

1. Decision: Not a specific topic → load project-layout.md for context
2. Explore the codebase using Read and Grep tools
3. Provide a summary of the relevant files

## Safety and Governance

**Skill Loading Order**: Always load this `choreo-planer` skill FIRST before any reference skills. Reference skills have "[Load choreo-planer first]" in their descriptions to remind you.

- **Explicit approval required**: Never apply patches, run migrations, or make changes without user confirmation
- **Git operations**: No git commits, pushes, or branch operations unless explicitly approved per task
- **Production safety**: Never touch production data, run destructive commands, or modify deployed systems
- **Secrets**: Never include credentials, API keys, or tokens in explanations or patches
- **Scope awareness**: If unsure about the scope or impact of a task, ask for clarification before acting
- **Read-first approach**: Prefer analysis and explanation before making changes

## Essential Commands

See [commands.md](references/commands.md) for detailed commands for testing, development, Docker, and database operations.
