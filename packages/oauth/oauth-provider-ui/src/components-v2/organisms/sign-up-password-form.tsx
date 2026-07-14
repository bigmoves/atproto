import { Trans, useLingui } from '@lingui/react/macro'
import { InputNewPassword } from '../atoms/input-new-password.tsx'
import { InputPassword } from '../atoms/input-password.tsx'
import { FormField } from '../molecules/form-field.tsx'
import { SmartForm, type WrappedSmartFormProps } from '../molecules/smart-form.tsx'

export type SignUpPasswordData = { password: string }

type SignUpPasswordValues = SignUpPasswordData & { confirmPassword?: string }

export type SignUpPasswordFormProps = WrappedSmartFormProps<
  SignUpPasswordData,
  SignUpPasswordValues
>

export function SignUpPasswordForm(props: SignUpPasswordFormProps) {
  const { t } = useLingui()

  return (
    <SmartForm
      {...props}
      validate={({ password, confirmPassword }) => {
        if (password && confirmPassword && password === confirmPassword) {
          return { password }
        }
      }}
      fields={({ values, setterFor }) => {
        const mismatch =
          !!values.password &&
          !!values.confirmPassword &&
          values.password !== values.confirmPassword

        return (
          <>
            <FormField label={<Trans>Password</Trans>}>
              <InputNewPassword
                name="password"
                enterKeyHint="next"
                required
                autoFocus
                defaultValue={values.password}
                onPassword={setterFor('password')}
              />
            </FormField>

            <FormField label={<Trans>Confirm password</Trans>}>
              <InputPassword
                name="confirmPassword"
                enterKeyHint="done"
                required
                autoHide={false}
                defaultValue={values.confirmPassword}
                onPassword={setterFor('confirmPassword')}
                title={t`Re-enter your password`}
              />
              {mismatch && (
                <p className="text-error mt-1.5 text-xs">
                  <Trans>Passwords don't match</Trans>
                </p>
              )}
            </FormField>
          </>
        )
      }}
    />
  )
}
