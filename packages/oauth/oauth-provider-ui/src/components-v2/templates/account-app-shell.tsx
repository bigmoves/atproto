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
import { LocaleSelector } from '#/locales/locale-selector.tsx'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'
import { Button } from '../atoms/button.tsx'

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
 * header with brand + account selector, a data-driven sidebar nav (so the
 * hosting-provider `customPages` extensibility from
 * `pages/account/(authenticated)/route.tsx` keeps working), and a main
 * content panel. Light theme, follows system dark mode via contrast tokens.
 */
export function AccountAppShell({
  basePath,
  title,
  links,
  children,
}: AccountAppShellProps) {
  const { _ } = useLingui()
  const { name, logo } = useCustomizationData()
  const { pathname } = useRouterState().location

  const titleString = typeof title === 'object' ? _(title) : (title ?? name)
  const atBase = pathname === basePath

  return (
    <div className="bg-contrast-50 flex min-h-dvh w-full flex-col">
      <header className="bg-contrast-0 border-contrast-100 flex items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
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
        </div>
        <AccountSelectorButton />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 items-start gap-4 px-4 py-7 md:px-8">
        <aside
          className={clsx(
            'flex shrink-0 flex-col gap-1 md:w-60',
            atBase ? 'w-full' : 'hidden md:flex',
          )}
          role="navigation"
        >
          {links
            .filter(({ hidden, to }) => !hidden || pathname === to)
            .map(({ to, title, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true, includeSearch: false }}
                activeProps={{ className: 'active' }}
                className={clsx(
                  'flex items-center gap-3 rounded-panel px-3.5 py-2.5 text-sm font-medium',
                  'text-text-light hover:bg-contrast-50',
                  '[&.active]:bg-primary/10 [&.active]:text-primary [&.active]:font-semibold',
                )}
              >
                {Icon && (
                  <span className="bg-contrast-100 flex size-7 flex-none items-center justify-center rounded-full [.active_&]:bg-primary [.active_&]:text-primary-contrast">
                    <Icon className="size-3.5" />
                  </span>
                )}
                <span className="truncate">
                  {typeof title === 'object' ? _(title) : title}
                </span>
              </Link>
            ))}
        </aside>

        <main
          className={clsx(
            'min-w-0 flex-1',
            atBase && 'hidden md:block',
          )}
        >
          {children}
        </main>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-4 px-6 py-4 text-xs md:px-8">
        <LocaleSelector className="mr-auto text-sm" />
      </footer>
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
          className="bg-contrast-0 border-contrast-100 shadow-card rounded-panel relative flex w-72 flex-col gap-2 border p-4"
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
            className="text-text-light absolute right-3 top-3 rounded-full p-1 hover:bg-contrast-50"
            aria-label={_(msg`Close`)}
          >
            <XIcon className="size-4" aria-hidden />
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
