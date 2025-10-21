# import-vercel-env.ps1
# Usage: Open PowerShell, cd to repo root and run:
#   vercel login
#   ./import-vercel-env.ps1 -Environment production
# This script reads vercel.env and runs `vercel env add` for each NAME=VALUE line.

param(
    [string]$Env = 'production'
)

$path = Join-Path -Path (Get-Location) -ChildPath 'vercel.env'
if (-not (Test-Path $path)) {
    Write-Error "vercel.env not found at $path"
    exit 1
}

Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $parts = $line -split '=', 2
    if ($parts.Length -ne 2) { return }
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    Write-Host "Adding $name to Vercel ($Env)"
    # Use vercel env add in a way that accepts the value from stdin
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'vercel'
    $psi.Arguments = "env add $name $Env"
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.UseShellExecute = $false

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $proc.Start() | Out-Null
    $proc.StandardInput.WriteLine($value)
    $proc.StandardInput.Close()
    $out = $proc.StandardOutput.ReadToEnd()
    $err = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    Write-Host $out
    if ($err) { Write-Host $err }
}

Write-Host "Done. Verify variables in Vercel dashboard and redeploy."