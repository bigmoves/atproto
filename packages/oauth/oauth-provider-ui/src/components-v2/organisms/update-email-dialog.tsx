import { Trans } from '@lingui/react/macro'
import { CheckIcon } from '@phosphor-icons/react'
import { type ReactNode, useEffect, useState } from 'react'
import { InputEmailAddress } from '../atoms/input-email-address.tsx'
import { InputToken } from '../atoms/input-token.tsx'
import { DialogSimple } from '../molecules/dialog-simple.tsx'
import { FormField } from '../molecules/form-field.tsx'
import {
  SmartForm,
  type WrappedSmartFormProps,
} from '../molecules/smart-form.tsx'

export type UpdateEmailDialogProps = {
  email?: string
  requestPending?: boolean
  confirmPending?: boolean
  onUpdateRequest: () => Promise<{ tokenRequired: boolean }>
  onUpdateConfirm: (data: { email: string; token?: string }) => Promise<void>
  onVerifyRequest?: () => Promise<void>
  onVerifyConfirm?: (data: { email: string; token: string }) => Promise<void>
  children: Exclude<ReactNode, false | null | undefined>
  introMessage?: ReactNode
}

enum Step {
  Init,
  Token,
  Verify,
}

type UpdateEmailFormData = { email: string; token: string }
type UpdateEmailFormProps = WrappedSmartFormProps<UpdateEmailFormData> & {
  emailCurrent?: string
  requestPending?: boolean
  onResend: () => void | PromiseLike<void>
}

function UpdateEmailForm({
  emailCurrent,
  requestPending,
  onResend,
  ...props
}: UpdateEmailFormProps) {
  return (
    <SmartForm
      {...props}
      loading={props.loading || requestPending}
      validate={({ email, token }: { email?: string; token?: string }) => {
        if (email && token) return { email, token }
      }}
      fields={({ values, set }) => (
        <>
          {emailCurrent && (
            <>
              <input type="password" autoComplete="current-password" hidden />
              <input
                type="email"
                autoComplete="username"
                defaultValue={emailCurrent}
                readOnly
                hidden
              />
            </>
          )}

          <FormField label={<Trans>New email address</Trans>}>
            <InputEmailAddress
              name="newEmail"
              required
              autoFocus
              defaultValue={values.email}
              onEmail={(value) => set('email', value)}
            />
          </FormField>

          <hr className="border-surface-border" />

          <div>
            <h3 className="text-ink text-base font-semibold">
              <Trans>Security step required</Trans>
            </h3>
            <p className="text-ink-light mt-1 text-sm">
              <Trans>
                Please enter the security code that was sent to your email
                address.
              </Trans>
            </p>
          </div>

          <FormField label={<Trans>Security code</Trans>}>
            <InputToken
              name="code"
              required
              autoFocus
              defaultValue={values.token}
              onToken={(value) => set('token', value ?? undefined)}
              onResend={onResend}
            />
          </FormField>
        </>
      )}
    />
  )
}

export function UpdateEmailDialog({
  email: emailCurrent,
  requestPending,
  confirmPending,
  onUpdateRequest,
  onUpdateConfirm,
  onVerifyRequest,
  onVerifyConfirm,
  children,
  introMessage,
}: UpdateEmailDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(Step.Init)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setStep(Step.Init)
    setEmail(undefined)
  }, [open])

  const dismissable = !submitting

  if (step === Step.Verify && email && onVerifyConfirm) {
    return (
      <DialogSimple
        trigger={children}
        open={open}
        onOpenChange={setOpen}
        dismissable={dismissable}
        title={
          <>
            <CheckIcon className="text-success mr-2 inline" weight="bold" />
            <Trans>Email address successfully updated</Trans>
          </>
        }
        description={
          <Trans>
            Your email address has been successfully updated and needs to be
            verified. Please enter the verification code that was sent to{' '}
            <strong>{email}</strong>.
          </Trans>
        }
      >
        <SmartForm
          onCancel={() => setOpen(false)}
          cancelLabel={<Trans context="verify email">Later</Trans>}
          submitLabel={<Trans context="verify email">Verify now</Trans>}
          onLoadingChange={setSubmitting}
          validate={({ token }: { token?: string }) =>
            token ? { token, email } : undefined
          }
          handler={async (data) => {
            await onVerifyConfirm(data)
            setOpen(false)
          }}
          fields={({ values, set }) => (
            <FormField label={<Trans>Verification code</Trans>}>
              <InputToken
                name="code"
                required
                autoFocus
                defaultValue={values.token ?? undefined}
                onToken={(value) => set('token', value ?? undefined)}
                onResend={onVerifyRequest}
              />
            </FormField>
          )}
        />
      </DialogSimple>
    )
  }

  if (step === Step.Token) {
    return (
      <DialogSimple
        trigger={children}
        open={open}
        onOpenChange={setOpen}
        dismissable={dismissable}
        title={<Trans>Update your email</Trans>}
        description={
          <Trans>
            Choose a new email address to associate with your account.
          </Trans>
        }
      >
        <UpdateEmailForm
          emailCurrent={emailCurrent}
          requestPending={requestPending}
          loading={confirmPending}
          values={{ email }}
          onLoadingChange={setSubmitting}
          onCancel={() => setOpen(false)}
          onResend={async () => {
            await onUpdateRequest()
          }}
          handler={async (data) => {
            await onUpdateConfirm(data)

            setEmail(data.email)

            if (onVerifyConfirm) setStep(Step.Verify)
            else setOpen(false)
          }}
        />
      </DialogSimple>
    )
  }

  return (
    <DialogSimple
      trigger={children}
      open={open}
      onOpenChange={setOpen}
      dismissable={dismissable}
      title={<Trans>Update your email</Trans>}
      description={
        <Trans>
          Choose a new email address to associate with your account.
        </Trans>
      }
    >
      <SmartForm
        disabled={requestPending}
        values={{ email }}
        onLoadingChange={setSubmitting}
        validate={({ email }: { email?: string }) =>
          email ? { email } : undefined
        }
        onCancel={() => setOpen(false)}
        handler={async (data: { email: string; token?: string }) => {
          const { tokenRequired } = await onUpdateRequest()

          setEmail(data.email)

          if (tokenRequired) setStep(Step.Token)
          else {
            await onUpdateConfirm(data)

            if (onVerifyConfirm) setStep(Step.Verify)
            else setOpen(false)
          }
        }}
        fields={({ values, set }) => (
          <>
            {introMessage}

            <FormField label={<Trans>New email address</Trans>}>
              <InputEmailAddress
                name="email"
                required
                autoFocus
                defaultValue={values.email}
                onEmail={(email) => set('email', email)}
              />
            </FormField>
          </>
        )}
      />
    </DialogSimple>
  )
}
