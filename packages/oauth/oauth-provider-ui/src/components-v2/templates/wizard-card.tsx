import { Trans } from '@lingui/react/macro'
import { clsx } from 'clsx'
import {
  type JSX,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react'
import { useStableCallback } from '#/hooks/use-stable-callback.ts'
import { type DisabledStep, useStepper } from '#/hooks/use-stepper.ts'
import type { Override } from '#/lib/util.ts'

export type WizardRenderProps<TStepData> = {
  current: boolean
  prev?: () => void
  prevLabel: ReactNode
  next: (data: TStepData) => Promise<void>
  nextLabel: ReactNode
}

export type WizardRenderFn<TStepData> = (
  data: WizardRenderProps<TStepData>,
) => ReactNode

export type WizardStep<TStepData = any> = {
  /** Contextual heading for this step, reported to the parent via `onStepChange` (e.g. shown in `AuthCard`'s left column) — not rendered inline. */
  title?: ReactNode
  subtitle?: ReactNode
  /** Smaller, secondary aside for this step (e.g. "you can change this later") — reported alongside title/subtitle. */
  note?: ReactNode
  contentRender: WizardRenderFn<TStepData>
}

export type WizardCardProps<TWizardData extends readonly any[]> = Override<
  JSX.IntrinsicElements['div'],
  {
    children?: never
    prevLabel?: ReactNode
    nextLabel?: ReactNode
    onBack?: () => void
    backLabel?: ReactNode
    onDone: (data: TWizardData) => void | PromiseLike<void>
    doneLabel?: ReactNode
    /** Fires whenever the active step changes, with that step's `title`/`subtitle`/`note`. */
    onStepChange?: (
      title: ReactNode,
      subtitle: ReactNode,
      note: ReactNode,
    ) => void
    steps: {
      [K in keyof TWizardData]: null extends TWizardData[K]
        ? WizardStep<TWizardData[K]> | DisabledStep
        : WizardStep<TWizardData[K]>
    }
  }
>

/** v2 restyle of `#/components/forms/wizard-card.tsx` — identical step-machine logic. */
export function WizardCard<const T extends readonly any[]>({
  prevLabel,
  nextLabel,
  onBack,
  backLabel,
  onDone,
  doneLabel,
  onStepChange,
  steps,
  className,

  // div
  ...props
}: WizardCardProps<T>) {
  const [data, setData] = useState(
    () => steps.map(() => null) as { [K in keyof T]: T[K] | null },
  )

  const {
    atFirst,
    atLast,
    current,
    currentPosition,
    othersCompleted,
    toNext,
    toPrev,
    toRequired,
  } = useStepper(
    steps.map((step, index) =>
      step
        ? { index, step, invalid: !!step && data[index] == null }
        : undefined,
    ),
  )

  const index = current?.index

  const setCurrentStepData = useCallback(
    (stepData: any) => {
      if (index != null) {
        setData((prevData) => {
          const nextData = [...prevData] as {
            -readonly [K in keyof T]: T[K] | null
          }
          nextData[index] = stepData
          return nextData
        })
      }
    },
    [index],
  )

  const stepProps: WizardRenderProps<any> = {
    current: true,
    prevLabel: (atFirst && backLabel) || prevLabel || <Trans>Back</Trans>,
    prev: atFirst ? onBack : toPrev,
    nextLabel: (atLast && doneLabel) || nextLabel || <Trans>Next</Trans>,
    next: async (stepData) => {
      setCurrentStepData(stepData)

      if (atLast && othersCompleted) {
        const doneData: any = steps.map((step, i) =>
          step ? (i === current?.index ? stepData : data[i]) : null,
        )
        await onDone(doneData)
      } else {
        if (!toNext()) toRequired()
      }
    },
  }

  const stepContent = current?.step?.contentRender?.(stepProps)

  const stableOnStepChange = useStableCallback(
    (title: ReactNode, subtitle: ReactNode, note: ReactNode) =>
      onStepChange?.(title, subtitle, note),
  )

  useLayoutEffect(() => {
    stableOnStepChange(
      current?.step?.title,
      current?.step?.subtitle,
      current?.step?.note,
    )
    // Only re-run when the active step's *position* changes — `steps` is an
    // inline array literal in callers, so `current.step` gets a new object
    // reference on every parent render even when the step itself hasn't changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition, stableOnStepChange])

  return (
    <div
      key={currentPosition}
      className={clsx(className, 'flex flex-col')}
      {...props}
    >
      {stepContent}
    </div>
  )
}
