import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TemplateRenderer } from './TemplateRenderer'

describe('TemplateRenderer', () => {
  it('should render simple template with data', () => {
    const data = { name: 'John' }
    const template = '<p>Hello, <%= data.name %>!</p>'

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText('Hello, John!')).toBeTruthy()
  })

  it('should render loading state when data is null', () => {
    render(<TemplateRenderer data={null} template="<p><%= data.name %></p>" />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render loading state when data is undefined', () => {
    render(<TemplateRenderer data={undefined} template="<p><%= data.name %></p>" />)

    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('should render nested data access', () => {
    const data = {
      user: {
        profile: {
          firstName: 'Alice',
          lastName: 'Smith',
        },
      },
    }
    const template =
      '<span><%= data.user.profile.firstName %> <%= data.user.profile.lastName %></span>'

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText('Alice Smith')).toBeTruthy()
  })

  it('should render arrays with loop', () => {
    const data = { items: ['apple', 'banana', 'cherry'] }
    const template = `
      <ul>
        <% data.items.forEach(function(item) { %>
          <li><%= item %></li>
        <% }) %>
      </ul>
    `

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText('apple')).toBeTruthy()
    expect(screen.getByText('banana')).toBeTruthy()
    expect(screen.getByText('cherry')).toBeTruthy()
  })

  it('should render conditional content', () => {
    const data = { isAdmin: true, name: 'Admin User' }
    const template = `
      <% if (data.isAdmin) { %>
        <span>Admin: <%= data.name %></span>
      <% } else { %>
        <span>User: <%= data.name %></span>
      <% } %>
    `

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText(/Admin: Admin User/)).toBeTruthy()
  })

  it('should render with false condition', () => {
    const data = { isAdmin: false, name: 'Regular User' }
    const template = `
      <% if (data.isAdmin) { %>
        <span>Admin: <%= data.name %></span>
      <% } else { %>
        <span>User: <%= data.name %></span>
      <% } %>
    `

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText(/User: Regular User/)).toBeTruthy()
  })

  it('should render numbers', () => {
    const data = { count: 42, price: 19.99 }
    const template = '<p>Count: <%= data.count %>, Price: $<%= data.price %></p>'

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText(/Count: 42/)).toBeTruthy()
    expect(screen.getByText(/Price: \$19.99/)).toBeTruthy()
  })

  it('should handle HTML elements in template', () => {
    const data = { title: 'Welcome' }
    const template = `
      <div class="container">
        <h1><%= data.title %></h1>
        <p>Some content</p>
      </div>
    `

    const { container } = render(<TemplateRenderer data={data} template={template} />)

    const h1 = container.querySelector('h1')
    expect(h1?.textContent).toBe('Welcome')
    expect(container.querySelector('.container')).toBeTruthy()
  })

  it('should handle inline styles in template', () => {
    const data = { color: 'red' }
    const template = '<span style="color: <%= data.color %>;">Styled text</span>'

    const { container } = render(<TemplateRenderer data={data} template={template} />)

    const span = container.querySelector('span')
    expect(span?.getAttribute('style')).toContain('color: red')
  })

  it('should update when data changes', () => {
    const template = '<p><%= data.value %></p>'

    const { rerender } = render(<TemplateRenderer data={{ value: 'first' }} template={template} />)
    expect(screen.getByText('first')).toBeTruthy()

    rerender(<TemplateRenderer data={{ value: 'second' }} template={template} />)
    expect(screen.getByText('second')).toBeTruthy()
  })

  it('should update when template changes', () => {
    const data = { name: 'Test' }

    const { rerender } = render(
      <TemplateRenderer data={data} template="<p>Hello <%= data.name %></p>" />,
    )
    expect(screen.getByText('Hello Test')).toBeTruthy()

    rerender(<TemplateRenderer data={data} template="<span>Hi <%= data.name %></span>" />)
    expect(screen.getByText('Hi Test')).toBeTruthy()
  })

  it('should render empty string for empty data properties', () => {
    const data = { name: '' }
    const template = '<p>Name: [<%= data.name %>]</p>'

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText('Name: []')).toBeTruthy()
  })

  it('should handle boolean values', () => {
    const data = { active: true, deleted: false }
    const template = '<p>Active: <%= data.active %>, Deleted: <%= data.deleted %></p>'

    render(<TemplateRenderer data={data} template={template} />)

    expect(screen.getByText(/Active: true/)).toBeTruthy()
    expect(screen.getByText(/Deleted: false/)).toBeTruthy()
  })

  it('should wrap rendered content in a div', () => {
    const { container } = render(
      <TemplateRenderer data={{ test: 'value' }} template="<span>Test</span>" />,
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')
  })
})
