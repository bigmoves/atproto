import { useLingui } from '@lingui/react/macro'
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@phosphor-icons/react'
import { composeEventHandlers } from '@radix-ui/primitive'
import { composeRefs } from '@radix-ui/react-compose-refs'
import { useRef, useState } from 'react'
import type { Override } from '#/lib/util.ts'
import { Button } from './button.tsx'
import { InputText, type InputTextProps } from './input-text.tsx'

export type InputPasswordProps = Override<
  Omit<InputTextProps, 'type'> & { value?: string; defaultValue?: string },
  {
    onPassword?: (password: undefined | string) => void
    autoHide?: boolean
  }
>

export function InputPassword({
  autoHide = true,
  onPassword,

  // InputTextProps
  onBlur,
  onChange,
  append,
  autoComplete = 'current-password',
  icon = <KeyIcon className="size-5" weight="bold" />,
  ref,
  title,
  dir = 'auto',
  autoCapitalize = 'none',
  autoCorrect = 'off',
  spellCheck = 'false',
  ...props
}: InputPasswordProps) {
  const { t } = useLingui()
  const inputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)

  return (
    <InputText
      {...props}
      title={title ?? t`Password`}
      ref={composeRefs(ref, inputRef)}
      dir={dir}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      icon={icon}
      onBlur={composeEventHandlers(onBlur, () => {
        if (autoHide) setVisible(false)
      })}
      onChange={composeEventHandlers(onChange, ({ target }) => {
        onPassword?.(target.validity.valid ? target.value : undefined)
      })}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      append={
        <>
          <Button
            shape="circle"
            size="sm"
            transparent
            aria-label={visible ? t`Hide` : t`Make visible`}
            onClick={() => {
              setVisible((prev) => !prev)
              inputRef.current?.focus()
            }}
          >
            {visible ? (
              <EyeIcon aria-hidden weight="regular" className="size-4" />
            ) : (
              <EyeSlashIcon aria-hidden weight="regular" className="size-4" />
            )}
          </Button>
          {append}
        </>
      }
    />
  )
}
