# Contributing to SuperNovaFit

First off, thank you for considering contributing to SuperNovaFit! 🎉

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. Include:

- Clear and descriptive title
- Step-by-step description of the enhancement
- Explain why this enhancement would be useful
- List any alternative solutions considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Follow the coding standards
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit your PR!

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase account (for backend services)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/supernovafit.git
cd supernovafit

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Run development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
npm run format       # Format code with Prettier
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use functional components with hooks
- Prefer composition over inheritance

### File Naming

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `calculateBMR.ts`)
- Files: kebab-case (e.g., `user-profile.tsx`)
- Tests: `*.test.ts` or `*.test.tsx`

### Component Structure

```typescript
// 1. Imports
import React from 'react'
import { useAuth } from '@/hooks/useAuth'

// 2. Types
interface ComponentProps {
  title: string
  onAction?: () => void
}

// 3. Component
export function Component({ title, onAction }: ComponentProps) {
  // 4. Hooks
  const { user } = useAuth()

  // 5. State
  const [state, setState] = useState(false)

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [])

  // 7. Handlers
  const handleClick = () => {
    onAction?.()
  }

  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new training calendar component
fix: resolve date calculation in BMR formula
docs: update README with deployment instructions
style: format code with prettier
refactor: extract meal validation logic
test: add tests for auth guard
chore: update dependencies
```

### Testing

- Write tests for new features
- Maintain minimum 30% code coverage
- Use descriptive test names
- Test both success and error cases

```typescript
describe("calculateBMR", () => {
  it("should calculate BMR correctly for male users", () => {
    const result = calculateBMR({
      weight: 70,
      height: 175,
      age: 30,
      gender: "male",
    });
    expect(result).toBe(1673);
  });

  it("should throw error for invalid input", () => {
    expect(() => calculateBMR({ weight: -10 })).toThrow();
  });
});
```

## Project Structure

```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # Generic UI components
│   ├── mobile/      # Mobile-specific components
│   └── desktop/     # Desktop-specific components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
├── types/           # TypeScript definitions
└── styles/          # Global styles
```

## Pull Request Process

1. **Branch Naming**: `feature/description`, `fix/description`, `docs/description`
2. **PR Title**: Clear and descriptive
3. **Description**: Use the PR template
4. **Reviews**: Require at least 1 approval
5. **Tests**: All tests must pass
6. **Lint**: No ESLint errors
7. **Build**: Successful production build

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console.logs left
- [ ] No commented-out code
- [ ] Translations added (if applicable)

## Documentation

- Update README.md for major changes
- Add JSDoc comments for utilities
- Document component props with TypeScript
- Update API documentation when needed

## Performance Guidelines

- Lazy load heavy components
- Use React.memo for expensive renders
- Optimize images with next/image
- Keep bundle size under 250KB
- Monitor Web Vitals

## Accessibility

- WCAG 2.1 AA compliance minimum
- Test with screen readers
- Provide keyboard navigation
- Use semantic HTML
- Include ARIA labels where needed

## Questions?

Feel free to open an issue for any questions or join our Discord community!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to SuperNovaFit! 💪
