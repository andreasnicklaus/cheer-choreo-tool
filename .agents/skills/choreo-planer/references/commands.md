# Essential Commands

Commands for running, testing, and developing the Cheer Choreo Tool project.

## Testing

### Frontend (app/)

```bash
# From app/ directory
npm run test:unit        # Run unit tests (vitest)
npm run test:e2e         # Run E2E tests (playwright)
npm run test             # Run all tests
```

### Server (server/)

```bash
# From server/ directory
npm run test:prep        # Lint and type check
npm run test:unit        # Run unit tests (jest)
npm run test             # Run all tests (prep then unit)
```

## Development

### Frontend (app/)

```bash
# From app/ directory
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
npm run lint:fix         # Lint and auto-fix issues
```

### Server (server/)

```bash
# From server/ directory
npm run dev              # Start Express dev server
npm run lint             # Lint code (eslint)
npm run lint:fix         # Lint and auto-fix issues
```

## Docker

```bash
# From root directory (where docker-compose.yml is)
docker compose up        # Start all services (app, server, database)
docker compose down      # Stop all services
docker compose build     # Build Docker images
docker compose logs      # View logs (add -f to follow)
docker compose exec server npm run dev  # Run server command in container
```

## Package Management

### Frontend (app/)

```bash
# From app/ directory
npm install              # Install dependencies
npm run audit           # Run security audit
npm run audit:fix       # Auto-fix security vulnerabilities
```

### Server (server/)

```bash
# From server/ directory
npm install              # Install dependencies
npm run audit           # Run security audit
npm run audit:fix       # Auto-fix security vulnerabilities
```

## Database

```bash
# From server/ directory
npm run db:migrate       # Run database migrations
npm run db:seed         # Seed database with initial data
npm run db:reset        # Reset database (drop, recreate, seed)
npm run db:rollback      # Rollback last migration
```
