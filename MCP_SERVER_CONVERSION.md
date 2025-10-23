# CaseManager MCP Server

## What Changed

The **CaseManager.McpServer** project has been converted from a Web API to a proper **Model Context Protocol (MCP) server** that implements the MCP specification.

## Key Differences

### Before (Web API)

- ❌ Web API running on port 5433
- ❌ HTTP endpoints with Swagger
- ❌ Controllers and REST API
- ❌ CORS configuration
- ❌ Traditional web service

### After (MCP Server)

- ✅ Background service using stdio transport
- ✅ JSON-RPC 2.0 protocol implementation
- ✅ MCP specification 2024-11-05 compliant
- ✅ Tools-based interface (not HTTP endpoints)
- ✅ Designed for AI assistant integration

## What is MCP?

The **Model Context Protocol (MCP)** is a standardized protocol for connecting AI assistants (like Claude) to external data sources and tools. It uses:

- **JSON-RPC 2.0** for message format
- **stdio** (standard input/output) for transport
- **Tools** as the primary interface paradigm

## Available Tools

### 1. `list_completable_cases`

Gets all cases where `CanComplete = true`

### 2. `complete_task`

Marks a case as complete and creates a task action with:

- Task name = Case name
- Case ID = Specified ID
- User ID = Logged in user ID

## How to Use

### Run Standalone

```bash
cd CaseManager.McpServer
dotnet run
```

The server will listen on **stdin** for JSON-RPC messages and respond on **stdout**.

### Integrate with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

Then restart Claude Desktop. The tools will appear automatically in the interface.

### Integrate with Cline (VS Code)

Add to VS Code settings:

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

## Testing

Run the interactive test:

```bash
./interactive-mcp-test.sh
```

This demonstrates the JSON-RPC protocol in action.

## Documentation

- **MCP_README.md** - Detailed MCP server documentation
- **MCP_CONFIGURATION.md** - Client configuration examples
- **PROJECT_SUMMARY.md** - Complete technical architecture

## Architecture

```
Background Service (stdio)
    ↓
JSON-RPC 2.0 Messages
    ↓
MCP Protocol Handler
    ↓
Tool Routing
    ↓
Business Services
    ↓
Database (SQLite)
```

## No Port, No HTTP

This is **not** a web server. It does not:

- Listen on a port (no 5433 anymore)
- Use HTTP/REST
- Have Swagger/OpenAPI
- Accept network connections

It **only** communicates via stdio using the MCP protocol.

## Building

```bash
dotnet build CaseManager.sln
```

Both projects (CaseManager.Api and CaseManager.McpServer) will build successfully.
