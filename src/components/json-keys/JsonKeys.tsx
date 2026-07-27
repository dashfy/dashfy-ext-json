import {
  generateReactKey,
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetListItem,
  WidgetLoader,
} from '@dashfy/ui'
import { get, valueToDisplayString } from '@dashfy/utils'
import { KeyIcon } from 'lucide-react'

import type { JsonResponse } from '@/types'

export interface JsonKeysProps {
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
   * @default 'JSON Keys'
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
   * @example '$.items[0]' - extracts the first item
   */
  path?: string
  /**
   * Array of keys to extract and display from the JSON response.
   * Supports dot notation for nested properties (e.g., 'user.name', 'stats.count')
   * @required
   */
  keys: string[]
}

/**
 * Displays specific key-value pairs extracted from a JSON response.
 * Supports nested property access using dot notation.
 *
 * @example
 * ```json
 * {
 *   "extension": "json",
 *   "widget": "JsonKeys",
 *   "api": "json",
 *   "endpoint": "get",
 *   "title": "User Profile",
 *   "url": "https://api.example.com/user",
 *   "headers": {
 *     "Authorization": "Bearer token"
 *   },
 *   "keys": ["name", "email"]
 * }
 * ```
 *
 * @example
 * ```yaml
 * extension: json
 * widget: JsonKeys
 * api: json
 * endpoint: get
 * title: User Profile
 * url: https://api.example.com/user
 * headers:
 *   Authorization: Bearer token
 *   url: https://api.example.com/user
 * keys:
 *   - name
 *   - email
 * ```
 *
 * @example
 * ```tsx
 * <JsonKeys
 *   api="json"
 *   endpoint="get"
 *   title="User Profile"
 *   url="https://api.example.com/user"
 *   headers={{ Authorization: 'Bearer token' }}
 *   keys={['name', 'email', 'profile.age', 'stats.posts']}
 * />
 * ```
 */
export const JsonKeys = ({
  api = 'json',
  endpoint = 'get',
  title = 'JSON Keys',
  subject,
  url,
  headers,
  path,
  keys,
}: JsonKeysProps) => {
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
        <WidgetHeader icon={<KeyIcon />} subject={subject} title={title} />
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
          <WidgetHeader icon={<KeyIcon />} subject={subject} title={title} />
          <WidgetBody>
            <WidgetLoader />
          </WidgetBody>
        </Widget>
      )
    }

    return (
      <Widget>
        <WidgetHeader icon={<KeyIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error ?? 'Failed to load data'} />
        </WidgetBody>
      </Widget>
    )
  }

  return (
    <Widget>
      <WidgetHeader icon={<KeyIcon />} subject={subject} title={title} />
      <WidgetBody className="space-y-1" disablePadding scrollable>
        <WidgetErrorBoundary resetKeys={[title, keys.length]}>
          {keys.map((key: string, index: number) => {
            const value = get(actualData as Record<string, unknown>, key)
            const formattedValue = valueToDisplayString(value)

            return (
              <WidgetListItem
                key={generateReactKey('json-key', key, index)}
                title={key}
                value={formattedValue}
              />
            )
          })}
        </WidgetErrorBoundary>
      </WidgetBody>
    </Widget>
  )
}
