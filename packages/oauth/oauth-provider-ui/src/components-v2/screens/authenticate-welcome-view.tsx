import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Button } from '../atoms/button.tsx'
import { AuthCard } from '../templates/auth-card.tsx'

export type AuthenticateWelcomeViewParams = {
  onSignIn?: () => void
  onSignUp?: () => void
  onCancel?: () => void
}

/** v2 restyle of `#/components/authenticate-welcome-view.tsx`. */
export function AuthenticateWelcomeView({
  onSignUp,
  onSignIn,
  onCancel,
}: AuthenticateWelcomeViewParams) {
  return (
    <AuthCard
      title={msg({ message: 'Welcome', context: 'AuthenticationPage' })}
      subtitle={<Trans>Please authenticate to continue</Trans>}
    >
      <div className="flex w-full flex-col gap-3">
        {onSignUp && (
          <Button
            className="w-full"
            color={onSignIn ? 'primary' : 'gray'}
            onClick={onSignUp}
          >
            <Trans>Create a new account</Trans>
          </Button>
        )}

        {onSignIn && (
          <Button
            className="w-full"
            color={onSignUp ? 'gray' : 'primary'}
            onClick={onSignIn}
          >
            <Trans context="verb">Sign in</Trans>
          </Button>
        )}

        {onCancel && (
          <>
            <hr className="border-contrast-100 my-2" />
            <Button className="w-full" onClick={onCancel}>
              <Trans>Cancel</Trans>
            </Button>
          </>
        )}
      </div>
    </AuthCard>
  )
}
