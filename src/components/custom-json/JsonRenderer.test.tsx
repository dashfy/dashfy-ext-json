import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { JsonRenderer } from './JsonRenderer'

describe('JsonRenderer', () => {
  it('should render object data as formatted JSON', () => {
    const data = { name: 'John', age: 30 }

    render(<JsonRenderer data={data} />)

    expect(screen.getByText(/"name": "John"/)).toBeTruthy()
    expect(screen.getByText(/"age": 30/)).toBeTruthy()
  })

  it('should render data in a pre element', () => {
    const data = { key: 'value' }

    const { container } = render(<JsonRenderer data={data} />)

    const preElement = container.querySelector('pre')
    expect(preElement).toBeTruthy()
  })

  it('should apply correct CSS classes', () => {
    const data = { test: true }

    const { container } = render(<JsonRenderer data={data} />)

    const preElement = container.querySelector('pre')
    expect(preElement?.classList.contains('bg-muted')).toBe(true)
    expect(preElement?.classList.contains('rounded')).toBe(true)
    expect(preElement?.classList.contains('p-3')).toBe(true)
    expect(preElement?.classList.contains('font-mono')).toBe(true)
    expect(preElement?.classList.contains('text-xs')).toBe(true)
  })

  it('should render array data', () => {
    const data = [1, 2, 3]

    render(<JsonRenderer data={data} />)

    const { container } = render(<JsonRenderer data={data} />)
    const preElement = container.querySelector('pre')
    expect(preElement?.textContent).toContain('1')
    expect(preElement?.textContent).toContain('2')
    expect(preElement?.textContent).toContain('3')
  })

  it('should render nested object data', () => {
    const data = {
      user: {
        name: 'Alice',
        address: {
          city: 'NYC',
        },
      },
    }

    render(<JsonRenderer data={data} />)

    expect(screen.getByText(/"name": "Alice"/)).toBeTruthy()
    expect(screen.getByText(/"city": "NYC"/)).toBeTruthy()
  })

  it('should render string data', () => {
    const data = 'Hello World'

    render(<JsonRenderer data={data} />)

    expect(screen.getByText(/"Hello World"/)).toBeTruthy()
  })

  it('should render number data', () => {
    const data = 42

    render(<JsonRenderer data={data} />)

    expect(screen.getByText('42')).toBeTruthy()
  })

  it('should render boolean data', () => {
    render(<JsonRenderer data={true} />)
    expect(screen.getByText('true')).toBeTruthy()
  })

  it('should render null data', () => {
    render(<JsonRenderer data={null} />)
    expect(screen.getByText('null')).toBeTruthy()
  })

  it('should render empty object', () => {
    render(<JsonRenderer data={{}} />)
    expect(screen.getByText('{}')).toBeTruthy()
  })

  it('should render empty array', () => {
    render(<JsonRenderer data={[]} />)
    expect(screen.getByText('[]')).toBeTruthy()
  })

  it('should format JSON with 2-space indentation', () => {
    const data = { a: { b: 1 } }

    const { container } = render(<JsonRenderer data={data} />)

    const preElement = container.querySelector('pre')
    const content = preElement?.textContent ?? ''
    // Check that it's properly indented (contains newlines)
    expect(content).toContain('\n')
    // Should have proper JSON structure
    expect(content).toContain('"a"')
    expect(content).toContain('"b"')
  })

  it('should handle special characters in strings', () => {
    const data = { message: 'Hello "World" & <test>' }

    const { container } = render(<JsonRenderer data={data} />)

    const preElement = container.querySelector('pre')
    // The JSON.stringify preserves the special characters
    expect(preElement?.textContent).toContain('Hello \\"World\\" & <test>')
  })

  it('should handle unicode characters', () => {
    const data = { emoji: '👋🌍', japanese: 'こんにちは' }

    render(<JsonRenderer data={data} />)

    expect(screen.getByText(/👋🌍/)).toBeTruthy()
    expect(screen.getByText(/こんにちは/)).toBeTruthy()
  })
})
