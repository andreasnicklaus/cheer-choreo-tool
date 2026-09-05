## Examples (NPM Packages)

Example 1: Basic npm workspaces (two packages: apps/ and packages/)
- Analysis: root package.json contains { "workspaces": ["apps/*", "packages/*"] }
- Output: list of packages with key scripts and dependencies; recommend consistent React/Vue versions; show a minimal consolidated dependency strategy.

Example 2: Migrating from Lerna to npm workspaces
- Analysis: Lerna configuration and per-package versions; propose migrating to a root-level dependencies management and updating scripts to use workspaces commands.
- Patch: not provided here; outline migration steps and a plan for keeping changes auditable.
