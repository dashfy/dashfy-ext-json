import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { JsonKeys } from './JsonKeys'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')

const TEST_URL = 'https://api.example.com/data'

describe('JsonKeys', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<JsonKeys keys={['name', 'age']} title="Test Keys" url={TEST_URL} />)

    expect(screen.getByText('Test Keys')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Failed to load',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['name', 'age']} title="Test Keys" url={TEST_URL} />)

    expect(screen.getByText(/Failed to load/i)).toBeTruthy()
  })

  it('should render specified keys', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['name', 'age']} title="User Info" url={TEST_URL} />)

    expect(screen.getByText('name')).toBeTruthy()
    expect(screen.getByText('John Doe')).toBeTruthy()
    expect(screen.getByText('age')).toBeTruthy()
    expect(screen.getByText('30')).toBeTruthy()
    expect(screen.queryByText('email')).not.toBeTruthy()
  })

  it('should render nested keys with dot notation', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          user: {
            profile: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <JsonKeys
        keys={['user.profile.firstName', 'user.profile.lastName']}
        title="Profile"
        url={TEST_URL}
      />,
    )

    expect(screen.getByText('user.profile.firstName')).toBeTruthy()
    expect(screen.getByText('John')).toBeTruthy()
    expect(screen.getByText('user.profile.lastName')).toBeTruthy()
    expect(screen.getByText('Doe')).toBeTruthy()
  })

  it('should format boolean values', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          active: true,
          disabled: false,
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['active', 'disabled']} title="Status" url={TEST_URL} />)

    expect(screen.getByText('true')).toBeTruthy()
    expect(screen.getByText('false')).toBeTruthy()
  })

  it('should format null and undefined values', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          value1: null,
          value2: undefined,
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['value1', 'value2']} title="Null Values" url={TEST_URL} />)

    expect(screen.getAllByText('null').length).toBeGreaterThan(0)
  })

  it('should format array values', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          items: [1, 2, 3, 4, 5],
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['items']} title="Items" url={TEST_URL} />)

    expect(screen.getByText('Array(5)')).toBeTruthy()
  })

  it('should format object values', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          config: { a: 1, b: 2, c: 3 },
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['config']} title="Config" url={TEST_URL} />)

    expect(screen.getByText('Object(3)')).toBeTruthy()
  })

  it('should show undefined for non-existent keys', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: {
        data: {
          name: 'John',
        },
      },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['name', 'nonexistent']} title="Keys" url={TEST_URL} />)

    expect(screen.getByText('name')).toBeTruthy()
    expect(screen.getByText('nonexistent')).toBeTruthy()
    expect(screen.getByText('undefined')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { name: 'Test' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <JsonKeys
        api="customApi"
        endpoint="customEndpoint"
        keys={['name']}
        title="Custom"
        url={TEST_URL}
      />,
    )

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { url: TEST_URL, headers: undefined },
    })
  })

  it('should pass url and headers to useApiSubscription', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { name: 'Test' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const headers = { Authorization: 'Bearer token' }

    render(<JsonKeys headers={headers} keys={['name']} title="Test" url={TEST_URL} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'json',
      endpoint: 'get',
      params: { url: TEST_URL, headers },
    })
  })

  it('should handle data without wrapper object', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { name: 'Direct', age: 25 },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonKeys keys={['name', 'age']} title="Direct Data" url={TEST_URL} />)

    expect(screen.getByText('Direct')).toBeTruthy()
    expect(screen.getByText('25')).toBeTruthy()
  })
})
