import type { HandleString } from '@atproto/syntax'
import { InputHandleDefault } from '../molecules/input-handle-default.tsx'
import {
  SmartForm,
  type WrappedSmartFormProps,
} from '../molecules/smart-form.tsx'

export type SignUpHandleData = { handle: HandleString }

export type SignUpHandleFormProps = WrappedSmartFormProps<SignUpHandleData> & {
  domains: string[]
}

export function SignUpHandleForm({
  domains,

  // FormProps
  ...props
}: SignUpHandleFormProps) {
  return (
    <SmartForm
      {...props}
      validate={({ handle }) => {
        if (handle) return { handle }
      }}
      fields={({ values, setterFor }) => (
        <InputHandleDefault
          handle={values.handle}
          onHandle={setterFor('handle')}
          domains={domains}
          name="handle"
          required
          autoFocus
          enterKeyHint="done"
          autoComplete="nickname"
        />
      )}
    />
  )
}
