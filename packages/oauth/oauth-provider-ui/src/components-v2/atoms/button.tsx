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
 * `default` — primary/secondary CTAs (Next, Authorize, Sign up).
 * `row` — full-width tappable list rows (picker accounts, nav items, settings rows).
 * `circle` — icon-only buttons.
 */
export type ButtonShape = 'default' | 'row' | 'circle'
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

// Uppercase mono labels only apply to the `default` CTA shape — `row`
// buttons render arbitrary content (names, emails) and `circle` buttons
// render icons only, neither of which should be forced uppercase/mono.
// Smaller than `TEXT_SIZES` — the reference design keeps these labels
// compact (12-13px) regardless of button size; only solid-coloring (the
// primary CTA) gets bold, transparent/secondary buttons stay medium-weight.
const DEFAULT_SHAPE_LABEL = 'font-mono uppercase'
const DEFAULT_SHAPE_TEXT_SIZES: Record<ButtonSize, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
}
const TRACKING_SIZES: Record<ButtonSize, string> = {
  sm: 'tracking-[0.1em]',
  md: 'tracking-[0.08em]',
  lg: 'tracking-[0.06em]',
}

const PADDING_SIZES: Record<ButtonShape, Record<ButtonSize, string>> = {
  default: {
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

// Solid-coloring buttons get a translucent hairline border (composites over
// any fill color, including operator-branded hues) — transparent-coloring
// buttons stay borderless, that's their whole affordance.
const SOLID_BORDER = 'border border-black/15 dark:border-white/15'

const COLORING: Record<ButtonColor, Record<ButtonColoring, string>> = {
  primary: {
    solid: `bg-primary text-primary-contrast hover:opacity-90 ${SOLID_BORDER}`,
    transparent: 'text-primary hover:bg-primary/10 bg-transparent',
  },
  // Neutral — hue-independent regardless of the operator's branding hue
  // (`bg-contrast-*` is derived from `--branding-color-primary-hue` and
  // would tint these as if they were primary-colored).
  gray: {
    solid: `bg-surface-2 text-ink hover:bg-surface-border ${SOLID_BORDER}`,
    transparent: 'text-ink-light hover:bg-surface-2 bg-transparent',
  },
  error: {
    solid: `bg-error-500 dark:bg-error-700 text-error-contrast hover:opacity-90 ${SOLID_BORDER}`,
    transparent: 'text-error hover:bg-error/10 bg-transparent',
  },
  warning: {
    solid: `bg-warning-500 dark:bg-warning-700 text-warning-contrast hover:opacity-90 ${SOLID_BORDER}`,
    transparent: 'text-warning hover:bg-warning/10 bg-transparent',
  },
  info: {
    solid: `bg-info-500 dark:bg-info-700 text-info-contrast hover:opacity-90 ${SOLID_BORDER}`,
    transparent: 'text-info hover:bg-info/10 bg-transparent',
  },
  success: {
    solid: `bg-success-500 dark:bg-success-700 text-success-contrast hover:opacity-90 ${SOLID_BORDER}`,
    transparent: 'text-success hover:bg-success/10 bg-transparent',
  },
}

export function buttonClassName({
  color = 'gray',
  coloring = 'solid',
  shape = 'default',
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
    'touch-manipulation overflow-hidden truncate',
    actionable && 'cursor-pointer',
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'row'
        ? 'rounded-panel'
        : 'rounded-control',
    'box-border flex items-center justify-center gap-2',
    shape === 'row' && 'w-full justify-start text-left',
    PADDING_SIZES[shape][size],
    shape === 'default' ? DEFAULT_SHAPE_TEXT_SIZES[size] : TEXT_SIZES[size],
    COLORING[color][coloring],
    // Gray/transparent `default`-shape buttons (Cancel, Back) get a visible
    // border so they read as bordered secondary actions rather than
    // borderless text links.
    shape === 'default' &&
      color === 'gray' &&
      coloring === 'transparent' &&
      'border-surface-border border',
    shape === 'default'
      ? [
          DEFAULT_SHAPE_LABEL,
          TRACKING_SIZES[size],
          coloring === 'solid' ? 'font-bold' : 'font-medium',
        ]
      : 'font-semibold tracking-wide',
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
  shape = 'default',
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
