$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$serverPort = 5000
$existingListener = Get-NetTCPConnection -LocalPort $serverPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingListener) {
    $existingProcess = Get-Process -Id $existingListener.OwningProcess -ErrorAction SilentlyContinue
    if ($existingProcess -and $existingProcess.ProcessName -eq "java") {
        Write-Host "Backend already running on port $serverPort (PID=$($existingProcess.Id))." -ForegroundColor Yellow
        Write-Host "Open: http://localhost:$serverPort/api/cars" -ForegroundColor Yellow
        exit 0
    }

    if ($existingProcess) {
        Write-Error "Port $serverPort is used by PID=$($existingProcess.Id) ($($existingProcess.ProcessName)). Stop that process, then run again."
    } else {
        Write-Error "Port $serverPort is already in use. Stop the process using this port, then run again."
    }
}

function Load-DotEnvFile([string]$filePath) {
    if (-not (Test-Path $filePath)) {
        return
    }

    Get-Content $filePath | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }
        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            return
        }
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        if ($value.StartsWith('"') -and $value.EndsWith('"')) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $existing = [Environment]::GetEnvironmentVariable($key)
        if (-not [string]::IsNullOrWhiteSpace($key) -and -not [string]::IsNullOrWhiteSpace($value) -and [string]::IsNullOrWhiteSpace($existing)) {
            Set-Item -Path "Env:$key" -Value $value
        }
    }
}

$envFile = Join-Path $projectRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "Missing .env file. Create .env from .env.example and fill real Railway credentials."
}

Load-DotEnvFile $envFile

$requiredJava = 17
$pomPath = Join-Path $projectRoot "pom.xml"
if (Test-Path $pomPath) {
    $pomContent = Get-Content -Raw $pomPath
    if ($pomContent -match "<java.version>(\d+)</java.version>") {
        $requiredJava = [int]$matches[1]
    }
}

$jdkCandidates = @(
    @{ Version = 22; Path = "C:\Program Files\Java\jdk-22.0.2+9" },
    @{ Version = 21; Path = "C:\Program Files\Java\jdk-21" },
    @{ Version = 21; Path = "C:\Program Files\Microsoft\jdk-21" },
    @{ Version = 17; Path = "C:\Users\admin\.jdks\corretto-17.0.8" }
)

$selectedJdk = $null
foreach ($jdk in $jdkCandidates) {
    $javaExe = Join-Path $jdk.Path "bin\java.exe"
    if ($jdk.Version -eq $requiredJava -and (Test-Path $javaExe)) {
        $selectedJdk = $jdk.Path
        break
    }
}

if (-not $selectedJdk) {
    foreach ($jdk in $jdkCandidates) {
        $javaExe = Join-Path $jdk.Path "bin\java.exe"
        if ($jdk.Version -ge $requiredJava -and (Test-Path $javaExe)) {
            $selectedJdk = $jdk.Path
            break
        }
    }
}

if (-not $selectedJdk) {
    Write-Error "No JDK found for java.version=$requiredJava. Install JDK $requiredJava+ and retry."
}

$env:JAVA_HOME = $selectedJdk
$env:Path = "$env:JAVA_HOME\bin;C:\apache-maven-3.9.14\bin;$env:Path"

if (-not $env:DB_URL -and $env:MYSQLHOST -and $env:MYSQLPORT -and $env:MYSQLDATABASE) {
    $env:DB_URL = "jdbc:mysql://$($env:MYSQLHOST):$($env:MYSQLPORT)/$($env:MYSQLDATABASE)?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC"
}
if (-not $env:DB_USERNAME -and $env:MYSQLUSER) {
    $env:DB_USERNAME = $env:MYSQLUSER
}
if (-not $env:DB_PASSWORD -and $env:MYSQLPASSWORD) {
    $env:DB_PASSWORD = $env:MYSQLPASSWORD
}

if ([string]::IsNullOrWhiteSpace($env:DB_URL) -or [string]::IsNullOrWhiteSpace($env:DB_USERNAME) -or [string]::IsNullOrWhiteSpace($env:DB_PASSWORD)) {
    Write-Error "Missing DB settings. Ensure DB_URL/DB_USERNAME/DB_PASSWORD are set in .env."
}

if ($env:DB_PASSWORD -eq "your_railway_mysql_password" -or $env:MYSQLPASSWORD -eq "your_railway_mysql_password") {
    Write-Error "Placeholder DB password detected. Replace with real Railway password in .env."
}

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
Write-Host "Running with DB user=$env:DB_USERNAME host=$env:MYSQLHOST port=$env:MYSQLPORT db=$env:MYSQLDATABASE"

mvn -v
mvn clean spring-boot:run
