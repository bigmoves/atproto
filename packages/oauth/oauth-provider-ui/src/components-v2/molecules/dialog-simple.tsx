import { useLingui } from '@lingui/react/macro'
import { XIcon } from '@phosphor-icons/react'
import * as Dialog from '@radix-ui/react-dialog'
import type { DialogSimpleProps } from '#/components/utils/dialog-simple.tsx'

/**
 * v2 restyle of `#/components/utils/dialog-simple.tsx` — same Radix Dialog
 * wiring/props (that file re-exports `DialogSimpleProps` as the single
 * source of truth and delegates to this component when `NEW_DESIGN_ENABLED`
 * is on, so the 7 account-management dialogs that consume `DialogSimple`
 * don't need to know which version renders). Surface uses `bg-contrast-100`
 * (raised one step above the page's `bg-contrast-0`) instead of `bg-contrast-0`
 * — sitting directly on the page bg made the v1 styling read as a flat cutout
 * rather than an elevated modal once the account app's own page background
 * switched to `bg-contrast-0` to match `<body>`.
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
        <Dialog.Overlay className="bg-contrast-900/40 dark:bg-contrast-0/70 fixed inset-0 z-40" />

        <Dialog.Content
          role="dialog"
          {...(description == null && { 'aria-describedby': undefined })}
          onEscapeKeyDown={preventWhenLocked}
          onPointerDownOutside={preventWhenLocked}
          onInteractOutside={preventWhenLocked}
          className="bg-contrast-100 shadow-card rounded-card fixed left-1/2 top-1/2 z-40 flex max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto p-6"
        >
          {children}

          {/* @NOTE -order-1 so the close button isn't focused first when the dialog opens */}
          <div className="-order-1 mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-text-default text-lg font-semibold">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-text-light text-sm">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              disabled={!dismissable}
              className="text-text-light hover:bg-contrast-200 focus-visible:ring-primary shrink-0 rounded-full p-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
              aria-label={t`Close`}
            >
              <XIcon className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
