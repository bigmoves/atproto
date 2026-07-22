# OAuth Authorize Step-URL Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the current authorization-flow step in the URL hash fragment so a page refresh restores the user to the same screen.

**Architecture:** A pure hash-parsing helper (`src/lib/location-step.ts`) plus wiring in the impure `AuthenticationProvider` layer: seed the initial view from the hash, sync the hash on view changes via `history.replaceState` (no history entries — the flow deliberately has no router). The reset-password sub-step is lifted via new pure props on `ResetPasswordView`. No backend changes.

**Tech Stack:** React 19 (`@atproto/oauth-provider-ui`), vitest (new adoption in this package), jest + puppeteer (existing e2e in `packages/pds`).

**Spec:** `docs/superpowers/specs/2026-07-22-oauth-authorize-step-url-design.md`

## Global Constraints

- Work on branch `oauth-authorize-step-url` (already exists, spec committed).
- No new dependencies except `vitest` devDependency (required by the repo's testing skill for packages adopting tests).
- ESM only; TypeScript builds use `tsgo` (`pnpm exec tsgo --build tsconfig.json`), never `tsc`.
- Run per-package commands **from inside the package directory**.
- In `oauth-provider-ui`, imports use the `#/*` alias and explicit `.ts`/`.tsx` extensions (e.g. `#/lib/util.ts`).
- `src/components/*` in `oauth-provider-ui` must stay pure (props-driven, no window/history access). Hash access is only allowed in `src/contexts/*` and top-level `src/*-page.tsx`.
- After editing any `.tsx` in `oauth-provider-ui`, run `pnpm i18n` from that package dir. No new user-facing strings are introduced by this plan, so no French translations should be needed — verify the `.po` diff only shifts line references.
- Step slugs (exact): `welcome`, `sign-in`, `sign-up`, `reset-password`, `reset-password-confirm`, `consent`. Hash format: `#step=<slug>`.
- E-mail addresses must never appear in the URL.

---

### Task 1: Vitest adoption + `location-step.ts` helper (TDD)

**Files:**
- Modify: `packages/oauth/oauth-provider-ui/package.json`
- Create: `packages/oauth/oauth-provider-ui/vitest.config.ts`
- Create: `packages/oauth/oauth-provider-ui/tsconfig.test.json`
- Modify: `packages/oauth/oauth-provider-ui/tsconfig.json`
- Modify: `packages/oauth/oauth-provider-ui/tsconfig.build.json`
- Modify: `vitest.config.ts` (repo root)
- Create: `packages/oauth/oauth-provider-ui/src/lib/location-step.test.ts`
- Create: `packages/oauth/oauth-provider-ui/src/lib/location-step.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (used by Task 3):
  - `type AuthStep = 'welcome' | 'sign-in' | 'sign-up' | 'reset-password' | 'reset-password-confirm' | 'consent'`
  - `isAuthStep(value: unknown): value is AuthStep`
  - `parseStepHash(hash: string): AuthStep | undefined` (pure)
  - `formatStepHash(step: AuthStep): string` (pure)
  - `readLocationStep(): AuthStep | undefined` (reads `window.location.hash`)
  - `syncLocationStep(step: AuthStep): void` (calls `history.replaceState`, preserves pathname/search/state, no-op when the hash already matches)

- [ ] **Step 1: Add vitest to the package**

In `packages/oauth/oauth-provider-ui/package.json`:

Add to `devDependencies` (keep alphabetical position among existing entries):

```json
    "vitest": "^4.0.16"
```

Add to `scripts`:

```json
    "test": "vitest run"
```

- [ ] **Step 2: Create `packages/oauth/oauth-provider-ui/vitest.config.ts`**

```ts
import { defineProject } from 'vitest/config'

export default defineProject({
  test: {},
})
```

- [ ] **Step 3: Create `packages/oauth/oauth-provider-ui/tsconfig.test.json`**

Note the three-level `../../../` (this package is nested one level deeper than e.g. `packages/syntax`):

```json
{
  "extends": ["../../../tsconfig/vitest.tsconfig.json"],
  "include": ["./src/**/*.test.ts"],
  "compilerOptions": {
    "rootDir": "./",
  },
  "references": [{ "path": "./tsconfig.build.json" }],
}
```

- [ ] **Step 4: Register the test config in `packages/oauth/oauth-provider-ui/tsconfig.json`**

```json
{
  "include": [],
  "compilerOptions": {
    // Needed by Zed's eslint extension
    "paths": { "#/*": ["./src/*"] },
  },
  "references": [
    { "path": "./tsconfig.build.json" },
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.test.json" },
  ],
}
```

- [ ] **Step 5: Exclude test files from the build config**

In `packages/oauth/oauth-provider-ui/tsconfig.build.json`, add after the `include` line (matching `packages/syntax/tsconfig.build.json` convention):

```json
  "exclude": ["**/*.test.ts"],
```

- [ ] **Step 6: Register the package in the root `vitest.config.ts` projects list**

In the repo-root `vitest.config.ts`, add to `test.projects` (alphabetical, after `'packages/oauth/oauth-client'`):

```ts
      'packages/oauth/oauth-provider-ui',
```

- [ ] **Step 7: Install**

Run from repo root: `pnpm install`
Expected: succeeds; lockfile updated with vitest linked to the package (hoisted version already present).

- [ ] **Step 8: Write the failing test**

Create `packages/oauth/oauth-provider-ui/src/lib/location-step.test.ts`:

```ts
import { describe, expect, it, test } from 'vitest'
import {
  AUTH_STEPS,
  formatStepHash,
  isAuthStep,
  parseStepHash,
} from './location-step.ts'

describe(isAuthStep, () => {
  test.each([
    { value: 'welcome', expected: true },
    { value: 'sign-in', expected: true },
    { value: 'sign-up', expected: true },
    { value: 'reset-password', expected: true },
    { value: 'reset-password-confirm', expected: true },
    { value: 'consent', expected: true },
    { value: 'bogus', expected: false },
    { value: 'Sign-In', expected: false },
    { value: '', expected: false },
    { value: undefined, expected: false },
    { value: null, expected: false },
  ])('$value', ({ value, expected }) => {
    expect(isAuthStep(value)).toBe(expected)
  })
})

describe(parseStepHash, () => {
  describe('invalid inputs', () => {
    test.each([
      { hash: '' },
      { hash: '#' },
      { hash: '#step=' },
      { hash: '#step=bogus' },
      { hash: '#step=Sign-In' },
      { hash: '#other=sign-in' },
      { hash: 'step=sign-in' },
      { hash: '#step=sign-in&extra=1' },
    ])('$hash', ({ hash }) => {
      expect(parseStepHash(hash)).toBeUndefined()
    })
  })
})

describe('roundtrip formatStepHash <-> parseStepHash', () => {
  test.each(AUTH_STEPS.map((step) => ({ step })))('$step', ({ step }) => {
    expect(parseStepHash(formatStepHash(step))).toBe(step)
  })
})
```

- [ ] **Step 9: Run test to verify it fails**

Run from `packages/oauth/oauth-provider-ui`: `pnpm test`
Expected: FAIL — cannot resolve `./location-step.ts` (module does not exist).

- [ ] **Step 10: Write the implementation**

Create `packages/oauth/oauth-provider-ui/src/lib/location-step.ts`:

```ts
/**
 * The authorization flow deliberately does not use a router (view changes
 * must not create browser history entries). To still allow refreshing the
 * page without losing one's place in the flow, the current step is
 * reflected in the URL fragment (`#step=<slug>`) using
 * `history.replaceState`, and read back on page load.
 */

export const AUTH_STEPS = [
  'welcome',
  'sign-in',
  'sign-up',
  'reset-password',
  'reset-password-confirm',
  'consent',
] as const

export type AuthStep = (typeof AUTH_STEPS)[number]

const STEP_HASH_PREFIX = '#step='

export function isAuthStep(value: unknown): value is AuthStep {
  return (AUTH_STEPS as readonly unknown[]).includes(value)
}

export function parseStepHash(hash: string): AuthStep | undefined {
  if (!hash.startsWith(STEP_HASH_PREFIX)) return undefined
  const value = hash.slice(STEP_HASH_PREFIX.length)
  return isAuthStep(value) ? value : undefined
}

export function formatStepHash(step: AuthStep): string {
  return `${STEP_HASH_PREFIX}${step}`
}

export function readLocationStep(): AuthStep | undefined {
  return parseStepHash(window.location.hash)
}

export function syncLocationStep(step: AuthStep): void {
  const hash = formatStepHash(step)
  if (window.location.hash === hash) return
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + window.location.search + hash,
  )
}
```

- [ ] **Step 11: Run test to verify it passes**

Run from `packages/oauth/oauth-provider-ui`: `pnpm test`
Expected: PASS (all cases).

- [ ] **Step 12: Type-check**

Run from `packages/oauth/oauth-provider-ui`: `pnpm exec tsgo --build tsconfig.json`
Expected: no errors.

- [ ] **Step 13: Format, lint, commit**

From `packages/oauth/oauth-provider-ui`:

```bash
pnpm exec prettier --write src/lib/location-step.ts src/lib/location-step.test.ts vitest.config.ts tsconfig.test.json tsconfig.json tsconfig.build.json package.json
pnpm exec eslint --fix src/lib/location-step.ts src/lib/location-step.test.ts
```

Then from repo root:

```bash
git add packages/oauth/oauth-provider-ui vitest.config.ts pnpm-lock.yaml
git commit -m "Add step-hash helper and vitest setup to oauth-provider-ui"
```

---

### Task 2: Failing e2e test — refresh mid reset-password

**Files:**
- Modify: `packages/pds/tests/_puppeteer.ts` (add `reload()`)
- Modify: `packages/pds/tests/oauth.test.ts` (new test after `'allows resetting the password'`, currently ending line ~187)

**Interfaces:**
- Consumes: nothing from Task 1 (different package; drives the UI through a browser).
- Produces: `PageHelper.reload(): Promise<void>`; jest test `'restores the reset-password step after a page refresh'` — the acceptance test Task 3 must turn green.

Note: this is a UI test. The exact French strings below are already proven by the existing green test `'allows resetting the password'` in the same file — they were captured from the running app. Do not invent new strings; if any assertion needs a string not present in the existing file, STOP and walk the flow first via the playwright skill (`.claude/skills/playwright/SKILL.md`).

- [ ] **Step 1: Add `reload()` to `PageHelper`**

In `packages/pds/tests/_puppeteer.ts`, after the `goto` method (line ~15):

```ts
  async reload() {
    await this.page.reload()
  }
