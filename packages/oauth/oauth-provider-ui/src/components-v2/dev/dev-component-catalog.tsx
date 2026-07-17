import { AtIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { Account } from '@atproto/oauth-provider-api'
import { Admonition } from '../atoms/admonition.tsx'
import { AvatarBadge } from '../atoms/avatar-badge.tsx'
import { ButtonCooldown } from '../atoms/button-cooldown.tsx'
import { ButtonCopy } from '../atoms/button-copy.tsx'
import { ButtonRequestCode } from '../atoms/button-request-code.tsx'
import { Button } from '../atoms/button.tsx'
import { Checkbox } from '../atoms/checkbox.tsx'
import { CircularProgress } from '../atoms/circular-progress.tsx'
import { CodeSnippet } from '../atoms/code-snippet.tsx'
import { ErrorCard } from '../atoms/error-card.tsx'
import { FooterLink } from '../atoms/footer-link.tsx'
import { Handle } from '../atoms/handle.tsx'
import { InputCheckbox } from '../atoms/input-checkbox.tsx'
import { InputEmailAddress } from '../atoms/input-email-address.tsx'
import { InputNewPassword } from '../atoms/input-new-password.tsx'
import { InputPassword } from '../atoms/input-password.tsx'
import { InputRadioGroup } from '../atoms/input-radio-group.tsx'
import { InputText } from '../atoms/input-text.tsx'
import { InputToken } from '../atoms/input-token.tsx'
import { LinkExternal } from '../atoms/link-external.tsx'
import { LocaleSelector } from '../atoms/locale-selector.tsx'
import { PasswordStrengthLabel } from '../atoms/password-strength-label.tsx'
import { PasswordStrengthMeter } from '../atoms/password-strength-meter.tsx'
import { Spinner } from '../atoms/spinner.tsx'
import { AccountRow } from '../molecules/account-row.tsx'
import { FormField } from '../molecules/form-field.tsx'
import { InputHandleCustomInstructions } from '../molecules/input-handle-custom-instructions.tsx'
import { InputHandleCustom } from '../molecules/input-handle-custom.tsx'
import { InputHandleDefault } from '../molecules/input-handle-default.tsx'
import { PageHeader } from '../molecules/page-header.tsx'
import { SettingsList, SettingsRow } from '../molecules/settings-row.tsx'

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

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <h2 className="text-text-default border-contrast-200 mb-4 border-b pb-2 text-lg font-bold">
        {title}
      </h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="text-text-light mb-2 text-xs font-bold uppercase tracking-wide">
        {label}
      </div>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </div>
  )
}

function ButtonColors() {
  const colors = [
    'primary',
    'gray',
    'error',
    'warning',
    'info',
    'success',
  ] as const
  return (
    <>
      <Row label="Button — solid">
        {colors.map((c) => (
          <Button key={c} color={c}>
            {c}
          </Button>
        ))}
      </Row>
      <Row label="Button — transparent">
        {colors.map((c) => (
          <Button key={c} color={c} transparent>
            {c}
          </Button>
        ))}
      </Row>
      <Row label="Button — shapes/sizes">
        <Button shape="default" size="sm">
          default sm
        </Button>
        <Button shape="default" size="lg">
          default lg
        </Button>
        <Button shape="row">row (full width in context)</Button>
        <Button shape="circle" aria-label="circle">
          <AtIcon className="size-4" />
        </Button>
        <Button loading>loading</Button>
        <Button disabled>disabled</Button>
      </Row>
    </>
  )
}

function AdmonitionVariants() {
  const roles = ['note', 'status', 'warning', 'alert'] as const
  return (
    <Row label="Admonition (role → variant)">
      <div className="flex w-full flex-col gap-2">
        {roles.map((role) => (
          <Admonition key={role} role={role}>
            role="{role}" — some descriptive text goes here.
          </Admonition>
        ))}
      </div>
    </Row>
  )
}

/**
 * Dev-only component catalog: atoms + molecules rendered with mock data,
 * grouped like an atomic-design storybook. Organisms (dialogs, forms that
 * need real callbacks/API wiring) aren't included — they don't fit a
 * static grid well. Use the screen gallery for those in context.
 */
