# EngageAI Makefile

.PHONY: setup install-deps start stop clean test lint build deploy help

help:
	@echo "EngageAI - AI-driven Social Media Engagement Prediction Platform"
	@echo ""
	@echo "Usage:"
	@echo "  make setup         - Create project directory structure"
	@echo "  make install-deps  - Install dependencies for all services"
	@echo "  make start         - Start all services using Docker Compose"
	@echo "  make stop          - Stop all services"
	@echo "  make clean         - Remove build artifacts and Docker containers"
	@echo "  make test          - Run tests for all services"
	@echo "  make lint          - Run linters for all services"
	@echo "  make build         - Build Docker images"
	@echo "  make deploy        - Deploy the application (placeholder)"
	@echo "  make help          - Show this help message"

# Setup project structure
setup:
	@echo "Setting up project directory structure..."
	powershell -ExecutionPolicy Bypass -File setup.ps1

# Install dependencies
install-deps:
	@echo "Installing dependencies for all services..."
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installing ML service dependencies..."
	cd ml && pip install -r requirements.txt

# Start services
start:
	@echo "Starting all services..."
	docker-compose up -d

# Stop services
stop:
	@echo "Stopping all services..."
	docker-compose down

# Clean up
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf backend/node_modules frontend/node_modules
	rm -rf frontend/.next
	rm -rf ml/__pycache__ ml/**/__pycache__

# Run tests
test:
	@echo "Running tests for all services..."
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "Running ML service tests..."
	cd ml && python -m pytest

# Run linters
lint:
	@echo "Running linters for all services..."
	@echo "Linting backend code..."
	cd backend && npm run lint
	@echo "Linting frontend code..."
	cd frontend && npm run lint
	@echo "Linting ML service code..."
	cd ml && flake8

# Build Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Deploy application (placeholder)
deploy:
	@echo "Deploying application..."
	@echo "This is a placeholder. Implement your deployment strategy here."