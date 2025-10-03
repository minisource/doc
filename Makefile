.PHONY: help build up down dev prod logs clean restart

# Default target
help: ## Show this help message
	@echo "Fumadocs + Payload CMS - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Build commands
build: ## Build production Docker image
	docker-compose build --no-cache

build-dev: ## Build development Docker image
	docker-compose -f docker-compose.yml -f docker-compose.override.yml build

# Run commands
up: ## Start production containers
	docker-compose up -d

dev: ## Start development containers with hot reload
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

prod: ## Start production containers (same as 'up')
	docker-compose up -d

# Stop commands
down: ## Stop all containers
	docker-compose down

stop: ## Stop all containers (same as 'down')
	docker-compose down

# Development commands
restart: ## Restart all containers
	docker-compose restart

restart-dev: ## Restart development containers
	docker-compose -f docker-compose.yml -f docker-compose.override.yml restart

# Monitoring commands
logs: ## Show container logs
	docker-compose logs -f

logs-app: ## Show application logs only
	docker-compose logs -f fumadocs-payloadcms

status: ## Show container status
	docker-compose ps

health: ## Check application health
	curl -f http://localhost:3000/api/health || echo "Application not healthy"

# Database commands
db-seed: ## Seed the database with sample data
	docker-compose exec fumadocs-payloadcms npm run seed

db-migrate: ## Run database migrations
	docker-compose exec fumadocs-payloadcms npx payload migrate

# Cleanup commands
clean: ## Remove containers, networks, and volumes
	docker-compose down -v --remove-orphans

clean-all: ## Remove everything including images
	docker-compose down -v --remove-orphans --rmi all

clean-logs: ## Clean Docker logs
	docker system prune -f

# Utility commands
shell: ## Open shell in running container
	docker-compose exec fumadocs-payloadcms sh

shell-dev: ## Open shell in development container
	docker-compose -f docker-compose.yml -f docker-compose.override.yml exec fumadocs-payloadcms sh

install: ## Install dependencies in container
	docker-compose exec fumadocs-payloadcms npm install

update: ## Update dependencies
	docker-compose exec fumadocs-payloadcms npm update

# Quick setup for new projects
setup: ## Initial setup - build and start containers
	@echo "Setting up Fumadocs + Payload CMS..."
	@make build
	@make up
	@echo "Waiting for application to start..."
	@sleep 10
	@make health
	@echo "Setup complete! Visit http://localhost:3000"

setup-dev: ## Initial development setup
	@echo "Setting up development environment..."
	@make build-dev
	@make dev
	@echo "Waiting for development server to start..."
	@sleep 15
	@make health
	@echo "Development setup complete! Visit http://localhost:3000"

# Environment commands
env-check: ## Check environment variables
	docker-compose exec fumadocs-payloadcms env | grep -E "(FUMADOCS|PAYLOAD|DATABASE|NEXT)" | sort

env-example: ## Copy environment example
	cp .env.example .env
	@echo "Environment file created. Please edit .env with your configuration."

# Backup and restore
backup-db: ## Backup SQLite database
	docker-compose exec fumadocs-payloadcms cp sqlite.db sqlite.backup.db

restore-db: ## Restore SQLite database from backup
	docker-compose exec fumadocs-payloadcms cp sqlite.backup.db sqlite.db

# Testing
test: ## Run tests in container
	docker-compose exec fumadocs-payloadcms npm test

test-build: ## Test production build
	docker-compose exec fumadocs-payloadcms npm run build