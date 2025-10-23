# Quick Start Guide - CaseManager MCP Server

## What You Have

A **Model Context Protocol (MCP) server** for CaseManager that provides AI assistants with tools to:

1. List cases that can be completed
2. Complete tasks and create task actions

## 5-Minute Setup

### Step 1: Verify It Builds

```bash
cd CaseManager.McpServer
dotnet build
```

✅ Should build with no errors

### Step 2: Test the Server

```bash
# From the CaseManager root directory
./interactive-mcp-test.sh
```

✅ Should show JSON-RPC messages and responses

### Step 3: Integrate with Claude Desktop (macOS)

1. Open/create: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add this configuration:

```json
{
  "mcpServers": {
    "casemanager": {
      "command": "dotnet",
      "args": [
        "run",
        "--project",
        "/Users/prajith/Documents/Sandbox/DotNet/csharp-sdk/CaseManager/CaseManager.McpServer/CaseManager.McpServer.csproj"
      ]
    }
  }
}
```

3. Restart Claude Desktop

4. Look for the 🔨 tools icon - you should see:
   - `list_completable_cases`
   - `complete_task`

### Step 4: Use the Tools in Claude

Try asking Claude:

- "List all cases that can be completed"
- "Complete task for case 1 as user 2"

Claude will automatically use the MCP tools to interact with your database!

## How It Works

```
Claude Desktop
    ↓
MCP Protocol (JSON-RPC via stdio)
    ↓
CaseManager.McpServer
    ↓
SQLite Database (casemanager.db)
```

## Troubleshooting

### "Tools not appearing in Claude"

- Restart Claude Desktop completely
- Check the config file path is correct
- Verify dotnet is in your PATH: `dotnet --version`

### "Server not starting"

- Ensure .NET 8.0 SDK is installed
- Check the project path in config is absolute
- Look at stderr output for errors

### "Database not found"

- The server uses `../CaseManager.Api/casemanager.db`
- Make sure the main API has created the database
- Check `appsettings.json` for connection string

## Important Notes

- ⚠️ This is **NOT a web server** - no ports, no HTTP
- ⚠️ It communicates via **stdin/stdout only**
- ⚠️ Designed specifically for MCP clients (Claude, Cline, etc.)
- ⚠️ Logs go to **stderr** to not interfere with stdout protocol

## Next Steps

1. ✅ Build the server
2. ✅ Test with interactive script
3. ✅ Configure Claude Desktop
4. ✅ Use the tools!

## Documentation

- Full details: `MCP_README.md`
- Configuration: `MCP_CONFIGURATION.md`
- Architecture: `PROJECT_SUMMARY.md`
