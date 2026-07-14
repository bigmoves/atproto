import { type ReactNode, createContext, useContext } from 'react'
import type { CustomizationData } from '@atproto/oauth-provider-api'

// Exported (in addition to the hook below) so the dev-only config panel
// (#/components-v2/dev/dev-tools.tsx) can re-provide an overridden value
// further down the tree without a second parallel context.
export const CustomizationContext = createContext<CustomizationData>({})
CustomizationContext.displayName = 'CustomizationContext'

export function CustomizationProvider({
  children,
  value,
}: {
  children: ReactNode
  value: CustomizationData
}) {
  return <CustomizationContext value={value}>{children}</CustomizationContext>
}

export function useCustomizationData() {
  return useContext(CustomizationContext)
}
