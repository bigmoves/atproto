import { Trans } from '@lingui/react/macro'
import { type ReactNode, useState } from 'react'
import { useCustomizationData } from '#/contexts/customization.tsx'
import { type SignUpEmailData, SignUpEmailForm } from '../organisms/sign-up-email-form.tsx'
import {
  type SignUpHandleData,
  SignUpHandleForm,
} from '../organisms/sign-up-handle-form.tsx'
import {
  type SignUpHcaptchaData,
  SignUpHcaptchaForm,
} from '../organisms/sign-up-hcaptcha-form.tsx'
import {
  type SignUpPasswordData,
  SignUpPasswordForm,
} from '../organisms/sign-up-password-form.tsx'
import { AuthCard } from '../templates/auth-card.tsx'
import { WizardCard } from '../templates/wizard-card.tsx'

export type SignUpViewProps = {
  onBack?: () => void
  onValidateNewHandle: (data: SignUpHandleData) => void | PromiseLike<void>
  onDone: (
    data: SignUpEmailData &
      SignUpPasswordData & { handle: string; hcaptchaToken?: string },
  ) => void | PromiseLike<void>
}

type PendingData = Partial<
  SignUpHandleData &
    SignUpEmailData &
    SignUpPasswordData &
    SignUpHcaptchaData & { confirmPassword?: string }
>

/** v2 restyle of `#/components/sign-up-view.tsx` — same wizard-step logic, split into 4 steps (username, email, password, hCaptcha). */
export function SignUpView({ onBack, onValidateNewHandle, onDone }: SignUpViewProps) {
  const {
    availableUserDomains = [],
    hcaptchaSiteKey = undefined,
    inviteCodeRequired = true,
  } = useCustomizationData()

  const [pending, setPending] = useState<PendingData>({})

  // Matches the first step's title/subtitle/note below, so there's no flash
  // before WizardCard's onStepChange fires on mount.
  const [header, setHeader] = useState<{
    title: ReactNode
    subtitle: ReactNode
    note: ReactNode
  }>({
    title: <Trans>Choose a username</Trans>,
    subtitle: <Trans>This is how others will find you</Trans>,
    note: (
      <Trans>
        You can change this to any domain name you control after your
        account is set up.
      </Trans>
    ),
  })

  return (
    <AuthCard title={header.title} subtitle={header.subtitle} note={header.note}>
      <WizardCard
        onBack={onBack}
        doneLabel={<Trans>Sign up</Trans>}
        onStepChange={(title, subtitle, note) => setHeader({ title, subtitle, note })}
        onDone={([handle, email, password, hcaptcha]: [
          SignUpHandleData,
          SignUpEmailData,
          SignUpPasswordData,
          SignUpHcaptchaData | null,
        ]) => {
          return onDone({
            ...email,
            ...password,
            ...handle,
            hcaptchaToken: hcaptcha?.verify.token,
          })
        }}
        steps={[
          {
            title: <Trans>Choose a username</Trans>,
            subtitle: <Trans>This is how others will find you</Trans>,
            note: (
              <Trans>
                You can change this to any domain name you control after your
                account is set up.
              </Trans>
            ),
            contentRender: ({ prev, prevLabel, next, nextLabel }) => (
              <SignUpHandleForm
                className="grow"
                domains={availableUserDomains}
                onBack={prev}
                backLabel={prevLabel}
                submitLabel={nextLabel}
                values={pending}
                onValues={(val) => setPending((old) => ({ ...old, ...val }))}
                handler={async (data) => {
                  await onValidateNewHandle(data)
                  next(data)
                }}
              />
            ),
          },
          {
            title: <Trans>Create your account</Trans>,
            subtitle: <Trans>Enter your email address</Trans>,
            contentRender: ({ prev, prevLabel, next, nextLabel }) => (
              <SignUpEmailForm
                className="grow"
                onBack={prev}
                backLabel={prevLabel}
                submitLabel={nextLabel}
                values={pending}
                onValues={(val) => setPending((old) => ({ ...old, ...val }))}
                handler={next}
                inviteCodeRequired={inviteCodeRequired}
              />
            ),
          },
          {
            title: <Trans>Create a password</Trans>,
            subtitle: (
              <Trans>
                At least 8 characters, with a mix of letters, numbers, and
                symbols
              </Trans>
            ),
            contentRender: ({ prev, prevLabel, next, nextLabel }) => (
              <SignUpPasswordForm
                className="grow"
                onBack={prev}
                backLabel={prevLabel}
                submitLabel={nextLabel}
                values={pending}
                onValues={(val) => setPending((old) => ({ ...old, ...val }))}
                handler={next}
              />
            ),
          },
          hcaptchaSiteKey != null && {
            title: <Trans>Verify you are human</Trans>,
            subtitle: <Trans>One last step before you're done</Trans>,
            contentRender: ({ prev, prevLabel, next, nextLabel }) => (
              <SignUpHcaptchaForm
                className="grow"
                siteKey={hcaptchaSiteKey}
                onBack={prev}
                backLabel={prevLabel}
                submitLabel={nextLabel}
                values={pending}
                onValues={(val) => setPending((old) => ({ ...old, ...val }))}
                handler={next}
              />
            ),
          },
        ]}
      />
    </AuthCard>
  )
}
