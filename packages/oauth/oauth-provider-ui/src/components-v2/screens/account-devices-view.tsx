import { Trans, useLingui } from '@lingui/react/macro'
import { DeviceMobileIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ActiveAccountSession } from '@atproto/oauth-provider-api'
import { DateAgo } from '#/components/utils/date-ago.tsx'
import { useBrowserName } from '#/hooks/use-browser-name.ts'
import { Button } from '../atoms/button.tsx'
import { PageHeader } from '../molecules/page-header.tsx'

export type AccountDevicesViewProps = {
  devices: readonly ActiveAccountSession[]
  revokingId?: string
  onRevoke: (deviceId: string) => void
}

/** v2 restyle of `pages/account/(authenticated)/devices/page.tsx`. */
export function AccountDevicesView({
  devices,
  revokingId,
  onRevoke,
}: AccountDevicesViewProps) {
  return (
    <div>
      <PageHeader back>
        <Trans>Devices</Trans>
      </PageHeader>

      {devices.length === 0 ? (
        <p className="text-text-light text-sm">
          <Trans>Looks like you aren't logged in on any other devices.</Trans>
        </p>
      ) : (
        <>
          <p className="text-text-light mb-4 text-sm leading-relaxed">
            <Trans>
              Your account is signed in on the devices listed below. If your
              account was compromised, sign out all devices, change your
              password, and check your connected{' '}
              <Link to="/account/apps" className="text-primary hover:underline">
                apps
              </Link>
              .
            </Trans>
          </p>

          <div className="bg-contrast-100 divide-contrast-200 rounded-panel flex flex-col divide-y overflow-hidden">
            {devices.map((session) => (
              <DeviceRow
                key={session.deviceId}
                session={session}
                revoking={revokingId === session.deviceId}
                onRevoke={() => onRevoke(session.deviceId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DeviceRow({
  session,
  revoking,
  onRevoke,
}: {
  session: ActiveAccountSession
  revoking: boolean
  onRevoke: () => void
}) {
  const { t } = useLingui()
  const { userAgent, lastSeenAt, ipAddress } = session.deviceMetadata
  const browserName = useBrowserName(userAgent || undefined)

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="bg-contrast-200 text-text-light flex size-9 flex-none items-center justify-center rounded-full">
        <DeviceMobileIcon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-text-default truncate text-sm font-semibold">
          {browserName || <Trans context="device list">Unknown user agent</Trans>}
        </p>
        <p className="text-text-light font-mono text-xs">{ipAddress}</p>
        <p className="text-text-light truncate text-xs">
          <Trans context="device list">
            Last seen <DateAgo date={lastSeenAt} />
          </Trans>
        </p>
      </div>
      {session.isCurrentDevice ? (
        <span className="bg-success-100 text-success-700 flex-none rounded-full px-3 py-1 text-xs font-semibold">
          <Trans context="device list">This device</Trans>
        </span>
      ) : (
        <Button
          size="sm"
          color="error"
          transparent
          loading={revoking}
          onClick={onRevoke}
          title={t`Sign out this device`}
        >
          <Trans context="device list">Sign out</Trans>
        </Button>
      )}
    </div>
  )
}
