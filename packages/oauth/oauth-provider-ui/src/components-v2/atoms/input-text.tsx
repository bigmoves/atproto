import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'
import { useFieldsetContext } from './fieldset-context.tsx'

export type InputTextProps = Override<
  JSX.IntrinsicElements['input'],
  {
    icon?: ReactNode
    append?: ReactNode
    /** Extra content rendered below the input row (caption, resend link, strength meter). */
    children?: ReactNode
  }
>

export function InputText({
  icon,
  append,
  children,
  className,

  // input
  disabled,
  title,
  'aria-label': ariaLabel = title,
  'aria-labelledby': ariaLabelledBy,
  placeholder = ariaLabel,
  ...props
}: InputTextProps) {
  const ctx = useFieldsetContext()
  const isDisabled = disabled ?? ctx.disabled

  return (
    <div className={className}>
      <div
        className={clsx(
          'border-contrast-400 focus-within:border-primary rounded-control flex items-center gap-2 border px-4 py-3',
          isDisabled && 'opacity-60',
        )}
      >
        {icon && (
          <span className="text-text-light flex-none" aria-hidden>
            {icon}
          </span>
        )}
        <input
          {...props}
          disabled={isDisabled}
          title={title}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? ctx.labelId}
          className="text-text-default placeholder:text-text-light w-full min-w-0 bg-transparent text-base outline-none"
        />
        {append}
      </div>
      {children && (
        <div className="text-text-light mt-1.5 px-1 text-xs">{children}</div>
      )}
    </div>
  )
}
