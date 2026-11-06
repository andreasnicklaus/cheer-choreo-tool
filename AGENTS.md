# Agents instructions

<!-- sloplint:start -->

## sloplint

- Check: before you finish, `npm run lint:sloplint` must report 0/100. Fix every finding.
- `npm run lint:sloplint -- explain <RULE>` gives the reasoning and a worked example.
- Pages never scroll sideways at 375px: wrap navigation, stack rows, and stack wide tables into cards or put them in a `position: relative; overflow-x: auto` wrapper.

### UI/UX & Motion

- **UI-001** Purple/indigo gradient or glow used as the default accent. Pick one brand hue from DESIGN.md and use it flat.
- **UI-002** Symmetrical 3-column grid of icon-badge feature cards. Rank the features.
- **UI-003** Muted gray subtitle under nearly every heading. Write headings that stand alone.
- **UI-004** Box-in-box border soup. Keep one border at the outermost surface.
- **UI-005** Numbers in tables or stats render with proportional digits. Add `font-variant-numeric: tabular-nums` (Tailwind `tabular-nums`) to tables, stat values, prices and any number that updates.
- **UI-006** Nested border radius is not concentric. Inner radius = outer radius − padding − border width, clamped at 0.
- **UI-007** Transition on every property. Name what moves: `transition: opacity 150ms ease-out, transform 150ms ease-out`, or Tailwind `transition-colors` / `transition-transform`.
- **UI-008** Spinner swaps out content and shifts layout. Keep the box: overlay the spinner on the existing label (`absolute` + `invisible` text), or render a skeleton with the final dimensions.
- **UI-009** Gradient-filled headline text. Set headlines in solid text color.
- **UI-010** Form shows success without sending anything. Send the data first (fetch to a real endpoint, a server action, or the form's own action) and show success only after a successful response.
- **UI-011** Color outside the DESIGN.md palette. Use the token (`var(--accent)`, or `bg-accent` once the Tailwind theme maps it).
- **UI-012** Typeface outside the DESIGN.md type system. Use the DESIGN.md faces through their tokens (`font-family: var(--font-text)`).
- **UI-013** Link that goes nowhere. Link to the real page, or leave the link out until the page exists.
- **UI-014** Grid cannot fit a 375px screen. Collapse the grid on small screens: `grid-template-columns: minmax(0, 1fr)` below 768px (Tailwind `grid-cols-1 md:grid-cols-12`), or let it wrap with `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))`.
- **UI-015** Table pushes a 375px page sideways. Below 600px, stack each row into a card (`display: block` on `tr` and `td`, with the column name as a label), or put the table in a `position: relative; overflow-x: auto` wrapper with a visible edge.

### Security

- **SEC-001** Secret falls back to a hard-coded value. Read secrets once at boot and crash if they are missing.
- **SEC-002** CORS allows every origin. Allow an explicit list of origins from configuration, and only enable credentials for those origins.
- **SEC-003** SQL assembled from interpolated strings. Use placeholders (`$1`, `?`, `%s` with a params tuple) or a tagged template from your driver.
- **SEC-004** Raw request input interpolated into an LLM prompt. Validate input with a schema (type, length, allowed values) first.
- **SEC-005** Authentication decided in the browser. Check the session on the server (middleware, server component, route handler) and return 401/403 there.
- **SEC-006** Webhook handler never verifies the signature. Verify the provider signature against the raw body with a timing-safe compare (Stripe `constructEvent`, Svix `verify`, HMAC + `timingSafeEqual`) before parsing JSON.
- **SEC-007** Interpolated values written as raw HTML. Render text with `textContent` / framework bindings.

### Backend & Architecture

- **BE-001** Error caught, logged and discarded. Handle the error (retry, fallback with a visible state, typed error response) or let it propagate.
- **BE-002** Database query inside a loop (N+1). Fetch in one query (`where: { id: { in: ids } }`, a JOIN, `select_related`/`prefetch_related`) and map results in memory.
- **BE-003** Outbound HTTP call without a timeout. Bound every call: `fetch(url, { signal: AbortSignal.timeout(10_000) })`, axios `{ timeout }`, requests `timeout=10`.
- **BE-004** Mutation route that is unsafe to retry. Never mutate in GET.
- **BE-005** Stub, mock data or elided code in a production path. Implement it, or delete the path and the UI that reaches it.
- **BE-006** Abstraction with exactly one implementation. Use the concrete class.

### UX Writing

- **COPY-001** LLM marketing filler in user-facing copy. Replace the adjective with the fact behind it: a number, a named integration, a time saved, a thing the user can now do.
- **COPY-002** Error message with no cause and no next step. Say what failed, why if known, and what to do now: "Card declined by your bank.
- **COPY-003** Button or link label does not name the action. Use verb + object: "Create invoice", "Save changes", "Download report (PDF)".
- **COPY-004** Template placeholder content shipped as real copy. Use realistic, specific content from your domain: real names, real product screenshots, no random avatars.
- **COPY-005** Social proof or performance claim with no source. Use a real figure with its source (a footnote, a link, the date it was measured) or render it from data.
- **COPY-006** Emoji used as decoration in headings, buttons, links and badges. Delete the emoji.

### Testing & DX

- **TEST-001** Test asserts only mocks, constants, or nothing. Assert on observable outcomes: return values, persisted state, rendered text, HTTP responses.
- **TEST-002** Fixed sleep in a test. Wait for the condition: fake timers (`vi.useFakeTimers`), `await expect.poll(...)`, Testing Library `findBy*`/`waitFor`, Playwright web-first assertions.
- **TEST-003** Emoji-decorated README headings and bullets. Plain headings.
- **TEST-004** Focused or skipped test committed. Remove `.only` before committing.
<!-- sloplint:end -->
