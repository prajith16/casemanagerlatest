# CaseManager MCP Server

A Model Context Protocol (MCP) server for the CaseManager application that provides tools for case management operations.

## Overview

This is a **background service** that implements the Model Context Protocol (MCP) specification. It communicates via **stdio** (standard input/output) using JSON-RPC 2.0 messages.

## MCP Tools

The server exposes two tools:

### 1. list_completable_cases

Get all cases where `CanComplete` is `true`.

**Input:** None required

**Output:**

```json
{
  "cases": [
    {
      "caseId": 1,
      "caseName": "Customer Support Request",
      "regardingUserId": 1,
      "isComplete": false,
      "canComplete": true,
      "assignedUserId": 2
    }
  ],
  "count": 1
}
```

### 2. complete_task

Mark a case as complete (`IsComplete = true`) and create a new task action entry.

**Input:**

```json
{
  "caseId": 1,
  "userId": 2
}
```

**Output:**

```json
{
  "success": true,
  "message": "Task completed successfully",
  "caseId": 1,
  "userId": 2
}
```

**What happens:**

- Sets `IsComplete = true` on the specified case
- Creates a new `TaskAction` with:
  - `TaskActionName` = Case name
  - `CaseId` = Specified case ID
  - `UserId` = Logged in user ID

## Running the Server

### Standalone Mode

```bash
cd CaseManager.McpServer
dotnet run
```

The server will start listening on **stdio** for MCP protocol messages.

### Integration with MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop, Cline):

```json
{
  "mcpServers": {
    "casemanager": {
      "command": "dotnet",
      "args": [
        "run",
        "--project",
        "/path/to/CaseManager.McpServer/CaseManager.McpServer.csproj"
      ]
    }
  }
}
```

## Protocol

This server implements the [Model Context Protocol](https://modelcontextprotocol.io/) specification:

- **Protocol Version:** 2024-11-05
- **Transport:** stdio (JSON-RPC over standard input/output)
- **Capabilities:** tools

### Supported Methods

1. `initialize` - Initialize the MCP session
2. `tools/list` - List available tools
3. `tools/call` - Execute a tool

## Database

The MCP Server uses the same SQLite database as the main API (`casemanager.db`) located in the `CaseManager.Api` folder.

## Architecture

- **Background Service**: Runs continuously, listening for MCP messages on stdio
- **MCP Protocol Layer**: Handles JSON-RPC 2.0 message parsing and routing
- **Services**: Business logic (`McpCaseService`)
- **Data**: Database context (`CaseManagerDbContext`)
- **Models**: Data models (`Case`, `TaskAction`, `User`)

## Logging

Logs are written to **stderr** (standard error) to avoid interfering with the MCP protocol communication on stdout.
