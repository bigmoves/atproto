import { XIcon } from '@phosphor-icons/react'
import type { Account, Session } from '@atproto/oauth-provider-api'
import type { OAuthClientMetadata } from '@atproto/oauth-types'
import { AuthenticateWelcomeView } from '../screens/authenticate-welcome-view.tsx'
import { ConsentView } from '../screens/consent-view.tsx'
import { CookieErrorView } from '../screens/cookie-error-view.tsx'
import { ErrorView } from '../screens/error-view.tsx'
import { RedirectingView } from '../screens/redirecting-view.tsx'
import { SignInView } from '../screens/sign-in-view.tsx'
import { SignUpView } from '../screens/sign-up-view.tsx'
import DevComponentCatalog from './dev-component-catalog.tsx'
import type { DevScreenId } from './dev-screen-store.ts'

const MOCK_ACCOUNT: Account = {
  did: 'did:plc:mockmockmockmockmockmock',
  pds: 'did:web:pds.example.com',
  deactivated: false,
  email: 'alice@example.com',
  emailVerified: true,
  name: 'Alice',
  handle: 'alice.test' as Account['handle'],
  picture: undefined,
}

const MOCK_SESSION: Session = {
  account: MOCK_ACCOUNT,
  loginRequired: false,
}

const MOCK_CLIENT_METADATA: OAuthClientMetadata = {
  redirect_uris: ['https://example.com/callback'] as OAuthClientMetadata['redirect_uris'],
  response_types: ['code'],
  grant_types: ['authorization_code', 'refresh_token'],
  application_type: 'web',
  subject_type: 'public',
  token_endpoint_auth_method: 'none',
  authorization_signed_response_alg: 'RS256',
  client_id: 'https://example.com/client-metadata.json',
  client_name: 'Example App',
  client_uri: 'https://example.com',
  logo_uri: undefined,
  tos_uri: 'https://example.com/tos',
  policy_uri: 'https://example.com/privacy',
}

const noop = () => {}
const asyncNoop = async () => {}

function ScreenFor({ id }: { id: DevScreenId }) {
  switch (id) {
    case 'welcome':
      return (
        <AuthenticateWelcomeView
          onSignIn={noop}
          onSignUp={noop}
          onCancel={noop}
        />
      )
    case 'sign-in':
      return (
        <SignInView
          sessions={[MOCK_SESSION]}
          session={null}
          setSession={noop}
          onSignIn={asyncNoop}
          onSignUp={noop}
          onForgotPassword={noop}
          onBack={noop}
        />
      )
    case 'sign-up':
      return (
        <SignUpView
          onBack={noop}
          onValidateNewHandle={asyncNoop}
          onDone={asyncNoop}
        />
      )
    case 'consent':
      return (
        <ConsentView
          clientId={MOCK_CLIENT_METADATA.client_id ?? 'https://example.com'}
          clientMetadata={MOCK_CLIENT_METADATA}
          clientTrusted={false}
          clientFirstParty={false}
          permissionSets={{}}
          account={MOCK_ACCOUNT}
          scope="atproto transition:generic"
          onConsent={noop}
          onReject={noop}
          onBack={noop}
        />
      )
    case 'redirecting':
      return (
        <RedirectingView
          title="Login complete"
          redirectUrl="https://example.com/callback?code=mock"
          redirectMode="assign"
          redirectCooldown={999}
        />
      )
    case 'error':
      return (
        <ErrorView
          error={new Error('This is a mocked error for style preview.')}
          retry={noop}
        />
      )
    case 'cookie-error':
      return (
        <CookieErrorView continueUrl="https://example.com/oauth/authorize?redirect-test=2" />
      )
    case 'components':
      return <DevComponentCatalog />
  }
}

/**
 * Dev-only full-screen preview overlay. Renders any v2 screen with mock
 * data so branding/styling consistency can be checked without needing to
 * genuinely reach that screen's real trigger condition (a signed-out
 * session, a real OAuth client, cookies actually failing, etc). Entirely
 * client-side — no routing or server involvement.
 */
function DevScreenGallery({
  screenId,
  onClose,
}: {
  screenId: DevScreenId
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[300]">
      <ScreenFor id={screenId} />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="bg-contrast-900 fixed right-4 top-4 z-[301] flex size-9 items-center justify-center rounded-full text-white shadow-lg"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

// Default export so this module works with React.lazy() — dev-tools.tsx
// dynamically imports it so the (sizeable) mocked screens only download
// when a preview is actually opened, not on every production page load.
export default DevScreenGallery
