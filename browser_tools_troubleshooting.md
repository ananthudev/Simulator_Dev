# Browser Tools MCP Troubleshooting Guide

## What has been done so far

- Fixed the mcp.json configuration
- Reinstalled the Browser Tools MCP package
- Started the MCP server with verbose logging

## Manual Steps to Check and Fix

### 1. Chrome Extension Setup

1. Open Chrome and go to `chrome://extensions`
2. Make sure "AgentsDesk Browser Tools" is installed and enabled
3. Click "Details" on the extension
4. Make sure "Allow in Incognito" is turned ON
5. Make sure "Site access" is set to "On all sites" or includes the sites you'll be debugging

### 2. Server Connection

1. Open a new PowerShell window and run:
   ```
   npx @agentdeskai/browser-tools-mcp@latest --verbose
   ```
2. Look for any error messages in the output
3. Keep this window open while using Cursor

### 3. Cursor Configuration

1. Close Cursor completely
2. Make sure the mcp.json file is correctly set up at `%USERPROFILE%\.cursor\mcp.json`
3. Restart Cursor
4. When reopening your workspace, the Browser Tools should connect

### 4. Testing the Connection

1. After restarting Cursor, open a Chrome browser window
2. Visit a website (e.g., https://example.com)
3. In Cursor, create a new file and try using a browser tool command
4. The screenshot or other browser tools should now work

### 5. Firewall/Antivirus Checks

If still not working:

1. Check if Windows Firewall or antivirus is blocking Node.js or the MCP server
2. Temporarily disable firewall/antivirus to test
3. Add exceptions for Node.js and the MCP server if needed

### Common Issues and Solutions

#### "Not connected to server. Searching..."

- This means Cursor can't find the MCP server
- Make sure the server is running (use the PowerShell command in step 2)
- Check that the mcp.json file has the correct configuration

#### Extension Not Working

- Make sure Chrome has the correct permissions
- Try reinstalling the extension
- Clear Chrome's cache and cookies

#### Still Not Working

Try these additional steps:

1. Restart your computer
2. Run `npm cache clean --force`
3. Delete and reinstall both Cursor and the Chrome extension
4. Run the fix_browser_tools.ps1 script again
