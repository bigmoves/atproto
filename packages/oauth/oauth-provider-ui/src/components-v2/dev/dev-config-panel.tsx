import { XIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import type {
  CustomizationData,
  LinkDefinition,
} from '@atproto/oauth-provider-api'
import { Button } from '../atoms/button.tsx'
import { Checkbox } from '../atoms/checkbox.tsx'
import {
  DEV_COLOR_NAMES,
  type DevColorName,
  type DevConfigOverrides,
} from './dev-config-store.ts'
import { DEV_SCREENS, type DevScreenId } from './dev-screen-store.ts'

export type DevConfigPanelProps = {
  base: CustomizationData
  overrides: DevConfigOverrides
  onColor: (name: DevColorName, hex: string | undefined) => void
  onContrastSaturation: (value: number | undefined) => void
  onCustomization: <K extends keyof CustomizationData>(
    key: K,
    value: CustomizationData[K] | undefined,
  ) => void
  onReset: () => void
  onClose: () => void
  previewScreen: DevScreenId | null
  onPreviewScreen: (id: DevScreenId | null) => void
}

const COLOR_LABEL: Record<DevColorName, string> = {
  primary: 'Primary',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
  success: 'Success',
}

function linkTitle(link: LinkDefinition): string {
  if (typeof link.title === 'string') return link.title
  return link.title.en ?? Object.values(link.title).find(Boolean) ?? ''
}

/**
 * Dev-only floating panel: shows every themeable/configured value (branding
 * colors, contrast saturation, `CustomizationData`) and lets you override
 * them live. Rendered only by `DevTools`, which is itself gated behind
 * `import.meta.env.DEV`.
 */
export function DevConfigPanel({
  base,
  overrides,
  onColor,
  onContrastSaturation,
  onCustomization,
  onReset,
  onClose,
  previewScreen,
  onPreviewScreen,
}: DevConfigPanelProps) {
  const links = overrides.customization.links ?? base.links ?? []

  const updateLink = (index: number, patch: Partial<LinkDefinition>) => {
    const next = links.map((l, i) => (i === index ? { ...l, ...patch } : l))
    onCustomization('links', next)
  }

  const removeLink = (index: number) => {
    onCustomization(
      'links',
      links.filter((_, i) => i !== index),
    )
  }

  const addLink = () => {
    onCustomization('links', [...links, { title: '', href: '', rel: '' }])
  }

  return (
    <div className="bg-contrast-100 border-contrast-200 shadow-card rounded-panel fixed bottom-20 right-4 z-[200] flex max-h-[80vh] w-80 flex-col overflow-hidden border">
      <div className="border-contrast-200 flex items-center justify-between border-b px-4 py-3">
        <span className="text-text-default text-sm font-bold">Dev config</span>
        <button
          type="button"
          onClick={onClose}
          className="text-text-light hover:bg-contrast-200 rounded-full p-1"
          aria-label="Close"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <Section title="Preview screens">
          <p className="text-text-light mb-2 text-xs leading-snug">
            Renders a screen full-screen with mock data, for checking style
            against the current branding. Error/cookie-error can't be reached
            for real without faking server state.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEV_SCREENS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onPreviewScreen(previewScreen === id ? null : id)
                }
                className={clsx(
                  'rounded-full border px-2.5 py-1 text-xs font-medium',
                  previewScreen === id
                    ? 'bg-primary text-primary-contrast border-primary'
                    : 'border-contrast-200 text-text-default hover:bg-contrast-200',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Branding colors">
          {DEV_COLOR_NAMES.map((name) => {
            const overrideHex = overrides.colors[name]
            const varName = `--branding-color-${name}`
            const fallback =
              typeof window === 'undefined'
                ? '#888888'
                : readCssVarAsHex(varName)
            const value = overrideHex ?? fallback

            return (
              <FieldRow
                key={name}
                label={COLOR_LABEL[name]}
                overridden={!!overrideHex}
              >
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onColor(name, e.target.value)}
                  className="size-7 cursor-pointer rounded border-none bg-transparent p-0"
                />
                <input
                  type="text"
                  value={overrideHex ?? ''}
                  placeholder={fallback}
                  onChange={(e) => onColor(name, e.target.value || undefined)}
                  className="border-contrast-200 text-text-default min-w-0 flex-1 rounded border bg-transparent px-2 py-1 font-mono text-xs"
                />
              </FieldRow>
            )
          })}

          <FieldRow
            label="Contrast sat."
            overridden={overrides.contrastSaturation != null}
          >
            <input
              type="number"
              min={0}
              max={100}
              value={overrides.contrastSaturation ?? ''}
              placeholder="30"
              onChange={(e) =>
                onContrastSaturation(
                  e.target.value === '' ? undefined : Number(e.target.value),
                )
              }
              className="border-contrast-200 text-text-default w-full rounded border bg-transparent px-2 py-1 text-xs"
            />
          </FieldRow>
        </Section>

        <Section title="Customization">
          <TextField
            label="Name"
            value={overrides.customization.name ?? base.name ?? ''}
            onChange={(v) => onCustomization('name', v || undefined)}
            overridden={overrides.customization.name != null}
          />
          <TextField
            label="Logo URL"
            value={overrides.customization.logo ?? base.logo ?? ''}
            onChange={(v) => onCustomization('logo', v || undefined)}
            overridden={overrides.customization.logo != null}
          />
          <TextField
            label="hCaptcha site key"
            value={
              overrides.customization.hcaptchaSiteKey ??
              base.hcaptchaSiteKey ??
              ''
            }
            onChange={(v) => onCustomization('hcaptchaSiteKey', v || undefined)}
            overridden={overrides.customization.hcaptchaSiteKey != null}
          />
          <TextField
            label="User domains (comma-sep)"
            value={(
              overrides.customization.availableUserDomains ??
              base.availableUserDomains ??
              []
            ).join(', ')}
            onChange={(v) =>
              onCustomization(
                'availableUserDomains',
                v
                  ? v
                      .split(',')
                      .map((d) => d.trim())
                      .filter(Boolean)
                  : undefined,
              )
            }
            overridden={overrides.customization.availableUserDomains != null}
          />

          <label className="flex items-center gap-2 py-1.5 text-xs">
            <Checkbox
              checked={
                overrides.customization.inviteCodeRequired ??
                base.inviteCodeRequired ??
                false
              }
              onChange={(e) =>
                onCustomization('inviteCodeRequired', e.target.checked)
              }
            />
            <span className="text-text-default">Invite code required</span>
          </label>

          <label className="flex items-center gap-2 py-1.5 text-xs">
            <Checkbox
              checked={
                overrides.customization.show2FaWarningOnEmailUpdate ??
                base.show2FaWarningOnEmailUpdate ??
                false
              }
              onChange={(e) =>
                onCustomization('show2FaWarningOnEmailUpdate', e.target.checked)
              }
            />
            <span className="text-text-default">
              Show 2FA warning on email update
            </span>
          </label>
        </Section>

        <Section title="Footer links">
          <div className="flex flex-col gap-2">
            {links.map((link, i) => (
              <div
                key={i}
                className="border-contrast-100 flex flex-col gap-1.5 rounded-md border p-2"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Title"
                    value={linkTitle(link)}
                    onChange={(e) => updateLink(i, { title: e.target.value })}
                    className="border-contrast-200 text-text-default min-w-0 flex-1 rounded border bg-transparent px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="text-text-light hover:bg-contrast-200 rounded-full p-1"
                    aria-label="Remove link"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="https://…"
                  value={link.href}
                  onChange={(e) => updateLink(i, { href: e.target.value })}
                  className="border-contrast-200 text-text-default rounded border bg-transparent px-2 py-1 font-mono text-xs"
                />
                <input
                  type="text"
                  placeholder="rel (e.g. terms-of-service)"
                  value={link.rel ?? ''}
                  onChange={(e) => updateLink(i, { rel: e.target.value })}
                  className="border-contrast-200 text-text-default rounded border bg-transparent px-2 py-1 font-mono text-xs"
                />
              </div>
            ))}
            <Button size="sm" onClick={addLink}>
              Add link
            </Button>
          </div>
        </Section>
      </div>

      <div className="border-contrast-100 border-t px-4 py-3">
        <Button
          size="sm"
          color="error"
          transparent
          className="w-full"
          onClick={onReset}
        >
          Reset all overrides
        </Button>
      </div>
    </div>
  )
}

function readCssVarAsHex(varName: string): string {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  const parts = raw.split(/[\s,]+/).map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return '#888888'
  return `#${parts.map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-text-light mb-2 text-xs font-bold uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  )
}

function FieldRow({
  label,
  overridden,
  children,
}: {
  label: string
  overridden: boolean
  children: ReactNode
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span
        className={
          overridden
            ? 'text-text-default w-24 shrink-0 text-xs font-bold'
            : 'text-text-light w-24 shrink-0 text-xs'
        }
      >
        {label}
      </span>
      {children}
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  overridden,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  overridden: boolean
}) {
  return (
    <FieldRow label={label} overridden={overridden}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-contrast-200 text-text-default min-w-0 flex-1 rounded border bg-transparent px-2 py-1 text-xs"
      />
    </FieldRow>
  )
}
