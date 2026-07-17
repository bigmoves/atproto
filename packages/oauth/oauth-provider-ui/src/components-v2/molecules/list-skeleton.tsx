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
      className="bg-surface-1 border-surface-border divide-surface-border rounded-panel flex animate-pulse flex-col divide-y overflow-hidden border"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden className="flex items-center gap-4 p-4">
          <div className="bg-surface-2 rounded-control size-9 flex-none" />
          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <div className="bg-surface-2 h-3.5 w-2/5 rounded" />
            <div className="bg-surface-2 h-3 w-1/3 rounded" />
            <div className="bg-surface-2 h-3 w-3/5 rounded" />
          </div>
          <div className="bg-surface-2 rounded-control h-7 w-16 flex-none" />
        </div>
      ))}
    </div>
  )
}
