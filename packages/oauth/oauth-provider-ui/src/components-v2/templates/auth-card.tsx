import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { GlobeIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import { useCustomizationData } from '#/contexts/customization.tsx'
import type { Override } from '#/lib/util.ts'
import { EyebrowLabel } from '../atoms/eyebrow-label.tsx'

export type AuthCardProps = Override<
  JSX.IntrinsicElements['div'],
  {
    /** Breadcrumb-style eyebrow above the title (e.g. "Authenticate", "Register"). */
    eyebrow?: ReactNode
    /** Small mono status tag shown top-right of the card's header bar (e.g. "Session / new", "Register / new"). */
    tag?: ReactNode
    /** Plain string/`MessageDescriptor` set the document title too; a raw ReactNode (e.g. a wizard's per-step `<Trans>`) does not. */
    title?: ReactNode | MessageDescriptor
    subtitle?: ReactNode
    /** Smaller, muted aside under the subtitle — for secondary context (e.g. "you can change this later"), not the primary instruction. */
    note?: ReactNode
    /** Extra-narrow, centered-text variant for short transient messages (used by the redirecting screen). */
    narrow?: boolean
  }
>

function isMessageDescriptor(value: unknown): value is MessageDescriptor {
  return (
    typeof value === 'object' &&
    value !== null &&
    !('$$typeof' in value) &&
    ('message' in value || 'id' in value)
  )
}

/**
 * The floating card for the pre-auth flow (sign-in, sign-up, consent,
 * redirecting) — matches the design reference's card structure exactly.
 * Must be rendered as a child of `AuthShell`, which owns the page
 * background, decorative globe, and footer that used to live here; that
 * split keeps the globe mounted across screen transitions instead of
 * resetting every time the active screen changes shape/props (which happens
 * often — `AuthenticationProvider` swaps between totally different screen
 * components as the user moves through steps). Follows system light/dark
 * like the rest of the app (not forced-dark, unlike the reference).
 */
export function AuthCard({
  eyebrow,
  tag,
  title,
  subtitle,
  note,
  narrow = false,

  // div
  className,
  children,
  ...props
}: AuthCardProps) {
  const { _ } = useLingui()
  const { logo, name } = useCustomizationData()
  const titleNode: ReactNode = isMessageDescriptor(title) ? _(title) : title
  const titleString = typeof titleNode === 'string' ? titleNode : undefined

  return (
    <div
      {...props}
      className={clsx(
        'relative z-10 m-auto',
        // Below `sm`, the card blends into the page (no surface/shadow/rounding
        // — matches a native full-bleed mobile auth flow like Google's).
        'sm:bg-surface-1 sm:border-surface-border sm:shadow-card sm:rounded-card w-full sm:overflow-hidden sm:border',
        narrow ? 'max-w-sm text-center' : 'max-w-[540px]',
        className,
      )}
    >
      {/* Mobile: centered wordmark, no divider. sm+: bordered header with the
          wordmark left and the status tag right. */}
      <div className="sm:border-surface-border text-ink-light flex items-center justify-center px-5 py-3 font-mono text-xs sm:justify-between sm:border-b">
        <span className="flex items-center gap-1.5 truncate">
          {/* Globe glyph + fixed product wordmark (not the operator's
              configured service name) — the brand identity for this UI. Scoped
              to the auth screens: the dashboard header has its own wordmark. */}
          <GlobeIcon
            weight="bold"
            aria-hidden
            className="text-ink size-4 flex-none"
          />
          <span className="text-ink font-bold">
            <Trans>Atmosphere Account</Trans>
          </span>
        </span>
        {tag && (
          <span className="hidden uppercase tracking-wide sm:inline">
            {tag}
          </span>
        )}
      </div>

      {logo && (
        <div className="hidden justify-center pb-1.5 pt-7 sm:flex">
          <BrandMark logo={logo} name={name} size="lg" />
        </div>
      )}

      <div
        className={clsx(
          // `sm:pt-3.5` only when a logo sits above; without one keep the
          // fuller `pt-10` so the content doesn't crowd the meta bar.
          'flex flex-col px-5 pb-10 pt-10 sm:px-10 sm:pb-10',
          logo && 'sm:pt-3.5',
          narrow ? 'items-center gap-4' : 'items-center',
        )}
      >
        <BrandMark
          logo={logo}
          name={name}
          className="mb-9 sm:hidden"
          size="lg"
        />
        <div className={clsx('w-full', narrow && 'flex flex-col items-center')}>
          {eyebrow && (
            <EyebrowLabel
              className={clsx('mb-3.5', narrow && 'justify-center')}
            >
              {eyebrow}
            </EyebrowLabel>
          )}
          {titleNode && (
            <h1 className="text-ink mb-1 font-mono text-[27px] font-semibold leading-[1.1] tracking-[-0.03em]">
              {titleString && <title>{titleString}</title>}
              {titleNode}
            </h1>
          )}
          {subtitle && (
            <p className="text-ink-light mb-6 text-sm leading-relaxed">
              {subtitle}
            </p>
          )}
          {note && (
            <p className="text-ink-light/70 mt-2 text-xs leading-relaxed">
              {note}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

const BRAND_MARK_SIZES = {
  sm: 'size-7',
  lg: 'size-14',
}

// Renders the operator's configured logo, or nothing when none is set — no
// decorative fallback mark.
function BrandMark({
  logo,
  name,
  size = 'sm',
  className,
}: {
  logo?: string
  name?: string
  size?: keyof typeof BRAND_MARK_SIZES
  className?: string
}) {
  if (!logo) return null

  return (
    <img
      src={logo}
      alt={name || ''}
      className={clsx(BRAND_MARK_SIZES[size], 'object-contain', className)}
    />
  )
}
