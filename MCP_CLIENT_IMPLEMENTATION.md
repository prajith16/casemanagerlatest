# MCP Client Implementation in Angular Frontend

## Overview

This document describes the implementation of a Model Context Protocol (MCP) client within the Angular frontend application. The MCP client connects to the MCP server and enables the chat widget to interact with case management tools using the standard MCP protocol.

## Architecture

### Components

1. **McpTransportService** (`mcp-transport.service.ts`)

   - Handles HTTP-based communication with the MCP server
   - Implements JSON-RPC 2.0 protocol over HTTP
   - Provides methods for initialization, listing tools, and calling tools

2. **McpClientService** (`mcp-client.service.ts`)

   - High-level MCP client following the official SDK pattern
   - Manages connection state and available tools
   - Provides Observable-based API for Angular components
   - Handles tool responses and error cases

3. **HTTP-to-MCP Bridge** (`McpController.cs` - Backend)

   - Provides `/api/mcp/rpc` endpoint
   - Translates HTTP requests to MCP protocol messages
   - Implements the MCP protocol server-side

4. **ChatWidgetComponent** (`chat-widget.component.ts`)
   - Uses McpClientService to interact with MCP tools
   - Displays available tools and their results
   - Handles user interactions with MCP functionality

## MCP Protocol Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│ ChatWidget      │         │ McpClientService │         │ Backend API │
│ Component       │────────>│                  │────────>│ /api/mcp/rpc│
└─────────────────┘         └──────────────────┘         └─────────────┘
       │                            │                            │
       │ 1. Call MCP Tool          │                            │
       │──────────────────────────>│                            │
       │                            │ 2. JSON-RPC Request        │
       │                            │───────────────────────────>│
       │                            │                            │
       │                            │ 3. Execute Tool Logic      │
       │                            │                            │
       │                            │ 4. JSON-RPC Response       │
       │                            │<───────────────────────────│
       │ 5. Observable Response     │                            │
       │<──────────────────────────│                            │
       │                            │                            │
```

## Implementation Details

### 1. Transport Layer (McpTransportService)

The transport service handles low-level communication:

```typescript
// Example: Calling a tool
const response = await transport.callTool("list_completable_cases", {
  userId: 1,
});
```

**JSON-RPC Message Format:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_completable_cases",
    "arguments": {
      "userId": 1
    }
  }
}
```

**Response Format:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"cases\": [...], \"count\": 5, \"userId\": 1}"
      }
    ]
  }
}
```

### 2. Client Service (McpClientService)

The client service provides a high-level API:

```typescript
// Initialize connection
private async initializeClient(): Promise<void> {
  const initResponse = await this.transport.initialize();
  const toolsResponse = await this.transport.listTools();
  this.availableTools = toolsResponse.tools;
}

// Call a tool with Observable pattern
listCompletableCases(userId: number): Observable<Response> {
  return from(this.transport.callTool('list_completable_cases', { userId }));
}
```

### 3. HTTP Bridge (Backend)

The backend controller implements the MCP protocol:

```csharp
[HttpPost("rpc")]
public async Task<IActionResult> McpRpc([FromBody] JObject request)
{
    var method = request["method"]?.ToString();

    switch (method)
    {
        case "initialize":
            // Return server capabilities
        case "tools/list":
            // Return available tools
        case "tools/call":
            // Execute tool and return result
    }
}
```

## Available MCP Tools

### 1. list_completable_cases

**Description:** Get all cases where CanComplete is true and assigned to the user

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "number",
      "description": "The ID of the logged in user"
    }
  },
  "required": ["userId"]
}
```

**Response:**

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
  "count": 1,
  "userId": 2
}
```

### 2. complete_task

**Description:** Complete all assigned tasks for the user by marking cases as complete

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "number",
      "description": "The ID of the logged in user"
    }
  },
  "required": ["userId"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Completed 3 task(s) successfully",
  "completedCount": 3,
  "userId": 2
}
```

## Usage in Components

### Injecting the Service

```typescript
constructor(
  private mcpClient: McpClientService,
  private authService: AuthService
) {}
```

### Listing Tools

```typescript
ngOnInit() {
  this.mcpTools = this.mcpClient.getTools();

  // Or subscribe to dynamic updates
  this.mcpClient.tools$.subscribe(tools => {
    this.mcpTools = tools;
  });
}
```

### Calling a Tool

```typescript
executeMcpTool(tool: McpTool) {
  const userId = this.currentUser.userId;

  if (tool.name === 'list_completable_cases') {
    this.mcpClient.listCompletableCases(userId).subscribe({
      next: (response) => {
        console.log('Cases:', response.cases);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }
}
```

## Error Handling

The MCP client implements comprehensive error handling:

1. **Transport Errors:** Network failures, timeout, etc.
2. **Protocol Errors:** Invalid JSON-RPC messages
3. **Tool Errors:** Tool execution failures
4. **Fallback Mechanism:** Uses hardcoded tool definitions if server is unavailable

```typescript
try {
  const response = await this.transport.callTool(toolName, args);
  // Process response
} catch (error) {
  console.error("MCP Error:", error);
  // Fallback or error handling
}
```

## Configuration

The MCP client automatically discovers the API endpoint from the environment configuration:

**environment.ts:**

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:5226/api",
};
```

The transport service uses `/api/mcp/rpc` endpoint for all MCP communication.

## Testing the Implementation

### 1. Check Available Tools

```typescript
// In browser console
const tools = mcpClient.getTools();
console.log(tools);
```

### 2. Call a Tool

```typescript
// In browser console
mcpClient.listCompletableCases(1).subscribe(
  (response) => console.log("Response:", response),
  (error) => console.error("Error:", error)
);
```

### 3. Monitor Network Traffic

Open Chrome DevTools > Network tab and filter for `/mcp/rpc` to see:

- Request payload (JSON-RPC message)
- Response (JSON-RPC result)

## Benefits of MCP Client Implementation

1. **Standard Protocol:** Follows Model Context Protocol specification
2. **Type Safety:** Full TypeScript type definitions
3. **Observable Pattern:** Integrates seamlessly with Angular RxJS
4. **Error Handling:** Comprehensive error handling and fallbacks
5. **Extensibility:** Easy to add new tools without changing client code
6. **Testability:** Services can be mocked for unit testing

## Future Enhancements

1. **WebSocket Transport:** Implement bidirectional streaming
2. **Tool Notifications:** Subscribe to server-side tool updates
3. **Caching:** Cache tool definitions and responses
4. **Retry Logic:** Automatic retry with exponential backoff
5. **Tool Discovery:** Dynamic tool discovery and registration

## Related Files

- `CaseManager.web/src/app/services/mcp-transport.service.ts`
- `CaseManager.web/src/app/services/mcp-client.service.ts`
- `CaseManager.web/src/app/components/chat-widget/chat-widget.component.ts`
- `CaseManager.Api/Controllers/McpController.cs`

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- [Angular Services and Dependency Injection](https://angular.dev/guide/di)
- [RxJS Observables](https://rxjs.dev/guide/observable)
