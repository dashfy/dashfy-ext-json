import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { StatusAssertion } from './StatusEvaluator'
import { StatusEvaluator } from './StatusEvaluator'

vi.mock('@getdashfy/ui', async () => {
  const actual = await vi.importActual('@getdashfy/ui')
  return {
    ...actual,
    WidgetStatusBadge: ({ status, label }: { status: string; label?: string }) => (
      <div data-label={label} data-status={status} data-testid="status-badge">
        {label && <span>{label}</span>}
        <span>{status}</span>
      </div>
    ),
  }
})

describe('StatusEvaluator', () => {
  describe('equals assertion', () => {
    it('should match when value equals expectation', () => {
      const data = { status: 'active' }
      const statuses: StatusAssertion[] = [{ assert: 'equals(status, active)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should not match when value does not equal expectation', () => {
      const data = { status: 'inactive' }
      const statuses: StatusAssertion[] = [{ assert: 'equals(status, active)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })

    it('should match nested values', () => {
      const data = { user: { role: 'admin' } }
      const statuses: StatusAssertion[] = [
        { assert: 'equals(user.role, admin)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })
  })

  describe('contains assertion', () => {
    it('should match when string contains substring', () => {
      const data = { message: 'Hello World' }
      const statuses: StatusAssertion[] = [
        { assert: 'contains(message, World)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should not match when string does not contain substring', () => {
      const data = { message: 'Hello World' }
      const statuses: StatusAssertion[] = [{ assert: 'contains(message, Foo)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })

    it('should match when array contains value', () => {
      const data = { tags: ['react', 'typescript', 'node'] }
      const statuses: StatusAssertion[] = [
        { assert: 'contains(tags, typescript)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })
  })

  describe('matches assertion', () => {
    it('should match when value matches regex pattern', () => {
      const data = { email: 'test@example.com' }
      const statuses: StatusAssertion[] = [
        { assert: 'matches(email, @example\\.com$)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should not match when value does not match regex', () => {
      const data = { email: 'test@other.com' }
      const statuses: StatusAssertion[] = [
        { assert: 'matches(email, @example\\.com$)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })
  })

  describe('truthy assertion', () => {
    it('should match when value is truthy', () => {
      const data = { active: true }
      const statuses: StatusAssertion[] = [{ assert: 'truthy(active)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should match when value is non-empty string', () => {
      const data = { name: 'John' }
      const statuses: StatusAssertion[] = [{ assert: 'truthy(name)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should not match when value is falsy', () => {
      const data = { active: false }
      const statuses: StatusAssertion[] = [{ assert: 'truthy(active)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })
  })

  describe('falsy assertion', () => {
    it('should match when value is falsy', () => {
      const data = { disabled: false }
      const statuses: StatusAssertion[] = [{ assert: 'falsy(disabled)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should match when value is null', () => {
      const data = { value: null }
      const statuses: StatusAssertion[] = [{ assert: 'falsy(value)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('success')
    })

    it('should not match when value is truthy', () => {
      const data = { disabled: true }
      const statuses: StatusAssertion[] = [{ assert: 'falsy(disabled)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })
  })

  describe('multiple assertions', () => {
    it('should evaluate assertions in order and use last matching status', () => {
      const data = { level: 'warning' }
      const statuses: StatusAssertion[] = [
        { assert: 'equals(level, error)', status: 'error' },
        { assert: 'equals(level, warning)', status: 'warning' },
        { assert: 'equals(level, success)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('warning')
    })

    it('should use unknown when no assertions match', () => {
      const data = { level: 'info' }
      const statuses: StatusAssertion[] = [
        { assert: 'equals(level, error)', status: 'error' },
        { assert: 'equals(level, warning)', status: 'warning' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })
  })

  describe('status labels', () => {
    it('should display label when provided', () => {
      const data = { status: 'ok' }
      const statuses: StatusAssertion[] = [
        { assert: 'equals(status, ok)', status: 'success', label: 'All systems go!' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      expect(screen.getByText('All systems go!')).toBeTruthy()
    })

    it('should not display label when not provided', () => {
      const data = { status: 'ok' }
      const statuses: StatusAssertion[] = [{ assert: 'equals(status, ok)', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-label')).toBeNull()
    })
  })

  describe('invalid assertions', () => {
    it('should show error for invalid assertion format', () => {
      const data = { status: 'ok' }
      const statuses: StatusAssertion[] = [{ assert: 'invalid_format', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      expect(screen.getByText('Invalid assertion:')).toBeTruthy()
      expect(screen.getByText('invalid_format')).toBeTruthy()
    })

    it('should show error for assertion with unknown type', () => {
      const data = { status: 'ok' }
      const statuses: StatusAssertion[] = [
        { assert: 'unknown_type(status, ok)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      expect(screen.getByText('Invalid assertion:')).toBeTruthy()
      expect(screen.getByText('unknown_type(status, ok)')).toBeTruthy()
    })

    it('should show help text for invalid assertion', () => {
      const data = { status: 'ok' }
      const statuses: StatusAssertion[] = [{ assert: 'bad', status: 'success' }]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      expect(
        screen.getByText('Should conform to: (equals|contains|matches|truthy|falsy)(key, value)'),
      ).toBeTruthy()
    })

    it('should stop evaluating after first invalid assertion', () => {
      const data = { status: 'ok', level: 'high' }
      const statuses: StatusAssertion[] = [
        { assert: 'invalid', status: 'error' },
        { assert: 'equals(level, high)', status: 'success' },
      ]

      render(<StatusEvaluator data={data} statuses={statuses} />)

      // Should show error, not evaluate second assertion
      expect(screen.getByText('Invalid assertion:')).toBeTruthy()
      expect(screen.queryByTestId('status-badge')).toBeNull()
    })
  })

  describe('null/undefined data', () => {
    it('should show unknown status when data is null', () => {
      const statuses: StatusAssertion[] = [{ assert: 'truthy(value)', status: 'success' }]

      render(<StatusEvaluator data={null} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })

    it('should show unknown status when data is undefined', () => {
      const statuses: StatusAssertion[] = [{ assert: 'truthy(value)', status: 'success' }]

      render(<StatusEvaluator data={undefined} statuses={statuses} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })
  })

  describe('empty statuses array', () => {
    it('should show unknown status when no statuses provided', () => {
      const data = { value: 'test' }

      render(<StatusEvaluator data={data} statuses={[]} />)

      const badge = screen.getByTestId('status-badge')
      expect(badge.getAttribute('data-status')).toBe('unknown')
    })
  })

  describe('all status types', () => {
    it.each(['unknown', 'success', 'warning', 'error'] as const)(
      'should render %s status correctly',
      (statusType) => {
        const data = { status: statusType }
        const statuses: StatusAssertion[] = [
          { assert: `equals(status, ${statusType})`, status: statusType },
        ]

        render(<StatusEvaluator data={data} statuses={statuses} />)

        const badge = screen.getByTestId('status-badge')
        expect(badge.getAttribute('data-status')).toBe(statusType)
      },
    )
  })
})
