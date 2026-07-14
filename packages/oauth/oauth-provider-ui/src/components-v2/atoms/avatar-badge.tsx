import { useLingui } from '@lingui/react/macro'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'
import type { Account } from '@atproto/oauth-provider-api'

const SIZES = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-22 text-3xl',
} as const

export type AvatarBadgeSize = keyof typeof SIZES

export type AvatarBadgeProps = {
  account: Account
  size?: AvatarBadgeSize
  className?: string
}

/** Deterministic hue (0-360) derived from a string, used as the avatar fallback color. */
function hueFromString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 360
}

function initialsFrom(account: Account): string {
  const source = account.name || account.handle || account.did
  const parts = source.replace(/^@/, '').split(/[\s._-]+/).filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
  return initials.toUpperCase() || '?'
}

export function AvatarBadge({
  account,
  size = 'md',
  className,
}: AvatarBadgeProps) {
  const { t } = useLingui()
  const [errored, setErrored] = useState(false)
  const src = account.picture

  useEffect(() => {
    setErrored(false)
  }, [src])

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={t`Account avatar`}
        className={clsx('flex-none rounded-full object-cover', SIZES[size], className)}
        onError={() => setErrored(true)}
      />
    )
  }

  const hue = hueFromString(account.did)

  return (
    <div
      aria-hidden
      className={clsx(
        'flex flex-none items-center justify-center rounded-full font-bold text-white',
        SIZES[size],
        className,
      )}
      style={{ background: `hsl(${hue} 55% 45%)` }}
    >
      {initialsFrom(account)}
    </div>
  )
}
