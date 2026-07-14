import { useLingui } from '@lingui/react/macro'
import { composeEventHandlers } from '@radix-ui/primitive'
import { useEffect, useState } from 'react'
import { MIN_PASSWORD_LENGTH } from '#/lib/password.ts'
import type { Override } from '#/lib/util.ts'
import { InputPassword, type InputPasswordProps } from './input-password.tsx'
import { PasswordStrengthLabel } from './password-strength-label.tsx'
import { PasswordStrengthMeter } from './password-strength-meter.tsx'

export type InputNewPasswordProps = Override<
  InputPasswordProps,
  { onPassword?: (password: undefined | string) => void }
>

/** v2 restyle of `#/components/forms/input-new-password.tsx`. Strength meter/label reused as-is (neutral, token-driven). */
export function InputNewPassword({
  autoComplete = 'new-password',
  minLength = MIN_PASSWORD_LENGTH,
  onChange,
  ...props
}: InputNewPasswordProps) {
  const { t } = useLingui()

  const [current, setCurrent] = useState(
    props.defaultValue ?? props.value ?? '',
  )

  useEffect(() => {
    if (props.value !== undefined) setCurrent(props.value)
  }, [props.value])

  return (
    <InputPassword
      {...props}
      placeholder={t`Enter a password`}
      aria-label={t`Enter your new password`}
      title={t`Password with at least ${MIN_PASSWORD_LENGTH} characters`}
      minLength={minLength}
      onChange={composeEventHandlers(onChange, (event) => {
        setCurrent(event.target.value)
      })}
      autoComplete={autoComplete}
    >
      <PasswordStrengthMeter password={current} className="mt-2" />
      <PasswordStrengthLabel
        className="text-text-light mt-1 min-w-max grow text-xs"
        password={current}
      />
    </InputPassword>
  )
}
