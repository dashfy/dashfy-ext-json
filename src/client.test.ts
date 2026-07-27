import { describe, expect, it, vi } from 'vitest'

import { createJsonClient } from './client'
import type { JsonResponse } from './types'

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

describe('createJsonClient', () => {
  it('should create a client with default config', () => {
    const client = createJsonClient()
    expect(client).toBeDefined()
    expect(typeof client).toBe('function')
  })

  it('should create a client with custom config', () => {
    const client = createJsonClient({
      baseUrl: 'https://api.example.com',
      headers: { Authorization: 'Bearer token' },
      timeout: 5000,
    })
    expect(client).toBeDefined()
  })

  it('should throw error when request helper is not provided', () => {
    const client = createJsonClient()
    expect(() => {
      // @ts-expect-error - Testing missing request
      client({})
    }).toThrow('@dashfy/ext-json requires the request helper')
  })

  it('should register get endpoint', () => {
    const mockRequest = vi.fn().mockResolvedValue({ name: 'John', age: 30 })
    const client = createJsonClient()
    const api = client({ logger: mockLogger, request: mockRequest })

    expect(api.get).toBeDefined()
    expect(typeof api.get).toBe('function')
  })

  describe('get endpoint', () => {
    it('should fetch data without JSONPath', async () => {
      const mockData = { name: 'John', age: 30 }
      const mockRequest = vi.fn().mockResolvedValue(mockData)

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.get!({ url: 'https://api.example.com/user' })) as JsonResponse

      expect(mockRequest).toHaveBeenCalledWith({
        url: 'https://api.example.com/user',
        method: 'GET',
        headers: {},
        body: undefined,
        timeout: 10000,
      })

      expect(result.data).toEqual(mockData)
      expect(result.url).toBe('https://api.example.com/user')
      expect(result.timestamp).toBeDefined()
    })

    it('should fetch data with JSONPath extraction', async () => {
      const mockData = { user: { name: 'John', age: 30 } }
      const mockRequest = vi.fn().mockResolvedValue(mockData)

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.get!({
        url: 'https://api.example.com/data',
        path: '$.user.name',
      })) as JsonResponse

      expect(result.data).toBe('John')
    })

    it('should use baseUrl when provided', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ success: true })

      const client = createJsonClient({ baseUrl: 'https://api.example.com' })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.get!({ url: '/users' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
        }),
      )
    })

    it('should not prepend baseUrl to absolute URLs', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ success: true })

      const client = createJsonClient({ baseUrl: 'https://api.example.com' })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.get!({ url: 'https://other.com/data' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://other.com/data',
        }),
      )
    })

    it('should merge default and request headers', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ success: true })

      const client = createJsonClient({
        headers: { Authorization: 'Bearer token', 'X-API-Key': 'key' },
      })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.get!({
        url: 'https://api.example.com/data',
        headers: { 'Content-Type': 'application/json' },
      })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer token',
            'X-API-Key': 'key',
            'Content-Type': 'application/json',
          },
        }),
      )
    })

    it('should override default headers with request headers', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ success: true })

      const client = createJsonClient({
        headers: { Authorization: 'Bearer old-token' },
      })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.get!({
        url: 'https://api.example.com/data',
        headers: { Authorization: 'Bearer new-token' },
      })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer new-token',
          },
        }),
      )
    })

    it('should use custom timeout', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ success: true })

      const client = createJsonClient({ timeout: 5000 })
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.get!({ url: 'https://api.example.com/data' })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        }),
      )
    })

    it('should support POST method with body', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ id: 1 })

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      await api.get!({
        url: 'https://api.example.com/users',
        method: 'POST',
        body: { name: 'John' },
      })

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          body: { name: 'John' },
        }),
      )
    })

    it('should throw error on request failure', async () => {
      const mockRequest = vi.fn().mockRejectedValue(new Error('Network error'))

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      await expect(api.get!({ url: 'https://api.example.com/data' })).rejects.toThrow(
        /Failed to fetch JSON from https:\/\/api.example.com\/data/,
      )
    })

    it('should include timestamp in response', async () => {
      const mockRequest = vi.fn().mockResolvedValue({ success: true })

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      const before = new Date().toISOString()
      const result = (await api.get!({ url: 'https://api.example.com/data' })) as JsonResponse
      const after = new Date().toISOString()

      expect(result.timestamp).toBeDefined()
      expect(result.timestamp >= before).toBe(true)
      expect(result.timestamp <= after).toBe(true)
    })

    it('should handle complex JSONPath', async () => {
      const mockData = {
        items: [
          { id: 1, name: 'First' },
          { id: 2, name: 'Second' },
        ],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockData)

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.get!({
        url: 'https://api.example.com/data',
        path: '$.items[0].name',
      })) as JsonResponse

      expect(result.data).toBe('First')
    })

    it('should handle array wildcard in JSONPath', async () => {
      const mockData = {
        items: [
          { id: 1, name: 'First' },
          { id: 2, name: 'Second' },
        ],
      }
      const mockRequest = vi.fn().mockResolvedValue(mockData)

      const client = createJsonClient()
      const api = client({ logger: mockLogger, request: mockRequest })

      const result = (await api.get!({
        url: 'https://api.example.com/data',
        path: '$.items[*]',
      })) as JsonResponse

      expect(result.data).toEqual(mockData.items)
    })
  })
})
