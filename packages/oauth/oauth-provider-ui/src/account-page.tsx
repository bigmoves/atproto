import './style.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorView } from '#/components/error-view.tsx'
import { DevToolsGate } from '#/components-v2/dev/dev-tools.tsx'
import { CustomizationProvider } from '#/contexts/customization.tsx'
import { NotificationsProvider } from '#/contexts/notifications.tsx'
import { InitialSelectedSession, SessionProvider } from '#/contexts/session.tsx'
import type { HydrationData } from '#/hydration-data.d.ts'
import { LocaleProvider } from '#/locales/locale-provider.tsx'
import { router } from '#/pages/router'

const {
  __customizationData: customizationData,
  __deviceSessions: deviceSessions,
} = window as typeof window & HydrationData['account-page']

const qc = new QueryClient()

const container = document.getElementById('root')!

createRoot(container).render(
  <StrictMode>
    <CustomizationProvider value={customizationData}>
      <LocaleProvider>
        <DevToolsGate>
          <NotificationsProvider>
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <ErrorView error={error} retry={resetErrorBoundary} />
              )}
            >
              <SessionProvider
                initialSessions={deviceSessions}
                initialSelected={InitialSelectedSession.Only}
              >
                <QueryClientProvider client={qc}>
                  <RouterProvider router={router} />
                </QueryClientProvider>
              </SessionProvider>
            </ErrorBoundary>
          </NotificationsProvider>
        </DevToolsGate>
      </LocaleProvider>
    </CustomizationProvider>
  </StrictMode>,
)
