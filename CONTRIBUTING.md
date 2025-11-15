# Contributing Guide

## Development Setup

1. Clone the repository
2. Run setup script: `./scripts/setup.sh`
3. Configure environment variables
4. Start services: `docker-compose up -d`
5. Run migrations: `cd backend && npm run migrate`

## Code Style

### Backend
- Use ESLint for linting
- Follow Node.js best practices
- Use async/await for asynchronous operations
- Handle errors appropriately

### Frontend
- Use TypeScript
- Follow React best practices
- Use functional components with hooks
- Ensure accessibility (ARIA labels, keyboard navigation)

## Testing

Run tests:
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Update documentation if needed
5. Submit pull request

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add new feature`
- `fix: Fix bug`
- `docs: Update documentation`
- `refactor: Refactor code`

