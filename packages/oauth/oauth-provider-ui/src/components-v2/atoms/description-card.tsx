import { useLingui } from '@lingui/react/macro'
import { QuestionIcon } from '@phosphor-icons/react'
import type { HTMLAttributes, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'
import { DialogSimple } from '../molecules/dialog-simple.tsx'
import { Button } from './button.tsx'

export type DescriptionCardProps = Override<
  HTMLAttributes<HTMLDivElement>,
  {
    hint?: string
    image: ReactNode
    title: ReactNode
    description?: ReactNode
    append?: ReactNode
    children?: ReactNode
    extra?: ReactNode
  }
>

/**
 * v2 restyle of `#/components/utils/description-card.tsx` — same
 * title-above-description layout, token-based colors; the icon is
 * vertically centered against the full (possibly two-line) text block via
 * the row's `items-center`.
 */
export function DescriptionCard({
  hint,
  image,
  title,
  description,
  append,
  children,
  extra,

  // HTMLDivElement
  ...attrs
}: DescriptionCardProps) {
  const { t } = useLingui()

  return (
    <div {...attrs}>
      <div className="flex items-center justify-start gap-2">
        <div
          className="text-ink-light flex w-8 flex-grow-0 items-center justify-center"
          aria-hidden
        >
          {image}
        </div>

        <div className="flex flex-1 flex-col">
          <h3 className="text-ink text-sm font-semibold leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-ink-light text-sm leading-snug">{description}</p>
          )}
        </div>

        <div className="flex shrink-0 grow-0 items-center justify-center">
          {append}
          {!!children && (
            <DialogSimple
              title={title}
              trigger={
                <Button
                  shape="circle"
                  aria-label={hint ?? t`Expand details`}
                  aria-haspopup="dialog"
                  size="sm"
                >
                  <QuestionIcon className="size-4" aria-hidden />
                </Button>
              }
            >
              <div className="text-ink-light text-sm">{children}</div>
              {extra}
            </DialogSimple>
          )}
        </div>
      </div>
    </div>
  )
}
