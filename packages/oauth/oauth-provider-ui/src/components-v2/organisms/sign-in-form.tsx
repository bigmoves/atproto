import { Trans, useLingui } from '@lingui/react/macro'
import { type Ref, useCallback, useRef, useState } from 'react'
import type { Account } from '@atproto/oauth-provider-api'
import { AccountIdentifier } from '#/components/utils/account-identifier.tsx'
import { AccountName } from '#/components/utils/account-name.tsx'
import { useMergedRefs } from '#/hooks/use-merged-refs.ts'
import {
  InvalidCredentialsError,
  SecondAuthenticationFactorRequiredError,
} from '#/lib/api.ts'
import { isValidDomain } from '#/lib/handle.ts'
import type { Override } from '#/lib/util.ts'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'
import { InputCheckbox } from '../atoms/input-checkbox.tsx'
import { InputPassword } from '../atoms/input-password.tsx'
import { InputText } from '../atoms/input-text.tsx'
import { InputToken } from '../atoms/input-token.tsx'
import type { FormCardProps } from '../molecules/form-card.tsx'
import { FormField } from '../molecules/form-field.tsx'
import { type FormHandler, SmartForm } from '../molecules/smart-form.tsx'

export type SignInData = {
  username: string
  password: string
  remember?: boolean
  emailOtp?: string
}

export type SignInValues = {
  username: string
  password: string
  remember?: boolean
  otp?: string | null
}

export type SignInFormProps = Override<
  FormCardProps,
  {
    usernameDefault?: string
    usernameReadonly?: boolean
    /**
     * When the identifier belongs to a known account (e.g. re-authenticating
     * an existing session), pass it to show an avatar + name + handle card in
     * place of the read-only identifier field — "we found your account, enter
     * your password". `usernameDefault` should still carry the identifier.
     */
    account?: Account
    rememberDefault?: boolean
    disableRemember?: boolean
    domains?: readonly string[]

    onForgotPassword?: (emailHint?: string) => void
    onSignIn: (
      data: SignInData,
      signal: AbortSignal,
    ) => void | PromiseLike<void>

    ref?: Ref<FormHandler<SignInData, SignInValues>>
  }
>

/**
 * v2 restyle of `#/components/sign-in-form.tsx`. Same validation/2FA logic
 * (kept in sync deliberately — this is the flagship screen of the redesign),
 * new visual atoms.
 */