```

- [ ] **Step 2: Add the failing test**

In `packages/pds/tests/oauth.test.ts`, insert immediately after the `'allows resetting the password'` test (after its closing `})`, line ~187):

```ts
  it('restores the reset-password step after a page refresh', async () => {
    const sendTemplateMock = jest
      .spyOn(network.pds.ctx.mailer, 'sendResetPassword')
      .mockImplementation(async () => {
        // noop
      })

    await using page = await PageHelper.from(browser, { languages })

    await page.goto(appUrl)

    await page.assertTitle('OAuth Client Example')

    const input = await page.typeInInput('identifier', 'alice.test')

    await page.navigationAction(async () => input.press('Enter'))

    await page.assertTitle('Connexion')

    await page.clickOnText('Oublié ?')

    await page.assertTitle('Mot de passe oublié')

    await page.typeInInput('email', 'alice@test.com')

    await page.clickOnText('Suivant')

    await page.assertTitle('Réinitialiser le mot de passe')

    // Refreshing the page must bring the user back to the "confirm" step
    // (the reset code was already emailed), not the initial sign-in view.
    await page.reload()

    await page.assertTitle('Réinitialiser le mot de passe')

    const [params] = sendTemplateMock.mock.lastCall!

    await page.typeInInput('code', params.token)

    // Keep the same password as the previous test so later tests
    // (which sign in with 'alice-new-pass') are unaffected.
    await page.typeInInput('password', 'alice-new-pass')

    await page.clickOnText('Suivant')

    await page.assertTitle('Mot de passe mis à jour')

    sendTemplateMock.mockRestore()
  })
