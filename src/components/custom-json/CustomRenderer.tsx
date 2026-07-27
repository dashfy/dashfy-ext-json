import * as React from 'react'

interface CustomRendererProps<T> {
  data: T
  render: (data: T) => React.ReactNode
}

// eslint-disable-next-line react/function-component-definition
export function CustomRenderer<T>({ data, render }: CustomRendererProps<T>) {
  return <div>{render(data)}</div>
}
