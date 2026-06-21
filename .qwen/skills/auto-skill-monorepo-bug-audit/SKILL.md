---
name: monorepo-bug-audit
description: Systematic audit of a monorepo's packages to find bugs, errors, inconsistencies, and code quality issues. Covers version mismatches, import scope errors, test failures, template consistency, dead config, missing files, and more.
source: auto-skill
extracted_at: '2026-06-21T14:21:40.566Z'
---

# Monorepo Bug Audit Procedure

When asked to find bugs, errors, or anything wrong across a monorepo's packages, follow this systematic approach:

## Phase 1: Structural Scan

1. **List all packages** and their directory structure
2. **Read every `package.json`** — check:
   - Version consistency across packages (must all match or follow a clear scheme)
   - `files` array vs. actual files (e.g., `LICENSE` listed but missing)
   - Dependencies that are declared but never imported in source code
   - `bin` entries pointing to correct files with `#!/usr/bin/env node`
   - `exports` / `main` pointing to correct entry files
   - `type: "module"` consistency (all packages should be ESM or CJS, not mixed)

## Phase 2: Source Code Review

3. **Read ALL source files** in every package — check:
   - Import paths: scoped vs. unscoped package names (e.g., `@piaman/piaman-nx` vs. `piaman-nx` — must match the published npm name)
   - Missing error handling (e.g., stream errors without `reject`, Promise never resolving)
   - Synchronous I/O in async contexts (`readFileSync` in request handlers)
   - Unnecessary operations (e.g., `parseBody()` on GET/HEAD requests)
   - Dead code or unused config values

## Phase 3: Template & Scaffold Consistency

4. **Read template/scaffold files** — check:
   - Import paths in generated files must match the actual npm package name (scoped or unscoped)
   - Duplicate registrations (routes registered both directly and via mounted router)
   - Config values exported but never consumed by the entry point
   - Missing files that every new project needs (`.gitignore`, `LICENSE`)
   - Hardcoded versions that won't auto-sync with releases
   - README commands matching npm conventions (`npm create @scope/name` → `@scope/create-name`)

## Phase 4: Test Verification

5. **Run all tests** (`node --test "packages/*/test/**/*.test.js"`) — check:
   - Any failing tests? Examine the failure message and root cause
   - Test assertions matching actual code behavior (e.g., checking `pkg.dependencies['foo']` when the key is `@scope/foo`)
   - Coverage gaps — are all exported functions tested?

## Phase 5: Cross-Reference Consistency

6. **Cross-reference across packages** — check:
   - CLI make/generate templates import paths → match published package name
   - Scaffolded project dependency names → match what the template imports
   - Version numbers across root + all packages → must be consistent
   - README instructions → match actual npm package names and `create` conventions
   - `files` array in package.json → files actually exist in the directory

## Categorize Findings

Organize findings into three tiers:
- **🔴 Critical**: Breaks functionality (failing tests, wrong imports, wrong npm commands)
- **🟡 Medium**: Incorrect but not immediately breaking (version mismatch, dead config, missing files, unnecessary deps)
- **🟢 Minor**: Code quality / performance (sync I/O, missing error handling, no .gitignore, hardcoded versions)

## Phase 6: Publish-Readiness Check (before `npm publish --workspaces`)

7. **Verify monorepo paths work standalone** — check:
   - Any `../../other-package/` relative paths in source code? These only exist inside the monorepo and **will fail** when the package is installed standalone via npm. Replace with `npx <bin-name>` calls or read from own `package.json`.
   - Scaffold/initializer code reading sibling package versions via `../../pkg/package.json`? Change to read from **own** `package.json` (`../package.json` relative to `src/`) — npm always includes `package.json` in published tarballs.
8. **Verify `.gitignore` won't be excluded** — npm silently excludes `.gitignore` files from published packages regardless of directory depth. For scaffold templates: name the file `gitignore` (no dot prefix) and `renameSync('gitignore', '.gitignore')` in the scaffolding code after copy.
9. **Verify no test-generated artifacts in template dirs** — Tests that write logs/output into `template/` subdirectories will leak those files into published packages. Clean them up before publishing and add the template's data dirs to `.gitignore`.
10. **Verify `package-lock.json` is fresh** — After removing dependencies or changing versions, run `npm install` to regenerate the lock file. Stale lock files cause npm to pack the wrong version.
11. **Verify version is unpublishable** — After unpublishing a version from npm, you **cannot** republish that same version for 72 hours. Bump to a new patch version (e.g., `1.0.0` → `1.0.1`) to publish immediately.
12. **Dry-run pack each package** — Run `npm pack --dry-run` from each package directory. Verify: version number matches intent, no stray files (test artifacts, temp dirs), all expected files present (LICENSE, README, template contents).

## Key Patterns to Watch

- **Scoped package import mismatch**: Most common in monorepos. CLI/generator templates often use the local package name (`piaman-nx`) instead of the published scoped name (`@piaman/piaman-nx`). Always verify what the `package.json` `"name"` field says.
- **npm create convention**: `npm create @scope/foo` → finds `@scope/create-foo`. `npm create bare-name` → finds `create-bare-name`. READMEs often get this wrong.
- **Version drift**: When bumping versions, some packages get missed. Always check all `package.json` version fields AND `package-lock.json`.
- **Template-import vs. installed-package mismatch**: The scaffolded project's `package.json` dependency name must exactly match what the template source files import from.
- **Monorepo-only path trap**: Any `../../sibling-package/` path breaks when published. CLI `init` commands should call `npx create-<name>` instead of `node ../../create-pkg/src/create.js`. Scaffolders reading versions should use own `package.json`, not sibling's.
- **npm `.gitignore` exclusion**: npm pack always excludes files named `.gitignore`. Use `gitignore` (no dot) in templates and rename after copy.
