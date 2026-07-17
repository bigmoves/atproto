import { useLingui } from '@lingui/react/macro'
import { composeEventHandlers } from '@radix-ui/primitive'
import type { Override } from '#/lib/util.ts'
import { InputText, type InputTextProps } from './input-text.tsx'

export type InputEmailAddressProps = Override<
  Omit<InputTextProps, 'type'>,
  { onEmail?: (email: string | undefined) => void }
>

export function InputEmailAddress({
  onEmail,

  // InputTextProps
  autoCapitalize = 'none',
  autoComplete = 'email',
  autoCorrect = 'off',
  dir = 'auto',
  onChange,
  pattern = '^[^@]+@[^@]+\\.[^@]+$',
  spellCheck = 'false',
  title,
  ...props
}: InputEmailAddressProps) {
  const { t } = useLingui()

  return (
    <InputText
      {...props}
      title={title ?? t`Email address`}
      type="email"
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      dir={dir}
      pattern={pattern}
      onChange={composeEventHandlers(onChange, (event) => {
        const { value } = event.target
        onEmail?.(event.target.validity.valid ? value.toLowerCase() : undefined)
      })}
    />
  )
}
