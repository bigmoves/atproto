import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { XIcon } from '@phosphor-icons/react'
import * as Popover from '@radix-ui/react-popover'
import {
  Link,
  type RegisteredRouter,
  type ToPathOption,
  useRouterState,
} from '@tanstack/react-router'
import { clsx } from 'clsx'
import type { FunctionComponent, ReactNode } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import { useAuthenticationContext } from '#/contexts/authentication.tsx'
import { useCustomizationData } from '#/contexts/customization.tsx'
import { useSessionContext } from '#/contexts/session.tsx'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'
import { Button } from '../atoms/button.tsx'
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

// Cycled by nav-item position. Deliberately NOT derived from --color-primary
// (or any branding/semantic token) — those are hue-tinted by the operator's
// configurable branding color, so a badge built from them can end up nearly
// invisible against the active pill (which is a solid --color-primary fill)
// or against the page background itself if the brand hue is dark/muted.
// This uses Tailwind's fixed default palette instead, so contrast holds
// regardless of what branding color is configured.
const NAV_BADGE_COLORS = [
  'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300',
] as const

/**
 * Restyle of `#/components/layouts/layout-page.tsx` + `layout-app.tsx`:
 * header with brand + account selector, a data-driven sidebar nav (so the
 * hosting-provider `customPages` extensibility from
 * `pages/account/(authenticated)/route.tsx` keeps working), and a main
 * content panel. Flat, borderless surfaces (Google Account-style) — follows
 * system dark mode via contrast tokens.
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

  const titleString = typeof title === 'object' ? _(title) : (title ?? name)
  const atBase = pathname === basePath

  const visibleLinks = links.filter(
    ({ hidden, to }) => !hidden || pathname === to,
  )

  return (
    <div className="bg-contrast-0 min-h-dvh w-full">
      <header className="bg-contrast-0 fixed inset-x-0 top-0 z-20 flex h-[76px] items-center justify-between gap-4 px-6">
        <Link to={basePath} className="flex min-w-0 items-center gap-2.5">
          {logo ? (
            <img src={logo} alt={name || 'Logo'} className="h-6" />
          ) : (
            <div className="bg-primary size-6 rounded-full" />
          )}
          {titleString && (
            <span className="text-text-default truncate text-[15px] font-bold">
              <title>{titleString}</title>
              {titleString}
            </span>
          )}
        </Link>
        <AccountSelectorButton />
      </header>

      <aside
        className="bg-contrast-0 fixed left-0 top-[76px] z-10 hidden h-[calc(100dvh-76px)] w-64 flex-col justify-between px-8 pb-6 md:flex"
        role="navigation"
      >
        <nav className="flex flex-col gap-1 pt-2">
          {visibleLinks.map(({ to, title, icon: Icon }, index) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true, includeSearch: false }}
              activeProps={{ className: 'active' }}
              className={clsx(
                'flex items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-medium',
                'text-text-default hover:bg-contrast-100',
                '[&.active]:bg-primary [&.active]:text-primary-contrast [&.active]:font-semibold',
              )}
            >
              {Icon && (
                <span
                  className={clsx(
                    'flex size-11 flex-none items-center justify-center rounded-full',
                    NAV_BADGE_COLORS[index % NAV_BADGE_COLORS.length],
                  )}
                >
                  <Icon className="size-5" weight="bold" />
                </span>
              )}
              <span className="truncate">
                {typeof title === 'object' ? _(title) : title}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 flex-row flex-wrap items-center gap-x-3 gap-y-2 pl-1.5">
          <LocaleSelector className="text-sm" />
          <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1">
            {footerLinks?.map((link) => (
              <FooterLink
                key={link.href}
                link={link}
                className="text-text-light hover:underline focus:underline focus:outline-none text-xs"
              />
            ))}
          </div>
        </div>
      </aside>

      {atBase && (
        <MobileHomeNav links={visibleLinks.filter(({ to }) => to !== basePath)} />
      )}

      <main
        className={clsx(
          'pt-[76px] md:pl-64',
          atBase && 'hidden md:block',
        )}
      >
        <div className="mx-auto max-w-3xl px-4 py-4 md:px-8">{children}</div>
      </main>
    </div>
  )
}

/**
 * Mobile-only "home" screen (Google Account app-style): profile header +
 * nav destinations rendered as separate tappable cards with a description,
 * instead of the compact sidebar pill list used on desktop.
 */
function MobileHomeNav({
  links,
}: {
  links: ReadonlyArray<AccountAppLink>
}) {
  const { _ } = useLingui()
  const { session } = useAuthenticationContext()
  const { links: footerLinks } = useCustomizationData()
  const { account } = session

  return (
    <div className="pt-[76px] md:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-4">
        <div className="flex items-center gap-4">
          <AvatarBadge account={account} size="lg" />
          <div className="min-w-0 flex-1">
            {account.name && (
              <div className="text-text-default truncate text-xl font-bold">
                {account.name}
              </div>
            )}
            <div className="text-text-light truncate text-sm">
              {account.handle ?? account.did}
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          {links.map(({ to, title, description, icon: Icon }, index) => (
            <Link
              key={to}
              to={to}
              className="bg-contrast-100 hover:bg-contrast-200 rounded-panel flex items-center gap-4 p-4 transition"
            >
              {Icon && (
                <span
                  className={clsx(
                    'flex size-12 flex-none items-center justify-center rounded-full',
                    NAV_BADGE_COLORS[index % NAV_BADGE_COLORS.length],
                  )}
                >
                  <Icon className="size-5" weight="bold" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="text-text-default block truncate text-base font-semibold">
                  {typeof title === 'object' ? _(title) : title}
                </span>
                {description && (
                  <span className="text-text-light block truncate text-sm">
                    {typeof description === 'object' ? _(description) : description}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 py-2 pl-1.5">
          <LocaleSelector className="text-sm" />
          <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-1">
            {footerLinks?.map((link) => (
              <FooterLink
                key={link.href}
                link={link}
                className="text-text-light hover:underline focus:underline focus:outline-none text-xs"
              />
            ))}
          </div>
        </div>
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
          className="rounded-full"
        >
          <AvatarBadge account={session.account} size="sm" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="bg-contrast-100 shadow-card rounded-panel relative z-30 flex w-72 flex-col gap-2 p-4"
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
            className="text-text-light absolute right-3 top-3 rounded-full p-1 hover:bg-contrast-200"
            aria-label={_(msg`Close`)}
          >
            <XIcon className="size-4" aria-hidden />
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
