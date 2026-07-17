import { useLingui } from '@lingui/react/macro'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { useRouter } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export type PageHeaderProps = {
  children: ReactNode
  /** Shows a mobile-only back button (browser history back) before the title. */
  back?: boolean
}

/** Large page title shown at the top of each account-app tab's content. */
export function PageHeader({ children, back = false }: PageHeaderProps) {
  const { t } = useLingui()
  const router = useRouter()

  return (
    <h1 className="text-ink mb-6 flex items-center gap-2 font-serif text-2xl font-semibold">
      {back && (
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label={t`Back`}
          className="text-ink hover:bg-surface-2 -ml-1.5 flex size-9 flex-none items-center justify-center rounded-full md:hidden"
        >
          <ArrowLeftIcon className="size-5" weight="bold" />
        </button>
      )}
      {children}
    </h1>
  )
}
