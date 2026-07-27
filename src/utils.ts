import { getErrorMessage, stringifyValue } from '@getdashfy/utils'

import type { AssertionType, ParsedAssertion } from './types'

/**
 * Evaluates an assertion against a value from the JSON data.
 *
 * @param assertion - Parsed assertion object
 * @param value - Value extracted from JSON data
 * @returns `true` if assertion passes, `false` otherwise
 *
 * @example
 * ```ts
 * evaluateAssertion({ type: 'equals', expectation: 'hello' }, 'hello')
 * // Returns: true
 *
 * evaluateAssertion({ type: 'matches', expectation: 'world' }, 'hello')
 * // Returns: false
 * ```
 */
export function evaluateAssertion(assertion: ParsedAssertion, value: unknown): boolean {
  const { type, expectation } = assertion

  switch (type) {
    case 'equals':
      return stringifyValue(value) === expectation

    case 'contains':
      if (value === undefined || value === null) {
        return false
      }

      return stringifyValue(value).includes(expectation)

    case 'matches': {
      if (value === undefined || value === null) {
        return false
      }

      const regex = new RegExp(expectation)

      return regex.test(stringifyValue(value))
    }

    case 'truthy':
      return Boolean(value) === true

    case 'falsy':
      return Boolean(value) === false

    default:
      return false
  }
}

/**
 * Evaluates a string-based function expression.
 * Used for dynamic `transform` functions in dashboard config.
 *
 * @param fnString - Valid JavaScript function expression
 * @returns Evaluated function
 * @throws If the function string is invalid
 *
 * @example
 * ```ts
 * // Arrow function
 * const fn = evaluateFunction<(x: number) => number>('(x) => x * 2');
 *
 * // Regular function
 * const fn = evaluateFunction<() => string>('function() { return "hello"; }');
 * ```
 *
 * @remarks
 * **Limitations:**
 * - Does NOT support JSX syntax. Use the `template` prop for HTML rendering.
 * - Only supports plain JavaScript expressions.
 *
 * **Security:**
 * This uses the Function constructor, which is similar to `eval()` and can execute
 * arbitrary code. This is safe in this context because:
 * - Function strings originate from developer-controlled dashboard configuration files
 * - Configuration files are trusted sources, not user-generated content
 */
export function evaluateFunction<T>(fnString: string): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    return new Function(`return ${fnString}`)() as T
  } catch (error) {
    throw new Error(
      `Failed to evaluate function: ${getErrorMessage(error)}. ` +
        `Note: JSX syntax is not supported in string-based functions. Use template prop instead.`,
    )
  }
}

/**
 * Extracts data from a JSON object using a simplified JSONPath expression.
 *
 * Supports:
 * - Root: `$` or `$.` (returns entire data)
 * - Dot notation: `$.user.name` or `user.name`
 * - Array index: `$.items[0]` (specific element)
 * - Array wildcard: `$.items[*]` (entire array)
 *
 * @param data - The JSON data to extract from
 * @param path - JSONPath expression
 * @returns Extracted data, or `undefined` if path not found
 *
 * @example
 * ```ts
 * const data = { user: { name: 'John', age: 30 } }
 * extractJsonPath(data, '$.user.name') // 'John'
 * extractJsonPath(data, 'user.age')    // 30
 *
 * const data2 = { items: [{ id: 1 }, { id: 2 }] }
 * extractJsonPath(data2, '$.items[0]')  // { id: 1 }
 * extractJsonPath(data2, '$.items[*]')  // [{ id: 1 }, { id: 2 }]
 * ```
 */
export function extractJsonPath(data: unknown, path: string): unknown {
  if (!path || path === '$') {
    return data
  }

  // Remove leading '$.' if present
  const cleanPath = path.replace(/^\$\.?/, '')

  if (!cleanPath) {
    return data
  }

  const parts = cleanPath.split('.')
  let result: unknown = data

  for (const part of parts) {
    if (result === null || result === undefined) {
      return undefined
    }

    // Handle array access: items[*] or items[0]
    const arrayMatch = /^(\w+)\[(\d+|\*)\]$/.exec(part)

    if (arrayMatch) {
      const prop = arrayMatch[1]
      const index = arrayMatch[2]

      if (!prop || typeof result !== 'object') {
        return undefined
      }

      result = (result as Record<string, unknown>)[prop]

      if (!Array.isArray(result)) {
        return undefined
      }

      if (index === '*') {
        // Return the whole array
        return result
      } else if (index) {
        // Return specific index
        result = result[parseInt(index, 10)]
      }
    } else {
      // Regular property access
      if (typeof result !== 'object') {
        return undefined
      }

      result = (result as Record<string, unknown>)[part]
    }
  }

  return result
}

/**
 * Parses an assertion string into structured components.
 *
 * @param assert - Assertion string
 * @returns Parsed assertion or `null` if invalid
 *
 * @example
 * ```ts
 * parseAssertion('equals(title, hello)')
 * // Returns: { type: 'equals', key: 'title', expectation: 'hello' }
 *
 * parseAssertion('truthy(active)')
 * // Returns: { type: 'truthy', key: 'active', expectation: '' }
 * ```
 */
export function parseAssertion(assert: string): ParsedAssertion | null {
  const matches = /^(equals|contains|matches|truthy|falsy)\(([^,]+),?(.*)\)$/.exec(assert)

  if (!matches?.[1] || !matches[2]) {
    return null
  }

  return {
    type: matches[1] as AssertionType,
    key: matches[2].trim(),
    expectation: matches[3]?.trim() ?? '',
  }
}
