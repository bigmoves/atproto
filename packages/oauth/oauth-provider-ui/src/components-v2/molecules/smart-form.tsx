import { composeEventHandlers } from '@radix-ui/primitive'
import {
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { useAsyncAction } from '#/hooks/use-async-action.ts'
import { useStableCallback } from '#/hooks/use-stable-callback.ts'
import type { Override } from '#/lib/util.ts'
import { FormCard, type FormCardProps } from './form-card.tsx'

export type SmartFormData = Record<string, unknown>

export type SetField<TValues> = <K extends keyof TValues>(
  key: K,
  value: TValues[K] | undefined,
) => void

export type SetterFor<TValues> = <K extends keyof TValues>(
  key: K,
) => (value: TValues[K] | undefined) => void

export type ValidateData<TValues, TData> = (
  values: Partial<TValues>,
) => TData | undefined

export type FormHandler<TData extends SmartFormData, TValues = TData> = {
  values: Readonly<Partial<TValues>>
  data: TData | undefined
  set: SetField<TValues>
  setterFor: SetterFor<TValues>
  error: Error | undefined
  loading: boolean
  reset: () => void
}

export type SmartFormProps<
  TData extends SmartFormData,
  TValues = TData,
> = Override<
  FormCardProps,
  {
    validate: ValidateData<TValues, TData>
    handler: (data: TData, signal: AbortSignal) => void | PromiseLike<void>
    values?: Partial<TValues>
    onValues?: (
      newValues: Partial<TValues>,
      oldValues: Partial<TValues>,
    ) => void
    onLoadingChange?: (loading: boolean) => void
    ref?: Ref<FormHandler<TData, TValues>>
    fields: (form: FormHandler<TData, TValues>) => ReactNode
  }
>

/**
 * v2 port of `#/components/forms/smart-form.tsx` — identical state engine,
 * renders the v2 `FormCard` instead of v1's so restyled forms compose with
 * the new pill-button chrome. See `WrappedSmartFormProps` for the wrapper
 * shape used by `organisms/*-form.tsx`.
 */
export function SmartForm<TData extends SmartFormData, TValues = TData>({
  fields,
  ref,
  values: initialValues = {},
  onValues,
  onLoadingChange,
  handler,
  validate,
  children,
  ...props
}: SmartFormProps<TData, TValues>) {
  const [values, setValues] = useState<Partial<TValues>>(initialValues)

  const data = useMemo(() => validate(values), [validate, values])

  const { run, loading, error, reset } = useAsyncAction(
    async (signal) => {
      if (data) return handler(data, signal)
      else throw new Error('Form data is not valid')
    },
    { onLoadingChange },
  )

  const set = useStableCallback<SetField<TValues>>((key, value) => {
    if (values[key] !== value) {
      reset()
      setValues({ ...values, [key]: value })
      onValues?.({ ...values, [key]: value }, values)
    }
  })

  const setterFor = useStableCallback<SetterFor<TValues>>(
    (key) => (value) => set(key, value),
  )

  const form = useMemo(
    () => ({ values, data, set, setterFor, loading, error, reset }),
    [values, data, set, setterFor, loading, error, reset],
  )

  useImperativeHandle(ref, () => form, [form])

  return (
    <FormCard
      {...props}
      error={props.error ?? error}
      loading={props.loading || loading}
      submittable={props.submittable !== false && data != null}
      onSubmit={composeEventHandlers(props.onSubmit, (event) => {
        event.preventDefault()
        void run()
      })}
      onReset={composeEventHandlers(props.onReset, (event) => {
        event.preventDefault()
        reset()
      })}
    >
      {fields(form)}
      {children}
    </FormCard>
  )
}

export type WrappedSmartFormProps<
  TData extends SmartFormData,
  TValues = TData,
> = Omit<SmartFormProps<TData, TValues>, 'fields' | 'validate'>
