import { useLingui } from '@lingui/react/macro'
import { composeEventHandlers } from '@radix-ui/primitive'
import {
  type HandleString,
  isValidHandle,
  isValidTld,
  normalizeHandle,
} from '@atproto/syntax'
import type { Override } from '#/lib/util.ts'
import { InputText, type InputTextProps } from '../atoms/input-text.tsx'

export type InputHandleCustomProps = Override<
  Omit<InputTextProps, 'type' | 'append'>,
  {
    /** Called whenever the handle becomes valid or invalid. */
    onHandle?: (handle: HandleString | undefined) => void
    /** The current user's DID, shown in the verification instructions. */
    did: string
  }
>

/** v2 restyle of `#/components/forms/input-handle-custom.tsx`. Same validation logic. */
export function InputHandleCustom({
  onHandle,
  did,

  // InputTextProps
  onChange,
  autoCapitalize = 'none',
  autoComplete = 'off',
  autoCorrect = 'off',
  dir = 'auto',
  title,
  placeholder,
  ...props
}: InputHandleCustomProps) {
  const { t } = useLingui()

  return (
    <InputText
      {...props}
      type="text"
      title={title ?? t`Type your domain`}
      placeholder={placeholder ?? t`alice.com`}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      dir={dir}
      onChange={composeEventHandlers(onChange, (event) => {
        onHandle?.(parseHandle(event.target.value))
      })}
    />
  )
}

function parseHandle(value: string): HandleString | undefined {
  const trimmed = normalizeHandle(value.trim())
  if (trimmed.length && isValidHandle(trimmed) && isValidTld(trimmed)) {
    return trimmed
  }
}
