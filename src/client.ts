import type { APIRegistration, RequestOptions } from '@dashfy/types'
import { getErrorMessage } from '@dashfy/utils'

import { extractJsonPath } from './utils'

const DEFAULT_TIMEOUT = 10_000

export interface JsonClientConfig {
  /**
   * Base URL for all requests
   */
  baseUrl?: string
  /**
   * Default headers to include in all requests
   */
  headers?: Record<string, string>
  /**
   * Request timeout in milliseconds
   * @default 10_000
   */
  timeout?: number
}

export interface JsonEndpointConfig extends RequestOptions {
  /**
   * JSONPath expression to extract specific data
   * @example '$.items[*].name'
   */
  path?: string
}

/**
 * Creates a JSON client API for fetching and processing JSON data from HTTP endpoints.
 *
 * @param config - Client configuration
 * @param config.baseUrl - Base URL prepended to all requests (optional)
 * @param config.headers - Default headers included in all requests (optional)
 * @param config.timeout - Request timeout in milliseconds (default: 10_000)
 * @returns API registration function for Dashfy
 *
 * @example
 * ```ts
 * import { Dashfy } from '@dashfy/server'
 * import { createJsonClient } from '@dashfy/ext-json'
 *
 * const dashfy = new Dashfy()
 *
 * // Basic registration
 * dashfy.registerApi('json', createJsonClient())
 *
 * // With configuration
 * dashfy.registerApi('json', createJsonClient({
 *   baseUrl: 'https://api.example.com',
 *   headers: { 'Authorization': 'Bearer token' },
 *   timeout: 5000
 * }))
 * ```
 */
export function createJsonClient(config: JsonClientConfig = {}): APIRegistration {
  const { baseUrl = '', headers: defaultHeaders = {}, timeout = DEFAULT_TIMEOUT } = config

  return ({ logger, request }) => {
    if (!request) {
      throw new Error(
        '@dashfy/ext-json requires the request helper. Make sure you are using @dashfy/server',
      )
    }

    return {
      get: async (endpointConfig: JsonEndpointConfig) => {
        const { url, headers: requestHeaders = {}, method = 'GET', body, path } = endpointConfig

        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`

        const mergedHeaders = {
          ...defaultHeaders,
          ...requestHeaders,
        }

        const requestOptions: RequestOptions = {
          url: fullUrl,
          method,
          headers: mergedHeaders,
          body,
          timeout,
        }

        logger.info(`[json.get] Fetching ${fullUrl}`)

        try {
          const data = await request(requestOptions)

          // Extract specific path if provided
          const result = path ? extractJsonPath(data, path) : data

          return {
            data: result,
            url: fullUrl,
            timestamp: new Date().toISOString(),
          }
        } catch (error) {
          throw new Error(`Failed to fetch JSON from ${fullUrl}: ${getErrorMessage(error)}`)
        }
      },
    }
  }
}
