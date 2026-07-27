import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CustomRenderer } from './CustomRenderer'

describe('CustomRenderer', () => {
  it('should render data using provided render function', () => {
    const data = { name: 'John', age: 30 }
    const renderFn = (d: typeof data) => <span data-testid="output">{d.name}</span>

    render(<CustomRenderer data={data} render={renderFn} />)

    expect(screen.getByTestId('output')).toBeTruthy()
    expect(screen.getByTestId('output').textContent).toBe('John')
  })

  it('should call render function with data', () => {
    const data = { value: 42 }
    const renderFn = vi.fn().mockReturnValue(<span>Result</span>)

    render(<CustomRenderer data={data} render={renderFn} />)

    expect(renderFn).toHaveBeenCalledTimes(1)
    expect(renderFn).toHaveBeenCalledWith(data)
  })

  it('should render complex data structures', () => {
    const data = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    }
    const renderFn = (d: typeof data) => (
      <ul>
        {d.users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    )

    render(<CustomRenderer data={data} render={renderFn} />)

    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByText('Bob')).toBeTruthy()
  })

  it('should handle string data', () => {
    const data = 'Hello World'
    const renderFn = (d: string) => <p>{d}</p>

    render(<CustomRenderer data={data} render={renderFn} />)

    expect(screen.getByText('Hello World')).toBeTruthy()
  })

  it('should handle number data', () => {
    const data = 12345
    const renderFn = (d: number) => <span>Count: {d}</span>

    render(<CustomRenderer data={data} render={renderFn} />)

    expect(screen.getByText('Count: 12345')).toBeTruthy()
  })

  it('should handle array data', () => {
    const data = ['apple', 'banana', 'cherry']
    const renderFn = (d: string[]) => (
      <ul>
        {d.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    )

    render(<CustomRenderer data={data} render={renderFn} />)

    expect(screen.getByText('apple')).toBeTruthy()
    expect(screen.getByText('banana')).toBeTruthy()
    expect(screen.getByText('cherry')).toBeTruthy()
  })

  it('should handle null data', () => {
    const renderFn = (d: null) => <span>{d === null ? 'No data' : 'Has data'}</span>

    render(<CustomRenderer data={null} render={renderFn} />)

    expect(screen.getByText('No data')).toBeTruthy()
  })

  it('should handle undefined data', () => {
    const renderFn = (d: undefined) => <span>{d === undefined ? 'Undefined' : 'Defined'}</span>

    render(<CustomRenderer data={undefined} render={renderFn} />)

    expect(screen.getByText('Undefined')).toBeTruthy()
  })

  it('should wrap content in a div', () => {
    const renderFn = () => <span>Content</span>

    const { container } = render(<CustomRenderer data={{}} render={renderFn} />)

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.querySelector('span')).toBeTruthy()
  })

  it('should render different content when data changes', () => {
    const renderFn = (d: { value: number }) => <span>Value: {d.value}</span>

    const { rerender } = render(<CustomRenderer data={{ value: 1 }} render={renderFn} />)
    expect(screen.getByText('Value: 1')).toBeTruthy()

    rerender(<CustomRenderer data={{ value: 2 }} render={renderFn} />)
    expect(screen.getByText('Value: 2')).toBeTruthy()
  })
})
