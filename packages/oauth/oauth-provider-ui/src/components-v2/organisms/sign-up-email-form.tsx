import { Trans } from '@lingui/react/macro'
import { InputEmailAddress } from '../atoms/input-email-address.tsx'
import { FormField } from '../molecules/form-field.tsx'
import {
  SmartForm,
  type WrappedSmartFormProps,
} from '../molecules/smart-form.tsx'

export type SignUpEmailData = {
  email: string
}

export type SignUpEmailFormProps = WrappedSmartFormProps<SignUpEmailData>

export function SignUpEmailForm(props: SignUpEmailFormProps) {
  return (
    <SmartForm
      {...props}
      validate={({ email }) => {
        if (email) return { email }
      }}
      fields={({ values, setterFor }) => (
        <FormField label={<Trans>Email</Trans>}>
          <InputEmailAddress
            autoFocus
            autoComplete="username email"
            name="email"
            enterKeyHint="done"
            required
            defaultValue={values.email}
            onEmail={setterFor('email')}
          />
        </FormField>
      )}
    />
  )
}
