import { CaretRightIcon, type Icon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'

export type SettingsRowProps = Override<
  JSX.IntrinsicElements['button'],
  {
    icon: Icon
    value?: ReactNode
    danger?: boolean
  }
>

/** Settings row — used inside `SettingsList`, which owns the shared background/rounding. */
export function SettingsRow({
  icon: IconComponent,
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
        'hover:bg-contrast-200 flex w-full cursor-pointer items-center gap-3 px-4 py-5 text-left',
        danger ? 'text-error' : 'text-text-default',
        className,
      )}
    >
      <IconComponent aria-hidden className="size-[18px] flex-none" />
      <span className="flex-1 truncate text-sm font-medium">{children}</span>
      {value != null && (
        <span className="text-text-light hidden max-w-[40%] truncate text-sm sm:inline">
          {value}
        </span>
      )}
      <CaretRightIcon aria-hidden className="text-text-light size-4 flex-none" />
    </button>
  )
}

/** One connected panel: shared background, rounded only at the outer corners, hairline dividers between rows. */
export function SettingsList({ children }: { children: ReactNode }) {
  return (
    <div className="bg-contrast-100 divide-contrast-200 rounded-panel flex flex-col divide-y overflow-hidden">
      {children}
    </div>
  )
}
