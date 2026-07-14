import { clsx } from 'clsx'
import type { JSX } from 'react'
import type { Override } from '#/lib/util.ts'

export type ButtonColor =
  | 'primary'
  | 'gray'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'

export type ButtonColoring = 'solid' | 'transparent'

/**
 * `pill` — primary/secondary CTAs (Next, Authorize, Sign up).
 * `row` — full-width tappable list rows (picker accounts, nav items, settings rows).
 * `circle` — icon-only buttons.
 */
export type ButtonShape = 'pill' | 'row' | 'circle'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = Override<
  JSX.IntrinsicElements['button'],
  {
    color?: ButtonColor
    loading?: boolean
    transparent?: boolean
    coloring?: ButtonColoring
    shape?: ButtonShape
    size?: ButtonSize
  }
>

const TEXT_SIZES: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const PADDING_SIZES: Record<ButtonShape, Record<ButtonSize, string>> = {
  pill: {
    sm: 'px-4 py-2',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3',
  },
  row: {
    sm: 'px-3 py-2',
    md: 'px-3.5 py-2.5',
    lg: 'px-4 py-3',
  },
  circle: {
    sm: 'size-7',
    md: 'size-9',
    lg: 'size-11',
  },
}

const COLORING: Record<ButtonColor, Record<ButtonColoring, string>> = {
  primary: {
    solid: 'bg-primary text-primary-contrast hover:opacity-90',
    transparent: 'text-primary hover:bg-primary/10 bg-transparent',
  },
  gray: {
    solid: 'bg-contrast-200 text-text-default hover:bg-contrast-300',
    transparent: 'text-text-light hover:bg-contrast-200 bg-transparent',
  },
  error: {
    solid: 'bg-error-500 dark:bg-error-700 text-error-contrast hover:opacity-90',
    transparent: 'text-error hover:bg-error/10 bg-transparent',
  },
  warning: {
    solid:
      'bg-warning-500 dark:bg-warning-700 text-warning-contrast hover:opacity-90',
    transparent: 'text-warning hover:bg-warning/10 bg-transparent',
  },
  info: {
    solid: 'bg-info-500 dark:bg-info-700 text-info-contrast hover:opacity-90',
    transparent: 'text-info hover:bg-info/10 bg-transparent',
  },
  success: {
    solid:
      'bg-success-500 dark:bg-success-700 text-success-contrast hover:opacity-90',
    transparent: 'text-success hover:bg-success/10 bg-transparent',
  },
}

export function buttonClassName({
  color = 'gray',
  coloring = 'solid',
  shape = 'pill',
  size = 'md',
  actionable = true,
  disabled = false,
  className,
}: {
  color?: ButtonColor
  coloring?: ButtonColoring
  shape?: ButtonShape
  size?: ButtonSize
  actionable?: boolean
  disabled?: boolean
  className?: string
} = {}) {
  return clsx(
    'touch-manipulation overflow-hidden truncate tracking-wide',
    actionable && 'cursor-pointer',
    shape === 'circle' ? 'rounded-full' : shape === 'row' ? 'rounded-panel' : 'rounded-pill',
    'box-border flex items-center justify-center gap-2',
    shape === 'row' && 'w-full justify-start text-left',
    PADDING_SIZES[shape][size],
    TEXT_SIZES[size],
    COLORING[color][coloring],
    'font-semibold',
    'transition duration-200 ease-in-out',
    'outline-none',
    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
    disabled ? 'opacity-50' : 'disabled:opacity-50',
    className,
  )
}

export function Button({
  color = 'gray',
  transparent = false,
  coloring = transparent ? 'transparent' : 'solid',
  loading = undefined,
  shape = 'pill',
  size = 'md',

  // button
  children,
  className,
  type = 'button',
  disabled = false,
  'aria-disabled': ariaDisabled,
  ...props
}: ButtonProps) {
  const actionable = type === 'submit' || props.onClick != null
  const isDisabled = disabled || loading === true

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      tabIndex={props?.tabIndex ?? (actionable ? 0 : -1)}
      aria-disabled={ariaDisabled ?? isDisabled}
      className={buttonClassName({
        color,
        coloring,
        shape,
        size,
        actionable,
        className,
      })}
    >
      {children}
    </button>
  )
}
