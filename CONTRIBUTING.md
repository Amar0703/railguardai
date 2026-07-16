# Contributing to RailGuard AI 🚆🛡️

Thank you for considering contributing to RailGuard AI! Every contribution — whether it's a bug report, feature request, or pull request — helps improve railway safety monitoring.

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (bundled with Node.js) or **Bun**
- A [Supabase](https://supabase.com) account (free tier works)

### Local Setup

1. **Fork & clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/railguardai.git
   cd railguardai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials (see `.env.example` for details).

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes and test locally.
3. Run the linter before committing:
   ```bash
   npm run lint
   ```
4. Commit with a clear, descriptive message (see [Commit Convention](#commit-convention)).
5. Push your branch and open a Pull Request against `main`.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix     | Use for                           |
|------------|-----------------------------------|
| `feat:`    | New features                      |
| `fix:`     | Bug fixes                         |
| `docs:`    | Documentation changes             |
| `style:`   | Formatting (no logic changes)     |
| `refactor:`| Code restructuring                |
| `test:`    | Adding or updating tests          |
| `chore:`   | Tooling, CI, dependencies, etc.   |

**Example:** `feat: add real-time defect severity filter to dashboard`

## Project Structure

```
src/
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── integrations/  # Third-party integrations (Supabase, etc.)
├── lib/           # Utility functions
├── routes/        # TanStack Router file-based routes
│   ├── _authenticated/   # Auth-protected pages
│   └── index.tsx         # Landing page
└── styles.css     # Global styles
```

## Reporting Issues

- Use [GitHub Issues](https://github.com/Amar0703/railguardai/issues) to report bugs or request features.
- Include steps to reproduce, expected behavior, and screenshots when possible.

## Code of Conduct

Be respectful, inclusive, and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
