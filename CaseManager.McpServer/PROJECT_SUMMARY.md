# CaseManager MCP Server - Project Summary

## Overview

The **CaseManager.McpServer** is a Model Context Protocol (MCP) server implemented in C# (.NET 8.0). It is a **background service** that communicates via **stdio** (standard input/output) using the JSON-RPC 2.0 protocol, following the MCP specification (version 2024-11-05).

## Project Type

- **Type**: Console Application / Background Service
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: stdio (JSON-RPC 2.0)
- **NOT a Web API**: Does not use HTTP, REST, or run on a port

## Architecture

```
CaseManager.McpServer/
├── Mcp/                          # MCP Protocol Implementation
│   ├── McpServer.cs              # Core MCP protocol handler
│   ├── McpBackgroundService.cs   # Background service host
│   ├── McpMessage.cs             # JSON-RPC message models
│   └── McpTool.cs                # MCP tool definitions
├── Services/                     # Business Logic
│   ├── IMcpCaseService.cs        # Service interface
│   └── McpCaseService.cs         # Case management logic
├── Data/                         # Database
│   └── CaseManagerDbContext.cs   # Entity Framework context
├── Models/                       # Data Models
│   ├── Case.cs
│   ├── TaskAction.cs
│   └── User.cs
├── Program.cs                    # Application entry point
├── appsettings.json              # Configuration
└── CaseManager.McpServer.csproj  # Project file
```

## MCP Tools Exposed

### 1. list_completable_cases

**Description**: Retrieves all cases where `CanComplete` is `true`

**Input Schema**:

```json
{
  "type": "object",
  "properties": {},
  "required": []
}
```

**Example Response**:

```json
{
  "cases": [
    {
      "caseId": 1,
      "caseName": "Customer Support Request",
      "isComplete": false,
      "canComplete": true,
      "assignedUserId": 2
    }
  ],
  "count": 1
}
```

### 2. complete_task

**Description**: Marks a case as complete and creates a task action

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "caseId": {
      "type": "number",
      "description": "The ID of the case to complete"
    },
    "userId": {
      "type": "number",
      "description": "The ID of the logged in user"
    }
  },
  "required": ["caseId", "userId"]
}
```

**Behavior**:

1. Sets `Case.IsComplete = true`
2. Creates a new `TaskAction` with:
   - `TaskActionName` = Case name
   - `CaseId` = Specified case ID
   - `UserId` = Logged in user ID

**Example Response**:

```json
{
  "success": true,
  "message": "Task completed successfully",
  "caseId": 1,
  "userId": 2
}
```

## Communication Protocol

### JSON-RPC 2.0 Messages

**Initialize Request**:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "client-name",
      "version": "1.0.0"
    }
  }
}
```

**List Tools Request**:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Call Tool Request**:

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "list_completable_cases",
    "arguments": {}
  }
}
```

## Running the Server

### Option 1: Direct Execution

```bash
cd CaseManager.McpServer
dotnet run
```

### Option 2: Using Startup Script

```bash
./start-mcp-server.sh
```

### Option 3: From MCP Client

Configure in your MCP client (e.g., Claude Desktop):

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

## Testing

### Interactive Test

```bash
./interactive-mcp-test.sh
```

This script:

1. Starts the MCP server
2. Sends test messages (initialize, tools/list, tools/call)
3. Displays responses
4. Demonstrates the stdio protocol

## Database

- **Type**: SQLite
- **Location**: `../CaseManager.Api/casemanager.db`
- **Shared**: Uses the same database as the main CaseManager.Api
- **Auto-created**: Database is created automatically if it doesn't exist

## Logging

- **Output**: stderr (standard error)
- **Reason**: stdout is reserved for MCP protocol messages
- **Level**: Configurable via appsettings.json

## Key Features

1. ✅ Implements MCP specification (2024-11-05)
2. ✅ stdio transport (no HTTP/ports)
3. ✅ Background service architecture
4. ✅ Proper service scoping for Entity Framework
5. ✅ Two business tools (list_completable_cases, complete_task)
6. ✅ Shared database with main API
7. ✅ Comprehensive error handling
8. ✅ JSON-RPC 2.0 compliant

## Integration Points

- **MCP Clients**: Claude Desktop, Cline, or any MCP-compatible client
- **Database**: Shares data with CaseManager.Api
- **Communication**: Purely stdio-based (no network ports)

## Files Created/Modified

### New Files:

- `CaseManager.McpServer/Mcp/McpServer.cs`
- `CaseManager.McpServer/Mcp/McpBackgroundService.cs`
- `CaseManager.McpServer/Mcp/McpMessage.cs`
- `CaseManager.McpServer/Mcp/McpTool.cs`
- `CaseManager.McpServer/mcp-config.json`
- `CaseManager.McpServer/MCP_README.md`
- `CaseManager.McpServer/MCP_CONFIGURATION.md`
- `start-mcp-server.sh`
- `interactive-mcp-test.sh`

### Modified Files:

- `CaseManager.McpServer/CaseManager.McpServer.csproj` (changed from Web SDK to Console)
- `CaseManager.McpServer/Program.cs` (changed from Web API to Background Service)
- `CaseManager.sln` (project remains in solution)

### Removed:

- `Controllers/` directory (Web API not needed)
- `Properties/launchSettings.json` (Web-specific configuration)
- Swashbuckle/Swagger packages (API documentation not needed)

## Documentation

- **README**: `MCP_README.md` - How to use the MCP server
- **Configuration**: `MCP_CONFIGURATION.md` - Client configuration examples
- **This Document**: Project architecture and implementation details
