import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { JsonStatus } from './JsonStatus'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    useApiSubscription: vi.fn(),
  }
})

const { useApiSubscription } = await import('@getdashfy/ui')

const TEST_URL = 'https://api.example.com/status'

describe('JsonStatus', () => {
  const mockStatuses = [
    { assert: 'equals(status, active)', status: 'success' as const, label: 'Active' },
    { assert: 'equals(status, pending)', status: 'warning' as const, label: 'Pending' },
    { assert: 'equals(status, error)', status: 'error' as const, label: 'Error' },
  ]

  it('should render loading state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: null,
      loading: true,
      lastUpdate: undefined,
    })

    render(<JsonStatus statuses={mockStatuses} title="Test Status" url={TEST_URL} />)

    expect(screen.getByText('Test Status')).toBeTruthy()
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render error state', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: null,
      error: 'Network error',
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonStatus statuses={mockStatuses} title="Test Status" url={TEST_URL} />)

    expect(screen.getByText(/Network error/i)).toBeTruthy()
  })

  it('should evaluate equals assertion', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { status: 'active' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonStatus statuses={mockStatuses} title="Status Widget" url={TEST_URL} />)

    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('should evaluate contains assertion', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { message: 'Hello world' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [
      { assert: 'contains(message, world)', status: 'success' as const, label: 'Contains World' },
    ]

    render(<JsonStatus statuses={statuses} title="Contains Test" url={TEST_URL} />)

    // Should show success status with label
    expect(screen.getByText('Contains World')).toBeTruthy()
  })

  it('should evaluate matches (regex) assertion', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { email: 'test@example.com' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [
      { assert: 'matches(email, ^[a-z]+@)', status: 'success' as const, label: 'Valid Email' },
    ]

    render(<JsonStatus statuses={statuses} title="Regex Test" url={TEST_URL} />)

    expect(screen.getByText('Valid Email')).toBeTruthy()
  })

  it('should evaluate truthy assertion', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { active: true } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [{ assert: 'truthy(active)', status: 'success' as const, label: 'Is Active' }]

    render(<JsonStatus statuses={statuses} title="Truthy Test" url={TEST_URL} />)

    expect(screen.getByText('Is Active')).toBeTruthy()
  })

  it('should evaluate falsy assertion', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { disabled: false } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [
      { assert: 'falsy(disabled)', status: 'success' as const, label: 'Not Disabled' },
    ]

    render(<JsonStatus statuses={statuses} title="Falsy Test" url={TEST_URL} />)

    expect(screen.getByText('Not Disabled')).toBeTruthy()
  })

  it('should show last matching assertion when multiple match', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { value: 10 } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [
      { assert: 'equals(value, 10)', status: 'warning' as const, label: 'First Match' },
      { assert: 'truthy(value)', status: 'success' as const, label: 'Second Match' },
    ]

    render(<JsonStatus statuses={statuses} title="Multiple Assertions" url={TEST_URL} />)

    // Last matching assertion should win
    expect(screen.getByText('Second Match')).toBeTruthy()
  })

  it('should show unknown status when no assertions match', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { status: 'unknown-value' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const { container } = render(
      <JsonStatus statuses={mockStatuses} title="No Match" url={TEST_URL} />,
    )

    // Should render a badge (checking by class since no testid exists)
    const badge = container.querySelector('[class*="inline-flex"]')
    expect(badge).toBeTruthy()
  })

  it('should handle invalid assertion syntax', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { status: 'active' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [{ assert: 'invalid-assertion', status: 'error' as const }]

    render(<JsonStatus statuses={statuses} title="Invalid Assertion" url={TEST_URL} />)

    expect(screen.getByText('Invalid assertion:')).toBeTruthy()
    expect(screen.getByText('invalid-assertion')).toBeTruthy()
  })

  it('should use custom API and endpoint', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { status: 'active' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(
      <JsonStatus
        api="customApi"
        endpoint="customEndpoint"
        statuses={mockStatuses}
        title="Custom API"
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
      data: { data: { status: 'active' } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const headers = { Authorization: 'Bearer token' }

    render(<JsonStatus headers={headers} statuses={mockStatuses} title="Test" url={TEST_URL} />)

    expect(useApiSubscription).toHaveBeenCalledWith({
      api: 'json',
      endpoint: 'get',
      params: { url: TEST_URL, headers },
    })
  })

  it('should handle data without wrapper object', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { status: 'active' },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonStatus statuses={mockStatuses} title="Direct Data" url={TEST_URL} />)

    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('should handle nested data paths', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: { user: { status: 'active' } } },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    const statuses = [
      { assert: 'equals(user.status, active)', status: 'success' as const, label: 'User Active' },
    ]

    render(<JsonStatus statuses={statuses} title="Nested Path" url={TEST_URL} />)

    expect(screen.getByText('User Active')).toBeTruthy()
  })

  it('should show loader for invalid data (empty object)', () => {
    vi.mocked(useApiSubscription).mockReturnValue({
      data: { data: {} },
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    })

    render(<JsonStatus statuses={mockStatuses} title="Empty Data" url={TEST_URL} />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })
})
