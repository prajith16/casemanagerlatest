# CaseManager MCP Server Configuration Examples

This file contains examples of how to configure the CaseManager MCP Server with various MCP clients.

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "casemanager": {
      "command": "dotnet",
      "args": [
        "run",
        "--project",
        "/Users/prajith/Documents/Sandbox/DotNet/csharp-sdk/CaseManager/CaseManager.McpServer/CaseManager.McpServer.csproj"
      ],
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

## Cline (VS Code Extension) Configuration

Add to VS Code settings or `.vscode/settings.json`:

```json
{
  "cline.mcpServers": {
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

## Using the Startup Script

Alternatively, you can use the provided startup script:

```json
{
  "mcpServers": {
    "casemanager": {
      "command": "/Users/prajith/Documents/Sandbox/DotNet/csharp-sdk/CaseManager/start-mcp-server.sh"
    }
  }
}
```

## Environment Variables

You can set environment variables for the MCP server:

```json
{
  "mcpServers": {
    "casemanager": {
      "command": "dotnet",
      "args": ["run", "--project", "/path/to/CaseManager.McpServer.csproj"],
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development",
        "ConnectionStrings__DefaultConnection": "Data Source=/custom/path/casemanager.db"
      }
    }
  }
}
```

## Available Tools

Once configured, the following tools will be available to your MCP client:

1. **list_completable_cases** - Get all cases that can be completed
2. **complete_task** - Mark a case as complete and create a task action

## Troubleshooting

If the server isn't working:

1. Check that .NET 8.0 SDK is installed: `dotnet --version`
2. Verify the project builds: `cd CaseManager.McpServer && dotnet build`
3. Check logs in stderr output
4. Ensure the database path is correct in `appsettings.json`
