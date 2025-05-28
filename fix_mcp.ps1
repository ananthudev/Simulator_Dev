$mcp = @{
    mcpServers = @{
        "browser-tools" = @{
            command = "npx"
            args = @("@agentdeskai/browser-tools-mcp@latest")
            enabled = $true
        }
    }
}

$json = ConvertTo-Json -InputObject $mcp -Depth 5
Set-Content -Path "$env:USERPROFILE\.cursor\mcp.json" -Value $json
Write-Host "mcp.json has been fixed!" 