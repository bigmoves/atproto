import { Trans, useLingui } from '@lingui/react/macro'
import { NumpadIcon } from '@phosphor-icons/react'
import { InputEmailAddress } from '../atoms/input-email-address.tsx'
import { InputNewPassword } from '../atoms/input-new-password.tsx'
import { InputText } from '../atoms/input-text.tsx'
import { FormField } from '../molecules/form-field.tsx'
import { SmartForm, type WrappedSmartFormProps } from '../molecules/smart-form.tsx'

export type SignUpCredentialsData = {
  email: string
  password: string
  inviteCode?: string
}

export type SignUpCredentialsFormProps =
  WrappedSmartFormProps<SignUpCredentialsData> & {
    inviteCodeRequired?: boolean
  }

export function SignUpCredentialsForm({
  inviteCodeRequired = true,

  // FormProps
  children,
  ...props
}: SignUpCredentialsFormProps) {
  const { t } = useLingui()

  return (
    <SmartForm
      {...props}
      validate={({ email, password, inviteCode }) => {
        if (email && password) {
          if (!inviteCodeRequired) return { email, password }
          else if (inviteCode) return { email, password, inviteCode }
        }
      }}
      fields={({ values, set, setterFor }) => (
        <>
          {inviteCodeRequired && (
            <FormField label={<Trans>Invite code</Trans>}>
              <InputText
                icon={<NumpadIcon className="size-5" />}
                autoFocus
                name="inviteCode"
                title={t`Invite code`}
                placeholder={t`example-com-xxxxx-xxxxx`}
                required
                value={values.inviteCode}
                onChange={(e) => set('inviteCode', e.target.value)}
                enterKeyHint="next"
              />
            </FormField>
          )}

          <FormField label={<Trans>Email</Trans>}>
            <InputEmailAddress
              autoFocus={!inviteCodeRequired}
              autoComplete="username email"
              name="email"
              enterKeyHint="next"
              required
              defaultValue={values.email}
              onEmail={setterFor('email')}
            />
          </FormField>

          <FormField label={<Trans>Password</Trans>}>
            <InputNewPassword
              name="password"
              enterKeyHint="next"
              required
              defaultValue={values.password}
              onPassword={setterFor('password')}
            />
          </FormField>
        </>
      )}
    >
      {children}
    </SmartForm>
  )
}
