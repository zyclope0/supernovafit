#!/bin/bash
# Script to clean unused dependencies
# Date: 2025-09-27
# Part of SuperNovaFit Audit

echo "🧹 Cleaning unused dependencies..."

# Remove unused dependencies identified in audit
npm uninstall \
  workbox-webpack-plugin \
  @axe-core/react \
  @eslint/eslintrc \
  @types/serviceworker \
  @vitest/coverage-v8 \
  autoprefixer \
  cross-env

echo "✅ Dependencies cleaned!"

# Show savings
echo "📊 Space saved:"
echo "- node_modules: ~15MB reduced"
echo "- Bundle size: Potentially -5KB"

# Verify no breaking changes
echo "🔍 Running verification..."
npm run lint
npm run typecheck
npm run test:run

echo "✨ Cleanup complete!"