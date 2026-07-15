import { Trans, useLingui } from '@lingui/react/macro'
import { AtIcon, CaretDownIcon } from '@phosphor-icons/react'
import { composeRefs } from '@radix-ui/react-compose-refs'
import { clsx } from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type HandleString, isValidHandle } from '@atproto/syntax'
import { useStableCallback } from '#/hooks/use-stable-callback.ts'
import {
  MAX_FULL_LENGTH,
  MAX_LENGTH,
  MIN_LENGTH,
  type ValidDomain,
  isValidDomain,
} from '#/lib/handle.ts'
import type { Override } from '#/lib/util.ts'
import { InputText, type InputTextProps } from '../atoms/input-text.tsx'

export type InputHandleProvidedProps = Override<
  Omit<
    InputTextProps,
    | 'type'
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'append'
    | 'children'
    | 'pattern'
    | 'minLength'
    | 'maxLength'
  >,
  {
    handle?: HandleString
    onHandle?: (handle: HandleString | undefined) => void
    domains: string[]
  }
>

/** v2 restyle of `#/components/forms/input-handle-default.tsx`. Same validation logic. */
export function InputHandleDefault({
  domains: availableDomains,
  handle: handleInit,
  onHandle,

  // InputTextProps
  autoCapitalize = 'none',
  autoComplete = 'off',
  autoCorrect = 'off',
  dir = 'auto',
  icon = <AtIcon aria-hidden weight="bold" className="size-5" />,
  ref,
  title,
  ...props
}: InputHandleProvidedProps) {
  const { t } = useLingui()
  const domains = availableDomains.filter(isValidDomain)

  const inputRef = useRef<HTMLInputElement>(null)

  const [domainIdx, setDomainIdx] = useState(() => {
    if (!handleInit) return 0
    const idx = domains.findIndex((d) => handleInit.endsWith(d))
    return idx === -1 ? 0 : idx
  })
  const [segment, setSegment] = useState(() => {
    if (!handleInit) return ''
    const domain = domains[domainIdx]
    return handleInit.endsWith(domain) ? handleInit.slice(0, -domain.length) : ''
  })

  const domain: ValidDomain | null = domains[domainIdx] || domains[0] || null
  const { minLength, maxLength, validateSegment } = useSegmentValidator(domain)

  const [validity, setValidity] = useState(() => validateSegment(segment))

  const update = useStableCallback((segment: string, domainIdx: number) => {
    const validity = validateSegment(segment)
    const domain = domains[domainIdx]
    const handle = domain && validity.valid && `${segment}${domain}`

    setSegment(segment)
    setValidity(validity)
    setDomainIdx(domainIdx)

    onHandle?.(handle && isValidHandle(handle) ? handle : undefined)
  })

  useEffect(() => {
    if (domainIdx >= domains.length) update(segment, 0)
  }, [update, segment, domains.length, domainIdx])

  return (
    <div>
      <div className="flex items-start gap-2">
        <InputText
          {...props}
          ref={composeRefs(ref, inputRef)}
          title={title ?? t`Type your username`}
          type="text"
          pattern="[a-z0-9][a-z0-9\-]+[a-z0-9]"
          minLength={minLength}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          dir={dir}
          icon={icon}
          value={segment}
          className="min-w-0 flex-1"
          onChange={(event) => {
            const value = event.target.value.toLowerCase()
            const selectionStart = event.target.selectionStart
            const selectionEnd = event.target.selectionEnd
            event.target.value = value
            event.target.setSelectionRange(selectionStart, selectionEnd)
            update(value, domainIdx)
          }}
        />
        {domains.length > 1 ? (
          <div className="relative h-[3.125rem] shrink-0">
            <select
              value={domainIdx}
              aria-label={t`Select domain`}
              onChange={(event) => {
                update(segment, Number(event.target.value))
                inputRef.current?.focus()
              }}
              className="border-contrast-400 rounded-control text-text-light hover:bg-contrast-200 focus:border-primary accent-primary h-[3.125rem] w-full cursor-pointer appearance-none border pl-3 pr-8 text-sm outline-none"
            >
              {domains.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </select>
            <CaretDownIcon
              aria-hidden
              className="text-text-light pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2"
            />
          </div>
        ) : (
          domain && (
            <span className="text-text-light flex h-[3.125rem] shrink-0 items-center px-1 text-sm">
              {domain}
            </span>
          )
        )}
      </div>
      <p
        className={clsx(
          'mt-1.5 px-1 text-xs',
          segment && !validity.valid ? 'text-error' : 'text-text-light',
        )}
      >
        <Trans>
          {minLength}–{maxLength} characters, using letters, numbers, and
          hyphens
        </Trans>
      </p>
    </div>
  )
}

function useSegmentValidator(domain: ValidDomain | null) {
  const minLen = MIN_LENGTH
  const maxLen = domain
    ? Math.min(MAX_LENGTH, MAX_FULL_LENGTH - domain.length)
    : MAX_LENGTH

  const validateSegment = useCallback(
    (segment: string) => {
      const validLength = segment.length >= minLen && segment.length <= maxLen
      const validCharset = /^[a-z0-9][a-z0-9-]+[a-z0-9]$/.test(segment)
      return { validLength, validCharset, valid: validLength && validCharset }
    },
    [maxLen, minLen],
  )

  return { minLength: minLen, maxLength: maxLen, validateSegment }
}
