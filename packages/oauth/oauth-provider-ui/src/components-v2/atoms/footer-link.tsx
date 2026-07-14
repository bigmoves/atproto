import type { JSX } from 'react'
import type { LinkDefinition } from '@atproto/oauth-provider-api'
import { LinkTitle } from '#/components/utils/link-title.tsx'
import type { Override } from '#/lib/util.ts'

export type FooterLinkProps = Override<
  Omit<JSX.IntrinsicElements['a'], 'href' | 'children'>,
  { link: LinkDefinition }
>

/**
 * Plain external link for footers — like `#/components/utils/link-anchor.tsx`
 * but without the trailing "↗" arrow decoration (`LinkExternal` always adds
 * one, and there's no prop to turn it off, so this is a separate atom rather
 * than fighting that with a CSS override).
 */
export function FooterLink({
  link,
  target = '_blank',
  rel = 'noopener noreferrer',

  // a
  className,
  ...props
}: FooterLinkProps) {
  return (
    <a
      {...props}
      href={link.href}
      target={target}
      rel={rel}
      className={className}
    >
      <LinkTitle link={link} />
    </a>
  )
}
