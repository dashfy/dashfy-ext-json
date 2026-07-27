# Dashfy JSON Extension

[![npm version](https://img.shields.io/npm/v/@dashfy/ext-json.svg?style=flat-square)](https://www.npmjs.com/package/@dashfy/ext-json)
[![License](https://img.shields.io/github/license/dashfy/dashfy.svg?style=flat-square)](https://github.com/dashfy/dashfy/blob/main/LICENSE)

> JSON/REST API extension for [Dashfy](https://github.com/dashfy/dashfy) - Display data from any JSON API with flexible rendering options.

This extension provides widgets to fetch, transform, and visualize JSON data from REST APIs with support for custom templates, status monitoring, and key-value displays.

## Features

- **🌐 Universal API support**: Connect to any REST API that returns JSON
- **🎨 Flexible rendering**: Templates, React components, or raw JSON display
- **🔑 Key-value display**: Extract and show specific fields from JSON responses
- **📊 Status monitoring**: Evaluate assertions and display status indicators
- **🔄 Data transformation**: Transform API responses before rendering
- **🛣️ JSONPath support**: Extract nested data using JSONPath expressions
- **🔐 Authentication**: Support for custom headers (Bearer tokens, API keys, etc.)
- **⚡ Real-time updates**: Automatic data refresh via WebSocket subscriptions
- **🎨 Theme support**: Works with all Dashfy themes (light/dark mode)

## Installation

```bash
npm install @dashfy/ext-json
# or
pnpm add @dashfy/ext-json
# or
yarn add @dashfy/ext-json
```

## Quick Start

### 1. Server Setup

Register the JSON API client in your Dashfy server:

```ts
import { Dashfy } from '@dashfy/server'
import { createJsonClient } from '@dashfy/ext-json'

const dashfy = new Dashfy()

// Basic registration
dashfy.registerApi('json', createJsonClient())

// With configuration (optional)
dashfy.registerApi(
  'json',
  createJsonClient({
    baseUrl: 'https://api.example.com',
    headers: { Authorization: 'Bearer token' },
    timeout: 5000,
  }),
)

await dashfy.start()
```

### 2. Client Setup

Register JSON widgets in your React application:

```tsx
import { WidgetRegistry } from '@dashfy/ui'
import { CustomJson, JsonKeys, JsonStatus } from '@dashfy/ext-json'

// Register all JSON widgets
WidgetRegistry.addExtension('json', {
  CustomJson,
  JsonKeys,
  JsonStatus,
})
```

### 3. Dashboard Configuration

Add JSON widgets to your dashboard configuration:

```yaml
# dashfy.config.yml
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

## JSON Client Configuration

### Configuration Options

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

### Environment Variables

You can use environment variables for sensitive configuration:

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

## Available Widgets

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

**Nested Properties:**

Use dot notation to access nested properties:

```yaml
keys:
  - user.name # Accesses data.user.name
  - address.city # Accesses data.address.city
  - stats.followers # Accesses data.stats.followers
```

---

### `CustomJson`

Display JSON data with flexible rendering options: templates, React components, or raw JSON.

**Parameters:**

| Parameter   | Type                  | Required | Default     | Description                                  |
| ----------- | --------------------- | -------- | ----------- | -------------------------------------------- |
| `url`       | string                | yes      | -           | URL to fetch the JSON data                   |
| `title`     | string                | no       | "JSON Data" | Custom widget title                          |
| `subject`   | string                | no       | -           | Custom widget subject                        |
| `headers`   | Record<string,string> | no       | -           | HTTP headers to send with the request        |
| `path`      | string                | no       | -           | JSONPath expression to extract specific data |
| `template`  | string                | no       | -           | Template string for HTML rendering           |
| `render`    | function \| string    | no       | -           | Custom React render function                 |
| `transform` | function \| string    | no       | -           | Transform function to process data           |
| `showRaw`   | boolean               | no       | true        | Show raw JSON if no render/template provided |
| `api`       | string                | no       | "json"      | API subscription ID                          |
| `endpoint`  | string                | no       | "get"       | API endpoint to call                         |

**Example (Template):**

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

**Example (TypeScript with React):**

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

**Example (Raw JSON):**

```yaml
- extension: json
  widget: CustomJson
  title: API Response
  url: https://api.example.com/data
  showRaw: true
  columns: 2
  rows: 1
```

**Template Syntax:**

Templates use [Eta](https://eta.js.org/) template engine syntax:

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

---

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

**Assertion Formats:**

#### `equals(key, value)`

Checks that the value strictly equals the expectation.

```yaml
statuses:
  - assert: equals(status, ok)
    status: success
    label: System OK
```

#### `contains(key, substring)`

Checks that the value contains the substring.

```yaml
statuses:
  - assert: contains(message, success)
    status: success
    label: Operation Successful
```

#### `matches(key, pattern)`

Checks that the value matches a regular expression.

```yaml
statuses:
  - assert: matches(version, ^v\d+\.\d+\.\d+$)
    status: success
    label: Valid Version
```

#### `truthy(key)`

Checks that the value is truthy.

```yaml
statuses:
  - assert: truthy(isActive)
    status: success
    label: Service Active
```

#### `falsy(key)`

Checks that the value is falsy.

```yaml
statuses:
  - assert: falsy(hasErrors)
    status: success
    label: No Errors
```

**Multiple Assertions:**

Assertions are evaluated in order. The last matching assertion determines the final status:

```yaml
statuses:
  # Default status
  - assert: truthy(status)
    status: unknown
    label: Unknown Status

  # Specific conditions (evaluated last, takes precedence)
  - assert: equals(status, operational)
    status: success
    label: All Systems Operational

  - assert: equals(status, maintenance)
    status: warning
    label: Under Maintenance

  - assert: equals(status, outage)
    status: error
    label: Service Outage
```

## Complete Examples

### Example 1: API Monitoring Dashboard

```yaml
# dashfy.config.yml
dashboards:
  - title: API Monitoring
    columns: 3
    rows: 2
    widgets:
      # API Status
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

      # Key Metrics
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

      # Custom Display
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

### Example 2: User Dashboard

```yaml
dashboards:
  - title: User Dashboard
    columns: 2
    rows: 2
    widgets:
      # User Profile
      - extension: json
        widget: JsonKeys
        title: Profile
        url: https://api.example.com/user/me
        headers:
          Authorization: Bearer ${API_TOKEN}
        keys:
          - name
          - email
          - role
          - lastLogin
        x: 0
        y: 0
        columns: 1
        rows: 1

      # Account Status
      - extension: json
        widget: JsonStatus
        title: Account Status
        url: https://api.example.com/user/me/status
        headers:
          Authorization: Bearer ${API_TOKEN}
        statuses:
          - assert: equals(accountStatus, active)
            status: success
            label: Active
          - assert: equals(accountStatus, suspended)
            status: error
            label: Suspended
        x: 1
        y: 0
        columns: 1
        rows: 1
```

### Example 3: TypeScript Configuration

```ts
import type { DashfyConfig } from '@dashfy/types'

const config: DashfyConfig = {
  dashboards: [
    {
      title: 'API Dashboard',
      columns: 3,
      rows: 1,
      widgets: [
        {
          extension: 'json',
          widget: 'JsonKeys',
          title: 'API Info',
          url: 'https://api.example.com/info',
          keys: ['version', 'status', 'uptime'],
          x: 0,
          y: 0,
          columns: 1,
          rows: 1,
        },
        {
          extension: 'json',
          widget: 'JsonStatus',
          title: 'Health Check',
          url: 'https://api.example.com/health',
          statuses: [
            {
              assert: 'equals(status, ok)',
              status: 'success',
              label: 'Healthy',
            },
          ],
          x: 1,
          y: 0,
          columns: 1,
          rows: 1,
        },
        {
          extension: 'json',
          widget: 'CustomJson',
          title: 'Raw Data',
          url: 'https://api.example.com/data',
          showRaw: true,
          x: 2,
          y: 0,
          columns: 1,
          rows: 1,
        },
      ],
    },
  ],
}

export default config
```

## Advanced Features

### JSONPath Support

Extract nested data using JSONPath expressions:

```yaml
- extension: json
  widget: JsonKeys
  url: https://api.example.com/data
  path: $.users[0] # Extract first user
  keys:
    - name
    - email
```

### Authentication

Support for various authentication methods:

```yaml
# Bearer Token
headers:
  Authorization: Bearer your-token

# API Key
headers:
  X-API-Key: your-api-key

# Basic Auth (base64 encoded)
headers:
  Authorization: Basic dXNlcjpwYXNz

# Custom Headers
headers:
  X-Custom-Header: value
  X-Request-ID: 12345
```

### Data Transformation

Transform API responses before rendering:

```tsx
<CustomJson
  url="https://api.github.com/repos/facebook/react"
  transform={(data) => ({
    repository: data.name,
    stars: data.stargazers_count,
    language: data.language,
    updated: new Date(data.updated_at).toLocaleDateString(),
  })}
  render={(data) => (
    <div>
      <h2>{data.repository}</h2>
      <p>⭐ {data.stars} stars</p>
      <p>Language: {data.language}</p>
      <p>Updated: {data.updated}</p>
    </div>
  )}
/>
```

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the API server includes appropriate CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Alternatively, configure a proxy in your Dashfy server.

### Authentication Errors

**Solution:** Verify that your API token/key is valid and has the necessary permissions.

### JSONPath Not Working

**Solution:** Ensure your JSONPath expression is valid. Test it using online JSONPath evaluators.

### Template Rendering Errors

**Solution:** Check your template syntax. Ensure all variables exist in the data object.

## Contributing

Contributions are welcome! Please refer to the main [Dashfy contributing guide](https://github.com/dashfy/dashfy/blob/main/CONTRIBUTING.md).

## Related Packages

- [`@dashfy/server`](https://www.npmjs.com/package/@dashfy/server) - Dashfy server
- [`@dashfy/ui`](https://www.npmjs.com/package/@dashfy/ui) - Dashfy UI components
- [`@dashfy/types`](https://www.npmjs.com/package/@dashfy/types) - Dashfy TypeScript types
- [`@dashfy/ext-github`](https://www.npmjs.com/package/@dashfy/ext-github) - GitHub extension

## License

MIT © [Breno Polanski](https://github.com/brenopolanski)

---

Part of the [Dashfy](https://github.com/dashfy/dashfy) project.
