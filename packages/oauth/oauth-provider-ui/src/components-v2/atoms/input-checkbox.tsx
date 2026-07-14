import { composeRefs } from '@radix-ui/react-compose-refs'
import { clsx } from 'clsx'
import { type JSX, useRef } from 'react'
import { useFieldsetContext } from '#/components/forms/fieldset-context.tsx'
import { useRandomString } from '#/hooks/use-random-string.ts'
import { Checkbox } from './checkbox.tsx'

export type InputCheckboxProps = Omit<JSX.IntrinsicElements['input'], 'type'>

export function InputCheckbox({
  className,
  children,
  id,
  ref,
  disabled: disabledProp,
  ...props
}: InputCheckboxProps) {
  const htmlFor = useRandomString('input-checkbox-')
  const inputRef = useRef<HTMLInputElement>(null)
  const ctx = useFieldsetContext()

  const inputId = id ?? htmlFor
  const disabled = disabledProp ?? ctx.disabled

  return (
    <label
      htmlFor={inputId}
      className={clsx(
        'flex cursor-pointer items-start gap-2 select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <Checkbox
        {...props}
        disabled={disabled}
        id={inputId}
        ref={composeRefs(ref, inputRef)}
        className="mt-0.5"
      />
      {children && (
        <span className="text-text-default text-sm leading-[1.6]">
          {children}
        </span>
      )}
    </label>
  )
}