export default function DevComponentCatalog() {
  const [checked, setChecked] = useState(true)
  const [radioValue, setRadioValue] = useState('a')

  return (
    <div className="bg-contrast-0 h-full w-full overflow-y-auto p-6 pb-24">
      <h1 className="text-text-default mb-1 text-2xl font-bold">
        Component catalog
      </h1>
      <p className="text-text-light mb-8 text-sm">
        Atoms and molecules, rendered with mock data against the current
        branding/theme. Organisms aren't included — see the screen preview for
        those in context.
      </p>

      <Section title="Atoms">
        <ButtonColors />
        <AdmonitionVariants />

        <Row label="AvatarBadge">
          <AvatarBadge account={MOCK_ACCOUNT} size="sm" />
          <AvatarBadge account={MOCK_ACCOUNT} size="md" />
          <AvatarBadge account={MOCK_ACCOUNT} size="lg" />
        </Row>

        <Row label="Checkbox / InputCheckbox">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <Checkbox checked={false} disabled />
          <InputCheckbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          >
            Remember this device
          </InputCheckbox>
        </Row>

        <Row label="CircularProgress / Spinner">
          <CircularProgress size={24} value={35} />
          <CircularProgress size={24} />
          <Spinner size={24} />
        </Row>

        <Row label="ButtonCooldown / ButtonRequestCode / ButtonCopy">
          <ButtonCooldown action={async () => {}}>
            Cooldown action
          </ButtonCooldown>
          <ButtonRequestCode action={async () => {}} />
          <ButtonCopy value="copy me" />
        </Row>

        <Row label="CodeSnippet">
          <CodeSnippet label="Host" className="w-full max-w-sm">
            _atproto.alice.example.com
          </CodeSnippet>
        </Row>

        <Row label="ErrorCard">
          <div className="w-full max-w-sm">
            <ErrorCard error={new Error('Mocked error for style preview.')} />
          </div>
        </Row>

        <Row label="Handle">
          <Handle handle="alice.test" />
          <Handle handle="handle.invalid" />
        </Row>

        <Row label="FooterLink / LinkExternal">
          <FooterLink
            link={{
              title: 'Terms of Service',
              href: 'https://example.com/tos',
            }}
          />
          <LinkExternal href="https://example.com">External link</LinkExternal>
        </Row>

        <Row label="LocaleSelector">
          <LocaleSelector />
        </Row>

        <Row label="PasswordStrengthMeter / Label">
          {['', 'a', 'abcdefgh', 'Abcd1234!@#$'].map((pw, i) => (
            <div key={i} className="flex w-32 flex-col gap-1">
              <PasswordStrengthMeter password={pw} />
              <PasswordStrengthLabel
                password={pw}
                className="text-text-light text-xs"
              />
            </div>
          ))}
        </Row>

        <Row label="InputText / InputEmailAddress / InputPassword / InputNewPassword / InputToken">
          <div className="flex w-full max-w-sm flex-col gap-3">
            <InputText placeholder="Plain input text" />
            <InputEmailAddress />
            <InputPassword />
            <InputNewPassword defaultValue="Abcd1234!@#$" />
            <InputToken onResend={async () => {}} />
          </div>
        </Row>

        <Row label="InputRadioGroup">
          <div className="w-full max-w-sm">
            <InputRadioGroup
              value={radioValue}
              onChange={setRadioValue}
              options={[
                { value: 'a', label: 'DNS', description: 'Via DNS TXT record' },
                {
                  value: 'b',
                  label: 'HTTP',
                  description: 'Via a file on your domain',
                },
              ]}
            />
          </div>
        </Row>
      </Section>

      <Section title="Molecules">
        <Row label="AccountRow">
          <div className="border-contrast-200 rounded-panel w-full max-w-sm overflow-hidden border">
            <AccountRow account={MOCK_ACCOUNT} />
          </div>
        </Row>

        <Row label="PageHeader">
          <div className="w-full max-w-sm">
            <PageHeader>Page title</PageHeader>
          </div>
        </Row>

        <Row label="SettingsList / SettingsRow">
          <div className="w-full max-w-sm">
            <SettingsList>
              <SettingsRow label="Email" value="alice@example.com" />
              <SettingsRow
                label="Handle"
                value={<Handle handle="alice.test" />}
              />
              <SettingsRow>Delete account</SettingsRow>
            </SettingsList>
          </div>
        </Row>

        <Row label="FormField">
          <div className="w-full max-w-sm">
            <FormField label="Email address">
              <InputEmailAddress />
            </FormField>
          </div>
        </Row>

        <Row label="InputHandleDefault">
          <div className="w-full max-w-sm">
            <InputHandleDefault domains={['.example.com', '.example.org']} />
          </div>
        </Row>

        <Row label="InputHandleCustom + Instructions">
          <div className="w-full max-w-sm">
            <InputHandleCustom did="did:plc:mockmockmockmockmockmock" />
            <InputHandleCustomInstructions
              className="mt-3 text-sm"
              did="did:plc:mockmockmockmockmockmock"
            />
          </div>
        </Row>
      </Section>
    </div>
  )
}
