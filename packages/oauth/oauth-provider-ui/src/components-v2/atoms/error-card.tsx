import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { useMemo } from 'react'
import {
  type ErrorParser,
  type ParsedError,
  parseError,
} from '#/lib/error-parser.ts'
import { Admonition } from './admonition.tsx'

export type { ErrorParser, ParsedError }

export type ErrorCardProps = {
  error: unknown
  parser?: ErrorParser
}

/**
 * v2 restyle of `#/components/utils/error-card.tsx`, scoped down to what
 * `FormCard` needs (description text in an alert `Admonition`). Skips the
 * retry action and click-5x debug-details affordance from the v1 version —
 * not exercised by any current v2 form.
 */
export function ErrorCard({ error, parser }: ErrorCardProps) {
  const { _ } = useLingui()

  const parsed = useMemo<ParsedError>(
    () => parser?.(error) ?? parseError(error),
    [parser, error],
  )

  return (
    <Admonition role="alert">
      {_(parsed.description ?? msg`An unknown error occurred`)}
    </Admonition>
  )
}

export const errorCardRender = (props: ErrorCardProps) => (
  <ErrorCard {...props} />
)
