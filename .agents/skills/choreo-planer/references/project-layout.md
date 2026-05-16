# Project Layout

Overview of the Cheer Choreo Tool project structure. This reflects the actual directory layout.

## Root Structure

```text
cheer-choreo-tool/
├── app/                    # Vue 3 frontend application
├── server/                 # Node Express backend
├── .agents/               # Agent skills and configuration
├── docker-compose.yml      # Docker services configuration
└── package.json            # Root workspace configuration
```

## Frontend (app/)

```text
app/
├── src/
│   ├── App.vue            # Root component
│   ├── main.js            # Application entry point
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables (reusable logic)
│   ├── plugins/          # Vue plugins
│   ├── router/           # Vue Router configuration
│   ├── store/            # Pinia stores
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── views/            # Page components
│   ├── i18n/             # Internationalization
│   └── docsDef.js        # Documentation definitions
├── public/                # Static public assets
├── tests/                 # Test files (vitest + playwright)
├── scripts/               # Build/dev scripts
├── coverage/              # Test coverage reports
├── playwright-report/     # Playwright test reports
├── test-results/         # Test results
├── package.json
├── vite.config.js         # Vite configuration
├── babel.config.js        # Babel configuration
├── jsconfig.json          # JavaScript project config
├── tsconfig.json          # TypeScript config (minimal)
└── playwright.config.js   # Playwright configuration
```

## Backend (server/)

```text
server/
├── src/
│   ├── index.ts           # Server entry point
│   ├── docDefs.ts         # Documentation definitions
│   ├── config/            # Configuration files
│   ├── middlewares/      # Express middleware
│   ├── plugins/          # Server plugins
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── views/            # View templates
│   ├── db/              # Database (migrations, seeders, config)
│   └── i18n/            # Internationalization
├── tests/                # Test files (jest + ts-jest)
├── coverage/             # Test coverage reports
├── logs/                 # Server logs
├── package.json
├── tsconfig.json          # TypeScript configuration
├── jest.config.ts        # Jest configuration
└── Dockerfile            # Docker image for server
```

## Agent Skills (.agents/)

```text
.agents/
└── skills/
    └── choreo-planer/
        ├── SKILL.md          # Main skill (decision tree)
        └── references/       # Sub-skills and reference documents
            ├── commands.md
            ├── project-layout.md
            ├── vue-best-practices/
            ├── express-rest-api/
            ├── sequelize/
            └── ...
```

## Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Defines all services (app, server, database) |
| `app/package.json` | Frontend dependencies and scripts |
| `server/package.json` | Backend dependencies and scripts |
| `.agents/skills/choreo-planer/SKILL.md` | Agent skill for this project |
