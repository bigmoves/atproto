import { clsx } from 'clsx'
import { type JSX, type ReactNode, useId } from 'react'
import type { Override } from '#/lib/util.ts'

export type RadioGroupOption<T> = {
  value: T
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export type RadioGroupProps<T> = Override<
  Omit<JSX.IntrinsicElements['div'], 'children'>,
  {
    options: ReadonlyArray<RadioGroupOption<T>>
    value?: T
    onChange?: (value: T) => void
    name?: string
    maxColumns?: 1 | 2 | 3 | 4
  }
>

/** v2 restyle of `#/components/forms/input-radio-group.tsx` — token-based border/hover instead of literal gray. */
export function InputRadioGroup<T>({
  value,
  onChange,
  options,
  maxColumns = options.length % 3 === 0 ? 3 : 2,
  name: nameProp,

  // fieldset
  className,
  ...props
}: RadioGroupProps<T>) {
  const reactId = useId()
  const name = nameProp ?? `radio-group-${reactId}`

  const columns = Math.min(maxColumns, options.length) as 1 | 2 | 3 | 4

  return (
    <div
      {...props}
      className={clsx(
        'grid grid-cols-1 gap-2',
        columns >= 2 && 'sm:grid-cols-2',
        columns >= 3 && 'md:grid-cols-3',
        columns >= 4 && 'lg:grid-cols-4',
        className,
      )}
    >
      {options.map((option, index) => {
        const checked = !option.disabled && option.value === value
        const inputId = `${name}-${index}`
        const descriptionId = option.description
          ? `${inputId}-description`
          : undefined

        return (
          <label
            key={inputId}
            htmlFor={inputId}
            className={clsx(
              'flex flex-1 items-start gap-2',
              'rounded-control px-3 py-2',
              'border-contrast-400 border-2',
              'transition duration-200 ease-in-out',
              'has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-1 has-[:focus-visible]:ring-offset-white dark:has-[:focus-visible]:ring-offset-black',
              option.disabled
                ? 'text-text-light cursor-not-allowed opacity-60'
                : 'cursor-pointer',
              checked
                ? 'bg-primary/10 text-text-default border-primary/0 ring-primary ring-2 ring-offset-1 ring-offset-white dark:ring-offset-black'
                : 'text-text-light hover:bg-contrast-200',
            )}
          >
            <input
              type="radio"
              id={inputId}
              name={name}
              checked={checked}
              disabled={option.disabled}
              aria-describedby={descriptionId}
              onChange={(event) => {
                if (event.target.checked && !option.disabled) {
                  onChange?.(option.value)
                }
              }}
              className="accent-primary mt-1 shrink-0"
            />
            <span className="flex flex-col gap-0.5">
              <span>{option.label}</span>
              {option.description && (
                <span
                  id={descriptionId}
                  className="text-text-light leading-snug"
                >
                  {option.description}
                </span>
              )}
            </span>
          </label>
        )
      })}
    </div>
  )
}
