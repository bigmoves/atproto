import { Trans, useLingui } from '@lingui/react/macro'
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
import { InputRadioGroup } from '../atoms/input-radio-group.tsx'
import { InputText, type InputTextProps } from '../atoms/input-text.tsx'
import { DialogSimple } from './dialog-simple.tsx'

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

/**
 * v2 restyle of `#/components/forms/input-handle-default.tsx`. Same
 * validation logic. Unlike v1, the domain defaults quietly (like the
 * official Bluesky app does at signup) instead of showing an
 * always-visible, awkwardly-sized selector next to the input — when more
 * than one domain is configured, a "Use a different domain" link opens a
 * full-width picker instead, which scales to long domains.
 */
export function InputHandleDefault({
  domains: availableDomains,
  handle: handleInit,
  onHandle,

  // InputTextProps
  autoCapitalize = 'none',
  autoComplete = 'off',
  autoCorrect = 'off',
  dir = 'auto',
  ref,
  title,
  ...props
}: InputHandleProvidedProps) {
  const { t } = useLingui()
  const domains = availableDomains.filter(isValidDomain)

  const inputRef = useRef<HTMLInputElement>(null)
  const [domainPickerOpen, setDomainPickerOpen] = useState(false)

  const [domainIdx, setDomainIdx] = useState(() => {
    if (!handleInit) return 0
    const idx = domains.findIndex((d) => handleInit.endsWith(d))
    return idx === -1 ? 0 : idx
  })
  const [segment, setSegment] = useState(() => {
    if (!handleInit) return ''
    const domain = domains[domainIdx]
    return handleInit.endsWith(domain)
      ? handleInit.slice(0, -domain.length)
      : ''
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
        value={segment}
        onChange={(event) => {
          const value = event.target.value.toLowerCase()
          const selectionStart = event.target.selectionStart
          const selectionEnd = event.target.selectionEnd
          event.target.value = value
          event.target.setSelectionRange(selectionStart, selectionEnd)
          update(value, domainIdx)
        }}
      />

      <p
        className={clsx(
          'mt-1.5 px-1 text-xs',
          segment && !validity.valid ? 'text-error' : 'text-ink-light',
        )}
      >
        <Trans>
          {minLength}–{maxLength} characters, using letters, numbers, and
          hyphens
        </Trans>
      </p>

      <div className="bg-surface-2 rounded-control mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-3">
        <div className="min-w-0 flex-1 truncate font-mono text-[15px]">
          <span className={segment ? 'text-ink' : 'text-ink-light'}>
            {segment || t`username`}
          </span>
          {domain && <span className="text-ink-light">{domain}</span>}
        </div>
        {domains.length > 1 && (
          <DialogSimple
            title={t`Choose a domain`}
            open={domainPickerOpen}
            onOpenChange={setDomainPickerOpen}
            trigger={
              <button
                type="button"
                className="text-primary shrink-0 text-xs font-medium hover:underline"
              >
                <Trans>Use a different domain</Trans>
              </button>
            }
          >
            <InputRadioGroup
              maxColumns={1}
              value={domainIdx}
              onChange={(idx) => {
                update(segment, idx)
                setDomainPickerOpen(false)
                inputRef.current?.focus()
              }}
              options={domains.map((d, idx) => ({ value: idx, label: d }))}
            />
          </DialogSimple>
        )}
      </div>
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
