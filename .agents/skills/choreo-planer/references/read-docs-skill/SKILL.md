---
name: read-docs-skill
description: "Read documentation (local or web) and explain concepts or setups with structured summaries, glossaries, and actionable steps."
license: MIT
compatibility: OpenCode and VSCode-compatible environments; supports webfetch for URLs; reads local repo docs with the Read tool
---

# Read Docs Skill

This skill reads documentation from local files, URLs, or provided content and explains concepts or setups in a structured, audit-friendly format. It outputs a concise summary, a glossary of terms, key concepts, prerequisites, and, if applicable, step-by-step setup instructions derived from the docs.

## Objective
- Convert documentation into an actionable, easy-to-consume explanation with optional setup guidance.

## Inputs
- doc_content: string (direct content to read)
- source_url: string (URL to fetch content from)
- source_path: string (local path to read content from)
- topic_hint: string (optional hint to focus the explanation)

At least one input should be provided.

## Rules for the agent
- Fetch content from source_url when provided using webfetch.
- Read local files when source_path is provided using Read.
- If doc_content is provided, use it directly.
- Produce:
  - overview/summary
  - key concepts with short definitions
  - prerequisites or setup steps (if the doc describes configuration or setup)
  - a concise glossary of terms found in the doc
  - references or further reading
- Do not modify code or dependencies; avoid making changes to the repository unless explicitly requested.
- Provide a brief rationale for any setup steps derived from the doc.
- If the doc is broad, segment the output by sections and include a quick-start checklist.

## Workflow (steps)
- Step 1: Determine content source (doc_content, source_url, or source_path)
- Step 2: Retrieve content (fetch if URL, read if path, or use provided content)
- Step 3: Identify key concepts and setup-related content
- Step 4: Generate structured output: summary, concepts, prerequisites, setup steps, glossary
- Step 5: Return output with references

## Outputs
- summary: a concise narrative of the doc
- concepts: bullet list with definitions
- prerequisites: list of required items or preconditions
- setup_steps: actionable steps if the doc covers setup/configuration
- glossary: terms and definitions
- references: links or references in the doc

## Examples
- Example 1: Read a Dockerfile-based README and extract setup steps for a dev environment
- Example 2: Read an npm workspace guide and explain how to configure workspaces and basic tooling

## Safety and governance
- No changes to code or repo; no patching unless explicitly requested
- Avoid exposing secrets; do not fetch or display sensitive data
- If content is unclear, ask for clarification before proceeding
