# 🚀 TanStack Starter

<div align="center">
  <p><strong>A modern React starter with shadcn/ui and Tailwind CSS 4</strong></p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
</div>

## ✨ Features

- **[TanStack Start](https://tanstack.com/start)** - Modern full-stack React framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible component library
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Modern utility-first CSS framework
- **[TypeScript](https://typescriptlang.org/)** - Full type safety
- **[TanStack Router](https://tanstack.com/router)** - Type-safe file-based routing

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **pnpm** (recommended package manager)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd tanstack-starter-instructa

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm biome:check  # Check code formatting and linting
pnpm biome:fix:unsafe # Fix code issues (unsafe)
```

### Project CLI (`pnpm ex0`)

This project includes a custom CLI tool for common tasks. Run it using `pnpm ex0 <command>`.

| Command    | Description                                                                | Args                 |
| :--------- | :------------------------------------------------------------------------- | :------------------- |
| `init`     | Initialize the project (dependencies, DB setup, Docker)                    |                      |
| `stop`     | Stop running Docker containers                                             |                      |
| `reload`   | Reload Docker containers with updated configuration                        |                      |
| `recreate` | Recreate Docker containers and volume (WARNING: deletes all data!)         |                      |
| `recreate` | Recreate Docker containers (use <code>--wipeVolume</code> to also delete the data volume) | `--wipeVolume` |
| `testdata` | Create or delete seed test data in the database                            | `--create`, `--delete` |
| `deploy`   | [TODO] Deploy the application                                              |                      |

### npm/pnpm Scripts

Standard project scripts are available via `pnpm <script-name>`.

| Script             | Description                                      | Underlying Command                                                                       |
| :----------------- | :----------------------------------------------- | :--------------------------------------------------------------------------------------- |
| `dev`              | Start development server                         | `vinxi dev`                                                                              |
| `build`            | Build the project                                | `vinxi build`                                                                            |
| `start`            | Start production server                          | `vinxi start`                                                                            |
| `test`             | Run tests                                        | `vitest`                                                                                 |
| `db:pull`          | Pull database schema using Drizzle Kit           | `npx drizzle-kit pull`                                                                   |
| `db:generate`      | Generate Drizzle migrations/schema changes       | `npx drizzle-kit generate`                                                               |
| `db:migrate`       | Apply Drizzle migrations                         | `npx drizzle-kit migrate`                                                                |
| `biome:fix:unsafe` | Fix code style issues (includes unsafe fixes)    | `biome check --fix --unsafe`                                                             |
| `biome:check`      | Check code style issues                          | `biome check`                                                                            |
| `auth:init`        | Generate Better Auth schema                      | `npx -y @better-auth/cli@latest generate --config src/server/auth.ts --output src/server/db/auth.schema.ts` |
| `ex0`              | Run the custom project CLI                       | `tsx cli/index.ts`                                                                       |


## 🔧 Configuration

### Adding shadcn/ui Components
```bash
# Add new components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

### Tailwind CSS
- Uses Tailwind CSS v4 with modern CSS-first configuration
- Configured in `app.config.ts`
- Global styles in `src/app/styles/`

### TypeScript
- **Path aliases**: `@` resolves to the root `./` directory
- **Route files**: Must use `.tsx` extension

## 🚀 Deployment

### Build for Production
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using modern React tools</p>
</div>


