import {
  useApiSubscription,
  Widget,
  WidgetBody,
  WidgetError,
  WidgetErrorBoundary,
  WidgetHeader,
  WidgetLoader,
} from '@getdashfy/ui'
import { FileJsonIcon } from 'lucide-react'
import * as React from 'react'

import type { JsonResponse } from '@/types'
import { evaluateFunction } from '@/utils'

import { CustomRenderer } from './CustomRenderer'
import { JsonRenderer } from './JsonRenderer'
import { TemplateRenderer } from './TemplateRenderer'

export interface CustomJsonProps<T = unknown> {
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
   * @default 'JSON Data'
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
   * @example '$.title' - extracts the title field
   * @example '$.items[0]' - extracts the first item
   * @example '$.items[*]' - extracts the entire items array
   */
  path?: string
  /**
   * Template string for rendering HTML
   * Uses template syntax: <%= data.field %>
   * Supports conditionals, loops, and expressions
   *
   * @example
   * template: '<h1><%= data.title %></h1><p>Count: <%= data.count %></p>'
   *
   * @example
   * // With conditionals
   * template: '<% if (data.count > 5) { %>Many<% } else { %>Few<% } %>'
   *
   * @example
   * // With loops
   * template: '<% data.items.forEach(item => { %><li><%= item %></li><% }) %>'
   */
  template?: string
  /**
   * Custom React render function for the data
   * Takes precedence over template if both are provided
   *
   * NOTE: When using string-based render functions (e.g., in JSON/YAML config),
   * JSX syntax is NOT supported. Use plain JavaScript with React.createElement
   * or use the `template` prop instead.
   *
   * JSX render functions only work when passed as actual functions in code.
   */
  render?: ((data: T) => React.ReactNode) | string
  /**
   * Transform function to process data before rendering
   * Can be a function or a string representation of a function
   */
  transform?: ((data: unknown) => T) | string
  /**
   * Show raw JSON if no render function or template provided
   * @default true
   */
  showRaw?: boolean
}

/**
 * Displays JSON data with flexible rendering: an Eta template, a React render function, or raw JSON.
 *
 * @example
 * ```yaml
 * - extension: json
 *   widget: CustomJson
 *   title: Weather
 *   url: https://api.example.com/weather
 *   template: |
 *     <h2><%= data.city %></h2>
 *     <p>Temperature: <%= data.temp %>°C</p>
 * ```
 */
// eslint-disable-next-line react/function-component-definition
export function CustomJson<T = unknown>({
  api = 'json',
  endpoint = 'get',
  title = 'JSON Data',
  subject,
  url,
  headers,
  path,
  template,
  render,
  transform,
  showRaw = true,
}: CustomJsonProps<T>) {
  const {
    data: response,
    error,
    loading,
  } = useApiSubscription({
    api,
    endpoint,
    params: { url, headers, path },
  })

  // Memoize evaluated functions (expensive: uses new Function())
  const transformFn = React.useMemo(
    () =>
      typeof transform === 'string' ? evaluateFunction<(data: unknown) => T>(transform) : transform,
    [transform],
  )

  const renderFn = React.useMemo(
    () =>
      typeof render === 'string' ? evaluateFunction<(data: T) => React.ReactNode>(render) : render,
    [render],
  )

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

  if (loading) {
    return (
      <Widget>
        <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetLoader />
        </WidgetBody>
      </Widget>
    )
  }

  if (error || !response || !isValidData) {
    if (!error && !isValidData) {
      return (
        <Widget>
          <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
          <WidgetBody>
            <WidgetLoader />
          </WidgetBody>
        </Widget>
      )
    }

    return (
      <Widget>
        <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
        <WidgetBody>
          <WidgetError error={error ?? 'Failed to load data'} />
        </WidgetBody>
      </Widget>
    )
  }

  // Only transform data AFTER we've confirmed it's valid
  const transformedData: T = transformFn ? transformFn(actualData) : (actualData as T)
  const resetKeys = [title, transformedData]

  if (renderFn) {
    return (
      <Widget>
        <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
        <WidgetBody scrollable>
          <WidgetErrorBoundary resetKeys={resetKeys}>
            <CustomRenderer data={transformedData} render={renderFn} />
          </WidgetErrorBoundary>
        </WidgetBody>
      </Widget>
    )
  }

  if (template) {
    return (
      <Widget>
        <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
        <WidgetBody scrollable>
          <WidgetErrorBoundary resetKeys={resetKeys}>
            <TemplateRenderer data={transformedData} template={template} />
          </WidgetErrorBoundary>
        </WidgetBody>
      </Widget>
    )
  }

  if (showRaw) {
    return (
      <Widget>
        <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
        <WidgetBody scrollable>
          <WidgetErrorBoundary resetKeys={resetKeys}>
            <JsonRenderer data={transformedData} />
          </WidgetErrorBoundary>
        </WidgetBody>
      </Widget>
    )
  }

  return (
    <Widget>
      <WidgetHeader icon={<FileJsonIcon />} subject={subject} title={title} />
      <WidgetBody>
        <div className="text-muted-foreground flex items-center justify-center p-6 text-sm">
          No render function or template provided
        </div>
      </WidgetBody>
    </Widget>
  )
}
