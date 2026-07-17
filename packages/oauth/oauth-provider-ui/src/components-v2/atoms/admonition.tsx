import {
  CheckCircleIcon,
  type Icon as PhosphorIcon,
  InfoIcon,
  ProhibitIcon,
  WarningIcon,
} from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { AriaRole, JSX, ReactNode } from 'react'
import type { Override } from '#/lib/util.ts'

type Variant = 'info' | 'warning' | 'error' | 'success'

const ROLE_VARIANT_MAP: ReadonlyMap<AriaRole, Variant> = new Map([
  ['note', 'info'],
  ['status', 'warning'],
  ['warning', 'warning'],
  ['alert', 'error'],
])

const roleToVariant = (role?: AriaRole): Variant => {
  return (ROLE_VARIANT_MAP as ReadonlyMap<unknown, Variant>).get(role) ?? 'info'
}

const ICONS: Record<Variant, PhosphorIcon> = {
  info: InfoIcon,
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ProhibitIcon,
}

const CARD_COLORS: Record<Variant, string> = {
  info: 'bg-info-100 dark:bg-info-800',
  warning: 'bg-warning-100 dark:bg-warning-800',
  error: 'bg-error-100 dark:bg-error-800',
  success: 'bg-success-100 dark:bg-success-800',
}

const ICON_COLORS: Record<Variant, string> = {
  info: 'text-info-500',
  warning: 'text-warning-600 dark:text-warning-500',
  error: 'text-error-500 dark:text-error-400',
  success: 'text-success-500 dark:text-success-400',
}

export type AdmonitionProps = Override<
  JSX.IntrinsicElements['div'],
  {
    role: AriaRole
    title?: ReactNode
    action?: ReactNode
    icon?: PhosphorIcon
  }
>

/** v2 restyle of `#/components/utils/admonition.tsx` — same role/variant mapping, token-based text color. */
export function Admonition({
  role,
  title,
  action,
  icon,
  children,
  className,
  ...props
}: AdmonitionProps) {
  const variant = roleToVariant(role)
  const Icon = icon ?? ICONS[variant]

  return (
    <div
      {...props}
      role={role}
      className={clsx(
        'rounded-panel flex items-center gap-3 border border-black/15 py-3 pl-3 pr-4 dark:border-white/15',
        'text-ink',
        CARD_COLORS[variant],
        className,
      )}
    >
      <div className={ICON_COLORS[variant]} aria-hidden>
        <Icon width={20} height={20} />
      </div>
      <div className="max-w-full flex-1 space-y-1">
        {title && (
          <h3 className="text-lg font-semibold leading-snug">{title}</h3>
        )}
        {children && <p className="text-sm">{children}</p>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  )
}
