import { Trans } from '@lingui/react/macro'
import { CookieIcon } from '@phosphor-icons/react'
import { Button } from '../atoms/button.tsx'

export type CookieErrorViewProps = {
  continueUrl: string
}

/** v2 restyle of `#/cookie-error-page.tsx`'s inline view. */
export function CookieErrorView({ continueUrl }: CookieErrorViewProps) {
  const url = new URL(continueUrl)

  return (
    <div className="bg-contrast-0 flex min-h-dvh w-full items-center justify-center px-5">
      <form
        action={url.origin}
        method="GET"
        className="bg-contrast-100 border-contrast-200 shadow-card rounded-card w-full max-w-md border p-10 text-center"
      >
        {Array.from(new Map(url.searchParams)).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <div className="bg-warning-100 text-warning-600 mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <CookieIcon weight="bold" className="size-6" />
        </div>
        <h1 className="text-text-default mb-2 text-lg font-bold">
          <Trans>Cookies are disabled</Trans>
        </h1>
        <p className="text-text-light mb-6 text-sm leading-relaxed">
          <Trans>
            Signing in requires cookies to keep you securely logged in. Please
            enable cookies for the "{url.hostname}" website and try again.
          </Trans>
        </p>
        <Button className="mx-auto" type="submit" color="primary">
          <Trans>Continue</Trans>
        </Button>
      </form>
    </div>
  )
}
