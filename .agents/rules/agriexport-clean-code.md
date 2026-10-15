# Permanent AgriExport Connect Engineering & Clean Code Rules

All modifications to this codebase must adhere strictly to these 9 core rules:

1. **In-Place Modification Only**: When changing a feature, MODIFY the existing function or file in place. Never create a second version (no "New", "V2", "Copy", "Old", "Temp", "Backup" names).
2. **Atomic Replacements**: When replacing a method, delete the old method and update every caller in the same change. Never leave unused code, commented-out code, or unused imports.
3. **Reuse First**: Before adding any helper, component, constant, endpoint, or file, search the project for an existing one and reuse or extend it. No duplicate logic.
4. **Lean Footprint**: Do not create extra files, folders, scripts, or documentation unless explicitly required. Prefer editing existing files.
5. **Single Source of Truth**: Keep one source of truth for each domain: API client (`src/services/api.js`), constants and enums (`src/data/crop_attributes.json`), validation rules, formatters, and crop attributes.
6. **Zero-Trust Backend Security**: Every backend route must have role and ownership checks, input validation, and parameterized SQL queries. No exceptions.
7. **No Secrets or Dummy Data in Code**: No secrets, API keys, or database passwords in source code. All configuration must be environment-variable driven. No `console.log` in production paths. No dummy/mock fallback data in production code.
8. **Verification Discipline**: After each change, run lint, build, and tests, then report: files changed, what was removed, what was reused, and how it was tested.
9. **Architectural Integrity**: If a user request would create duplication or break these rules, highlight the risk and implement the clean, standardized approach instead of a quick hack.
