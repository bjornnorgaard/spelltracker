You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Project-specific guidance (spelltracker)

These are repository-specific notes agents must follow when working on this project. Additions here are minimal and practical — do NOT change the project's style or conventions unless asked.

- Frameworks & versions: this project uses Svelte 5 and SvelteKit (see `package.json` for exact versions). The app is configured with the Vercel adapter in `svelte.config.js`.

- Local dev and build commands (use these exact npm scripts):

  - Start dev server: `npm run dev` (runs `vite dev --host`).
  - Build: `npm run build` (runs `vite build`).
  - Preview build: `npm run preview` (runs `vite preview`).
  - Typecheck / sync: `npm run check` (runs `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`). Always run `svelte-kit sync` after changing routing/layout files.
  - Tests: `npm run test` (runs `vitest`). UI test runner: `npm run test:ui`.

- Where to make UI/route changes:

  - Pages and routes live under `src/routes/` (e.g. `src/routes/+layout.svelte`, `src/routes/spells/+page.svelte`). Edit these for page-level changes.
  - Reusable components live under `src/lib/components/` (e.g. `CharacterCard.svelte`, `Section.svelte`). Prefer adding small components here.
  - App-wide stores are in `src/lib/stores/stores.ts`.
  - Types are under `src/lib/types/` (e.g. `spell.ts`, `character.ts`) — update these when changing data shapes.
  - Utilities and parsers are under `src/lib/utils/` (examples: `spell-import.ts`, `spell-csv-parser.ts`). Use these rather than duplicating logic.

- Conventions & notes:

  - TypeScript is used across the project; keep explicit types for public functions and store values where practical.
  - Routing follows SvelteKit file-based conventions — if you rename or add `+layout.ts` / `+page.svelte` files, run `svelte-kit sync` before type checks.
  - Small UI state is stored in Svelte stores (`src/lib/stores/stores.ts`) and consumed by components — prefer stores for cross-component state.

- Tests: unit tests live next to utilities as `*.test.ts` and run with Vitest. Run `npm run test` locally after changes; use `npm run test:run` for CI-style runs.

- Svelte MCP tool rules (repository reinforcement):

  - ALWAYS call `list-sections` first for Svelte or SvelteKit questions and then `get-documentation` for any helpful sections (follow the tool use order already documented above).
  - ALWAYS run `svelte-autofixer` on any Svelte files you author or edit and iterate until it reports no issues. This project uses Svelte 5 syntax — let the autofixer handle syntax/format corrections before creating a patch.

- Example file references (use these in task descriptions and PRs when relevant):

  - `svelte.config.js` — shows adapter (Vercel)
  - `package.json` — shows dev scripts and core dependencies
  - `src/routes/` — top-level routing and pages
  - `src/lib/components/` — UI components (e.g. `CharacterCard.svelte`, `Section.svelte`)
  - `src/lib/stores/stores.ts` — global stores
  - `src/lib/utils/spell-import.ts` — import/parsing logic used by the CSV import page

Follow the above and keep changes minimal and targeted to the files/directories named. When in doubt, reference the exact filename in your edits or PR description so reviewers can validate quickly.

