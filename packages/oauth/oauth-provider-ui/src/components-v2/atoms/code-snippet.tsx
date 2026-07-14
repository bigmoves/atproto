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
      {label && <span className="text-text-light text-sm">{label}</span>}
      <div className="flex items-stretch gap-2">
        <code className="bg-contrast-200 text-text-default flex flex-1 items-center break-all rounded-md px-2 py-1 font-mono text-sm">
          {children}
        </code>
        <ButtonCopy value={copyable ? children : undefined} size="sm" />
      </div>
    </div>
  )
}
