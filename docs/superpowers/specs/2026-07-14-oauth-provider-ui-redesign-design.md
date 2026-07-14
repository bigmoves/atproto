# oauth-provider-ui redesign

## Summary

Bring a new visual design (dark, Google-account-picker-inspired for the pre-auth flow; light, sidebar-nav app for the logged-in account manager) into `packages/oauth/oauth-provider-ui`, built as a parallel component tree gated by an in-code flag, organized using Atomic Design. The source of truth for the new look is a Claude-Design interactive prototype (`PDS Prototype.dc.html`) supplied by the user, covering: sign-in (picker + credentials), sign-up, consent, redirecting, error screens, and the account app (home/manage/devices/apps/about).

## Goals

- Full scope: both the pre-auth flow (sign-in/up/consent/redirecting/errors) and the authenticated Account app.
- Preserve today's behavior that isn't about visuals: light/dark mode follows `prefers-color-scheme` on every screen (no forced-dark, unlike the prototype), and per-client branding color injection (`--branding-color-primary` etc.) keeps working.
- Ship as a parallel build behind a flag so the existing UI is unaffected until the new tree is ready and the flag is flipped.
- Fit the existing architectural conventions in `packages/oauth/oauth-provider-ui/CLAUDE.md`: pure-component layering, `SmartForm`, Lingui i18n, design-token-driven Tailwind classes (no raw colors).

## Non-goals

- No changes to the OAuth provider's server-side logic, endpoints, or `Api` client.
- No changes to the branding/customization data model — the new UI consumes the same `--branding-color-*` variables, just restyled.
- No new npm dependencies (in particular, the prototype's Inter Google Font is dropped in favor of the existing font stack — this repo avoids new dependencies without strong justification).
- No deletion of the existing (v1) component tree in this pass — that's a follow-up once the flag is flipped and the new UI is validated.
- No runtime/query-param/env-var flag infrastructure — the flag is a plain in-code constant.

## Architecture

### Flag

A single constant, `NEW_DESIGN_ENABLED`, exported from a new `src/lib/feature-flags.ts`, defaulting to `false`. It is read **only** at the pages layer (`src/authorization-page.tsx`, `src/account-page.tsx`, and the route files under `src/pages/account/**`) — the layer that already owns translating context/API state into props for pure components. Each of those call sites branches between rendering the existing `*-view.tsx` (v1) or the new `screens/*` component (v2, described below). Flipping the constant is the entire cutover.

`src/contexts/`, `src/data/`, `src/hooks/`, and `src/lib/` (all business logic, no visual code) are shared unchanged between v1 and v2.

### Component tree (`src/components-v2/`)

Organized using Atomic Design, mirroring — at a coarser grain — this package's existing low-level/high-level/pages layering:

```
src/components-v2/
  atoms/       button, input-text, checkbox, badge, avatar-initials, spinner, icon wrappers…
  molecules/   form-field, account-row (avatar+name+email), nav-item, device-row, app-row,
               permission-row, password-strength-meter
  organisms/   sign-in-picker, sign-in-form, sign-up-form, consent-form, sidebar-nav,
               confirm-dialog, devices-list, apps-list, settings-list, toast
  templates/   auth-card (two-column dark/light card shell used by sign-in/up/consent/redirecting),
               account-app (header + sidebar + main content shell)
  screens/     sign-in-view, sign-up-view, consent-view, error-view, redirecting-view,
               account-home, account-manage, account-devices, account-apps, account-about
```

`screens/` corresponds to Atomic Design's "pages" tier, renamed to avoid colliding with this repo's existing `src/pages/` (the route/context-reading layer, which is unchanged — see Flag section). `templates/` corresponds to today's `layouts/*`; `atoms/` corresponds to today's `forms/*` + `utils/*` primitives; `organisms/` is the v2 equivalent of today's `*-form.tsx` / `*-picker.tsx` / dialog components.

Each `screens/*` component is pure (props in, callbacks out) exactly like today's `*-view.tsx`, so the pages layer wires it up the same way regardless of which version it renders.

### Modals

The six edit/confirm dialogs (verify email, update email, update handle, update password, deactivate, delete) collapse into one `organisms/confirm-dialog` driven by title/body/confirm-label/confirm-color props, mirroring the prototype's single `MODAL_COPY`-table-driven modal, rather than porting six separate dialog components 1:1.

## Design tokens

New tokens added to `src/style.css`'s `@theme` block (additive — nothing existing is renamed or removed):

- `--radius-card: 28px` — the large auth-card / account-app panel corners.
- `--radius-panel: 16px` — settings-list / device-row / app-row card corners.
- `--radius-control: 6px` — text inputs.
- `--radius-pill: 999px` — primary CTA buttons (Next, Authorize, Sign up).
- `--shadow-card` — the elevated drop shadow under the auth card.

Colors continue to come from the existing `--color-contrast-*` scale (which already auto-inverts for dark mode) and `--color-primary-*` (branding-injected) — no new color tokens. Typography keeps the existing font stack.

## Screen inventory

| Screen | New organism(s) | Template |
|---|---|---|
| Sign-in picker | `sign-in-picker` | `auth-card` (two-column: heading left, content right) |
| Sign-in credentials | `sign-in-form` | `auth-card` |
| Sign-up | `sign-up-form` | `auth-card` |
| Consent | `consent-form` | `auth-card`, header swapped for client icon/name |
| Redirecting | `redirecting` | `auth-card` narrow variant |
| Error / cookie-disabled | `error-panel` | own card template (not `auth-card` — no two-column split) |
| Account app shell | `sidebar-nav` | `account-app` (header + sidebar + main) |
| Home | `account-home` content | `account-app` |
| Manage | `settings-list` (+ email-verified banner) | `account-app` |
| Devices | `devices-list` | `account-app` |
| Apps | `apps-list` | `account-app` |
| About | static content | `account-app` |
| Edit/confirm actions | `confirm-dialog` (shared) | — |
| Toast | `toast` atom | — |

## i18n

New `screens/`/`organisms/`/`molecules/` components use the same Lingui macros (`<Trans>`, `msg`) as v1. `pnpm i18n` (run from the package directory after edits) picks up new files automatically. Per the package's existing convention, only the French (`fr`) catalog gets hand-filled after extraction; other locales stay untouched until translated externally.

## Testing

- Type-check via `pnpm exec tsgo --build tsconfig.json` from the package directory.
- Visual verification: flip `NEW_DESIGN_ENABLED` to `true` locally and walk both the auth flow and account app via the `playwright` skill against a local dev env, in both light and dark system-color-scheme, and with a non-default branding color, before flipping the flag on for real.
- No new automated test infra is introduced by this spec; existing test patterns (per the `testing` skill) apply to any new pure-component logic worth covering (e.g. `confirm-dialog`'s prop-driven variants).

## Rollout

1. Build `components-v2/` screen-by-screen (atoms → molecules → organisms → templates → screens), each independently reviewable.
2. Wire the flag into the pages layer once a screen's v2 counterpart exists, so partial progress is always exercised behind the flag rather than left dead.
3. Once all screens are done and validated, flip `NEW_DESIGN_ENABLED` to `true` by default as a separate follow-up change; deleting the v1 tree and the flag itself is a further follow-up after that.
