import { useLingui } from '@lingui/react/macro'
import { CaretDownIcon } from '@phosphor-icons/react'
import { clsx } from 'clsx'
import type { JSX } from 'react'
import { useLocaleContext } from '#/locales/locale-provider.tsx'

export type LocaleSelectorProps = Omit<
  JSX.IntrinsicElements['select'],
  'value' | 'defaultValue'
>

/** v2 restyle of `#/locales/locale-selector.tsx` — same logic, bordered box with a custom chevron (native selects can't be restyled beyond `appearance:none`). */
export function LocaleSelector({
  className,
  onChange,
  ...props
}: LocaleSelectorProps) {
  const { locale, locales, setLocale } = useLocaleContext()
  const { t } = useLingui()

  return (
    <div className="border-surface-border rounded-control relative inline-flex items-center border">
      <select
        {...props}
        className={clsx(
          'accent-ink',
          'cursor-pointer',
          'appearance-none',
          'bg-transparent',
          'hover:bg-surface-2',
          'transition duration-300 ease-in-out',
          'outline-none',
          'focus:ring-ink focus:ring-2 focus:ring-offset-1',
          'text-ink-light',
          'rounded-control',
          'py-1.5 pl-3 pr-8',
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
      <CaretDownIcon
        aria-hidden
        weight="bold"
        className="text-ink-light pointer-events-none absolute right-2.5 size-3"
      />
    </div>
  )
}
