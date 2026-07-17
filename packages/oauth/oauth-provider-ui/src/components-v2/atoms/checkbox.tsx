import { clsx } from 'clsx'
import {
  type ClassAttributes,
  type InputHTMLAttributes,
  forwardRef,
} from 'react'
import type { Override } from '#/lib/util.ts'

export type CheckboxProps = Override<
  InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement>,
  { type?: never }
>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <input
        {...props}
        type="checkbox"
        ref={ref}
        disabled={disabled}
        className={clsx(
          'accent-ink size-[18px] rounded-sm',
          'transition duration-200 ease-in-out',
          'focus-visible:ring-ink outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      />
    )
  },
)

Checkbox.displayName = 'Checkbox'
