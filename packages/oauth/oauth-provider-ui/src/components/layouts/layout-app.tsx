import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import type { ReactNode } from 'react'
import { useCustomizationData } from '#/contexts/customization.tsx'
import { LocaleSelector } from '#/locales/locale-selector.tsx'
import { LinkAnchor } from '../utils/link-anchor.tsx'

export type LayoutAppProps = {
  children?: ReactNode
  header?: ReactNode
  title?: string | MessageDescriptor
}

export function LayoutApp({ children, header, title }: LayoutAppProps) {
  const { _ } = useLingui()
  const { logo, name, links } = useCustomizationData()
  const titleString = typeof title === 'object' ? _(title) : title ?? name

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      <header className="flex flex-none items-center justify-between gap-4 p-4">
        {titleString && <title>{titleString}</title>}
        {logo && (
          <h1 className="text-text-default flex min-w-0 truncate text-xl font-light capitalize">
            <img
              src={logo}
              alt={name || _(msg`Logo`)}
              className="mr-4 h-6 object-contain object-left"
            />
            {titleString ?? name}
          </h1>
        )}

        {header}
      </header>

      {/* The scroll container is kept separate from the centering box: a flex
       * container that both centers and scrolls clips the overflowing edge.
       * The inner box uses min-h-full so short content stays centered while
       * long content grows and scrolls. */}
      <div className="min-h-0 w-full flex-1 overflow-y-auto">
        <div className="flex min-h-full w-full min-w-0 max-w-full flex-col items-center justify-center">
          {children}
        </div>
      </div>

      <footer className="flex flex-none flex-wrap items-center justify-center gap-4 px-6 py-4 text-xs md:px-8">
        <LocaleSelector className="mr-auto text-sm" />

        {links?.map((link) => (
          <LinkAnchor
            key={link.href}
            link={link}
            className="text-text-light hover:underline focus:underline focus:outline-none"
          />
        ))}
      </footer>
    </div>
  )
}
