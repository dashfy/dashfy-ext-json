import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CustomJson } from './CustomJson'

vi.mock('@dashfy/ui', async () => {
  const actual = await vi.importActual('@dashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@dashfy/ui')

const TEST_URL = 'https://api.example.com/data'

describe('CustomJson', () => {
  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<CustomJson title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText('Test Widget')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Network error',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText('Test Widget')).toBeTruthy()
    expect(screen.getByText(/Network error/i)).toBeTruthy()
  })

  it('should render raw JSON by default', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { name: 'John', age: 30 } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson title="User Data" url={TEST_URL} />)

    expect(screen.getByText('User Data')).toBeTruthy()
    expect(screen.getByText(/"name": "John"/)).toBeTruthy()
    expect(screen.getByText(/"age": 30/)).toBeTruthy()
  })

  it('should render with template', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { title: 'Hello World' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson template="<h1><%= data.title %></h1>" title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should apply transform function', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { count: 5 } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const transform = (data: unknown) => ({
      doubled: (data as { count: number }).count * 2,
    })

    render(<CustomJson title="Test Widget" transform={transform} url={TEST_URL} />)

    expect(screen.getByText(/"doubled": 10/)).toBeTruthy()
  })

  it('should apply string-based transform function', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { count: 5 } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <CustomJson
        title="Test Widget"
        transform="(data) => ({ doubled: data.count * 2 })"
        url={TEST_URL}
      />,
    )

    expect(screen.getByText(/"doubled": 10/)).toBeTruthy()
  })

  it('should render with custom render function', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { message: 'Custom Render' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const renderFn = (data: { message: string }) => <div data-testid="custom">{data.message}</div>

    render(<CustomJson render={renderFn} title="Test Widget" url={TEST_URL} />)

    const customElement = screen.getByTestId('custom')
    expect(customElement).toBeTruthy()
    expect(customElement.textContent).toBe('Custom Render')
  })

  it('should show message when no render method provided and showRaw is false', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { name: 'John' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson showRaw={false} title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText('No render function or template provided')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { test: true } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <CustomJson api="customApi" endpoint="customEndpoint" title="Custom API" url={TEST_URL} />,
    )

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'customApi',
      endpoint: 'customEndpoint',
      params: { url: TEST_URL, headers: undefined },
    })
  })

  it('should pass url and headers to useApiSubscription', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { test: true } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const headers = { Authorization: 'Bearer token' }

    render(<CustomJson headers={headers} title="Test" url={TEST_URL} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'json',
      endpoint: 'get',
      params: { url: TEST_URL, headers },
    })
  })

  it('should handle data without wrapper object', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { name: 'Direct Data' },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText(/"name": "Direct Data"/)).toBeTruthy()
  })

  it('should show loader for invalid data (empty object)', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: {} },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render valid empty array', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: [] },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<CustomJson title="Test Widget" url={TEST_URL} />)

    expect(screen.getByText(/\[\]/)).toBeTruthy()
  })
})
