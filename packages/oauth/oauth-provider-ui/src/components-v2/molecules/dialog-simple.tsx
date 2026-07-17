import { useLingui } from '@lingui/react/macro'
import { XIcon } from '@phosphor-icons/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { DialogSimpleProps } from '#/components/utils/dialog-simple.tsx'

/**
 * v2 restyle of `#/components/utils/dialog-simple.tsx` — same Radix Dialog
 * wiring/props (that file re-exports `DialogSimpleProps` as the single
 * source of truth and delegates to this component when `NEW_DESIGN_ENABLED`
 * is on, so the 7 account-management dialogs that consume `DialogSimple`
 * don't need to know which version renders). Surface uses `bg-surface-1`
 * (raised one step above the page's `bg-surface-0`) instead of sitting
 * directly on the page bg, which would read as a flat cutout rather than an
 * elevated modal.
 */
export function DialogSimple({
  title,
  description,
  trigger,
  children,
  dismissable = true,

  // Dialog.DialogProps
  ...props
}: DialogSimpleProps) {
  const { t } = useLingui()
  const preventWhenLocked = dismissable
    ? undefined
    : (event: Event) => event.preventDefault()

  return (
    <Dialog.Root {...props}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 dark:bg-black/70" />

        <Dialog.Content
          role="dialog"
          {...(description == null && { 'aria-describedby': undefined })}
          onEscapeKeyDown={preventWhenLocked}
          onPointerDownOutside={preventWhenLocked}
          onInteractOutside={preventWhenLocked}
          className="bg-surface-1 border-surface-border shadow-card rounded-card fixed left-1/2 top-1/2 z-40 flex max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden border"
        >
          <div className="border-surface-border flex shrink-0 items-center justify-between gap-4 border-b px-5 py-3.5">
            <Dialog.Title className="text-ink font-mono text-xs font-bold uppercase tracking-wide">
              {title}
            </Dialog.Title>
            <Dialog.Close
              disabled={!dismissable}
              className="text-ink-light hover:bg-surface-2 focus-visible:ring-primary shrink-0 rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
              aria-label={t`Close`}
            >
              <XIcon className="size-4" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
            {description && (
              <Dialog.Description className="text-ink-light mb-5 font-mono text-sm">
                {description}
              </Dialog.Description>
            )}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
