import { Trans } from '@lingui/react/macro'
import { type ReactNode, useRef } from 'react'
import type { Account } from '@atproto/oauth-provider-api'
import { AccountPermission } from '@atproto/oauth-scopes'
import type { OAuthClientMetadata } from '@atproto/oauth-types'
import { AccountIdentifier } from '#/components/utils/account-identifier.tsx'
import { ClientName } from '#/components/utils/client-name.tsx'
import { useAsyncAction } from '#/hooks/use-async-action.ts'
import type { PermissionSets } from '#/hydration-data.d.ts'
import { Button } from '../atoms/button.tsx'
import { ClientImage } from '../atoms/client-image.tsx'
import type { FormHandler } from '../molecules/smart-form.tsx'
import { SmartForm } from '../molecules/smart-form.tsx'
import { ScopeDescription } from './scope-description.tsx'

export type ConsentCardProps = {
  clientId: string
  clientMetadata: OAuthClientMetadata
  clientTrusted: boolean
  clientFirstParty: boolean
  permissionSets: PermissionSets

  account: Account
  scope?: string

  onConsent: (data: { scope?: string }) => void | PromiseLike<void>
  onReject: () => void
  onBack?: () => void
}

function isTransitionScope(scope: string): scope is `transition:${string}` {
  return scope.startsWith('transition:')
}

function isAccountEmailScope(scope: string): boolean {
  const parsed = AccountPermission.fromString(scope)
  if (!parsed) return false
  return parsed.matches({ attr: 'email', action: 'read' })
}

function stripAccountEmailScope(scope?: string): string | undefined {
  return scope
    ?.split(' ')
    .filter((s) => !isAccountEmailScope(s))
    .join(' ')
}

/**
 * v2 restyle of `#/components/consent-form.tsx`. The permission list
 * (`./scope-description.tsx`) is a full v2 fork of v1's ~900-line AT
 * Protocol scope-parsing component — same logic, own presentational
 * primitives (`../atoms/description-card.tsx` renders each permission row
 * inline instead of v1's stacked title/description).
 */
export function ConsentCard({
  clientId,
  clientMetadata,
  clientTrusted,
  clientFirstParty,
  permissionSets,
  account,
  scope,
  onConsent,
  onReject,
  onBack,
}: ConsentCardProps) {
  const reject = useAsyncAction(onReject)

  const formRef =
    useRef<FormHandler<{ scope?: string }, { allowEmail: boolean }>>(null)
  const form = formRef.current

  const canUnsetEmail = !scope?.split(' ').some(isTransitionScope)

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <ClientImage
          clientId={clientId}
          clientMetadata={clientMetadata}
          clientTrusted={clientTrusted}
        />
        <div className="min-w-0">
          <div className="text-ink truncate font-serif text-lg font-semibold">
            <ClientName
              clientId={clientId}
              clientMetadata={clientMetadata}
              clientTrusted={clientTrusted}
            />
          </div>
          <div className="text-ink-light text-sm">
            {!scope || scope === 'atproto' ? (
              <Trans>
                wants to uniquely identify you through your{' '}
                <AccountIdentifier
                  account={account}
                  className="font-semibold"
                />
              </Trans>
            ) : (
              <Trans>
                wants to access your{' '}
                <AccountIdentifier
                  account={account}
                  className="font-semibold"
                />
              </Trans>
            )}
          </div>
        </div>
      </div>

      <SmartForm
        ref={formRef}
        onBack={onBack}
        error={reject.error}
        disabled={reject.loading}
        submitLabel={<Trans context="OAuthConsent">Authorize</Trans>}
        values={{ allowEmail: true }}
        onValues={() => reject.reset()}
        validate={({ allowEmail }) => ({
          scope:
            canUnsetEmail && !allowEmail
              ? stripAccountEmailScope(scope)
              : scope,
        })}
        handler={onConsent}
        actions={
          <Button
            transparent
            disabled={form?.loading}
            loading={reject.loading}
            onClick={(event) => {
              event.preventDefault()
              form?.reset()
              void reject.run()
            }}
          >
            <Trans context="OAuthConsent">Deny access</Trans>
          </Button>
        }
        fields={({ values, setterFor }) => (
          <ScopeDescription
            scope={scope}
            permissionSets={permissionSets}
            clientTrusted={clientTrusted}
            clientFirstParty={clientFirstParty}
            allowEmail={canUnsetEmail ? values.allowEmail : true}
            onAllowEmail={canUnsetEmail ? setterFor('allowEmail') : undefined}
          />
        )}
      >
        <FooterNote clientMetadata={clientMetadata} />
      </SmartForm>
    </div>
  )
}

function FooterNote({
  clientMetadata,
}: {
  clientMetadata: OAuthClientMetadata
}): ReactNode {
  return (
    <p className="text-ink-light text-xs leading-relaxed">
      <Trans>
        By clicking{' '}
        <b className="text-ink">
          <Trans context="OAuthConsent">Authorize</Trans>
        </b>
        , you will grant this application access to your account in accordance
        with its{' '}
        <a
          role="link"
          href={clientMetadata.tos_uri}
          rel="nofollow noopener"
          target="_blank"
          className={
            clientMetadata.tos_uri ? 'text-primary underline' : undefined
          }
        >
          <Trans>terms of service</Trans>
        </a>
        {' and '}
        <a
          role="link"
          href={clientMetadata.policy_uri}
          rel="nofollow noopener"
          target="_blank"
          className={
            clientMetadata.policy_uri ? 'text-primary underline' : undefined
          }
        >
          <Trans>privacy policy</Trans>
        </a>
        .
      </Trans>
    </p>
  )
}
