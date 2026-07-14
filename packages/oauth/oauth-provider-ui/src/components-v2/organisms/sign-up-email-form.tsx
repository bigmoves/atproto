import { Trans, useLingui } from '@lingui/react/macro'
import { NumpadIcon } from '@phosphor-icons/react'
import { InputEmailAddress } from '../atoms/input-email-address.tsx'
import { InputText } from '../atoms/input-text.tsx'
import { FormField } from '../molecules/form-field.tsx'
import { SmartForm, type WrappedSmartFormProps } from '../molecules/smart-form.tsx'

export type SignUpEmailData = {
  email: string
  inviteCode?: string
}

export type SignUpEmailFormProps = WrappedSmartFormProps<SignUpEmailData> & {
  inviteCodeRequired?: boolean
}

export function SignUpEmailForm({
  inviteCodeRequired = true,
  ...props
}: SignUpEmailFormProps) {
  const { t } = useLingui()

  return (
    <SmartForm
      {...props}
      validate={({ email, inviteCode }) => {
        if (email) {
          if (!inviteCodeRequired) return { email }
          else if (inviteCode) return { email, inviteCode }
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
              enterKeyHint="done"
              required
              defaultValue={values.email}
              onEmail={setterFor('email')}
            />
          </FormField>
        </>
      )}
    />
  )
}
