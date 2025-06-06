<h1>Choreo Planer API</h1>

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

---

## Features

- User authentication & management
- Routine and element management
- Team collaboration tools
- RESTful API endpoints
- Dockerized deployment

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/)

This documentation only provides quick start instructions for docker because the server is designed to run in a docker container.

### Setup the environment variables

1. Rename each `.env.template` file to `.env`
   1. `.env.template` -> `.env`
   2. `.server.env.template` -> `.server.env`
2. Fill in the required environment variables in each `.env` file. The `.env` files are located in the following directories:

### Running the Server in production mode

```bash
docker-compose up
```

This command will start the server in production mode. The server will be available at `http://localhost:3000` by default.

### Running the Server in development mode

```bash
docker-compose -f docker-compose.yml -f dev.docker-compose.yml up
```

This command will start docker compose with the development configuration which extends the production configuration for hot reloading.

## Architecture

<pre class="mermaid">

graph
  User --IPv4/IPv6--> aws(AWS EC2 as Reverse Proxy)
  aws --IPv6--> Router

  BetterStack --IPv4/Ipv6--> aws

  subgraph On-Premise
    Router --> ReverseProxy
    subgraph HomeServer
      subgraph Docker
        ReverseProxy[Reverse Proxy] --> api
        sequelize --> db[(Postgres Database)]
        subgraph api[Choreo Planer API]
          sequelize
          i18n
          winston
          nodemailer
        end
      end
    end
  end

  nodemailer --> GoogleMail(Google Mail)
  mailProxy(DNS-provided E-Mail Proxy) --> GoogleMail
  GoogleMail --> Brevo(Brevo)

</pre>

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
