import { Eta } from 'eta'
import * as React from 'react'

const eta = new Eta({ varName: 'data' })

function createMarkup(templateStr: string, data: unknown): { __html: string } {
  const html = eta.renderString(templateStr, data as Record<string, unknown>)
  return { __html: html }
}

interface TemplateRendererProps {
  data: unknown
  template: string
}

export const TemplateRenderer = ({ data, template }: TemplateRendererProps) => {
  // Memoize the rendered HTML to avoid re-rendering issues
  const markup = React.useMemo(() => {
    if (data === undefined || data === null) {
      return {
        __html: '<div style="padding: 1rem; text-align: center; opacity: 0.7;">Loading...</div>',
      }
    }

    return createMarkup(template, data)
  }, [data, template])

  return <div dangerouslySetInnerHTML={markup} />
}
