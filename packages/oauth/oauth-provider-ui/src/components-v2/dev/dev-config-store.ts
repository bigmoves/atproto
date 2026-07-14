import { useCallback, useEffect, useState } from 'react'
import type { CustomizationData } from '@atproto/oauth-provider-api'

export const DEV_COLOR_NAMES = [
  'primary',
  'error',
  'warning',
  'info',
  'success',
] as const
export type DevColorName = (typeof DEV_COLOR_NAMES)[number]

export type DevConfigOverrides = {
  colors: Partial<Record<DevColorName, string>> // hex
  contrastSaturation?: number
  customization: Partial<CustomizationData>
}

const STORAGE_KEY = 'atproto:oauth-provider-ui:dev-config-overrides'
const EMPTY: DevConfigOverrides = { colors: {}, customization: {} }

function load(): DevConfigOverrides {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<DevConfigOverrides>
    return {
      colors: parsed.colors ?? {},
      contrastSaturation: parsed.contrastSaturation,
      customization: parsed.customization ?? {},
    }
  } catch {
    return EMPTY
  }
}

function save(value: DevConfigOverrides) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // e.g. private-browsing storage quota — overrides just won't persist
  }
}

/**
 * Dev-only: holds theme/customization overrides in memory + localStorage.
 * Consumed by `DevTools`, which applies `colors`/`contrastSaturation` as CSS
 * vars and merges `customization` into the `CustomizationData` context.
 */
export function useDevConfigOverrides() {
  const [overrides, setOverrides] = useState<DevConfigOverrides>(load)

  useEffect(() => {
    save(overrides)
  }, [overrides])

  const setColor = useCallback(
    (name: DevColorName, hex: string | undefined) => {
      setOverrides((prev) => {
        const colors = { ...prev.colors }
        if (hex) colors[name] = hex
        else delete colors[name]
        return { ...prev, colors }
      })
    },
    [],
  )

  const setContrastSaturation = useCallback((value: number | undefined) => {
    setOverrides((prev) => ({ ...prev, contrastSaturation: value }))
  }, [])

  const setCustomization = useCallback(
    <K extends keyof CustomizationData>(
      key: K,
      value: CustomizationData[K] | undefined,
    ) => {
      setOverrides((prev) => {
        const customization = { ...prev.customization }
        if (value === undefined) delete customization[key]
        else customization[key] = value
        return { ...prev, customization }
      })
    },
    [],
  )

  const reset = useCallback(() => setOverrides(EMPTY), [])

  return {
    overrides,
    setColor,
    setContrastSaturation,
    setCustomization,
    reset,
  }
}
