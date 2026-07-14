import { Trans } from '@lingui/react/macro'
import { clsx } from 'clsx'
import {
  type FormEvent,
  type JSX,
  type MouseEventHandler,
  type ReactNode,
  useMemo,
} from 'react'
import { FormContext, type FormContextValue } from '#/components/forms/form-context.tsx'
import { errorCardRender } from '#/components/utils/error-card.tsx'
import { apiErrorParser } from '#/lib/api-error-parser.ts'
import type { ErrorParser } from '#/lib/error-parser.ts'
import type { Override } from '#/lib/util.ts'
import { Button, type ButtonColor } from '../atoms/button.tsx'

export type ErrorRenderer = (props: {
  error: unknown
  parser: ErrorParser
}) => ReactNode

export type FormCardProps = Override<
  JSX.IntrinsicElements['form'],
  {
    disabled?: boolean
    loading?: boolean
    actions?: ReactNode

    onSubmit?: (event: FormEvent<HTMLFormElement>) => void
    submitLabel?: ReactNode
    submitColor?: ButtonColor
    submittable?: boolean

    onCancel?: MouseEventHandler<HTMLButtonElement>
    cancelLabel?: ReactNode

    onBack?: () => void
    backLabel?: ReactNode

    error?: Error
    hideError?: boolean
    errorParser?: ErrorParser
    errorRender?: ErrorRenderer
  }
>

/**
 * v2 restyle of `#/components/forms/form-card.tsx`: same contract (drop-in
 * for `SmartForm`), pill-shaped submit button, reused error rendering
 * (`errorCardRender`/`apiErrorParser` stay shared — they're not visual).
 */
export function FormCard({
  disabled: disabledProp = false,
  loading = false,
  actions,

  submitLabel = <Trans>Submit</Trans>,
  submitColor = 'primary',
  submittable = true,

  onCancel = undefined,
  cancelLabel = <Trans>Cancel</Trans>,

  onBack,
  backLabel = <Trans>Back</Trans>,

  error,
  hideError = false,
  errorParser = apiErrorParser,
  errorRender = errorCardRender,

  // form
  inert,
  children,
  onSubmit,
  className,
  ...props
}: FormCardProps) {
  const disabled = Boolean(inert || disabledProp || loading)

  const contextValue = useMemo<FormContextValue>(
    () => ({ disabled }),
    [disabled],
  )

  const errorNode =
    error != null && !hideError
      ? errorRender({ error, parser: errorParser })
      : null

  return (
    <form
      {...props}
      action={undefined}
      inert={disabled}
      className={clsx('flex flex-col gap-8', className)}
      onSubmit={(event) => {
        if (!event.defaultPrevented) {
          const isValid = event.currentTarget.reportValidity()
          if (disabled || !isValid || !submittable) {
            event.preventDefault()
          } else {
            onSubmit?.(event)
          }
        }
      }}
    >
      <FormContext value={contextValue}>
        <div key="children" className="flex flex-col gap-6">
          {children}
        </div>

        {errorNode && <div key="error">{errorNode}</div>}

        <div
          key="actions"
          className="mt-2 flex flex-row-reverse flex-wrap items-center justify-start gap-6"
        >
          {submitLabel && (
            <Button
              type="submit"
              color={submitColor}
              loading={loading}
              disabled={disabled || !submittable}
            >
              {submitLabel}
            </Button>
          )}
          {actions}
          <div className="flex-auto" />
          {onCancel && cancelLabel ? (
            <Button transparent onClick={onCancel}>
              {cancelLabel}
            </Button>
          ) : null}
          {onBack && backLabel ? (
            <Button transparent onClick={onBack}>
              {backLabel}
            </Button>
          ) : null}
        </div>
      </FormContext>
    </form>
  )
}
