# Choreo Planer

<div align="center">
<img src="https://www.choreo-planer.de/Icon.png" width="200" height="200" alt="Choreo Planer Icon">

<!-- Badges -->

![License](https://img.shields.io/github/license/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Status](https://img.shields.io/badge/In_Development-ffb02e?style=for-the-badge&logo=checkmarx&logoColor=white&label=status)

![Server Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=server%2Fpackage.json&style=for-the-badge&label=Server%20Version)
![Website Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=app%2Fpackage.json&style=for-the-badge&label=Website%20Version)

![Website status](https://img.shields.io/website?url=https%3A%2F%2Fwww.choreo-planer.de&style=for-the-badge)
![Backend status](https://img.shields.io/website?url=https%3A%2F%2Fapi.choreo-planer.de&style=for-the-badge&label=Backend)

![Backend server build status](<https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/docker-server-image.yml?style=for-the-badge&logo=docker&logoColor=white&label=Backend%20Build%20(Server)>)
![Frontend build status](https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/pages.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=Frontend%20Build)

![Last commit](https://img.shields.io/github/last-commit/andreasnicklaus/cheer-choreo-tool?style=for-the-badge&label=Last%20Major%20Update)
![Top languages](https://img.shields.io/github/languages/top/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Language count](https://img.shields.io/github/languages/count/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)

</div>

## Features

- Choreography editor and visualization
- Team and routine management
- Integration with backend API
- Responsive design

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/)

## Quick Start

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run serve
   ```
   The app will be available at http://localhost:8080 by default.

## Useful npm scripts

- `npm run serve` – Start the development server (with icon generation)
- `npm run build` – Build the app for production (with docs and icons)
- `npm run lint` – Lint and fix source files
- `npm run docs` – Generate JSDoc documentation
- `npm run docs:watch` – Live-reload documentation server

## Project Structure

- `src/` – Main Vue app source code
- `public/` – Static assets and icons

## Architecture

<pre class="mermaid">
graph
  User --IPv4/IPv6,https--> github

  subgraph github[Github Pages]
    subgraph vue[Vue JS UI]
      bootstrap-vue
      vue-18n
      vue-meta
      VueMatomo
    end
  end

  VueMatomo --IPv4/IPv6,https--> aws(AWS EC2 as Reverse Proxy)
  aws --IPv6,https--> Router


  BetterStack --IPv4/IPv6,https--> github


  subgraph On-Premise
    Router --> ReverseProxy
    subgraph HomeServer
      subgraph Docker
        ReverseProxy[Reverse Proxy] --> Matomo
      end
    end
  end

</pre>

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
