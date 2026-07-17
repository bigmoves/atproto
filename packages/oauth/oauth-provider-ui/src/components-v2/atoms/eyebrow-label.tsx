import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'

export type EyebrowLabelProps = Override<
  JSX.IntrinsicElements['div'],
  {
    children: ReactNode
    /** Leading dash — used for breadcrumb-style eyebrows ("— Authenticate", "— 01 / Home"). Section headers ("Navigation") omit it. */
    dash?: boolean
  }
>

/**
 * Small uppercase mono wayfinding label. Two flavors, both driven by the
 * same primitive: a breadcrumb-style eyebrow above a card/section title
 * (`dash`, the default), and a plain section header (`dash={false}`, e.g.
 * the sidebar nav's "Navigation" label or a stat panel's "Host"/"Status").
 */
export function EyebrowLabel({
  children,
  dash = true,
  className,
  ...props
}: EyebrowLabelProps) {
  return (
    <div
      {...props}
      className={clsx(
        'text-ink-light flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em]',
        className,
      )}
    >
      {dash && <span className="bg-ink-light h-px w-3.5 flex-none" />}
      {children}
    </div>
  )
}