```

- [ ] **Step 3: Ensure current UI assets are built**

The pds e2e serves the oauth-provider-ui bundle from `dist/`. Build the current (pre-change) code — from repo root:

```bash
pnpm build --force
```

Expected: build succeeds.

- [ ] **Step 4: Run the test to verify it fails for the right reason**

From `packages/pds`:

```bash
pnpm test -- tests/oauth.test.ts -t 'restores the reset-password step'
```

Expected: FAIL at the post-reload `assertTitle('Réinitialiser le mot de passe')` — received title `'Connexion'` (the flow reset to sign-in). If it fails anywhere *before* the `reload()` call, the test transcription is wrong — fix that first (strings must match the existing passing test).

- [ ] **Step 5: Commit**

From repo root:

```bash
git add packages/pds/tests/_puppeteer.ts packages/pds/tests/oauth.test.ts
git commit -m "Add failing e2e test: reset-password step survives refresh"
```

---

### Task 3: Wire step restore into the authorization flow

**Files:**
- Modify: `packages/oauth/oauth-provider-ui/src/components/reset-password-view.tsx`
- Modify: `packages/oauth/oauth-provider-ui/src/contexts/authentication.tsx`
- Modify: `packages/oauth/oauth-provider-ui/src/authorization-page.tsx`
- Modify (generated): `packages/oauth/oauth-provider-ui/src/locales/*` via `pnpm i18n`

**Interfaces:**
- Consumes (from Task 1, all from `#/lib/location-step.ts`): `type AuthStep`, `readLocationStep()`, `syncLocationStep(step)`.
- Produces: new optional props on `ResetPasswordView`: `initialView?: 'request' | 'confirm'` and `onViewChange?: (view: 'request' | 'confirm') => void`. Behavior verified by Task 2's e2e test.

- [ ] **Step 1: Add sub-step props to `ResetPasswordView` (pure component — no window access)**

In `packages/oauth/oauth-provider-ui/src/components/reset-password-view.tsx`:

Extend the props type:

```ts
export type ResetPasswordViewProps = {
  emailDefault?: string
  /**
   * Sub-step to start on. Allows restoring the "confirm" step (the reset
   * code was already emailed) after a page refresh.
   */
  initialView?: 'request' | 'confirm'
  /**
   * Reports sub-step changes so the parent can reflect them (e.g. in the
   * URL). The transient "password updated" screen is reported as
   * 'request'.
   */
  onViewChange?: (view: 'request' | 'confirm') => void
  onResetPasswordRequest: (data: { email: string }) => void | PromiseLike<void>
  onResetPasswordConfirm: (data: {
    token: string
    password: string
  }) => void | PromiseLike<void>
  onBack?: () => void
}
```

Replace the component's opening (destructuring + state) — currently:

```ts
export function ResetPasswordView({
  emailDefault,
  onResetPasswordRequest,
  onResetPasswordConfirm,
  onBack,
}: ResetPasswordViewProps) {
  const { t } = useLingui()
  const [view, setView] = useState<View>(View.RequestReset)
  const [email, setEmail] = useState(emailDefault)
```

with:

```ts
export function ResetPasswordView({
  emailDefault,
  initialView,
  onViewChange,
  onResetPasswordRequest,
  onResetPasswordConfirm,
  onBack,
}: ResetPasswordViewProps) {
  const { t } = useLingui()
  const [view, setViewState] = useState<View>(
    initialView === 'confirm' ? View.ConfirmReset : View.RequestReset,
  )
  const [email, setEmail] = useState(emailDefault)

  const setView = (next: View) => {
    setViewState(next)
    onViewChange?.(next === View.ConfirmReset ? 'confirm' : 'request')
  }
```

All existing `setView(...)` call sites in the file remain unchanged (they now go through the wrapper).

- [ ] **Step 2: Seed and sync the step in `AuthenticationProvider`**

In `packages/oauth/oauth-provider-ui/src/contexts/authentication.tsx`:

Add to the imports:

```ts
import {
  type AuthStep,
  readLocationStep,
  syncLocationStep,
} from '#/lib/location-step.ts'
```

Add module-level mapping helpers directly after the `View` enum declaration:

```ts
function viewFromStep(step: AuthStep): View | undefined {
  switch (step) {
    case 'welcome':
      return View.Welcome
    case 'sign-in':
      return View.SignIn
    case 'sign-up':
      return View.SignUp
    case 'reset-password':
    case 'reset-password-confirm':
      return View.ResetPassword
    case 'consent':
      // The consent view is derived from the session state (which
      // survives refresh through cookies); nothing to restore here.
      return undefined
  }
}

function stepFromView(view: View): AuthStep {
  switch (view) {
    case View.Welcome:
      return 'welcome'
    case View.SignIn:
      return 'sign-in'
    case View.SignUp:
      return 'sign-up'
    case View.ResetPassword:
      return 'reset-password'
    case View.Authenticated:
      return 'consent'
  }
}
```

Replace the current view-state initialization —

```ts
  const [view, setView] = useState<View>(() => {
    if (promptMode === 'create' && canSignUp) {
      return View.SignUp
    }

    return homeView
  })
```

— with (placed directly after the `homeView` computation):

```ts
  // Step restored from the URL fragment (if any), read once at mount.
  // Allows refreshing the page without being sent back to the initial
  // view.
  const [initialStep] = useState(readLocationStep)

  const [view, setView] = useState<View>(() => {
    // A step in the URL means the user was already navigating the flow
    // before a refresh; restore it in preference to the prompt default.
    const initialView = initialStep ? viewFromStep(initialStep) : undefined
    if (initialView != null) return initialView

    if (promptMode === 'create' && canSignUp) {
      return View.SignUp
    }

    return homeView
  })

  const [resetPasswordConfirm, setResetPasswordConfirm] = useState(
    initialStep === 'reset-password-confirm',
  )

  // Reflect the current step in the URL fragment so that refreshing the
  // page restores the user to the same place. replaceState is used so
  // that view changes never create browser history entries.
  useEffect(() => {
    syncLocationStep(
      view === View.ResetPassword && resetPasswordConfirm
        ? 'reset-password-confirm'
        : stepFromView(view),
    )
  }, [view, resetPasswordConfirm])
```

Wire the new props into the `<ResetPasswordView>` render:

```tsx
    if (view === View.ResetPassword) {
      return (
        <ResetPasswordView
          emailDefault={resetPasswordHint}
          initialView={resetPasswordConfirm ? 'confirm' : 'request'}
          onViewChange={(v) => setResetPasswordConfirm(v === 'confirm')}
          onResetPasswordRequest={async (data) => {
            await api.initiatePasswordReset(data)
          }}
          onResetPasswordConfirm={async (data) => {
            await api.confirmResetPassword(data)
          }}
          onBack={showSignIn}
        />
      )
    }
```

And reset the sub-step on (re-)entry — the `onForgotPassword` handler in the `<SignInView>` render becomes:

```tsx
        onForgotPassword={(email) => {
          setResetPasswordConfirm(false)
          setView(View.ResetPassword)
          setResetPasswordHint(email)
        }}
```

- [ ] **Step 3: Preserve the hash in the `authorization-page.tsx` URL shim**

In `packages/oauth/oauth-provider-ui/src/authorization-page.tsx`, the existing shim rebuilds the URL without the fragment. Change:

```ts
  window.history.replaceState(history.state, '', url.pathname + url.search)
```

to:

```ts
  window.history.replaceState(
    history.state,
    '',
    url.pathname + url.search + url.hash,
  )
```

(`url` is constructed from `window.location.href`, so `url.hash` carries the current fragment.)

- [ ] **Step 4: Type-check and unit tests**

From `packages/oauth/oauth-provider-ui`:

```bash
pnpm exec tsgo --build tsconfig.json
pnpm test
```

Expected: no type errors; unit tests PASS. (The exhaustive `switch` statements in `viewFromStep`/`stepFromView` have no `default` on purpose — a missing case is a type error.)

- [ ] **Step 5: Regenerate i18n catalogs**

From `packages/oauth/oauth-provider-ui`:

```bash
pnpm i18n
git diff --stat src/locales
```

Expected: only line-reference shifts in `.po` files; **no new `msgid` entries** (this change adds no user-facing strings). If a new empty `msgstr` appears in `src/locales/fr/messages.po`, translate it to French and re-run `pnpm i18n`.

- [ ] **Step 6: Format and lint changed files**

From `packages/oauth/oauth-provider-ui`:

```bash
pnpm exec prettier --write src/contexts/authentication.tsx src/components/reset-password-view.tsx src/authorization-page.tsx
pnpm exec eslint --fix src/contexts/authentication.tsx src/components/reset-password-view.tsx src/authorization-page.tsx
```

- [ ] **Step 7: Commit**

From repo root:

```bash
git add packages/oauth/oauth-provider-ui
git commit -m "Restore OAuth authorize flow step from URL fragment on refresh"
```

---

### Task 4: Rebuild, e2e verification, full check

**Files:**
- No new files; runs builds and tests.

**Interfaces:**
- Consumes: Task 2's e2e test, Task 3's implementation.
- Produces: green suite; branch ready for review.

- [ ] **Step 1: Rebuild so the pds e2e picks up the new UI bundle**

From repo root:

```bash
pnpm build --force
```

Expected: succeeds (includes the oauth-provider-ui Vite bundle).

- [ ] **Step 2: Run the new e2e test — must now pass**

From `packages/pds`:

```bash
pnpm test -- tests/oauth.test.ts -t 'restores the reset-password step'
```

Expected: PASS. If docker infra is stale: `cd packages/dev-infra && docker compose down --volumes`, retry.

- [ ] **Step 3: Run the full oauth e2e suite (regression check on all flows)**

From `packages/pds`:

```bash
pnpm test -- tests/oauth.test.ts
```

Expected: all tests PASS — in particular `'Allows to sign-up through OAuth'` (prompt=create still lands on sign-up) and `'allows resetting the password'` (unchanged flow).

- [ ] **Step 4: Repo-wide sanity**

From repo root:

```bash
pnpm verify
```

Expected: style + lint pass.

From `packages/oauth/oauth-provider-ui`:

```bash
pnpm test
```

Expected: unit tests PASS.

- [ ] **Step 5: Commit any remaining artifacts**

```bash
git status
```

If clean, done. If build/codegen artifacts that belong in git changed (e.g. `.po` line refs missed earlier), add and commit:

```bash
git add -A
git commit -m "Rebuild artifacts for step-URL restore"
```
