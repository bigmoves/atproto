import { Trans } from '@lingui/react/macro'
import { CookieIcon } from '@phosphor-icons/react'
import { Button } from '../atoms/button.tsx'
import { AuthShell } from '../templates/auth-shell.tsx'

export type CookieErrorViewProps = {
  continueUrl: string
}

/**
 * v2 restyle of `#/cookie-error-page.tsx`'s inline view — the cookies-off
 * sibling of `./error-view.tsx`, sharing its `AuthShell` chrome and card
 * layout (meta bar + error-colored tag + serif title). Stays a GET `<form>`
 * that re-submits to the continue URL (no client callback), so "Try again"
 * is the form's submit button.
 */
export function CookieErrorView({ continueUrl }: CookieErrorViewProps) {
  const url = new URL(continueUrl)

  return (
    <AuthShell>
      <form
        action={url.origin}
        method="GET"
        className="sm:bg-surface-1 sm:border-surface-border sm:shadow-card sm:rounded-card relative z-10 m-auto w-full max-w-[540px] sm:overflow-hidden sm:border"
      >
        {Array.from(new Map(url.searchParams)).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <div className="border-surface-border text-ink-light hidden items-center justify-between gap-4 border-b px-5 py-3 font-mono text-xs sm:flex">
          <span className="text-ink truncate font-bold">
            <Trans>Atmosphere Account</Trans>
          </span>
          <span className="text-error uppercase tracking-wide">
            <Trans context="error meta tag">Cookies</Trans>
          </span>
        </div>

        <div className="flex flex-col px-5 pb-10 pt-10 sm:px-10 sm:pt-8">
          <div className="border-surface-border text-ink-light rounded-panel mb-6 flex size-11 items-center justify-center border">
            <CookieIcon weight="bold" className="size-5" aria-hidden />
          </div>
          <h1 className="text-ink mb-3 font-serif text-3xl font-semibold leading-tight">
            <Trans>Cookies are disabled</Trans>
          </h1>
          <p className="text-ink-light mb-8 font-mono text-sm leading-relaxed">
            <Trans>
              Signing in requires cookies to keep you securely logged in. Please
              enable cookies for the "{url.hostname}" website and try again.
            </Trans>
          </p>

          <Button className="self-start" type="submit" color="primary">
            <Trans>Try again</Trans>
          </Button>
        </div>
      </form>
    </AuthShell>
  )
}
