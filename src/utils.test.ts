import { describe, expect, it } from 'vitest'

import { evaluateAssertion, evaluateFunction, extractJsonPath, parseAssertion } from './utils'

describe('evaluateAssertion', () => {
  describe('equals', () => {
    it('should match equal strings', () => {
      const assertion = { type: 'equals' as const, key: 'title', expectation: 'hello' }
      expect(evaluateAssertion(assertion, 'hello')).toBe(true)
    })

    it('should not match different strings', () => {
      const assertion = { type: 'equals' as const, key: 'title', expectation: 'hello' }
      expect(evaluateAssertion(assertion, 'world')).toBe(false)
    })

    it('should match equal numbers', () => {
      const assertion = { type: 'equals' as const, key: 'count', expectation: '42' }
      expect(evaluateAssertion(assertion, 42)).toBe(true)
    })

    it('should match equal booleans', () => {
      const assertion = { type: 'equals' as const, key: 'active', expectation: 'true' }
      expect(evaluateAssertion(assertion, true)).toBe(true)
    })
  })

  describe('contains', () => {
    it('should match substring', () => {
      const assertion = { type: 'contains' as const, key: 'text', expectation: 'world' }
      expect(evaluateAssertion(assertion, 'hello world')).toBe(true)
    })

    it('should not match missing substring', () => {
      const assertion = { type: 'contains' as const, key: 'text', expectation: 'foo' }
      expect(evaluateAssertion(assertion, 'hello world')).toBe(false)
    })

    it('should return false for null', () => {
      const assertion = { type: 'contains' as const, key: 'text', expectation: 'world' }
      expect(evaluateAssertion(assertion, null)).toBe(false)
    })

    it('should return false for undefined', () => {
      const assertion = { type: 'contains' as const, key: 'text', expectation: 'world' }
      expect(evaluateAssertion(assertion, undefined)).toBe(false)
    })
  })

  describe('matches', () => {
    it('should match regex pattern', () => {
      const assertion = { type: 'matches' as const, key: 'email', expectation: '^test@' }
      expect(evaluateAssertion(assertion, 'test@example.com')).toBe(true)
    })

    it('should not match invalid pattern', () => {
      const assertion = { type: 'matches' as const, key: 'email', expectation: '^test@' }
      expect(evaluateAssertion(assertion, 'other@example.com')).toBe(false)
    })

    it('should return false for null', () => {
      const assertion = { type: 'matches' as const, key: 'text', expectation: 'pattern' }
      expect(evaluateAssertion(assertion, null)).toBe(false)
    })

    it('should return false for undefined', () => {
      const assertion = { type: 'matches' as const, key: 'text', expectation: 'pattern' }
      expect(evaluateAssertion(assertion, undefined)).toBe(false)
    })
  })

  describe('truthy', () => {
    it('should return true for truthy values', () => {
      const assertion = { type: 'truthy' as const, key: 'active', expectation: '' }
      expect(evaluateAssertion(assertion, true)).toBe(true)
      expect(evaluateAssertion(assertion, 1)).toBe(true)
      expect(evaluateAssertion(assertion, 'hello')).toBe(true)
      expect(evaluateAssertion(assertion, [])).toBe(true)
      expect(evaluateAssertion(assertion, {})).toBe(true)
    })

    it('should return false for falsy values', () => {
      const assertion = { type: 'truthy' as const, key: 'active', expectation: '' }
      expect(evaluateAssertion(assertion, false)).toBe(false)
      expect(evaluateAssertion(assertion, 0)).toBe(false)
      expect(evaluateAssertion(assertion, '')).toBe(false)
      expect(evaluateAssertion(assertion, null)).toBe(false)
      expect(evaluateAssertion(assertion, undefined)).toBe(false)
    })
  })

  describe('falsy', () => {
    it('should return true for falsy values', () => {
      const assertion = { type: 'falsy' as const, key: 'disabled', expectation: '' }
      expect(evaluateAssertion(assertion, false)).toBe(true)
      expect(evaluateAssertion(assertion, 0)).toBe(true)
      expect(evaluateAssertion(assertion, '')).toBe(true)
      expect(evaluateAssertion(assertion, null)).toBe(true)
      expect(evaluateAssertion(assertion, undefined)).toBe(true)
    })

    it('should return false for truthy values', () => {
      const assertion = { type: 'falsy' as const, key: 'disabled', expectation: '' }
      expect(evaluateAssertion(assertion, true)).toBe(false)
      expect(evaluateAssertion(assertion, 1)).toBe(false)
      expect(evaluateAssertion(assertion, 'hello')).toBe(false)
      expect(evaluateAssertion(assertion, [])).toBe(false)
      expect(evaluateAssertion(assertion, {})).toBe(false)
    })
  })
})

