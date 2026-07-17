import { Trans } from '@lingui/react/macro'
import {
  AtIcon,
  CaretRightIcon,
  EnvelopeIcon,
  type Icon,
  LockIcon,
  ShieldWarningIcon,
  SnowflakeIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { DeactivateAccountDialog } from '#/components/deactivate-account-dialog.tsx'
import { DeleteAccountDialog } from '#/components/delete-account-dialog.tsx'
import { Button, type ButtonProps } from '#/components/forms/button.tsx'
import { ReactivateAccountDialog } from '#/components/reactivate-account-dialog.tsx'
import { UpdateEmailDialog } from '#/components/update-email-dialog.tsx'
import { UpdateHandleDialog } from '#/components/update-handle-dialog.tsx'
import { UpdatePasswordDialog } from '#/components/update-password-dialog.tsx'
import { Admonition } from '#/components/utils/admonition'
import { Handle } from '#/components/utils/handle.tsx'
import { VerifyEmailDialog } from '#/components/verify-email-dialog.tsx'
import { Admonition as AdmonitionV2 } from '#/components-v2/atoms/admonition.tsx'
import { Button as ButtonV2 } from '#/components-v2/atoms/button.tsx'
import { Handle as HandleV2 } from '#/components-v2/atoms/handle.tsx'
import { PageHeader } from '#/components-v2/molecules/page-header.tsx'
import {
  SettingsList,
  SettingsRow,
} from '#/components-v2/molecules/settings-row.tsx'
import { DeactivateAccountDialog as DeactivateAccountDialogV2 } from '#/components-v2/organisms/deactivate-account-dialog.tsx'
import { DeleteAccountDialog as DeleteAccountDialogV2 } from '#/components-v2/organisms/delete-account-dialog.tsx'
import { ReactivateAccountDialog as ReactivateAccountDialogV2 } from '#/components-v2/organisms/reactivate-account-dialog.tsx'
import { UpdateEmailDialog as UpdateEmailDialogV2 } from '#/components-v2/organisms/update-email-dialog.tsx'
import { UpdateHandleDialog as UpdateHandleDialogV2 } from '#/components-v2/organisms/update-handle-dialog.tsx'
import { UpdatePasswordDialog as UpdatePasswordDialogV2 } from '#/components-v2/organisms/update-password-dialog.tsx'
import { VerifyEmailDialog as VerifyEmailDialogV2 } from '#/components-v2/organisms/verify-email-dialog.tsx'
import { useAuthenticatedSession } from '#/contexts/authentication.tsx'
import { useCustomizationData } from '#/contexts/customization.tsx'
import {
  useDeactivateAccount,
  useDeleteAccountConfirm,
  useDeleteAccountRequest,
  useReactivateAccount,
} from '#/data/account.ts'
import {
  useUpdateEmailConfirm,
  useUpdateEmailRequest,
  useVerifyEmailConfirm,
  useVerifyEmailRequest,
} from '#/data/email.ts'
import { useUpdateHandle } from '#/data/handle.ts'
import {
  useResetPasswordConfirm,
  useResetPasswordRequest,
} from '#/data/password.ts'
import { NEW_DESIGN_ENABLED } from '#/lib/feature-flags.ts'
import type { Override } from '#/lib/util.ts'

export function Page() {
  return NEW_DESIGN_ENABLED ? <PageV2 /> : <PageV1 />
}

function PageV1() {
  return (
    <div className="flex flex-col gap-2">
      <EmailVerificationRow />
      <EmailUpdateRow />
      <hr className="border-none" aria-hidden />
      <HandleUpdateRow />
      <PasswordUpdateRow />
      <hr className="border-none" aria-hidden />
      <AccountStatusRow />
      <AccountDeletionRow />
    </div>
  )
}

/**
 * v2 restyle: uses the fully-ported v2 dialogs (`components-v2/organisms/*`)
 * so the form content inside matches the new visual language — not just the
 * trigger rows. Data hooks (`#/data/*`) and contexts are reused as-is; only
 * the presentational layer is duplicated.
 */
function PageV2() {
  return (
    <div>
      <PageHeader back>
        <Trans>Account</Trans>
      </PageHeader>

      <div className="flex flex-col gap-4">
        <EmailVerificationRowV2 />
        <SettingsList>
          <EmailUpdateRowV2 />
          <HandleUpdateRowV2 />
          <PasswordUpdateRowV2 />
        </SettingsList>
        <SettingsList>
          <AccountStatusRowV2 />
          <AccountDeletionRowV2 />
        </SettingsList>
      </div>
    </div>
  )
}

function EmailUpdateRowV2() {
  const { account } = useAuthenticatedSession()
  const data = useCustomizationData()
  const { did, email } = account

  const updateRequest = useUpdateEmailRequest()
  const updateConfirm = useUpdateEmailConfirm()
  const verifyRequest = useVerifyEmailRequest()
  const verifyConfirm = useVerifyEmailConfirm()

  return (
    <UpdateEmailDialogV2
      email={email}
      requestPending={updateRequest.isPending}
      confirmPending={updateConfirm.isPending}
      onUpdateRequest={async () => updateRequest.mutateAsync({ did })}
      onUpdateConfirm={async ({ email, token }) => {
        await updateConfirm.mutateAsync({ did, email, token })
      }}
      onVerifyRequest={async () => {
        await verifyRequest.mutateAsync({ did })
      }}
      onVerifyConfirm={async ({ email, token }) => {
        await verifyConfirm.mutateAsync({ did, email, token })
      }}
      introMessage={
        data.show2FaWarningOnEmailUpdate && (
          <AdmonitionV2 role="warning" className="text-sm">
            <Trans>
              If you update your email address, email 2FA (if enabled) will be
              disabled.
            </Trans>
          </AdmonitionV2>
        )
      }
    >
      <SettingsRow label={<Trans>Email</Trans>} value={email} />
    </UpdateEmailDialogV2>
  )
}

function HandleUpdateRowV2() {
  const { account } = useAuthenticatedSession()
  const { availableUserDomains = [] } = useCustomizationData()
  const { did, handle } = account
  const updateHandle = useUpdateHandle()

  return (
    <UpdateHandleDialogV2
      did={did}
      currentHandle={handle}
      domains={availableUserDomains}
      handler={async ({ handle }) => {
        await updateHandle.mutateAsync({ did, handle })
      }}
    >
      <SettingsRow
        label={<Trans>Handle</Trans>}
        value={<HandleV2 handle={handle} />}
      />
    </UpdateHandleDialogV2>
  )
}

function PasswordUpdateRowV2() {
  const { account } = useAuthenticatedSession()
  const { email } = account
  const resetPasswordRequest = useResetPasswordRequest()
  const resetPasswordConfirm = useResetPasswordConfirm()

  if (!email) return null

  return (
    <UpdatePasswordDialogV2
      email={email}
      requestPending={resetPasswordRequest.isPending}
      confirmPending={resetPasswordConfirm.isPending}
      onRequest={async () => {
        await resetPasswordRequest.mutateAsync({ email })
      }}
      onConfirm={async ({ token, password }) => {
        await resetPasswordConfirm.mutateAsync({ token, password })
      }}
    >
      <SettingsRow label={<Trans>Password</Trans>} value="••••••••" />
    </UpdatePasswordDialogV2>
  )
}

function AccountStatusRowV2() {
  const { account } = useAuthenticatedSession()
  const deactivate = useDeactivateAccount()
  const reactivate = useReactivateAccount()

  if (account.deactivated) {
    return (
      <ReactivateAccountDialogV2
        onConfirm={async () => {
          await reactivate.mutateAsync({ did: account.did })
        }}
      >
        <SettingsRow>
          <Trans>Reactivate account</Trans>
        </SettingsRow>
      </ReactivateAccountDialogV2>
    )
  }

  return (
    <DeactivateAccountDialogV2
      onConfirm={async () => {
        await deactivate.mutateAsync({ did: account.did })
      }}
    >
      <SettingsRow>
        <Trans>Deactivate account</Trans>
      </SettingsRow>
    </DeactivateAccountDialogV2>
  )
}

function AccountDeletionRowV2() {
  const { account } = useAuthenticatedSession()
  const { did, email, handle } = account
  const deleteRequest = useDeleteAccountRequest()
  const deleteConfirm = useDeleteAccountConfirm()

  return (
    <DeleteAccountDialogV2
      handle={handle}
      email={email}
      requestPending={deleteRequest.isPending}
      confirmPending={deleteConfirm.isPending}
      onRequest={async () => {
        await deleteRequest.mutateAsync({ did })
      }}
      onConfirm={async ({ token, password }) => {
        await deleteConfirm.mutateAsync({ did, token, password })
      }}
    >
      <SettingsRow danger>
        <Trans>Delete account</Trans>
      </SettingsRow>
    </DeleteAccountDialogV2>
  )
}

function EmailVerificationRowV2() {
  const { account } = useAuthenticatedSession()
  const { did, email, emailVerified } = account

  const verifyRequest = useVerifyEmailRequest()
  const verifyConfirm = useVerifyEmailConfirm()

  if (!email || emailVerified) return null

  return (
    <AdmonitionV2
      role="info"
      icon={ShieldWarningIcon}
      action={
        <VerifyEmailDialogV2
          email={email}
          requestPending={verifyRequest.isPending}
          confirmPending={verifyConfirm.isPending}
          onRequest={async () => {
            await verifyRequest.mutateAsync({ did })
          }}
          onConfirm={async ({ token }) => {
            await verifyConfirm.mutateAsync({ did, token, email })
          }}
        >
          <ButtonV2 size="sm" color="info">
            <Trans context="verify email">Verify now</Trans>
          </ButtonV2>
        </VerifyEmailDialogV2>
      }
    >
      <Trans>Your email address needs to be verified.</Trans>
    </AdmonitionV2>
  )
}

function EmailVerificationRow() {
  const { account } = useAuthenticatedSession()
  const { did, email, emailVerified } = account

  const verifyRequest = useVerifyEmailRequest()
  const verifyConfirm = useVerifyEmailConfirm()

  if (!email || emailVerified) return null

  return (
    <Admonition
      role="info"
      icon={ShieldWarningIcon}
      action={
        <VerifyEmailDialog
          email={email}
          requestPending={verifyRequest.isPending}
          confirmPending={verifyConfirm.isPending}
          onRequest={async () => {
            await verifyRequest.mutateAsync({ did })
          }}
          onConfirm={async ({ token }) => {
            await verifyConfirm.mutateAsync({ did, token, email })
          }}
        >
          <Button size="sm" color="info">
            <Trans context="verify email">Verify now</Trans>
          </Button>
        </VerifyEmailDialog>
      }
    >
      <Trans>Your email address needs to be verified.</Trans>
    </Admonition>
  )
}

function EmailUpdateRow(props: Omit<RowProps, 'icon' | 'value'>) {
  const { account } = useAuthenticatedSession()
  const data = useCustomizationData()
  const { did, email } = account

  const updateRequest = useUpdateEmailRequest()
  const updateConfirm = useUpdateEmailConfirm()
  const verifyRequest = useVerifyEmailRequest()
  const verifyConfirm = useVerifyEmailConfirm()

  return (
    <UpdateEmailDialog
      email={email}
      requestPending={updateRequest.isPending}
      confirmPending={updateConfirm.isPending}
      onUpdateRequest={async () => {
        return updateRequest.mutateAsync({ did })
      }}
      onUpdateConfirm={async ({ email, token }) => {
        await updateConfirm.mutateAsync({ did, email, token })
      }}
      onVerifyRequest={async () => {
        await verifyRequest.mutateAsync({ did })
      }}
      onVerifyConfirm={async ({ email, token }) => {
        await verifyConfirm.mutateAsync({ did, email, token })
      }}
      introMessage={
        data.show2FaWarningOnEmailUpdate && (
          <Admonition role="warning" className="text-sm">
            <Trans>
              If you update your email address, email 2FA (if enabled) will be
              disabled.
            </Trans>
          </Admonition>
        )
      }
    >
      <Row {...props} icon={EnvelopeIcon} value={email}>
        <Trans>Email address</Trans>
      </Row>
    </UpdateEmailDialog>
  )
}

function PasswordUpdateRow(props: Omit<RowProps, 'icon' | 'value'>) {
  const { account } = useAuthenticatedSession()
  const { email } = account

  const resetPasswordRequest = useResetPasswordRequest()
  const resetPasswordConfirm = useResetPasswordConfirm()

  // The /reset-password-request endpoint requires an email, so if the user
  // doesn't have one, we can't let them update their password. These users
  // should not exist in normal conditions (may have been created manually by an
  // admin), and are expected to contact support to update their password.
  if (!email) return null

  return (
    <UpdatePasswordDialog
      email={email}
      requestPending={resetPasswordRequest.isPending}
      confirmPending={resetPasswordConfirm.isPending}
      onRequest={async () => {
        await resetPasswordRequest.mutateAsync({ email })
      }}
      onConfirm={async ({ token, password }) => {
        await resetPasswordConfirm.mutateAsync({ token, password })
      }}
    >
      <Row {...props} icon={LockIcon}>
        <Trans>Password</Trans>
      </Row>
    </UpdatePasswordDialog>
  )
}

function AccountStatusRow(props: Omit<RowProps, 'icon' | 'value'>) {
  const { account } = useAuthenticatedSession()
  const deactivate = useDeactivateAccount()
  const reactivate = useReactivateAccount()

  if (account.deactivated) {
    return (
      <ReactivateAccountDialog
        onConfirm={async () => {
          await reactivate.mutateAsync({ did: account.did })
        }}
      >
        <Row {...props} icon={SnowflakeIcon} color="primary">
          <Trans>Reactivate account</Trans>
        </Row>
      </ReactivateAccountDialog>
    )
  }

  return (
    <DeactivateAccountDialog
      onConfirm={async () => {
        await deactivate.mutateAsync({ did: account.did })
      }}
    >
      <Row {...props} icon={SnowflakeIcon} color="error">
        <Trans>Deactivate account</Trans>
      </Row>
    </DeactivateAccountDialog>
  )
}

function AccountDeletionRow(props: Omit<RowProps, 'icon' | 'value'>) {
  const { account } = useAuthenticatedSession()
  const { did, email, handle } = account

  const deleteRequest = useDeleteAccountRequest()
  const deleteConfirm = useDeleteAccountConfirm()

  return (
    <DeleteAccountDialog
      handle={handle}
      email={email}
      requestPending={deleteRequest.isPending}
      confirmPending={deleteConfirm.isPending}
      onRequest={async () => {
        await deleteRequest.mutateAsync({ did })
      }}
      onConfirm={async ({ token, password }) => {
        await deleteConfirm.mutateAsync({ did, token, password })
      }}
    >
      <Row {...props} icon={TrashIcon} color="error">
        <Trans>Delete account</Trans>
      </Row>
    </DeleteAccountDialog>
  )
}

function HandleUpdateRow(props: Omit<RowProps, 'icon' | 'value'>) {
  const { account } = useAuthenticatedSession()
  const { availableUserDomains = [] } = useCustomizationData()
  const { did, handle } = account

  const updateHandle = useUpdateHandle()

  return (
    <UpdateHandleDialog
      did={did}
      currentHandle={handle}
      domains={availableUserDomains}
      handler={async ({ handle }) => {
        await updateHandle.mutateAsync({ did, handle })
      }}
    >
      <Row {...props} icon={AtIcon} value={<Handle handle={handle} />}>
        <Trans>Username</Trans>
      </Row>
    </UpdateHandleDialog>
  )
}

type RowProps = Override<
  ButtonProps,
  {
    icon: Icon
    value?: ReactNode
  }
>

function Row({
  icon: Icon,
  value,

  // ButtonProps
  children,
  className,
  transparent = true,
  ...props
}: RowProps) {
  return (
    <Button
      shape="padded"
      {...props}
      transparent={transparent}
      className={clsx('gap-2', className)}
    >
      <Icon aria-hidden className="size-5 shrink-0 grow-0" />
      <span className="grow-1 truncate text-left font-medium">{children}</span>
      {value != null && (
        <span className="hidden min-w-0 flex-1 truncate text-right text-sm sm:inline">
          {value}
        </span>
      )}
      <CaretRightIcon aria-hidden className="size-4 shrink-0" />
    </Button>
  )
}
