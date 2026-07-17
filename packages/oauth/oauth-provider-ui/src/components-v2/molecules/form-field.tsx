import { type JSX, type ReactNode, useMemo } from 'react'
import { useRandomString } from '#/hooks/use-random-string.ts'
import type { Override } from '#/lib/util.ts'
import {
  FieldsetContext,
  type FieldsetContextValue,
} from '../atoms/fieldset-context.tsx'
import { useFormContext } from '../atoms/form-context.tsx'

export type FormFieldProps = Override<
  Omit<JSX.IntrinsicElements['fieldset'], 'aria-labelledby'>,
  { label?: ReactNode }
>

export function FormField({
  label,
  children,
  disabled: disabledProp = false,
  ...props
}: FormFieldProps) {
  const labelId = useRandomString({ prefix: 'form-field-' })
  const formContext = useFormContext()
  const disabled = formContext.disabled || disabledProp

  const contextValue = useMemo<FieldsetContextValue>(
    () => ({ disabled, labelId: label ? labelId : undefined }),
    [disabled, label, labelId],
  )

  return (
    <fieldset {...props} aria-labelledby={labelId} disabled={disabled}>
      {label && (
        <legend
          id={labelId}
          className="text-ink-light mb-1.5 block w-full font-mono text-xs font-bold uppercase tracking-[0.08em]"
        >
          {label}
        </legend>
      )}
      <div className="flex flex-col gap-3">
        <FieldsetContext value={contextValue}>{children}</FieldsetContext>
      </div>
    </fieldset>
  )
}
