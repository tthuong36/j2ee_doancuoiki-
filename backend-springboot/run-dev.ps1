$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

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

Load-DotEnvFile (Join-Path $projectRoot ".env")
Load-DotEnvFile (Join-Path $projectRoot ".env.example")

$java17 = "C:\Users\admin\.jdks\corretto-17.0.8"
if (-not (Test-Path (Join-Path $java17 "bin\java.exe"))) {
    Write-Error "JDK 17 not found at $java17"
}

$env:JAVA_HOME = $java17
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

Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
Write-Host "Running with DB user=$env:DB_USERNAME host=$env:MYSQLHOST port=$env:MYSQLPORT db=$env:MYSQLDATABASE"

mvn -v
mvn spring-boot:run
