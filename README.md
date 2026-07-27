# `@getdashfy/ext-json`

![Full README Row](https://shieldcn.dev/group/npm/@getdashfy/ext-json+github/stars/dashfy/dashfy-ext-json+github/ci/dashfy/dashfy-ext-json+github/license/dashfy/dashfy-ext-json.svg?variant=branded&size=xs)

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/dashfy?referralCode=INMsTa&utm_medium=integration&utm_source=template&utm_campaign=generic)

> JSON/REST API extension for [Dashfy](https://github.com/dashfy/dashfy) - Display data from any JSON API with flexible rendering options.

This extension provides widgets to fetch, transform, and visualize JSON data from REST APIs with support for custom templates, status monitoring, and key-value displays.

## Features

- **🌐 Universal API support**: Connect to any REST API that returns JSON
- **🎨 Flexible rendering**: Templates, React components, or raw JSON display
- **🔑 Key-value display**: Extract and show specific fields from JSON responses
- **📊 Status monitoring**: Evaluate assertions and display status indicators
- **🔄 Data transformation**: Transform API responses before rendering
- **🛣️ JSONPath support**: Extract nested data using simplified JSONPath expressions
- **🔐 Authentication**: Support for custom headers (Bearer tokens, API keys, etc.)
- **⚡ Real-time updates**: Automatic data refresh via WebSocket subscriptions
- **🎨 Theme support**: Works with all Dashfy themes (light/dark mode)

## Installation

Install with your favorite package manager:

#### `npm`

```bash
npm install @getdashfy/ext-json
```

#### `pnpm`

```bash
pnpm add @getdashfy/ext-json
```

#### `yarn`

```bash
yarn add @getdashfy/ext-json
```

#### `bun`

```bash
bun add @getdashfy/ext-json
```

## Quick start

### 1. Server setup

Register the JSON API client in your Dashfy server (`dashfy.server.ts`):

```ts
import { Dashfy } from '@getdashfy/server'
import { createJsonClient } from '@getdashfy/ext-json/client'

// Create a new Dashfy server instance
const dashfy = new Dashfy()

// Load dashboard configuration
await dashfy.configureFromFile('./dashfy.config.yml')

// Register JSON API (all options are optional)
dashfy.registerApi(
  'json',
  createJsonClient({
    baseUrl: 'https://api.example.com',
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    timeout: 5000,
  }),
)

// Start server
await dashfy.start()
```

### 2. Client setup

Register JSON widgets in your React application (`App.tsx`):

```tsx
import { WidgetRegistry } from '@getdashfy/ui'
import { CustomJson, JsonKeys, JsonStatus } from '@getdashfy/ext-json'

// Register JSON extension
WidgetRegistry.addExtension('json', {
  CustomJson,
  JsonKeys,
  JsonStatus,
})
```

### 3. Dashboard configuration

Add JSON widgets to your dashboard configuration (`dashfy.config.yml`):

```yaml
dashboards:
  - title: API Dashboard
    columns: 3
    rows: 2
    widgets:
      - extension: json
        widget: JsonKeys
        title: User Profile
        url: https://api.example.com/user
        keys:
          - name
          - email
          - location
        x: 0
        y: 0
        columns: 1
        rows: 1

      - extension: json
        widget: JsonStatus
        title: API Health
        url: https://api.example.com/health
        statuses:
          - assert: equals(status, ok)
            status: success
            label: API Online
          - assert: equals(status, degraded)
            status: warning
            label: API Degraded
        x: 1
        y: 0
        columns: 1
        rows: 1
```

## JSON client configuration

#### Configuration options

```ts
createJsonClient({
  // Base URL prepended to all requests (optional)
  baseUrl: 'https://api.example.com',

  // Default headers included in all requests (optional)
  headers: {
    Authorization: 'Bearer your-token',
    'Content-Type': 'application/json',
  },

  // Request timeout in milliseconds (default: 10000)
  timeout: 5000,
})
```

#### Environment variables

Use environment variables for sensitive configuration:

```bash
# .env
API_BASE_URL=https://api.example.com
API_TOKEN=your-secret-token
```

```ts
createJsonClient({
  baseUrl: process.env.API_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  },
})
```

## API endpoints

`createJsonClient` registers a single endpoint. Widgets subscribe to it through the `endpoint` parameter (default `get`), and you can call it from your own custom widgets.

| Endpoint | Parameters                                 | Returns                    |
| -------- | ------------------------------------------ | -------------------------- |
| `get`    | `url`, `headers`, `method`, `body`, `path` | `{ data, url, timestamp }` |

The `method` and `body` parameters are accepted by the client but not surfaced by any built-in widget, so they are available for custom widgets (e.g. `POST` requests). When `path` is provided, the response is narrowed with a simplified JSONPath expression (see [JSONPath support](#jsonpath-support)).

## Available widgets

### `JsonKeys`

Display specific key-value pairs extracted from a JSON response. Supports nested property access using dot notation.

**Parameters:**

| Parameter  | Type                  | Required | Default     | Description                                      |
| ---------- | --------------------- | -------- | ----------- | ------------------------------------------------ |
| `url`      | string                | yes      | -           | URL to fetch the JSON data                       |
| `keys`     | string[]              | yes      | -           | Array of keys to extract (supports dot notation) |
| `title`    | string                | no       | "JSON Keys" | Custom widget title                              |
| `subject`  | string                | no       | -           | Custom widget subject                            |
| `headers`  | Record<string,string> | no       | -           | HTTP headers to send with the request            |
| `path`     | string                | no       | -           | JSONPath expression to extract specific data     |
| `api`      | string                | no       | "json"      | API subscription ID                              |
| `endpoint` | string                | no       | "get"       | API endpoint to call                             |

**Example:**

```yaml
- extension: json
  widget: JsonKeys
  title: User Profile
  url: https://api.example.com/user/123
  headers:
    Authorization: Bearer token
  keys:
    - name
    - email
    - profile.age
    - stats.posts
  columns: 1
  rows: 1
```

Use dot notation to access nested properties: `user.name` reads `data.user.name`, `stats.followers` reads `data.stats.followers`.

### `CustomJson`

Display JSON data with flexible rendering options: Eta templates, React components, or raw JSON.

**Parameters:**

| Parameter   | Type                  | Required | Default     | Description                                  |
| ----------- | --------------------- | -------- | ----------- | -------------------------------------------- |
| `url`       | string                | yes      | -           | URL to fetch the JSON data                   |
| `title`     | string                | no       | "JSON Data" | Custom widget title                          |
| `subject`   | string                | no       | -           | Custom widget subject                        |
| `headers`   | Record<string,string> | no       | -           | HTTP headers to send with the request        |
| `path`      | string                | no       | -           | JSONPath expression to extract specific data |
| `template`  | string                | no       | -           | Eta template string for HTML rendering       |
| `render`    | function \| string    | no       | -           | Custom React render function                 |
| `transform` | function \| string    | no       | -           | Transform function to process data           |
| `showRaw`   | boolean               | no       | true        | Show raw JSON if no render/template provided |
| `api`       | string                | no       | "json"      | API subscription ID                          |
| `endpoint`  | string                | no       | "get"       | API endpoint to call                         |

**Example (template):**

```yaml
- extension: json
  widget: CustomJson
  title: Weather
  url: https://api.example.com/weather
  template: |
    <div>
      <h2><%= data.city %></h2>
      <p>Temperature: <%= data.temp %>°C</p>
      <p>Condition: <%= data.condition %></p>
    </div>
  columns: 2
  rows: 1
```

**Example (React render function):**

```tsx
<CustomJson
  title="Repository Stats"
  url="https://api.github.com/repos/facebook/react"
  transform={(data) => ({
    name: data.name,
    stars: data.stargazers_count,
    forks: data.forks_count,
  })}
  render={(data) => (
    <div>
      <h2>{data.name}</h2>
      <p>⭐ {data.stars} stars</p>
      <p>🍴 {data.forks} forks</p>
    </div>
  )}
/>
```

**Example (raw JSON):**

```yaml
- extension: json
  widget: CustomJson
  title: API Response
  url: https://api.example.com/data
  showRaw: true
  columns: 2
  rows: 1
```

> Note: string-based `render` functions (from YAML/JSON config) do not support JSX. Use `template` for HTML rendering, or pass an actual function in code for JSX.

#### Template syntax

Templates use the [Eta](https://eta.js.org/) template engine:

```html
<!-- Output value -->
<%= data.field %>

<!-- Conditional -->
<% if (data.count > 5) { %> Many items <% } else { %> Few items <% } %>

<!-- Loop -->
<ul>
  <% data.items.forEach(item => { %>
  <li><%= item.name %></li>
  <% }) %>
</ul>

<!-- Expressions -->
<p>Total: <%= data.price * data.quantity %></p>
```

### `JsonStatus`

Display status indicators based on assertions evaluated against JSON data.

**Parameters:**

| Parameter  | Type                  | Required | Default       | Description                                  |
| ---------- | --------------------- | -------- | ------------- | -------------------------------------------- |
| `url`      | string                | yes      | -             | URL to fetch the JSON data                   |
| `statuses` | StatusAssertion[]     | yes      | -             | Array of status assertions to evaluate       |
| `title`    | string                | no       | "JSON Status" | Custom widget title                          |
| `subject`  | string                | no       | -             | Custom widget subject                        |
| `headers`  | Record<string,string> | no       | -             | HTTP headers to send with the request        |
| `path`     | string                | no       | -             | JSONPath expression to extract specific data |
| `api`      | string                | no       | "json"        | API subscription ID                          |
| `endpoint` | string                | no       | "get"         | API endpoint to call                         |

**StatusAssertion:**

| Field    | Type                                           | Required | Description                              |
| -------- | ---------------------------------------------- | -------- | ---------------------------------------- |
| `assert` | string                                         | yes      | Assertion expression (see formats below) |
| `status` | "success" \| "warning" \| "error" \| "unknown" | yes      | Status to display if assertion passes    |
| `label`  | string                                         | no       | Optional label to display with status    |

**Example:**

```yaml
- extension: json
  widget: JsonStatus
  title: API Health
  url: https://api.example.com/health
  statuses:
    - assert: equals(status, ok)
      status: success
      label: API Online
    - assert: equals(status, degraded)
      status: warning
      label: API Degraded
    - assert: equals(status, down)
      status: error
      label: API Down
  columns: 1
  rows: 1
```

#### Assertion formats

| Format                     | Description                               |
| -------------------------- | ----------------------------------------- |
| `equals(key, value)`       | The value strictly equals the expectation |
| `contains(key, substring)` | The value contains the substring          |
| `matches(key, pattern)`    | The value matches a regular expression    |
| `truthy(key)`              | The value is truthy                       |
| `falsy(key)`               | The value is falsy                        |

Assertions are evaluated in order, and **the last matching assertion wins**. Put a broad default first and more specific conditions after it:

```yaml
statuses:
  # Default status
  - assert: truthy(status)
    status: unknown
    label: Unknown Status

  # Specific conditions (evaluated last, take precedence)
  - assert: equals(status, operational)
    status: success
    label: All Systems Operational
  - assert: equals(status, outage)
    status: error
    label: Service Outage
```

## Complete example

```yaml
# dashfy.config.yml
dashboards:
  - title: API Monitoring
    columns: 3
    rows: 1
    widgets:
      # API status
      - extension: json
        widget: JsonStatus
        title: API Health
        url: https://api.example.com/health
        statuses:
          - assert: equals(status, ok)
            status: success
            label: Operational
          - assert: equals(status, degraded)
            status: warning
            label: Degraded
        x: 0
        y: 0
        columns: 1
        rows: 1

      # Key metrics
      - extension: json
        widget: JsonKeys
        title: Metrics
        url: https://api.example.com/metrics
        keys:
          - requests.total
          - requests.success
          - latency.avg
          - uptime
        x: 1
        y: 0
        columns: 1
        rows: 1

      # Custom display
      - extension: json
        widget: CustomJson
        title: System Info
        url: https://api.example.com/system
        template: |
          <div>
            <h3><%= data.name %></h3>
            <p>Version: <%= data.version %></p>
            <p>Uptime: <%= data.uptime %> days</p>
          </div>
        x: 2
        y: 0
        columns: 1
        rows: 1
```

## JSONPath support

The `path` parameter narrows the response before it reaches a widget. This extension implements a **simplified subset** of JSONPath, not the full specification:

| Syntax        | Description                        |
| ------------- | ---------------------------------- |
| `$`           | The entire response (root)         |
| `$.user.name` | Dot notation for nested properties |
| `user.name`   | Leading `$.` is optional           |
| `$.items[0]`  | A specific array element by index  |
| `$.items[*]`  | The entire array                   |

```yaml
- extension: json
  widget: JsonKeys
  url: https://api.example.com/data
  path: $.users[0] # Extract the first user, then read its keys
  keys:
    - name
    - email
```

## Authentication

Pass credentials through request headers, either per widget or as client defaults:

```yaml
# Bearer token
headers:
  Authorization: Bearer your-token

# API key
headers:
  X-API-Key: your-api-key

# Basic auth (base64 encoded)
headers:
  Authorization: Basic dXNlcjpwYXNz
```

## Troubleshooting

### CORS errors

If you encounter CORS errors, ensure the API server includes appropriate CORS headers, or configure a proxy in your Dashfy server:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Authentication errors

**Solution:** Verify that your API token/key is valid and has the necessary permissions.

### JSONPath not working

**Solution:** Confirm your expression uses the supported simplified syntax above. Full JSONPath features (filters, recursive descent, unions) are not implemented.

### Template rendering errors

**Solution:** Check your Eta template syntax and ensure all referenced variables exist on the `data` object.

## Contributing

Contributions are welcome. For issues and pull requests related to the extension, use the [dashfy/dashfy-ext-json](https://github.com/dashfy/dashfy-ext-json) repository. Framework contributions belong in [dashfy/dashfy](https://github.com/dashfy/dashfy).

## Community

Join the community on [Dashfy's Discord server](https://dashfy.dev/discord) to discuss the project, ask questions, or get help.

Join the conversation on X (Twitter) and follow [@dashfydev](https://x.com/dashfydev) for updates and announcements.

## Related packages

- [`@getdashfy/server`](https://www.npmjs.com/package/@getdashfy/server) - Dashfy server
- [`@getdashfy/ui`](https://www.npmjs.com/package/@getdashfy/ui) - Dashfy UI components
- [`@getdashfy/types`](https://www.npmjs.com/package/@getdashfy/types) - Dashfy TypeScript types
- [`@getdashfy/ext-github`](https://www.npmjs.com/package/@getdashfy/ext-github) - GitHub extension
- [`@getdashfy/ext-nba`](https://www.npmjs.com/package/@getdashfy/ext-nba) - NBA extension

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](./LICENSE) file for details.
