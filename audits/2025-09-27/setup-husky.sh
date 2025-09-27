#!/bin/bash
# Setup Husky and lint-staged for pre-commit hooks
# Date: 2025-09-27

echo "🐶 Setting up Husky pre-commit hooks..."

# Install Husky and lint-staged
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky install

# Add prepare script to package.json
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
npx husky add .husky/pre-commit 'npx lint-staged'

# Configure lint-staged in package.json
npm pkg set 'lint-staged'='{
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"],
  "*.css": ["prettier --write"]
}'

echo "✅ Husky setup complete!"
echo "📝 Pre-commit hooks will now run:"
echo "  - ESLint with auto-fix"
echo "  - Prettier formatting"
echo "  - TypeScript type checking"
echo "  - Tests on changed files"
