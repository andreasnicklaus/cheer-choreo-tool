# Choreo Planer

<div align="center">
<img src="https://www.choreo-planer.de/Icon.png" width="200" height="200" alt="Choreo Planer Icon">

![License](https://img.shields.io/github/license/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Status](https://img.shields.io/badge/In_Development-ffb02e?style=for-the-badge&logo=checkmarx&logoColor=white&label=status)

![Server Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=server%2Fpackage.json&style=for-the-badge&label=Server%20Version)
![Website Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=app%2Fpackage.json&style=for-the-badge&label=Website%20Version)

![Website status](https://img.shields.io/website?url=https%3A%2F%2Fwww.choreo-planer.de&style=for-the-badge)
![Backend status](https://img.shields.io/website?url=https%3A%2F%2Fapi.choreo-planer.de&style=for-the-badge&label=Backend)

![Backend server build status](https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/server.yml?style=for-the-badge&logo=docker&logoColor=white&label=Backend%20Build%20(Server))
![Frontend build status](https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/pages.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=Frontend%20Build)

![Last commit](https://img.shields.io/github/last-commit/andreasnicklaus/cheer-choreo-tool?style=for-the-badge&label=Last%20Major%20Update)
![Top languages](https://img.shields.io/github/languages/top/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Language count](https://img.shields.io/github/languages/count/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)

</div>

## Features

- Choreography editor and visualization with mat-based positioning
- Team and routine management
- Video and PDF export with FFmpeg.wasm
- Responsive design (mobile-friendly)
- Internationalization (English & German)
- Feature flags via Unleash
- Integration with backend API
- PWA support (installable)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/)

## Quick Start

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
   The app will be available at the configured localhost port by default.

## Useful npm scripts

| Script                 | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run dev`          | Start the development server with hot reload (includes icon generation) |
| `npm run build`        | Build for production (includes docs, icons, prerendering, sitemap)      |
| `npm run preview`      | Preview the production build locally                                    |
| `npm run lint`         | Run ESLint with strict rules                                            |
| `npm run lint:fix`     | Run ESLint with auto-fix                                                |
| `npm run test`         | Run all tests (unit + E2E)                                              |
| `npm run test:unit`    | Run Vitest unit tests                                                   |
| `npm run test:e2e`     | Run Playwright E2E tests                                                |
| `npm run test:e2e:ui`  | Run Playwright with UI                                                  |
| `npm run docs`         | Generate JSDoc documentation                                            |
| `npm run docs:watch`   | Live-reload documentation server                                        |
| `npm run format`       | Format code with Prettier                                               |
| `npm run format:check` | Check code formatting                                                   |

## Project Structure

```
app/
├── public/              # Static assets (icons, docs)
├── src/
│   ├── components/      # Vue components
│   ├── docsDef.js      # Documentation definitions
│   ├── i18n/           # Translation files (en.json, de.json)
│   ├── plugins/        # Vue plugin configurations
│   ├── router/        # Vue Router configuration
│   ├── services/      # API service layer
│   ├── store/          # Vuex store
│   ├── utils/          # Utility functions
│   ├── views/          # Page components
│   ├── App.vue         # Root component
│   └── main.js         # Entry point
├── tests/
│   ├── integration/    # Playwright E2E tests
│   └── unit/           # Vitest unit tests
├── vite.config.js      # Vite configuration
└── package.json
```

## Architecture

```mermaid
graph TD
  User[User] -->|IPv4/IPv6,https| AWS[AWS EC2]
  AWS -->|IPv6,https| Router[Home Router]
  Router -->|port forwarding| ReverseProxy[Reverse Proxy]
  
  subgraph On-Premise Server
    ReverseProxy --> API[Choreo Planer API]
    ReverseProxy --> Matomo[Matomo Analytics]
    ReverseProxy --> Watchtower
    ReverseProxy --> Unleash
  end
  
  subgraph GitHub Pages
    User -->|https| Pages[GitHub Pages - Vue 3 App]
  end
  
  Pages -.->|tracking| Matomo
  API -->|nodemailer| Email[Google Mail → Brevo]
  Pages -.->|logging| BetterStack[BetterStack]
  API -.->|logging| BetterStack
  
  subgraph Docker Containers
    API -->|sequelize| DB[(Postgres Database)]
  end
```

## Testing

### Unit Tests (Vitest)
```sh
npm run test:unit
```

Coverage thresholds are set to 80% for branches, functions, lines, and statements.

### E2E Tests (Playwright)
```sh
npm run test:e2e
```

Tests are run in 7 parallel shards in CI. To run locally with UI:
```sh
npm run test:e2e:ui
```

## License

See [LICENSE](../LICENSE) for details.

## Support

For questions or support, please open an issue or contact the maintainer via the website.

---

© <span id="year"></span> Andreas Nicklaus. Licensed under the MIT License.

<script>
    document.getElementById("year").textContent = new Date().getFullYear();
</script>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
</script>
