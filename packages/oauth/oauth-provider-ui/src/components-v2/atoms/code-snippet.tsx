import { clsx } from 'clsx'
import type { JSX } from 'react'
import type { Override } from '#/lib/util.ts'
import { ButtonCopy } from './button-copy.tsx'

export type CodeSnippetProps = Override<
  JSX.IntrinsicElements['div'],
  {
    label?: string
    children: string
    copyable?: boolean
  }
>

/** v2 restyle of `#/components/utils/code-snippet.tsx` — token-based background instead of literal gray. */
export function CodeSnippet({
  label,
  children,
  copyable = true,
  className,
  ...props
}: CodeSnippetProps) {
  return (
    <div {...props} className={clsx('flex flex-col', className)}>
      {label && (
        <span className="text-ink-light mb-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em]">
          {label}
        </span>
      )}
      <div className="flex items-stretch gap-2">
        <code className="bg-surface-2 text-ink rounded-control flex flex-1 items-center break-all px-4 py-3 font-mono text-[15px]">
          {children}
        </code>
        <ButtonCopy value={copyable ? children : undefined} size="md" />
      </div>
    </div>
  )
}
