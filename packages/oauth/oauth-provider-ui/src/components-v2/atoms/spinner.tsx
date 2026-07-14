import { clsx } from 'clsx'
import type { JSX } from 'react'
import type { Override } from '#/lib/util.ts'

export type SpinnerProps = Override<
  JSX.IntrinsicElements['div'],
  { size?: number }
>

export function Spinner({ size = 40, className, ...props }: SpinnerProps) {
  return (
    <div
      {...props}
      role="status"
      style={{ width: size, height: size }}
      className={clsx(
        'border-contrast-200 border-t-primary animate-spin rounded-full border-[3px]',
        className,
      )}
    />
  )
}
