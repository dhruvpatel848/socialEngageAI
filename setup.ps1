# EngageAI Project Setup Script

# Create necessary directories
Write-Host "Creating project directories..." -ForegroundColor Green

# Create directories for ML module
New-Item -ItemType Directory -Force -Path "ml/data/raw" | Out-Null
New-Item -ItemType Directory -Force -Path "ml/data/processed" | Out-Null
New-Item -ItemType Directory -Force -Path "ml/models" | Out-Null
New-Item -ItemType Directory -Force -Path "ml/notebooks" | Out-Null
New-Item -ItemType Directory -Force -Path "ml/src/utils" | Out-Null

# Create directories for backend
New-Item -ItemType Directory -Force -Path "backend/src/controllers" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/middleware" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/models" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/routes" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/src/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "backend/tests" | Out-Null

# Create directories for frontend
New-Item -ItemType Directory -Force -Path "frontend/public" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/components" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/pages" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/services" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/styles" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/src/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "frontend/tests" | Out-Null

# Create directories for docker
New-Item -ItemType Directory -Force -Path "docker/frontend" | Out-Null
New-Item -ItemType Directory -Force -Path "docker/backend" | Out-Null
New-Item -ItemType Directory -Force -Path "docker/ml" | Out-Null

# Create directories for documentation
New-Item -ItemType Directory -Force -Path "docs" | Out-Null

# Create .gitkeep files for empty directories
Write-Host "Creating .gitkeep files for empty directories..." -ForegroundColor Green
$emptyDirs = @(
    "ml/data/raw",
    "ml/data/processed",
    "ml/models"
)

foreach ($dir in $emptyDirs) {
    New-Item -ItemType File -Force -Path "$dir/.gitkeep" | Out-Null
}

Write-Host "Project directory structure created successfully!" -ForegroundColor Green
Write-Host "\nNext steps:" -ForegroundColor Yellow
Write-Host "1. Create .env files in each service directory (copy from .env.example)" -ForegroundColor Yellow
Write-Host "2. Install dependencies for each service" -ForegroundColor Yellow
Write-Host "3. Start the application using docker-compose up" -ForegroundColor Yellow