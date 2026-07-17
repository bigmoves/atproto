import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { XIcon } from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import * as Popover from '@radix-ui/react-popover'
import {
  Link,
  type RegisteredRouter,
  type ToPathOption,
  useRouterState,
} from '@tanstack/react-router'
import { clsx } from 'clsx'
import type { FunctionComponent, ReactNode } from 'react'
import { useAuthenticationContext } from '#/contexts/authentication.tsx'
import { useCustomizationData } from '#/contexts/customization.tsx'
import { useSessionContext } from '#/contexts/session.tsx'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'
import { Button } from '../atoms/button.tsx'
import { EyebrowLabel } from '../atoms/eyebrow-label.tsx'
import { FooterLink } from '../atoms/footer-link.tsx'
import { LocaleSelector } from '../atoms/locale-selector.tsx'

export type AccountAppLink = {
  to: ToPathOption<RegisteredRouter, '/', undefined>
  title: string | MessageDescriptor
  hidden?: boolean
  description?: string | MessageDescriptor
  icon?: FunctionComponent<IconProps>
}

export type AccountAppShellProps = {
  basePath: ToPathOption<RegisteredRouter, '/', undefined>
  title?: string | MessageDescriptor
  links: ReadonlyArray<AccountAppLink>
  children?: ReactNode
}

/**
 * Restyle of `#/components/layouts/layout-page.tsx` + `layout-app.tsx`:
 * header with brand + account selector, a data-driven nav (so the
 * hosting-provider `customPages` extensibility from
 * `pages/account/(authenticated)/route.tsx` keeps working), and a main
 * content panel. The nav is a left sidebar on `md+` and a horizontal
 * scrollable tab bar under the header on mobile; both render the same numbered
 * destinations, and mobile shows the real page content (same as desktop)
 * rather than a separate card-list home screen.
 */
