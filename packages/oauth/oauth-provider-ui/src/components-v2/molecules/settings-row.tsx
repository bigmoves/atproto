import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'

export type SettingsRowProps = Override<
  JSX.IntrinsicElements['button'],
  {
    /** Short field name (e.g. "Email", "Handle") — renders as a fixed-width
     *  mono label with `value` alongside it. Omit for a plain action row
     *  (e.g. "Delete account"), where `children` is the row's title instead. */
    label?: ReactNode
    value?: ReactNode
    danger?: boolean
  }
>

/** Settings row — used inside `SettingsList`, which owns the shared background/rounding. */
export function SettingsRow({
  label,
  value,
  danger = false,

  // button
  children,
  className,
  ...props
}: SettingsRowProps) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'hover:bg-surface-2 flex w-full cursor-pointer items-center gap-3.5 px-5 py-4 text-left',
        danger ? 'text-error' : 'text-ink',
        className,
      )}
    >
      {label != null ? (
        <>
          <span className="text-ink-light w-20 flex-none font-mono text-xs uppercase tracking-wide">
            {label}
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-sm">
            {value}
          </span>
        </>
      ) : (
        <span className="flex-1 truncate text-sm font-medium">{children}</span>
      )}
      <span aria-hidden className="text-ink-light flex-none font-mono text-sm">
        →
      </span>
    </button>
  )
}

/** One connected panel: shared background, rounded only at the outer corners, hairline dividers between rows. */
export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface-1 border-surface-border divide-surface-border rounded-card flex flex-col divide-y overflow-hidden border">
      {children}
    </div>
  )
}
