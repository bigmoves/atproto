import { clsx } from 'clsx'
import type { JSX, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'
import { useFieldsetContext } from './fieldset-context.tsx'

export type InputTextProps = Override<
  JSX.IntrinsicElements['input'],
  {
    append?: ReactNode
    /** Extra content rendered below the input row (caption, resend link, strength meter). */
    children?: ReactNode
  }
>

export function InputText({
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
          'border-surface-border focus-within:border-ink rounded-control flex items-center gap-2 border px-4 py-3 focus-within:border-2 focus-within:px-[15px] focus-within:py-[11px]',
          isDisabled && 'opacity-60',
        )}
      >
        <input
          {...props}
          disabled={isDisabled}
          title={title}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy ?? ctx.labelId}
          // `text-base` (16px) below `sm` prevents iOS Safari from
          // auto-zooming the viewport when the field is focused (it zooms any
          // editable field with font-size < 16px); the 15px design is kept on
          // `sm+`, where there's no touch-zoom.
          className="text-ink placeholder:text-ink-light w-full min-w-0 bg-transparent font-mono text-base outline-none sm:text-[15px]"
        />
        {append}
      </div>
      {children && (
        <div className="text-ink-light mt-1.5 px-1 text-xs">{children}</div>
      )}
    </div>
  )
}
