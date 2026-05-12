<h1>Choreo Planer API</h1>

<div align="center">
<img src="https://www.choreo-planer.de/Icon.png" width="200" height="200" alt="Choreo Planer Icon">

![License](https://img.shields.io/github/license/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Status](https://img.shields.io/badge/In_Development-ffb02e?style=for-the-badge&logo=checkmarx&logoColor=white&label=status)

![Server Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=server%2Fpackage.json&style=for-the-badge&label=Server%20Version)
![Website Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=app%2Fpackage.json&style=for-the-badge&label=Website%20Version)

![Website status](https://img.shields.io/website?url=https%3A%2F%2Fwww.choreo-planer.de&style=for-the-badge)
![Backend status](https://img.shields.io/website?url=https%3A%2F%2Fapi.choreo-planer.de&style=for-the-badge&label=Backend)

![Backend server build status](https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/server.yml?style=for-the-badge&logo=docker&logoColor=white&label=Backend%20Build)
![Frontend build status](https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/pages.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=Frontend%20Build)

![Last commit](https://img.shields.io/github/last-commit/andreasnicklaus/cheer-choreo-tool?style=for-the-badge&label=Last%20Major%20Update)
![Top languages](https://img.shields.io/github/languages/top/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Language count](https://img.shields.io/github/languages/count/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)

</div>

---

## Features

- User authentication & JWT management
- Soft-delete user accounts with recovery
- Routine and element management (choreos, hits, lineups, positions)
- Team collaboration tools
- Club and season management
- Notification system
- Feedback collection
- Contact form with email notifications
- RESTful API with OpenAPI/Swagger documentation
- Dockerized deployment with automatic updates via Watchtower

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

This documentation provides quick start instructions for Docker because the server is designed to run in a Docker container.

### Environment Setup

1. Rename each `.env.template` file to `.env`:
   - `.env.template` → `.env`
   - `.server.env.template` → `.server.env`
2. Fill in the required environment variables in each `.env` file. The `.env` files are located in the following directories:
   - Root directory: `.env` (database config)
   - Root directory: `.server.env` (server config)
   - Optional: `.backup.env` (backup config)

### Running the Server

#### Production

```bash
docker-compose up -d
```

The server will be available at the configured port by default.

#### Development

```bash
docker-compose -f docker-compose.yml -f dev.docker-compose.yml up -d
```

This starts Docker Compose with the development configuration which enables hot reloading.

### Useful npm scripts

| Script              | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Start with nodemon for hot reload (TypeScript via tsx) |
| `npm run start`     | Start the production build                             |
| `npm run build`     | Compile TypeScript and build                           |
| `npm run test`      | Run all tests (lint + unit)                            |
| `npm run test:unit` | Run Jest unit tests                                    |
| `npm run lint`      | Run ESLint                                             |
| `npm run docs`      | Generate JSDoc documentation                           |
| `npm run format`    | Format code with Prettier                              |

## Project Structure

```
server/
├── src/
│   ├── db/
│   │   ├── models/        # Sequelize models
│   │   ├── db.ts          # Database connection
│   │   ├── index.ts      # Model associations
│   │   └── seed.ts       # Database seeding
│   ├── middlewares/      # Express middleware
│   │   ├── errorHandlingMiddleware.ts
│   │   ├── loggingMiddleware.ts
│   │   ├── rateLimitMiddleware.ts
│   │   └── requestQueue.ts
│   ├── plugins/          # Plugin configurations
│   │   ├── i18n.ts       # Internationalization
│   │   ├── nodemailer.ts # Email setup
│   │   └── winston.ts    # Logging setup
│   ├── routes/           # API route handlers
│   │   ├── admin/        # Admin endpoints
│   │   └── *.ts          # REST endpoints
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── views/            # EJS templates
│   │   ├── admin/        # Admin dashboard
│   │   └── mail/         # Email templates
│   └── index.ts          # Entry point
├── tests/
│   └── unit/             # Jest unit tests
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Architecture

```mermaid
graph
  User --IPv4/IPv6,https--> aws(AWS EC2 as Reverse Proxy)
  aws --IPv6,https--> Router

  BetterStack --IPv4/Ipv6,https--> aws

  subgraph On-Premise
    Router --> ReverseProxy
    subgraph HomeServer
      subgraph Docker
        ReverseProxy[Reverse Proxy] --> api
        sequelize --> db[(Postgres Database)]
        Unleash
        subgraph api[Choreo Planer API]
          sequelize
          i18n
          winston
          nodemailer
        end
      end
    end
  end

  nodemailer --https--> GoogleMail(Google Mail)
  mailProxy(DNS-provided E-Mail Proxy) --> GoogleMail
  GoogleMail --> Brevo(Brevo)

  githubactions --docker push--> dockerhub([Docker Hub])
  githubactions --trigger watchtower--> Watchtower[Watchtower]
  Watchtower --pull new image--> dockerhub
```

## API Documentation

Once the server is running:

- Swagger UI: `/api-docs`
- JSDoc: `/docs`
- Status: `/status`

## Testing

```bash
npm run test
```

This runs ESLint first, then executes Jest unit tests.

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
