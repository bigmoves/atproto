import type { MessageDescriptor } from '@lingui/core'
import { useLingui } from '@lingui/react'
import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import { useCustomizationData } from '#/contexts/customization.tsx'
import type { Override } from '#/lib/util.ts'
import { FooterLink } from '../atoms/footer-link.tsx'
import { LocaleSelector } from '../atoms/locale-selector.tsx'

export type AuthCardProps = Override<
  JSX.IntrinsicElements['div'],
  {
    /** Plain string/`MessageDescriptor` set the document title too; a raw ReactNode (e.g. a wizard's per-step `<Trans>`) does not. */
    title?: ReactNode | MessageDescriptor
    subtitle?: ReactNode
    /** Smaller, muted aside under the subtitle — for secondary context (e.g. "you can change this later"), not the primary instruction. */
    note?: ReactNode
    /** Narrow, single-column variant (used by the redirecting screen). */
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
 * Two-column dark/light card shell for the pre-auth flow (sign-in, sign-up,
 * consent, redirecting). Structurally mirrors `#/components/layouts/layout-title.tsx`
 * (title+subtitle left, content right) so v1 screens map onto it directly,
 * but renders as a centered rounded card instead of a full-viewport split —
 * matching the prototype. Follows system light/dark like the rest of the app
 * (not forced-dark, unlike the prototype).
 */
export function AuthCard({
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
  const { logo, name, links } = useCustomizationData()
  const titleNode: ReactNode = isMessageDescriptor(title) ? _(title) : title
  const titleString = typeof titleNode === 'string' ? titleNode : undefined

  return (
    <div className="bg-contrast-0 flex min-h-screen w-full flex-col items-stretch justify-between px-5 pb-6 pt-10 sm:items-center sm:justify-center sm:px-5 sm:py-10">
      <div
        {...props}
        className={clsx(
          // Below `sm`, the card blends into the page (no surface/shadow/rounding
          // — matches a native full-bleed mobile auth flow like Google's).
          'w-full p-0 sm:bg-contrast-100 sm:shadow-card sm:rounded-card sm:p-8 sm:px-14 sm:py-16',
          narrow ? 'max-w-lg' : 'max-w-4xl sm:min-h-[30rem]',
          className,
        )}
      >
        {narrow ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <BrandMark logo={logo} name={name} />
            {titleNode && (
              <h1 className="text-text-default text-2xl font-normal">
                {titleString && <title>{titleString}</title>}
                {titleNode}
              </h1>
            )}
            {subtitle && <p className="text-text-light text-sm">{subtitle}</p>}
            {note && <p className="text-text-light/70 text-xs">{note}</p>}
            {children}
          </div>
        ) : (
          <>
            <BrandMark logo={logo} name={name} className="mb-9" />
            <div className="grid grid-cols-1 gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
              <div>
                {titleNode && (
                  <h1 className="text-text-default mb-3 text-3xl font-normal leading-tight sm:text-4xl">
                    {titleString && <title>{titleString}</title>}
                    {titleNode}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-text-light text-sm leading-relaxed">
                    {subtitle}
                  </p>
                )}
                {note && (
                  <p className="text-text-light/70 mt-2 text-xs leading-relaxed">
                    {note}
                  </p>
                )}
              </div>
              <div>{children}</div>
            </div>
          </>
        )}
      </div>

      <footer className="w-full py-4">
        <div
          className={clsx(
            'mx-auto flex w-full flex-wrap items-center justify-between gap-4 text-xs',
            narrow ? 'max-w-lg' : 'max-w-4xl',
          )}
        >
          <LocaleSelector className="text-sm" />
          <div className="flex flex-wrap items-center gap-4">
            {links?.map((link) => (
              <FooterLink
                key={link.href}
                link={link}
                className="text-text-light hover:underline focus:underline focus:outline-none"
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

function BrandMark({
  logo,
  name,
  className,
}: {
  logo?: string
  name?: string
  className?: string
}) {
  if (logo) {
    return <img src={logo} alt={name || ''} className={clsx('h-7', className)} />
  }

  // Decorative fallback mark for deployments that haven't configured a logo.
  return (
    <div className={clsx('relative size-7', className)}>
      <div className="bg-primary absolute left-0 top-0 size-5 rounded-full opacity-85" />
      <div className="bg-primary absolute bottom-0 right-0 size-5 rounded-full opacity-60" />
    </div>
  )
}
