export type AssertionType = 'equals' | 'contains' | 'matches' | 'truthy' | 'falsy'

export interface JsonResponse {
  data: unknown
  url: string
  timestamp: string
}

export interface ParsedAssertion {
  type: AssertionType
  key: string
  expectation: string
}
