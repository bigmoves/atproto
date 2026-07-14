import { Trans, useLingui } from '@lingui/react/macro'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { ButtonRequestCode } from '../atoms/button-request-code.tsx'
import { Button } from '../atoms/button.tsx'
import { InputNewPassword } from '../atoms/input-new-password.tsx'
import { InputToken } from '../atoms/input-token.tsx'
import { DialogSimple } from '../molecules/dialog-simple.tsx'
import { FormField } from '../molecules/form-field.tsx'
import {
  SmartForm,
  type WrappedSmartFormProps,
} from '../molecules/smart-form.tsx'

export type UpdatePasswordDialogProps = {
  email: string
  requestPending?: boolean
  confirmPending?: boolean
  onRequest: () => void | PromiseLike<void>
  onConfirm: (data: {
    token: string
    password: string
  }) => void | PromiseLike<void>
  children: Exclude<ReactNode, false | null | undefined>
}

enum UpdatePasswordDialogState {
  Request,
  Confirm,
}

type ResetPasswordConfirmData = { token: string; password: string }
type ResetPasswordConfirmFormProps =
  WrappedSmartFormProps<ResetPasswordConfirmData> & {
    email?: string
    onResend?: () => void | PromiseLike<void>
  }

function ResetPasswordConfirmForm({
  email,
  onResend,
  ...props
}: ResetPasswordConfirmFormProps) {
  const passwordRef = useRef<HTMLInputElement>(null)
  return (
    <SmartForm
      {...props}
      validate={({
        token,
        password,
      }: {
        token?: string
        password?: string
      }) => {
        if (token && password) return { token, password }
      }}
      fields={({ values, set, setterFor }) => (
        <>
          {email && (
            <input
              type="text"
              autoComplete="username"
              defaultValue={email}
              readOnly
              hidden
            />
          )}

          <FormField label={<Trans>Reset code</Trans>}>
            <InputToken
              name="code"
              enterKeyHint="next"
              required
              autoFocus
              defaultValue={values.token}
              onResend={onResend}
              onToken={(value) => {
                set('token', value ?? undefined)
                if (value) passwordRef.current?.focus()
              }}
            />
          </FormField>

          <FormField label={<Trans>New password</Trans>}>
            <InputNewPassword
              ref={passwordRef}
              name="password"
              enterKeyHint="done"
              required
              defaultValue={values.password}
              onPassword={setterFor('password')}
            />
          </FormField>
        </>
      )}
    />
  )
}

export function UpdatePasswordDialog({
  email,
  requestPending,
  confirmPending,
  onRequest,
  onConfirm,
  children,
}: UpdatePasswordDialogProps) {
  const { t } = useLingui()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<UpdatePasswordDialogState>(
    UpdatePasswordDialogState.Request,
  )
  const [confirmSubmitting, setConfirmSubmitting] = useState(false)

  useEffect(() => {
    if (!open) setState(UpdatePasswordDialogState.Request)
  }, [open])

  const dismissable = !requestPending && !confirmSubmitting

  return (
    <DialogSimple
      trigger={children}
      title={t`Change your password`}
      description={
        <Trans>
          To change your password, you'll need to enter a security code sent to
          your email.
        </Trans>
      }
      open={open}
      onOpenChange={setOpen}
      dismissable={dismissable}
    >
      {state === UpdatePasswordDialogState.Request ? (
        <div className="align-stretch flex flex-col gap-4">
          <ButtonRequestCode
            action={async () => {
              await onRequest()
              setState(UpdatePasswordDialogState.Confirm)
            }}
            loading={requestPending}
            disabled={confirmPending}
            color="primary"
            className="w-full"
          />

          <Button
            onClick={() => setState(UpdatePasswordDialogState.Confirm)}
            className="w-full"
          >
            <Trans>Already have a code?</Trans>
          </Button>
        </div>
      ) : (
        <ResetPasswordConfirmForm
          email={email}
          disabled={confirmPending}
          onLoadingChange={setConfirmSubmitting}
          onResend={onRequest}
          handler={async (data) => {
            await onConfirm(data)
            setOpen(false)
          }}
        />
      )}
    </DialogSimple>
  )
}
