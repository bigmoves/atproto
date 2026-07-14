import { Trans } from '@lingui/react/macro'
import { TicketIcon } from '@phosphor-icons/react'
import { composeEventHandlers } from '@radix-ui/primitive'
import { useRef } from 'react'
import { useCountdown } from '#/hooks/use-countdown.ts'
import { useMergedRefs } from '#/hooks/use-merged-refs.ts'
import type { Override } from '#/lib/util.ts'
import { InputText, type InputTextProps } from './input-text.tsx'

export type InputTokenProps = Override<
  Omit<
    InputTextProps,
    | 'children'
    | 'type'
    | 'pattern'
    | 'autoCapitalize'
    | 'autoCorrect'
    | 'autoComplete'
    | 'spellCheck'
    | 'minLength'
    | 'maxLength'
    | 'placeholder'
    | 'dir'
  >,
  {
    example?: string
    onToken?: (code: string | null) => void
    onResend?: () => void | PromiseLike<void>
  }
>

export const OTP_CODE_EXAMPLE = 'XXXXX-XXXXX'
const RESEND_COOLDOWN_SECONDS = 30

function fix(value: string) {
  const normalized = value.toUpperCase().replaceAll(/[^A-Z2-7]/g, '')
  if (normalized.length <= 5) return normalized
  return `${normalized.slice(0, 5)}-${normalized.slice(5, 10)}`
}

export function InputToken({
  example = OTP_CODE_EXAMPLE,
  onToken,
  onResend,

  // InputTextProps
  icon = <TicketIcon className="size-5" weight="bold" />,
  title = example,
  autoFocus = false,
  onChange,
  ...props
}: InputTokenProps) {
  const ref = useRef<HTMLInputElement>(null)
  const refMerged = useMergedRefs(ref, props.ref)
  const [cooldown, setCooldown] = useCountdown(0)

  return (
    <InputText
      {...props}
      ref={refMerged}
      type="text"
      autoFocus={autoFocus}
      autoCapitalize="characters"
      autoCorrect="off"
      autoComplete="one-time-code"
      spellCheck="false"
      minLength={11}
      maxLength={11}
      dir="auto"
      icon={icon}
      pattern="^[A-Z2-7]{5}-[A-Z2-7]{5}$"
      placeholder={example}
      title={title}
      onChange={composeEventHandlers(onChange, (event) => {
        const { value, selectionEnd, selectionStart } = event.currentTarget
        const fixedValue = fix(value)
        event.currentTarget.value = fixedValue

        const pos = selectionEnd ?? selectionStart
        if (pos != null) {
          const fixedSlicedValue = fix(value.slice(0, pos))
          event.currentTarget.selectionStart = event.currentTarget.selectionEnd =
            fixedSlicedValue.length
        }

        onToken?.(fixedValue.length === 11 ? fixedValue : null)
      })}
    >
      {onResend && (
        <span className="text-text-light inline-flex items-center text-xs">
          {cooldown > 0 ? (
            <Trans>Resend available in {cooldown}s</Trans>
          ) : (
            <Trans>
              Didn't receive a code?{' '}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={async () => {
                  setCooldown(RESEND_COOLDOWN_SECONDS)
                  await onResend()
                }}
              >
                Click here to resend.
              </button>
            </Trans>
          )}
        </span>
      )}
    </InputText>
  )
}
