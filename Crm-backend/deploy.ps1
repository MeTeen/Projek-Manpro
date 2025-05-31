# PowerShell script for managing CRM Docker deployment on Windows
# Usage: .\deploy.ps1 [command]

param(
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "CRM Docker Deployment Script" -ForegroundColor Green
    Write-Host "Usage: .\deploy.ps1 [command]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  start     - Build and start all services"
    Write-Host "  stop      - Stop all services"
    Write-Host "  restart   - Restart all services"
    Write-Host "  logs      - Show logs for all services"
    Write-Host "  status    - Show status of all services"
    Write-Host "  clean     - Stop and remove all containers and volumes"
    Write-Host "  backup    - Create database backup"
    Write-Host "  health    - Check service health"
    Write-Host "  shell     - Open shell in backend container"
    Write-Host "  mysql     - Open MySQL shell"
    Write-Host "  help      - Show this help message"
}

function Start-Services {
    Write-Host "Building and starting CRM services..." -ForegroundColor Green
    docker-compose up --build -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services started successfully!" -ForegroundColor Green
        Start-Sleep -Seconds 5
        Get-Status
    } else {
        Write-Host "Failed to start services!" -ForegroundColor Red
    }
}

function Stop-Services {
    Write-Host "Stopping CRM services..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "Services stopped." -ForegroundColor Green
}

function Restart-Services {
    Write-Host "Restarting CRM services..." -ForegroundColor Yellow
    docker-compose restart
    Write-Host "Services restarted." -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Showing logs for all services..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Get-Status {
    Write-Host "Service Status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "API Health Check:" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
        Write-Host "✓ Backend API is healthy" -ForegroundColor Green
        Write-Host "  Status: $($response.status)" -ForegroundColor White
        Write-Host "  Environment: $($response.environment)" -ForegroundColor White
        Write-Host "  Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor White
    } catch {
        Write-Host "✗ Backend API is not responding" -ForegroundColor Red
    }
}

function Clean-Deployment {
    Write-Host "WARNING: This will remove all containers, networks, and volumes!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? Type 'yes' to continue"
    if ($confirmation -eq "yes") {
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Host "Cleanup completed." -ForegroundColor Green
    } else {
        Write-Host "Cleanup cancelled." -ForegroundColor Yellow
    }
}

function Backup-Database {
    Write-Host "Creating database backup..." -ForegroundColor Green
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = ".\backups"
    $backupFile = "crm_backup_$timestamp.sql"
    
    if (!(Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir
    }
    
    docker-compose exec -T mysql mysqldump -u crm_user -pcrm_password --single-transaction --routines --triggers crm_db > "$backupDir\$backupFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Backup created: $backupDir\$backupFile" -ForegroundColor Green
    } else {
        Write-Host "Backup failed!" -ForegroundColor Red
    }
}

function Check-Health {
    Write-Host "Checking service health..." -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    
    # Check MySQL
    $mysqlHealth = docker-compose exec mysql mysqladmin ping -h localhost -u crm_user -pcrm_password 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MySQL is healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ MySQL is not healthy" -ForegroundColor Red
    }
    
    # Check Backend API
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
        Write-Host "✓ Backend API is healthy" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backend API is not responding" -ForegroundColor Red
    }
}

function Open-Shell {
    Write-Host "Opening shell in backend container..." -ForegroundColor Cyan
    docker-compose exec backend sh
}

function Open-MySQL {
    Write-Host "Opening MySQL shell..." -ForegroundColor Cyan
    docker-compose exec mysql mysql -u crm_user -pcrm_password crm_db
}

# Main script logic
switch ($Command.ToLower()) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "logs" { Show-Logs }
    "status" { Get-Status }
    "clean" { Clean-Deployment }
    "backup" { Backup-Database }
    "health" { Check-Health }
    "shell" { Open-Shell }
    "mysql" { Open-MySQL }
    "help" { Show-Help }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Show-Help
    }
}
