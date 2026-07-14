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
    <h1 className="text-text-default mb-6 flex items-center gap-2 text-2xl font-normal">
      {back && (
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label={t`Back`}
          className="text-text-default -ml-1.5 flex size-9 flex-none items-center justify-center rounded-full hover:bg-contrast-200 md:hidden"
        >
          <ArrowLeftIcon className="size-5" weight="bold" />
        </button>
      )}
      {children}
    </h1>
  )
}
