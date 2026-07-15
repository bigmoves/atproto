import './style.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorView as ErrorViewV1 } from '#/components/error-view.tsx'
import { ErrorView as ErrorViewV2 } from '#/components-v2/screens/error-view.tsx'
import { DevToolsGate } from '#/components-v2/dev/dev-tools.tsx'
import { CustomizationProvider } from '#/contexts/customization'
import type { HydrationData } from '#/hydration-data.d.ts'
import { parseApiErrorPayload } from '#/lib/api.ts'
import { NEW_DESIGN_ENABLED } from '#/lib/feature-flags.ts'
import { LocaleProvider } from '#/locales/locale-provider.tsx'

const ErrorView = NEW_DESIGN_ENABLED ? ErrorViewV2 : ErrorViewV1

const {
  //
  __errorData: errorData,
  __customizationData: customizationData,
} = window as typeof window & HydrationData['error-page']

// Attempt to turn the error data into an actual error instance if the error
// data has the shape of an API error response. This will allow the ErrorView to
// display the right error details and messages for known API errors.
const error = parseApiErrorPayload(errorData)

const container = document.getElementById('root')!

createRoot(container).render(
  <StrictMode>
    <CustomizationProvider value={customizationData}>
      <LocaleProvider>
        <DevToolsGate>
          <ErrorView error={error ?? errorData} />
        </DevToolsGate>
      </LocaleProvider>
    </CustomizationProvider>
  </StrictMode>,
)
