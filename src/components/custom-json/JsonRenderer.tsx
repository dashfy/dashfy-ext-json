interface JsonRendererProps {
  data: unknown
}

export const JsonRenderer = ({ data }: JsonRendererProps) => {
  return (
    <pre className="bg-muted rounded p-3 font-mono text-xs">{JSON.stringify(data, null, 2)}</pre>
  )
}
