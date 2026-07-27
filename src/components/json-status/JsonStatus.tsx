import {
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { ActivityIcon } from 'lucide-react'

import type { JsonResponse } from '@/types'

import type { StatusAssertion } from './StatusEvaluator'
import { StatusEvaluator } from './StatusEvaluator'

export interface JsonStatusProps {
  /**
   * API subscription ID
   * @default 'json'
   */
  api?: string
  /**
   * API endpoint to call
   * @default 'get'
   */
  endpoint?: string
  /**
   * Custom widget title
   * @default 'JSON Status'
   */
  title?: string
  /**
   * Custom widget subject
   */
  subject?: string
  /**
   * URL to fetch the JSON data
   * @required
   */
  url: string
  /**
   * An optional object containing http headers to send with the request
   */
  headers?: Record<string, string>
  /**
   * JSONPath expression to extract specific data from the response
   * @example '$.data' - extracts the data field
   * @example '$.status' - extracts the status field
   */
  path?: string
  /**
   * Array of status assertions to evaluate against the JSON data.
   * Assertions are evaluated in order, and the last matching assertion wins.
   */
  statuses: StatusAssertion[]
}

/**
 * Displays a status indicator from assertions evaluated against JSON data (the last matching assertion wins).
 *
 * @example
 * ```yaml
 * - extension: json
 *   widget: JsonStatus
 *   title: API Health
 *   url: https://api.example.com/health
 *   statuses:
 *     - assert: equals(status, ok)
 *       status: success
 *       label: API Online
 *     - assert: equals(status, degraded)
 *       status: warning
 *       label: API Degraded
 * ```
 */
export const JsonStatus = ({
  api = 'json',
  endpoint = 'get',
  title = 'JSON Status',
  subject,
  url,
  headers,
  path,
  statuses,
}: JsonStatusProps) => {
  const {
    data: response,
    error,
    loading,
  } = useApiSubscription({
    api,
    endpoint,
    params: { url, headers, path },
  })

  if (loading) {
    return (
      <Widget>
        <WidgetHeader icon={<ActivityIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  const jsonResponse = response as JsonResponse

  const actualData =
    jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse
      ? jsonResponse.data
      : jsonResponse

  const isValidData =
    actualData !== undefined &&
    actualData !== null &&
    (typeof actualData !== 'object' ||
      Object.keys(actualData).length > 0 ||
      Array.isArray(actualData))

  if (error || !response || !isValidData) {
    if (!error && !isValidData) {
      return (
        <Widget>
          <WidgetHeader icon={<ActivityIcon />} subject={subject} title={title} />
          <WidgetBody>
            <WidgetLoader />
          </WidgetBody>
        </Widget>
      )
    }

    return (
      <Widget>
        <WidgetHeader icon={<ActivityIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error ?? 'Failed to load data'} />
        </WidgetBody>
      </Widget>
    )
  }

  return (
    <Widget>
      <WidgetHeader icon={<ActivityIcon />} subject={subject} title={title} />
      <WidgetBody>
        <WidgetErrorBoundary resetKeys={[title, actualData]}>
          <StatusEvaluator data={actualData} statuses={statuses} />
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
