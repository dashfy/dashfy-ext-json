import { WidgetStatusBadge } from '@getdashfy/ui'
import { get } from '@getdashfy/utils'

import { evaluateAssertion, parseAssertion } from '@/utils'

export interface StatusAssertion {
  /**
   * Assertion expression in format: type(key, value)
   * Types: equals, contains, matches, truthy, falsy
   */
  assert: string
  /**
   * Status to display when assertion matches
   */
  status: 'unknown' | 'success' | 'warning' | 'error'
  /**
   * Label to display with the status badge
   */
  label?: string
}

interface StatusEvaluatorProps {
  data: unknown
  statuses: StatusAssertion[]
}

export const StatusEvaluator = ({ data, statuses }: StatusEvaluatorProps) => {
  let currentStatus: 'unknown' | 'success' | 'warning' | 'error' = 'unknown'
  let currentLabel: string | undefined
  let invalidAssertion: string | undefined

  if (data) {
    for (const status of statuses) {
      const parsed = parseAssertion(status.assert)

      if (!parsed) {
        invalidAssertion = status.assert
        break
      }

      const value = get(data as Record<string, unknown>, parsed.key)

      if (evaluateAssertion(parsed, value)) {
        currentStatus = status.status
        currentLabel = status.label
      }
    }
  }

  if (invalidAssertion) {
    return (
      <div className="text-error flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm">
        <span className="font-semibold">Invalid assertion:</span>
        <code className="bg-muted rounded px-2 py-1 font-mono text-xs">{invalidAssertion}</code>
        <span className="text-muted-foreground text-xs">
          Should conform to: (equals|contains|matches|truthy|falsy)(key, value)
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <WidgetStatusBadge label={currentLabel} status={currentStatus} />
    </div>
  )
}
