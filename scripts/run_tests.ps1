# EngageAI Test Runner Script

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

# Track overall success
$overallSuccess = $true

# Run backend tests
function Run-BackendTests {
    Write-Header "Running Backend Tests"
    
    try {
        Set-Location -Path "$PSScriptRoot/../backend"
        
        # Check if node_modules exists
        if (-not (Test-Path -Path "node_modules")) {
            Write-Info "Installing backend dependencies..."
            npm install
        }
        
        # Run tests
        Write-Info "Running backend tests..."
        npm test
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backend tests passed!"
            return $true
        } else {
            Write-Error "Backend tests failed!"
            return $false
        }
    } catch {
        Write-Error "Error running backend tests: $_"
        return $false
    } finally {
        Set-Location -Path $PSScriptRoot
    }
}

# Run frontend tests
function Run-FrontendTests {
    Write-Header "Running Frontend Tests"
    
    try {
        Set-Location -Path "$PSScriptRoot/../frontend"
        
        # Check if node_modules exists
        if (-not (Test-Path -Path "node_modules")) {
            Write-Info "Installing frontend dependencies..."
            npm install
        }
        
        # Run tests
        Write-Info "Running frontend tests..."
        npm test
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend tests passed!"
            return $true
        } else {
            Write-Error "Frontend tests failed!"
            return $false
        }
    } catch {
        Write-Error "Error running frontend tests: $_"
        return $false
    } finally {
        Set-Location -Path $PSScriptRoot
    }
}

# Run ML tests
function Run-MLTests {
    Write-Header "Running ML Tests"
    
    try {
        Set-Location -Path "$PSScriptRoot/../ml"
        
        # Check if Python virtual environment exists
        $venvPath = "venv"
        $pythonCmd = "python"
        
        if (Test-Path -Path $venvPath) {
            # Activate virtual environment
            Write-Info "Activating virtual environment..."
            if ($IsWindows) {
                & "$venvPath\Scripts\Activate.ps1"
                $pythonCmd = "$venvPath\Scripts\python.exe"
            } else {
                & "$venvPath/bin/activate"
                $pythonCmd = "$venvPath/bin/python"
            }
        }
        
        # Run tests
        Write-Info "Running ML tests..."
        & $pythonCmd -m pytest
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "ML tests passed!"
            return $true
        } else {
            Write-Error "ML tests failed!"
            return $false
        }
    } catch {
        Write-Error "Error running ML tests: $_"
        return $false
    } finally {
        Set-Location -Path $PSScriptRoot
    }
}

# Main function
function Main {
    Write-Header "EngageAI Test Runner"
    
    # Parse command line arguments
    param(
        [switch]$backend,
        [switch]$frontend,
        [switch]$ml,
        [switch]$all
    )
    
    # If no specific tests are specified, run all tests
    if (-not $backend -and -not $frontend -and -not $ml) {
        $all = $true
    }
    
    # Track results
    $backendSuccess = $true
    $frontendSuccess = $true
    $mlSuccess = $true
    
    # Run tests based on arguments
    if ($backend -or $all) {
        $backendSuccess = Run-BackendTests
    }
    
    if ($frontend -or $all) {
        $frontendSuccess = Run-FrontendTests
    }
    
    if ($ml -or $all) {
        $mlSuccess = Run-MLTests
    }
    
    # Print summary
    Write-Header "Test Summary"
    
    if ($backend -or $all) {
        if ($backendSuccess) {
            Write-Success "Backend: PASSED"
        } else {
            Write-Error "Backend: FAILED"
            $overallSuccess = $false
        }
    }
    
    if ($frontend -or $all) {
        if ($frontendSuccess) {
            Write-Success "Frontend: PASSED"
        } else {
            Write-Error "Frontend: FAILED"
            $overallSuccess = $false
        }
    }
    
    if ($ml -or $all) {
        if ($mlSuccess) {
            Write-Success "ML: PASSED"
        } else {
            Write-Error "ML: FAILED"
            $overallSuccess = $false
        }
    }
    
    # Return overall result
    if ($overallSuccess) {
        Write-Success "All tests passed!"
        return 0
    } else {
        Write-Error "Some tests failed!"
        return 1
    }
}

# Run the main function
Main $args