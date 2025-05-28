# Stop any existing MCP server processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*browser-tools-mcp*"} | Stop-Process -Force

# Reinstall the package
npm uninstall -g @agentdeskai/browser-tools-mcp
npm cache clean --force
npm install -g @agentdeskai/browser-tools-mcp@latest

# Update mcp.json file
$mcp = @{
    mcpServers = @{
        "browser-tools" = @{
            command = "npx"
            args = @("@agentdeskai/browser-tools-mcp@latest", "--verbose")
            enabled = $true
        }
    }
}

$json = ConvertTo-Json -InputObject $mcp -Depth 5
Set-Content -Path "$env:USERPROFILE\.cursor\mcp.json" -Value $json
Write-Host "mcp.json has been updated with verbose logging!"

# Start the MCP server in a new window
Start-Process powershell -ArgumentList "-Command npx @agentdeskai/browser-tools-mcp@latest --verbose"

Write-Host "Browser Tools MCP has been reinstalled and restarted."
Write-Host "Please ensure you:"
Write-Host "1. Have the AgentsDesk Browser Tools extension installed in Chrome"
Write-Host "2. Have allowed the extension to run in incognito mode (if applicable)"
Write-Host "3. Restart Cursor to apply the changes" 