import { Trans } from '@lingui/react/macro'
import { type ReactNode, useEffect, useState } from 'react'
import type { HandleString } from '@atproto/syntax'
import { isValidHandle } from '@atproto/syntax'
import { Button } from '../atoms/button.tsx'
import { LinkExternal } from '../atoms/link-external.tsx'
import { DialogSimple } from '../molecules/dialog-simple.tsx'
import { FormField } from '../molecules/form-field.tsx'
import { InputHandleCustomInstructions } from '../molecules/input-handle-custom-instructions.tsx'
import { InputHandleCustom } from '../molecules/input-handle-custom.tsx'
import { InputHandleDefault } from '../molecules/input-handle-default.tsx'
import {
  SmartForm,
  type WrappedSmartFormProps,
} from '../molecules/smart-form.tsx'

export type UpdateHandleDialogProps = {
  children: Exclude<ReactNode, false | null | undefined>

  domains: string[]
  currentHandle?: HandleString
  /** The current user's DID, used in own-domain verification instructions. */
  did: string
  handler: (
    data: { handle: HandleString },
    signal: AbortSignal,
  ) => void | PromiseLike<void>
}

enum HandleType {
  Default,
  Custom,
}

type UpdateHandleDefaultData = { handle: HandleString }
type UpdateHandleDefaultFormProps =
  WrappedSmartFormProps<UpdateHandleDefaultData> & {
    domains: string[]
  }

function UpdateHandleDefaultForm({
  domains,
  ...props
}: UpdateHandleDefaultFormProps) {
  return (
    <SmartForm
      {...props}
      validate={({ handle }: { handle?: HandleString }) => {
        if (handle && domains.some((dom) => handle.endsWith(dom)))
          return { handle }
      }}
      fields={({ values, set }) => (
        <InputHandleDefault
          handle={values.handle}
          onHandle={(value) => set('handle', value)}
          domains={domains}
          name="handle"
          required
          autoFocus
          enterKeyHint="done"
        />
      )}
    />
  )
}

type UpdateHandleCustomData = { handle: HandleString }
type UpdateHandleCustomFormProps =
  WrappedSmartFormProps<UpdateHandleCustomData> & {
    did: string
  }

function UpdateHandleCustomForm({
  did,
  ...props
}: UpdateHandleCustomFormProps) {
  return (
    <SmartForm
      {...props}
      validate={({ handle }: { handle?: HandleString }) => {
        if (handle && isValidHandle(handle)) return { handle }
      }}
      fields={({ values, setterFor }) => (
        <>
          <FormField label={<Trans>Enter the domain you want to use</Trans>}>
            <InputHandleCustom
              defaultValue={values.handle}
              onHandle={setterFor('handle')}
              did={did}
              name="domain"
              required
              autoFocus
              enterKeyHint="done"
            />
          </FormField>

          <InputHandleCustomInstructions
            className="text-sm"
            handle={values.handle}
            did={did}
          />
        </>
      )}
    />
  )
}

export function UpdateHandleDialog({
  handler,
  children,
  domains,
  currentHandle,
  did,
}: UpdateHandleDialogProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<HandleType | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) setView(null)
  }, [open])

  const dismissable = !submitting

  const [defaultHandle, customHandle] =
    currentHandle && domains.some((dom) => currentHandle.endsWith(dom))
      ? [currentHandle, undefined]
      : [undefined, currentHandle]

  if (view === HandleType.Default && domains.length) {
    return (
      <DialogSimple
        open={open}
        onOpenChange={setOpen}
        dismissable={dismissable}
        trigger={children}
        title={<Trans>Update your username</Trans>}
        description={<Trans>Choose a new default username.</Trans>}
      >
        <UpdateHandleDefaultForm
          domains={domains}
          onBack={() => setView(null)}
          values={{ handle: defaultHandle }}
          onLoadingChange={setSubmitting}
          handler={async (data, signal) => {
            await handler(data, signal)
            setOpen(false)
          }}
        />
      </DialogSimple>
    )
  }

  if (view === HandleType.Custom) {
    return (
      <DialogSimple
        open={open}
        onOpenChange={setOpen}
        dismissable={dismissable}
        trigger={children}
        title={<Trans>Update your username</Trans>}
        description={
          <Trans>
            Update your username to a domain name you own to self-verify your
            identity.
          </Trans>
        }
      >
        <UpdateHandleCustomForm
          did={did}
          onBack={() => setView(null)}
          submitLabel={<Trans>Verify and Save</Trans>}
          values={{ handle: customHandle }}
          onLoadingChange={setSubmitting}
          handler={async (data, signal) => {
            await handler(data, signal)
            setOpen(false)
          }}
        />
      </DialogSimple>
    )
  }

  return (
    <DialogSimple
      trigger={children}
      title={<Trans>Update your username</Trans>}
      description={
        <Trans>
          If you have your own domain, you can use that as your handle. This
          lets you self-verify your identity.{' '}
          <LinkExternal href="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial">
            Learn more here
          </LinkExternal>
          .
        </Trans>
      }
      open={open}
      onOpenChange={setOpen}
    >
      <div className="align-stretch flex flex-col gap-4">
        <Button
          onClick={() => setView(HandleType.Default)}
          disabled={!domains.length}
        >
          <ButtonContent
            label={<Trans>Use a default username</Trans>}
            example={
              <Trans>
                e.g. <em>alice{domains[0]}</em>
              </Trans>
            }
          />
        </Button>

        <Button onClick={() => setView(HandleType.Custom)}>
          <ButtonContent
            label={<Trans>Use a domain name I own</Trans>}
            example={
              <Trans>
                e.g. <em>alice.com</em>
              </Trans>
            }
          />
        </Button>
      </div>
    </DialogSimple>
  )
}

type ButtonContentProps = {
  label: ReactNode
  example: ReactNode
}

function ButtonContent({ label, example }: ButtonContentProps) {
  return (
    <span className="flex w-full flex-col gap-0.5 text-left">
      <span>{label}</span>
      <span className="text-ink-light text-sm leading-snug">{example}</span>
    </span>
  )
}
