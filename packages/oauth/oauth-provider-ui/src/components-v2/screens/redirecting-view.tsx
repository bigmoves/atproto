import type { MessageDescriptor } from '@lingui/core'
import { Trans } from '@lingui/react/macro'
import {
  type MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useCountdown } from '#/hooks/use-countdown.ts'
import { buttonClassName } from '../atoms/button.tsx'
import { AuthCard } from '../templates/auth-card.tsx'

export type RedirectingViewProps = {
  title?: string | MessageDescriptor
  redirectUrl: string
  redirectMode?: 'replace' | 'assign'
  redirectCooldown?: number
}

/** v2 restyle of `#/components/redirecting-view.tsx` — same cooldown logic. */
export function RedirectingView({
  title,
  redirectUrl: url,
  redirectMode = 'assign',
  redirectCooldown = 5,
}: RedirectingViewProps) {
  const [cooldown, setCooldown] = useCountdown(redirectCooldown)

  const canClick = cooldown === 0
  const [showLink, setShowLink] = useState(canClick)
  useEffect(() => {
    if (canClick) setShowLink(true)
  }, [canClick])

  const clickCountRef = useRef(0)

  const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(
    (event) => {
      if (!canClick) {
        event.preventDefault()
      } else {
        setCooldown()
        clickCountRef.current++
        if (redirectMode === 'replace' && clickCountRef.current < 2) {
          event.preventDefault()
          window.location.replace(url)
        }
      }
    },
    [canClick, setCooldown, redirectMode, url],
  )

  return (
    <AuthCard narrow tag={<Trans>Session / OK</Trans>} title={title}>
      <div className="flex flex-col items-center gap-4">
        <div className="border-surface-border border-t-ink size-10 animate-spin rounded-full border-[3px]" />
        <Trans>You are being redirected...</Trans>

        {showLink && (
          <a
            href={url}
            onClick={onClick}
            aria-disabled={!canClick}
            className={buttonClassName({
              color: 'primary',
              disabled: !canClick,
            })}
          >
            <Trans>Click here if nothing happens</Trans>
          </a>
        )}
      </div>
    </AuthCard>
  )
}