describe('evaluateFunction', () => {
  it('should evaluate arrow function', () => {
    const fn = evaluateFunction<(x: number) => number>('(x) => x * 2')
    expect(fn(5)).toBe(10)
  })

  it('should evaluate regular function', () => {
    const fn = evaluateFunction<() => string>('function() { return "hello"; }')
    expect(fn()).toBe('hello')
  })

  it('should evaluate function with complex logic', () => {
    const fn = evaluateFunction<(arr: number[]) => number>(
      '(arr) => arr.reduce((a, b) => a + b, 0)',
    )
    expect(fn([1, 2, 3, 4])).toBe(10)
  })

  it('should throw error for invalid function string', () => {
    expect(() => {
      evaluateFunction('not a function')
    }).toThrow(/Failed to evaluate function/)
  })

  it('should throw error with helpful message', () => {
    expect(() => {
      evaluateFunction('invalid syntax {')
    }).toThrow(/JSX syntax is not supported/)
  })

  it('should handle transform function', () => {
    const fn = evaluateFunction<(data: { items: number[] }) => number[]>(
      '(data) => data.items.map(x => x * 2)',
    )
    expect(fn({ items: [1, 2, 3] })).toEqual([2, 4, 6])
  })
})

describe('extractJsonPath', () => {
  const testData = {
    user: {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    },
    items: [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
      { id: 3, title: 'Third' },
    ],
    active: true,
    count: 0,
  }

  it('should return entire data for $ path', () => {
    expect(extractJsonPath(testData, '$')).toEqual(testData)
  })

  it('should return entire data for empty path', () => {
    expect(extractJsonPath(testData, '')).toEqual(testData)
  })

  it('should extract top-level property', () => {
    expect(extractJsonPath(testData, '$.active')).toBe(true)
    expect(extractJsonPath(testData, 'active')).toBe(true)
  })

  it('should extract nested property', () => {
    expect(extractJsonPath(testData, '$.user.name')).toBe('John')
    expect(extractJsonPath(testData, 'user.name')).toBe('John')
  })

  it('should extract deep nested property', () => {
    expect(extractJsonPath(testData, '$.user.email')).toBe('john@example.com')
  })

  it('should extract array element by index', () => {
    expect(extractJsonPath(testData, '$.items[0]')).toEqual({ id: 1, title: 'First' })
    expect(extractJsonPath(testData, 'items[0]')).toEqual({ id: 1, title: 'First' })
  })

  it('should extract entire array with wildcard', () => {
    expect(extractJsonPath(testData, '$.items[*]')).toEqual(testData.items)
    expect(extractJsonPath(testData, 'items[*]')).toEqual(testData.items)
  })

  it('should return undefined for non-existent path', () => {
    expect(extractJsonPath(testData, '$.nonexistent')).toBeUndefined()
    expect(extractJsonPath(testData, 'user.nonexistent')).toBeUndefined()
  })

  it('should return undefined for invalid array index', () => {
    expect(extractJsonPath(testData, '$.items[99]')).toBeUndefined()
  })

  it('should return undefined for array access on non-array', () => {
    expect(extractJsonPath(testData, '$.user[0]')).toBeUndefined()
  })

  it('should return undefined when accessing property on null', () => {
    const data = { value: null }
    expect(extractJsonPath(data, '$.value.nested')).toBeUndefined()
  })

  it('should handle numeric values', () => {
    expect(extractJsonPath(testData, '$.count')).toBe(0)
    expect(extractJsonPath(testData, '$.user.age')).toBe(30)
  })
})

describe('parseAssertion', () => {
  it('should parse equals assertion', () => {
    const result = parseAssertion('equals(title, hello)')
    expect(result).toEqual({
      type: 'equals',
      key: 'title',
      expectation: 'hello',
    })
  })

  it('should parse contains assertion', () => {
    const result = parseAssertion('contains(description, world)')
    expect(result).toEqual({
      type: 'contains',
      key: 'description',
      expectation: 'world',
    })
  })

  it('should parse matches assertion', () => {
    const result = parseAssertion('matches(email, ^[a-z]+@)')
    expect(result).toEqual({
      type: 'matches',
      key: 'email',
      expectation: '^[a-z]+@',
    })
  })

  it('should parse truthy assertion', () => {
    const result = parseAssertion('truthy(active)')
    expect(result).toEqual({
      type: 'truthy',
      key: 'active',
      expectation: '',
    })
  })

  it('should parse falsy assertion', () => {
    const result = parseAssertion('falsy(disabled)')
    expect(result).toEqual({
      type: 'falsy',
      key: 'disabled',
      expectation: '',
    })
  })

  it('should handle extra spaces', () => {
    const result = parseAssertion('equals( title , hello )')
    expect(result).toEqual({
      type: 'equals',
      key: 'title',
      expectation: 'hello',
    })
  })

  it('should return null for invalid assertion', () => {
    expect(parseAssertion('invalid()')).toBeNull()
    expect(parseAssertion('equals()')).toBeNull()
    expect(parseAssertion('equals')).toBeNull()
    expect(parseAssertion('')).toBeNull()
  })
})
