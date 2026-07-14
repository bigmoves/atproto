import { clsx } from 'clsx'
import type { JSX } from 'react'
import type { Override } from '#/lib/util.ts'

export type CircularProgressProps = Override<
  JSX.IntrinsicElements['svg'],
  {
    value?: number
    size?: number
    strokeWidth?: number
    children?: never
    startAngle?: number
    progressDirection?: 'clockwise' | 'counter-clockwise'
  }
>

export function CircularProgress({
  value,
  startAngle = 0,
  progressDirection = 'clockwise',
  size = 24,
  strokeWidth = 2,

  // svg
  className,
  ...props
}: CircularProgressProps) {
  const center = size / 2
  const radius = center - strokeWidth / 2
  const circumference = 2 * Math.PI * radius

  const clampedValue = Math.max(0, Math.min(100, value ?? 70))
  const progress = clampedValue / 100

  const strokeDashoffset =
    progressDirection === 'clockwise'
      ? circumference * (1 - progress)
      : circumference * progress

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: `rotate(${startAngle}deg)` }}
      className={clsx(value == null && 'animate-spin', className)}
      {...props}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-20"
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-linear"
        style={{
          transform:
            progressDirection === 'counter-clockwise'
              ? 'scaleX(-1)'
              : undefined,
          transformOrigin: 'center',
        }}
      />
    </svg>
  )
}
