import { Trans, useLingui } from '@lingui/react/macro'
import { InputText } from '../atoms/input-text.tsx'
import { FormField } from '../molecules/form-field.tsx'
import {
  SmartForm,
  type WrappedSmartFormProps,
} from '../molecules/smart-form.tsx'

export type SignUpInviteCodeData = {
  inviteCode: string
}

export type SignUpInviteCodeFormProps =
  WrappedSmartFormProps<SignUpInviteCodeData>

export function SignUpInviteCodeForm(props: SignUpInviteCodeFormProps) {
  const { t } = useLingui()

  return (
    <SmartForm
      {...props}
      validate={({ inviteCode }) => {
        if (inviteCode) return { inviteCode }
      }}
      fields={({ values, set }) => (
        <FormField label={<Trans>Invite code</Trans>}>
          <InputText
            autoFocus
            name="inviteCode"
            title={t`Invite code`}
            placeholder={t`example-com-xxxxx-xxxxx`}
            required
            value={values.inviteCode}
            onChange={(e) => set('inviteCode', e.target.value)}
            enterKeyHint="done"
          />
        </FormField>
      )}
    />
  )
}