export function AccountAppShell({
  basePath,
  title,
  links,
  children,
}: AccountAppShellProps) {
  const { _ } = useLingui()
  const { name, logo, links: footerLinks } = useCustomizationData()
  const { pathname } = useRouterState().location

  const titleString = typeof title === 'object' ? _(title) : title ?? name

  const visibleLinks = links.filter(
    ({ hidden, to }) => !hidden || pathname === to,
  )

  const activeIndex = links.findIndex((l) => l.to === pathname)
  const activeTitle = activeIndex >= 0 ? links[activeIndex].title : undefined

  return (
    <div className="bg-surface-0 min-h-dvh w-full">
      {/* Fixed + centered (not just `mx-auto`, which doesn't apply to `fixed`
          elements) — the whole shell stays a centered max-width column on
          ultra-wide screens instead of the sidebar/header/footer stretching
          to the raw viewport edges. Only `main` below scrolls internally;
          this outer shell never moves.

          On mobile (`< md`) that fixed model is dropped for normal document
          flow: a `min-h-dvh` flex column where the page itself scrolls and the
          footer sits at the end of the content — otherwise the footer (whose
          links wrap to several rows on narrow screens) overlaps and hides the
          bottom of the scrollable content. */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col md:fixed md:inset-y-0 md:left-1/2 md:mx-0 md:block md:min-h-0 md:-translate-x-1/2">
        <header className="bg-surface-0 border-surface-border sticky top-0 z-20 flex h-14 flex-none items-center justify-between gap-4 border-b px-6 md:absolute md:inset-x-0">
          <Link to={basePath} className="flex min-w-0 items-center gap-2.5">
            {logo ? (
              <img src={logo} alt={name || 'Logo'} className="h-6" />
            ) : (
              <div className="bg-primary rounded-panel size-6" />
            )}
            {titleString && (
              <span className="flex min-w-0 items-baseline gap-0.5 truncate font-mono text-[15px]">
                <title>{titleString}</title>
                <span className="text-ink truncate font-bold">
                  {titleString}
                </span>
              </span>
            )}
          </Link>
          <AccountSelectorButton />
        </header>

        <aside
          className="bg-surface-0 border-surface-border absolute bottom-14 left-0 top-14 z-10 hidden w-64 flex-col overflow-y-auto border-r px-8 py-6 md:flex"
          role="navigation"
        >
          <nav className="flex flex-col gap-1">
            <EyebrowLabel dash={false} className="mb-3 px-3">
              <Trans>Navigation</Trans>
            </EyebrowLabel>
            {visibleLinks.map(({ to, title }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{ className: 'active' }}
                className={clsx(
                  'rounded-r-panel flex items-center gap-3 border-l-2 border-transparent py-2 pl-3 pr-4 text-sm font-medium',
                  'text-ink hover:bg-surface-2',
                  '[&.active]:bg-surface-2 [&.active]:border-l-primary [&.active]:font-semibold',
                )}
              >
                <span className="nav-number text-ink-light w-5 flex-none font-mono text-xs">
                  {String(links.findIndex((l) => l.to === to) + 1).padStart(
                    2,
                    '0',
                  )}
                </span>
                <span className="truncate">
                  {typeof title === 'object' ? _(title) : title}
                </span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile-only horizontal tab bar (the sidebar's counterpart) —
            scrolls sideways when the destinations overflow. */}
        <nav
          className="bg-surface-0 border-surface-border sticky top-14 z-20 flex h-14 flex-none items-center gap-2 overflow-x-auto border-b px-4 md:hidden"
          role="navigation"
        >
          {visibleLinks.map(({ to, title }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{ className: 'active' }}
              className={clsx(
                'rounded-t-panel flex flex-none items-center gap-2.5 border-b-2 border-transparent px-4 py-2 text-sm font-medium',
                'text-ink hover:bg-surface-2',
                '[&.active]:border-b-primary [&.active]:bg-surface-2 [&.active]:font-semibold',
              )}
            >
              <span className="nav-number text-ink-light font-mono text-xs">
                {String(links.findIndex((l) => l.to === to) + 1).padStart(
                  2,
                  '0',
                )}
              </span>
              <span className="whitespace-nowrap">
                {typeof title === 'object' ? _(title) : title}
              </span>
            </Link>
          ))}
        </nav>

        <main className="relative flex-1 md:absolute md:inset-x-0 md:bottom-14 md:left-64 md:top-14 md:flex-none md:overflow-y-auto">
          {/* Decorative only — fades out over the first 240px, doesn't carry content. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-60"
            style={{
              backgroundImage:
                'radial-gradient(color-mix(in oklab, var(--color-ink-light) 45%, transparent) 1px, transparent 1px)',
              backgroundSize: '13px 13px',
              maskImage:
                'linear-gradient(180deg, rgb(0 0 0 / 0.9) 0%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(180deg, rgb(0 0 0 / 0.9) 0%, transparent 100%)',
            }}
          />
          {/* `pt-6` matches the sidebar's `py-6` so the section eyebrow lines
              up with the "NAVIGATION" label on the left. */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 pb-4 pt-6 md:px-8">
            {activeTitle != null && (
              <EyebrowLabel className="mb-4">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {typeof activeTitle === 'object' ? _(activeTitle) : activeTitle}
              </EyebrowLabel>
            )}
            {children}
          </div>
        </main>

        <footer className="border-surface-border bg-surface-0 z-20 flex-none border-t px-6 py-3 sm:flex sm:h-14 sm:items-center sm:py-0 md:absolute md:inset-x-0 md:bottom-0">
          <div className="flex w-full flex-col items-center gap-3 text-xs sm:flex-row sm:flex-wrap sm:justify-between sm:gap-4">
            <LocaleSelector className="text-sm" />
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {footerLinks?.map((link) => (
                <FooterLink
                  key={link.href}
                  link={link}
                  className="text-ink-light font-mono text-xs uppercase tracking-wide hover:underline focus:underline focus:outline-none"
                />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function AccountSelectorButton() {
  const { _ } = useLingui()
  const { session, canSwitchAccounts } = useAuthenticationContext()
  const { setSession, api } = useSessionContext()

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          aria-label={_(msg`Account selector`)}
          className="rounded-panel flex items-center gap-2.5"
        >
          <span className="text-ink-light hidden truncate font-mono text-sm sm:inline">
            {session.account.handle ?? session.account.did}
          </span>
          <AvatarBadge account={session.account} size="sm" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="bg-surface-1 border-surface-border shadow-card rounded-panel relative z-30 flex w-72 flex-col gap-2 border p-4"
        >
          <div className="flex items-center gap-3">
            <AvatarBadge account={session.account} size="md" />
            <div className="min-w-0 flex-1 truncate text-sm font-semibold">
              {session.account.handle ?? session.account.did}
            </div>
          </div>

          <Button
            color="primary"
            onClick={() => {
              void api.signOut(session.account)
            }}
          >
            <Trans>Sign out</Trans>
          </Button>

          {canSwitchAccounts && (
            <Button onClick={() => setSession(null)}>
              <Trans>Select another account</Trans>
            </Button>
          )}

          <Popover.Close
            className="text-ink-light hover:bg-surface-2 absolute right-3 top-3 rounded-full p-1"
            aria-label={_(msg`Close`)}
          >
            <XIcon className="size-4" aria-hidden />
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
