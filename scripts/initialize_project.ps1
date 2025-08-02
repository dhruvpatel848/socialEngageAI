# EngageAI Project Initialization Script

# Set error action preference
$ErrorActionPreference = "Stop"

# Define colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "ℹ $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "⚠ $message"
}

function Write-Header($message) {
    Write-Output ""
    Write-ColorOutput Magenta "=== $message ==="
    Write-Output ""
}

# Create project directory structure
function Create-DirectoryStructure {
    Write-Header "Creating Project Directory Structure"
    
    try {
        # Run the setup script
        & "$PSScriptRoot/../setup.ps1"
        Write-Success "Directory structure created successfully!"
        return $true
    } catch {
        Write-Error "Error creating directory structure: $_"
        return $false
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    # Backend dependencies
    try {
        Write-Info "Installing backend dependencies..."
        Set-Location -Path "$PSScriptRoot/../backend"
        npm install
        Write-Success "Backend dependencies installed successfully!"
    } catch {
        Write-Error "Error installing backend dependencies: $_"
        return $false
    }
    
    # Frontend dependencies
    try {
        Write-Info "Installing frontend dependencies..."
        Set-Location -Path "$PSScriptRoot/../frontend"
        npm install
        Write-Success "Frontend dependencies installed successfully!"
    } catch {
        Write-Error "Error installing frontend dependencies: $_"
        return $false
    }
    
    # ML dependencies
    try {
        Write-Info "Installing ML dependencies..."
        Set-Location -Path "$PSScriptRoot/../ml"
        
        # Create and activate virtual environment
        Write-Info "Creating Python virtual environment..."
        python -m venv venv
        
        if ($IsWindows) {
            & "./venv/Scripts/Activate.ps1"
            $pip = "./venv/Scripts/pip"
        } else {
            & "./venv/bin/activate"
            $pip = "./venv/bin/pip"
        }
        
        # Install dependencies
        & $pip install --upgrade pip
        & $pip install -r requirements.txt
        
        Write-Success "ML dependencies installed successfully!"
    } catch {
        Write-Error "Error installing ML dependencies: $_"
        return $false
    } finally {
        Set-Location -Path $PSScriptRoot
    }
    
    return $true
}

# Generate sample data
function Generate-SampleData {
    Write-Header "Generating Sample Data"
    
    try {
        Set-Location -Path "$PSScriptRoot/../ml"
        
        # Activate virtual environment
        if ($IsWindows) {
            & "./venv/Scripts/Activate.ps1"
            $python = "./venv/Scripts/python"
        } else {
            & "./venv/bin/activate"
            $python = "./venv/bin/python"
        }
        
        # Run the data generation script
        Write-Info "Running data generation script..."
        & $python scripts/generate_sample_data.py
        
        Write-Success "Sample data generated successfully!"
        return $true
    } catch {
        Write-Error "Error generating sample data: $_"
        return $false
    } finally {
        Set-Location -Path $PSScriptRoot
    }
}

# Train the model
function Train-Model {
    Write-Header "Training the Model"
    
    try {
        Set-Location -Path "$PSScriptRoot/../ml"
        
        # Activate virtual environment
        if ($IsWindows) {
            & "./venv/Scripts/Activate.ps1"
            $python = "./venv/Scripts/python"
        } else {
            & "./venv/bin/activate"
            $python = "./venv/bin/python"
        }
        
        # Run the training script
        Write-Info "Running model training script..."
        & $python scripts/run_training_pipeline.py --data_path="data/synthetic_data.csv" --model_type="xgboost" --optimize
        
        Write-Success "Model trained successfully!"
        return $true
    } catch {
        Write-Error "Error training model: $_"
        return $false
    } finally {
        Set-Location -Path $PSScriptRoot
    }
}

# Create environment files
function Create-EnvFiles {
    Write-Header "Creating Environment Files"
    
    # Backend .env file
    if (-not (Test-Path -Path "$PSScriptRoot/../backend/.env")) {
        try {
            Write-Info "Creating backend .env file..."
            Copy-Item -Path "$PSScriptRoot/../backend/.env.example" -Destination "$PSScriptRoot/../backend/.env"
            Write-Success "Backend .env file created successfully!"
        } catch {
            Write-Error "Error creating backend .env file: $_"
            return $false
        }
    } else {
        Write-Info "Backend .env file already exists."
    }
    
    # Frontend .env file
    if (-not (Test-Path -Path "$PSScriptRoot/../frontend/.env")) {
        try {
            Write-Info "Creating frontend .env file..."
            Copy-Item -Path "$PSScriptRoot/../frontend/.env.example" -Destination "$PSScriptRoot/../frontend/.env"
            Write-Success "Frontend .env file created successfully!"
        } catch {
            Write-Error "Error creating frontend .env file: $_"
            return $false
        }
    } else {
        Write-Info "Frontend .env file already exists."
    }
    
    # ML .env file
    if (-not (Test-Path -Path "$PSScriptRoot/../ml/.env")) {
        try {
            Write-Info "Creating ML .env file..."
            Copy-Item -Path "$PSScriptRoot/../ml/.env.example" -Destination "$PSScriptRoot/../ml/.env"
            Write-Success "ML .env file created successfully!"
        } catch {
            Write-Error "Error creating ML .env file: $_"
            return $false
        }
    } else {
        Write-Info "ML .env file already exists."
    }
    
    return $true
}

# Main function
function Main {
    Write-Header "EngageAI Project Initialization"
    
    # Parse command line arguments
    param(
        [switch]$skipDeps,
        [switch]$skipData,
        [switch]$skipTrain
    )
    
    # Create directory structure
    $dirSuccess = Create-DirectoryStructure
    if (-not $dirSuccess) {
        Write-Error "Failed to create directory structure. Exiting."
        return 1
    }
    
    # Create environment files
    $envSuccess = Create-EnvFiles
    if (-not $envSuccess) {
        Write-Error "Failed to create environment files. Exiting."
        return 1
    }
    
    # Install dependencies
    if (-not $skipDeps) {
        $depsSuccess = Install-Dependencies
        if (-not $depsSuccess) {
            Write-Error "Failed to install dependencies. Exiting."
            return 1
        }
    } else {
        Write-Info "Skipping dependency installation."
    }
    
    # Generate sample data
    if (-not $skipData) {
        $dataSuccess = Generate-SampleData
        if (-not $dataSuccess) {
            Write-Error "Failed to generate sample data. Exiting."
            return 1
        }
    } else {
        Write-Info "Skipping sample data generation."
    }
    
    # Train the model
    if (-not $skipTrain) {
        $trainSuccess = Train-Model
        if (-not $trainSuccess) {
            Write-Error "Failed to train the model. Exiting."
            return 1
        }
    } else {
        Write-Info "Skipping model training."
    }
    
    # Print success message
    Write-Header "Initialization Complete"
    Write-Success "EngageAI project has been successfully initialized!"
    
    Write-Info "Next steps:"
    Write-Info "1. Start the application using 'docker-compose up' or individual services:"
    Write-Info "   - Backend: cd backend && npm run dev"
    Write-Info "   - Frontend: cd frontend && npm run dev"
    Write-Info "   - ML Service: cd ml && python scripts/run_server.py"
    Write-Info "2. Access the application at http://localhost:3000"
    
    return 0
}

# Run the main function
Main $args