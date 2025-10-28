# SuperNovaFit - Makefile
# Standardized commands for development and deployment

.PHONY: help install dev build test lint format clean audit deploy setup

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

# Default target
help: ## Show this help message
	@echo "SuperNovaFit - Available Commands"
	@echo "================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

# Setup & Installation
setup: ## Initial project setup
	@echo "$(YELLOW)Setting up SuperNovaFit...$(NC)"
	npm install
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local 2>/dev/null || echo "$(RED)Warning: .env.example not found$(NC)"; \
		echo "$(YELLOW)Please configure .env.local with your Firebase credentials$(NC)"; \
	fi
	@echo "$(GREEN)Setup complete!$(NC)"

install: ## Install dependencies
	npm install

install-clean: ## Clean install dependencies
	rm -rf node_modules package-lock.json
	npm install

# Development
dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

# Testing
test: ## Run all tests
	npm run test:run

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

test-ui: ## Open test UI
	npm run test:ui

# Code Quality
lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint with auto-fix
	npm run lint -- --fix

format: ## Format code with Prettier
	npm run format

typecheck: ## Run TypeScript type checking
	npm run typecheck

quality: lint typecheck test ## Run all quality checks

# Analysis
analyze: ## Analyze bundle size
	npm run analyze

audit: ## Security audit
	npm audit
	@echo "$(YELLOW)Checking for unused dependencies...$(NC)"
	-npx depcheck
	@echo "$(YELLOW)Checking for unused exports...$(NC)"
	-npx ts-prune 2>/dev/null || echo "$(YELLOW)ts-prune not installed$(NC)"

audit-fix: ## Fix security vulnerabilities
	npm audit fix

# Cleaning
clean: ## Clean build artifacts
	rm -rf .next out dist coverage
	rm -rf .turbo .swc
	find . -name "*.log" -delete

clean-all: clean ## Clean everything including node_modules
	rm -rf node_modules
	rm -f package-lock.json

# Firebase
firebase-login: ## Login to Firebase
	npx firebase login

firebase-init: ## Initialize Firebase
	npx firebase init

deploy-hosting: ## Deploy to Firebase Hosting
	npm run build
	npx firebase deploy --only hosting --project supernovafit-a6fe7

deploy-rules: ## Deploy Firestore rules
	npx firebase deploy --only firestore:rules --project supernovafit-a6fe7

deploy-indexes: ## Deploy Firestore indexes
	npx firebase deploy --only firestore:indexes --project supernovafit-a6fe7

deploy-all: ## Deploy everything to Firebase
	npm run build
	npx firebase deploy --project supernovafit-a6fe7

# Git Helpers
pre-commit: format lint typecheck test ## Run pre-commit checks
	@echo "$(GREEN)Pre-commit checks passed!$(NC)"

commit: ## Interactive commit with conventional commits
	npx git-cz

# Docker (if needed in future)
docker-build: ## Build Docker image
	docker build -t supernovafit:latest .

docker-run: ## Run Docker container
	docker run -p 3000:3000 supernovafit:latest

# CI/CD Helpers
ci: install lint typecheck test build ## Run CI pipeline locally
	@echo "$(GREEN)CI pipeline passed!$(NC)"

# Performance
lighthouse: ## Run Lighthouse audit
	npx lighthouse http://localhost:3000 --view

# Documentation
docs: ## Generate documentation
	@echo "$(YELLOW)Generating documentation...$(NC)"
	npx typedoc --out docs/api src

# Utilities
check-deps: ## Check for outdated dependencies
	npx npm-check-updates

update-deps: ## Update dependencies interactively
	npx npm-check-updates -i

size: ## Check bundle size
	@echo "$(YELLOW)Analyzing bundle size...$(NC)"
	@du -sh .next 2>/dev/null || echo "Build not found. Run 'make build' first"
	@find .next -name "*.js" -type f -exec du -h {} + 2>/dev/null | sort -rh | head -20

# Shortcuts
d: dev ## Alias for dev
b: build ## Alias for build
t: test ## Alias for test
l: lint ## Alias for lint
f: format ## Alias for format

# Advanced
benchmark: ## Run performance benchmarks
	@echo "$(YELLOW)Running benchmarks...$(NC)"
	npm run build
	npx autocannon -c 10 -d 30 http://localhost:3000

monitor: ## Start monitoring dashboard
	@echo "$(YELLOW)Starting monitoring...$(NC)"
	npx pm2 start npm --name "supernovafit" -- start
	npx pm2 monit

# Help for new contributors
onboard: setup ## Onboarding for new developers
	@echo "$(GREEN)Welcome to SuperNovaFit!$(NC)"
	@echo "1. Run 'make dev' to start developing"
	@echo "2. Run 'make test' to run tests"
	@echo "3. Run 'make help' to see all commands"
	@echo "4. Check CONTRIBUTING.md for guidelines"

.DEFAULT_GOAL := help
