import { useLingui } from '@lingui/react/macro'

export type ListSkeletonProps = {
  rows?: number
}

/** Placeholder for `AccountDevicesView`/`AccountAppsView`'s row list while data is loading. */
export function ListSkeleton({ rows = 3 }: ListSkeletonProps) {
  const { t } = useLingui()

  return (
    <div
      role="status"
      aria-label={t`Loading`}
      className="bg-contrast-100 divide-contrast-200 rounded-panel flex animate-pulse flex-col divide-y overflow-hidden"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="flex items-center gap-4 p-4">
          <div className="bg-contrast-200 size-9 flex-none rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <div className="bg-contrast-200 h-3.5 w-2/5 rounded" />
            <div className="bg-contrast-200 h-3 w-1/3 rounded" />
            <div className="bg-contrast-200 h-3 w-3/5 rounded" />
          </div>
          <div className="bg-contrast-200 h-7 w-16 flex-none rounded-full" />
        </div>
      ))}
    </div>
  )
}
