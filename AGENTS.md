# Repository Agent Instructions

These guidelines apply to all work in this repository and focus on maintaining high-quality Next.js and TypeScript code.

## Next.js best practices
- Prefer the App Router patterns (layouts, server components by default) and only use Client Components when interactivity is required; include the `"use client"` directive at the top of client files.
- Use `next/link` for internal navigation and `next/image` for images when possible, configuring `alt` text and sizes explicitly.
- Co-locate route-specific logic inside the relevant route folder and keep shared UI in `src/components`.
- Avoid direct `fetch` calls in Client Components unless necessary; favor server-side data fetching or server actions.
- Keep metadata definitions in `metadata` exports rather than manually manipulating `<Head>`.

## TypeScript best practices
- Avoid `any` and prefer precise types; add explicit return types for exported functions and components.
- Prefer `type` aliases for props and data models; use interfaces only when necessary for declaration merging.
- Enable strict null checks in logic: narrow possible `undefined` or `null` cases before use.
- Favor immutable patterns (using `const` and non-mutating array helpers) and avoid object mutation where practical.

## Testing and tooling
- Ensure linting (`npm run lint`) and relevant tests pass before concluding work.
- Keep imports ordered: built-ins, external deps, then internal modules; remove unused imports.

## Documentation expectations
- Update or add docstrings/comments when introducing new behaviors or non-obvious decisions.
- When creating new routes or components, include brief inline comments if the flow or data shape is non-trivial.
