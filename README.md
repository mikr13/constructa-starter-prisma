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

## 📁 Project Structure

```
src/
├── app/
│   ├── routes/           # File-based routing
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page
│   │   └── api/         # API routes
│   └── styles/          # Global styles
├── components/
│   └── ui/              # shadcn/ui components
└── utils/               # Utility functions
```

## 🎯 Core Technologies

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **TanStack Start** | Full-stack framework | [Docs](https://tanstack.com/start) |
| **shadcn/ui** | Component library | [Docs](https://ui.shadcn.com/) |
| **Tailwind CSS v4** | Styling framework | [Docs](https://tailwindcss.com/) |
| **TypeScript** | Type safety | [Docs](https://typescriptlang.org/) |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/constructa"

# Client-side Base URL (optional - defaults to current origin in production)
VITE_BASE_URL="http://localhost:3000"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email Verification (disabled by default)
# Set to 'true' to enable email verification
# Both variables must be set to the same value
ENABLE_EMAIL_VERIFICATION="false"
VITE_ENABLE_EMAIL_VERIFICATION="false"

# Email Service Configuration (required if email verification is enabled)
# Configure your email service here (Resend, SendGrid, etc.)
# EMAIL_FROM="noreply@yourdomain.com"
# RESEND_API_KEY="your-resend-api-key"

# OAuth Providers (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

- `VITE_BASE_URL` is optional - in production, it will automatically use the current domain
- For local development, it defaults to `http://localhost:3000`

### Email Verification

Email verification is **disabled by default** for easier development. To enable it:

1. Set both `ENABLE_EMAIL_VERIFICATION="true"` and `VITE_ENABLE_EMAIL_VERIFICATION="true"` in your `.env` file
2. Configure an email service provider (e.g., Resend, SendGrid, Postmark)
3. Update the `sendEmail` function in `server/auth.ts` with your email service integration

**Example with Resend:**
```typescript
// server/auth.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In the emailVerification config:
sendEmail: async ({ user, url }) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: user.email,
    subject: 'Verify your email',
    html: `<a href="${url}">Click here to verify your email</a>`
  });
}
```

**Behavior when email verification is disabled:**
- Users are automatically signed in after registration
- No verification email is sent
- Users are redirected directly to the dashboard

**Behavior when email verification is enabled:**
- Users must verify their email before signing in
- A verification email is sent upon registration
- Users are redirected to a "check your email" page
- Users cannot sign in until their email is verified

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


