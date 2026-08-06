# @getdashfy/ext-json

## 0.2.0

### Minor Changes

- Require @getdashfy/ui ^0.3.1 and align @getdashfy/types dev dependency.

## 0.1.0

### Initial Release

First public release of the Dashfy JSON extension — widgets and a data client for fetching, transforming, and visualizing data from any JSON/REST API in a Dashfy dashboard.

- **JSON API client** (`createJsonClient`) with a configurable `baseUrl`, default `headers`, and request `timeout`, plus simplified JSONPath extraction.
- **Key-value widget**: `JsonKeys` for extracting and displaying specific fields (dot notation supported).
- **Custom rendering widget**: `CustomJson` with Eta templates, React render functions, data transforms, or raw JSON.
- **Status widget**: `JsonStatus` for assertion-based status indicators.
- Real-time updates via WebSocket subscriptions and full Dashfy theme (light/dark) support.
