import { useLingui } from '@lingui/react/macro'
import { clsx } from 'clsx'
import type { JSX } from 'react'
import { useLocaleContext } from '#/locales/locale-provider.tsx'

export type LocaleSelectorProps = Omit<
  JSX.IntrinsicElements['select'],
  'value' | 'defaultValue'
>

/** v2 restyle of `#/locales/locale-selector.tsx` — same logic, borderless. */
export function LocaleSelector({
  className,
  onChange,
  ...props
}: LocaleSelectorProps) {
  const { locale, locales, setLocale } = useLocaleContext()
  const { t } = useLingui()

  return (
    <select
      {...props}
      className={clsx(
        'accent-primary',
        'cursor-pointer',
        'bg-transparent',
        'hover:bg-contrast-50',
        'transition duration-300 ease-in-out',
        'outline-none',
        'focus:ring-primary focus:ring-2 focus:ring-offset-1',
        'text-text-light',
        'rounded-full',
        'px-2 py-1',
        className,
      )}
      value={locale}
      onChange={(e) => {
        onChange?.(e)
        if (!e.defaultPrevented) {
          setLocale(e.target.value as keyof typeof locales)
        }
      }}
      aria-label={t`Interface language selector`}
    >
      {Object.entries(locales).map(([key, { name, flag }]) => (
        <option key={key} value={key}>
          {flag ? `${flag} ${name}` : name}
        </option>
      ))}
    </select>
  )
}
