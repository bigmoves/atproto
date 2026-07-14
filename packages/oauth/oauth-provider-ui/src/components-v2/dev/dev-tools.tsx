import { GearIcon } from '@phosphor-icons/react'
import { type ReactNode, useEffect, useState } from 'react'
import { CustomizationContext, useCustomizationData } from '#/contexts/customization.tsx'
import {
  hexToRgb,
  rgbToContrast,
  rgbToCssVar,
  rgbToHue,
} from './color-utils.ts'
import { DEV_COLOR_NAMES, useDevConfigOverrides } from './dev-config-store.ts'
import { DevConfigPanel } from './dev-config-panel.tsx'

/**
 * Dev-only floating config panel + live theme/customization override layer.
 * Mount at the entry-point level, inside `CustomizationProvider`, behind
 * `DevToolsGate` below.
 *
 * Colors are applied as inline `:root` CSS custom properties (which win over
 * the server-injected `<style>` block regardless of branding hue/saturation).
 * `CustomizationData` overrides are merged and re-provided to `children` via
 * the same context the base `CustomizationProvider` uses, so every consumer
 * downstream (`useCustomizationData()`) sees the merged value transparently.
 */
function DevTools({ children }: { children: ReactNode }) {
  const base = useCustomizationData()
  const { overrides, setColor, setContrastSaturation, setCustomization, reset } =
    useDevConfigOverrides()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement

    for (const name of DEV_COLOR_NAMES) {
      const hex = overrides.colors[name]
      if (!hex) {
        root.style.removeProperty(`--branding-color-${name}`)
        root.style.removeProperty(`--branding-color-${name}-contrast`)
        root.style.removeProperty(`--branding-color-${name}-hue`)
        continue
      }
      const rgb = hexToRgb(hex)
      if (!rgb) continue
      root.style.setProperty(`--branding-color-${name}`, rgbToCssVar(rgb))
      root.style.setProperty(
        `--branding-color-${name}-contrast`,
        rgbToCssVar(rgbToContrast(rgb)),
      )
      root.style.setProperty(`--branding-color-${name}-hue`, String(rgbToHue(rgb)))
    }

    if (overrides.contrastSaturation != null) {
      root.style.setProperty('--contrast-sat', `${overrides.contrastSaturation}%`)
    } else {
      root.style.removeProperty('--contrast-sat')
    }
  }, [overrides.colors, overrides.contrastSaturation])

  const effective = { ...base, ...overrides.customization }

  return (
    <CustomizationContext value={effective}>
      {children}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close dev config' : 'Open dev config'}
        className="bg-contrast-900 fixed bottom-4 right-4 z-[200] flex size-11 items-center justify-center rounded-full text-white shadow-lg"
      >
        <GearIcon className="size-5" />
      </button>

      {open && (
        <DevConfigPanel
          base={base}
          overrides={overrides}
          onColor={setColor}
          onContrastSaturation={setContrastSaturation}
          onCustomization={setCustomization}
          onReset={reset}
          onClose={() => setOpen(false)}
        />
      )}
    </CustomizationContext>
  )
}

/**
 * `pnpm build:ui` always runs Vite in production mode (`import.meta.env.DEV`
 * is `false`) — including when serving the local `packages/dev-env` /
 * `make run-dev-env` stack, since that consumes the built `dist/` bundle, not
 * Vite's own dev server. So `import.meta.env.DEV` alone would never show this
 * panel in the environment this is actually meant for. Fall back to a
 * hostname check (localhost/127.0.0.1) to cover that case too. Note this
 * means the panel's code, unlike a pure `import.meta.env.DEV` check, is NOT
 * dead-code-eliminated from the production bundle — it just stays inert
 * (renders nothing) on any real deployed hostname.
 */
function isDevEnvironment(): boolean {
  if (import.meta.env.DEV) return true
  if (typeof location === 'undefined') return false
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1'
}

/** Public entry point — see `isDevEnvironment` for what "dev" means here. */
export function DevToolsGate({ children }: { children: ReactNode }) {
  if (!isDevEnvironment()) return children
  return <DevTools>{children}</DevTools>
}