export function SignInForm({
  usernameDefault = '',
  usernameReadonly = false,
  account,
  rememberDefault = false,
  disableRemember = false,
  domains: availableDomains = [],

  onForgotPassword,
  onSignIn,

  // FormCard
  ...props
}: SignInFormProps) {
  const { t } = useLingui()
  const ref = useRef<FormHandler<SignInData, SignInValues> | null>(null)
  const refMerged = useMergedRefs(props.ref, ref)
  const domains = availableDomains.filter(isValidDomain)

  const [secondFactorError, setSecondFactorError] =
    useState<null | SecondAuthenticationFactorRequiredError>(null)

  const clearSecondFactor = useCallback(() => {
    ref.current?.set('otp', null)
    setSecondFactorError(null)
  }, [])

  return (
    <SmartForm
      {...props}
      ref={refMerged}
      submitLabel={
        secondFactorError ? (
          <Trans context="verb">Confirm</Trans>
        ) : (
          <Trans context="verb">Next</Trans>
        )
      }
      values={{
        username: usernameDefault,
        password: '',
        remember: rememberDefault,
        otp: null as string | null,
      }}
      onValues={(next, prev) => {
        if (
          prev.username !== next.username ||
          prev.password !== next.password
        ) {
          clearSecondFactor()
        }
      }}
      validate={(values): undefined | SignInData => {
        const { username, password, otp, remember } = values
        if (!username || !password) return
        if (secondFactorError && !otp) return
        return {
          username,
          password,
          remember: !disableRemember && remember,
          ...(secondFactorError && otp
            ? { [secondFactorError.type]: otp }
            : {}),
        }
      }}
      handler={async (data: SignInData, signal) => {
        try {
          await onSignIn(data, signal)
        } catch (err) {
          if (err instanceof SecondAuthenticationFactorRequiredError) {
            setSecondFactorError(err)
            const shouldThrow =
              secondFactorError != null &&
              secondFactorError.hint === err.hint &&
              secondFactorError.type === err.type
            if (!shouldThrow) return
          } else if (err instanceof InvalidCredentialsError) {
            clearSecondFactor()
          }
          throw err
        }
      }}
      fields={({ values, loading, set, setterFor }) => (
        <>
          {account ? (
            // Known account (session re-auth): show an identity card instead
            // of the identifier field. The username still travels in form
            // state; a hidden field keeps password managers associating the
            // saved credential with the right account.
            <>
              <div className="bg-surface-2 border-surface-border rounded-control flex items-center gap-3 border px-4 py-3">
                <AvatarBadge account={account} size="md" />
                <div className="min-w-0 flex-1">
                  {account.name && (
                    <AccountName
                      account={account}
                      className="text-ink block truncate font-serif text-base font-semibold"
                    />
                  )}
                  <AccountIdentifier
                    account={account}
                    className="text-ink-light block truncate text-sm"
                  />
                </div>
              </div>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={values.username}
                readOnly
                hidden
              />
            </>
          ) : (
            <FormField disabled={loading} label={<Trans>Identifier</Trans>}>
              <InputText
                name="username"
                type="text"
                title={t`Username or email address`}
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                spellCheck="false"
                dir="auto"
                enterKeyHint="next"
                required
                readOnly={usernameReadonly}
                disabled={usernameReadonly}
                autoFocus={!usernameReadonly}
                pattern="([^@]+@[^@]+|[^.@]+(\.[^.@]+)+)|did:[a-z0-9]+:.+"
                value={values.username}
                onChange={(event) => set('username', event.target.value)}
                onBlur={(event) => {
                  if (usernameReadonly) return
                  let value = event.target.value.trim().toLowerCase()
                  if (value.startsWith('@')) value = value.slice(1)
                  if (
                    value.length > 0 &&
                    !value.startsWith('did:') &&
                    !value.includes('@') &&
                    !value.includes('.') &&
                    domains.length > 0
                  ) {
                    set('username', `${value}${domains[0]}`)
                  }
                }}
              />
            </FormField>
          )}

          <FormField
            disabled={loading}
            label={
              <span className="flex w-full items-center justify-between">
                <Trans>Password</Trans>
                {onForgotPassword && (
                  <button
                    type="button"
                    className="text-primary font-medium hover:underline"
                    onClick={() => {
                      onForgotPassword(
                        values.username?.includes('@')
                          ? values.username
                          : undefined,
                      )
                    }}
                    aria-label={t`Reset your password`}
                  >
                    <Trans>Forgot?</Trans>
                  </button>
                )}
              </span>
            }
          >
            <InputPassword
              name="password"
              defaultValue={values.password}
              onPassword={setterFor('password')}
              enterKeyHint={secondFactorError ? 'next' : 'done'}
              disabled={loading}
              autoFocus={usernameReadonly}
              required
            />
          </FormField>

          {!disableRemember && (
            <InputCheckbox
              name="remember"
              title={t`Remember this account on this device`}
              checked={values.remember}
              onChange={(event) => set('remember', event.target.checked)}
            >
              <Trans>Remember this device</Trans>
            </InputCheckbox>
          )}

          {secondFactorError && (
            <FormField
              key="2fa"
              disabled={loading}
              label={<Trans>2FA Confirmation</Trans>}
            >
              <div>
                <InputToken
                  title={t`Confirmation code`}
                  enterKeyHint="done"
                  required
                  autoFocus={true}
                  defaultValue={values.otp ?? ''}
                  onToken={setterFor('otp')}
                />
                <p className="text-ink-light mt-1 text-sm">
                  <Trans>
                    Check your {secondFactorError.hint} email for a login code
                    and enter it here.
                  </Trans>
                </p>
              </div>
            </FormField>
          )}
        </>
      )}
    />
  )
}
