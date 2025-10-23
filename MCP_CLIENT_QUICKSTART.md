# MCP Client Quick Start Guide

## Overview

This guide will help you get started with the MCP (Model Context Protocol) client implementation in the Angular frontend.

## What Changed?

The frontend now uses a proper MCP client instead of directly calling API controllers. This provides:

- **Standardized Communication:** Uses the Model Context Protocol specification
- **Type-Safe API:** Full TypeScript type definitions for all MCP interactions
- **Observable Pattern:** Seamless integration with Angular's RxJS
- **Error Handling:** Comprehensive error handling and fallback mechanisms
- **Extensibility:** Easy to add new MCP tools without changing client code

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                         │
│                                                             │
│  ┌──────────────┐    ┌────────────────┐                   │
│  │ ChatWidget   │───>│ McpClientService│                   │
│  │ Component    │    └────────────────┘                   │
│  └──────────────┘           │                              │
│                              │                              │
│                              ▼                              │
│                    ┌────────────────┐                      │
│                    │McpTransportSvc │                      │
│                    └────────────────┘                      │
│                              │                              │
└──────────────────────────────│──────────────────────────────┘
                               │ HTTP
                               │ JSON-RPC 2.0
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  .NET Backend API                           │
│                                                             │
│                    ┌────────────────┐                      │
│                    │ McpController  │                      │
│                    │  /api/mcp/rpc  │                      │
│                    └────────────────┘                      │
│                              │                              │
│                              ▼                              │
│                    ┌────────────────┐                      │
│                    │  Database      │                      │
│                    │  (SQLite)      │                      │
│                    └────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## New Files Created

### Frontend

1. **`mcp-transport.service.ts`** - HTTP transport layer for MCP communication
2. **`mcp-client.service.ts`** - Enhanced MCP client service with full protocol support

### Backend

- **`McpController.cs`** - Updated with `/api/mcp/rpc` endpoint for JSON-RPC handling

### Documentation

- **`MCP_CLIENT_IMPLEMENTATION.md`** - Detailed implementation documentation
- **`test-mcp-client.sh`** - Test script for MCP endpoints

## Quick Start

### 1. Install Dependencies

The MCP SDK package has already been installed:

```bash
cd CaseManager.web
npm install
```

### 2. Start the Backend

```bash
cd CaseManager.Api
dotnet run
```

The API will start on `http://localhost:5226`

### 3. Start the Frontend

```bash
cd CaseManager.web
npm start
```

The app will open on `http://localhost:4200`

### 4. Test the MCP Client

1. Open the application in your browser
2. Login with your credentials
3. Click the chat icon to open the chat widget
4. You should see the MCP tools section with available tools:

   - **List Completable Cases** - View cases you can complete
   - **Complete Task** - Mark all your assigned tasks as complete

5. Click on any tool to execute it

## How It Works

### 1. Initialization

When the chat widget loads, the MCP client automatically initializes:

```typescript
// In McpClientService
async initializeClient() {
  // Connect to MCP server
  const initResponse = await this.transport.initialize();

  // Get available tools
  const toolsResponse = await this.transport.listTools();
  this.availableTools = toolsResponse.tools;
}
```

### 2. Tool Execution

When you click a tool in the chat widget:

```typescript
// In ChatWidgetComponent
executeMcpTool(tool: McpTool) {
  const userId = this.currentUser.userId;

  this.mcpClient.listCompletableCases(userId).subscribe({
    next: (response) => {
      // Display results in chat
      this.addMcpResultMessage('Found cases:', response.cases);
    },
    error: (error) => {
      // Handle errors
      this.addMcpErrorMessage('Failed to list cases', error);
    }
  });
}
```

### 3. Protocol Communication

The transport layer sends JSON-RPC messages:

```typescript
// Request
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

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"cases\": [...], \"count\": 5}"
      }
    ]
  }
}
```

## Available MCP Tools

### list_completable_cases

Get all cases where you can complete tasks.

**Usage:**

```typescript
mcpClient.listCompletableCases(userId).subscribe((response) => {
  console.log(`Found ${response.count} cases`);
  console.log(response.cases);
});
```

### complete_task

Complete all your assigned tasks.

**Usage:**

```typescript
mcpClient.completeTasks(userId).subscribe((response) => {
  console.log(response.message);
  console.log(`Completed ${response.completedCount} tasks`);
});
```

## Testing the Implementation

### Manual Testing

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Filter by `/mcp`
4. Click an MCP tool in the chat widget
5. Inspect the request/response

### Automated Testing

Run the test script:

```bash
./test-mcp-client.sh
```

This will test:

- MCP initialization
- Tool listing
- Tool execution

## Troubleshooting

### Issue: MCP client fails to initialize

**Solution:**

- Check that the backend is running
- Verify the API URL in `environment.ts`
- Check browser console for errors

### Issue: Tools don't appear in chat widget

**Solution:**

- Make sure you're logged in
- Check that `McpClientService` is imported in the component
- Verify tools are being fetched: `mcpClient.getTools()`

### Issue: Tool execution fails

**Solution:**

- Verify you have a valid user ID
- Check database connection
- Look at backend logs for errors
- Inspect network response in DevTools

### Issue: Authentication errors

**Solution:**

- Ensure you're logged in
- Check that auth token is being sent with requests
- Verify token is not expired

## Key Differences from Previous Implementation

| Aspect             | Before              | After                                 |
| ------------------ | ------------------- | ------------------------------------- |
| **Protocol**       | Direct HTTP calls   | JSON-RPC 2.0 over HTTP                |
| **Service**        | Simple HTTP service | Full MCP client with protocol support |
| **Tool Discovery** | Hardcoded           | Dynamic from server                   |
| **Error Handling** | Basic               | Comprehensive with fallbacks          |
| **Standards**      | Custom              | Model Context Protocol spec           |
| **Type Safety**    | Partial             | Full TypeScript types                 |

## Next Steps

1. **Add More Tools:** Extend the MCP server with new tools
2. **Enhance UI:** Improve tool display in chat widget
3. **Add Streaming:** Implement streaming responses for long operations
4. **Tool Parameters:** Add UI for tools that need user input
5. **Tool History:** Track and display executed tools

## Resources

- **Documentation:** See `MCP_CLIENT_IMPLEMENTATION.md` for detailed implementation
- **MCP Specification:** https://modelcontextprotocol.io/
- **JSON-RPC 2.0:** https://www.jsonrpc.org/specification
- **Angular Services:** https://angular.dev/guide/di

## Support

If you encounter any issues:

1. Check the console logs (both browser and backend)
2. Review the implementation documentation
3. Run the test script to verify endpoints
4. Check network traffic in browser DevTools

For questions or issues, refer to the detailed documentation in `MCP_CLIENT_IMPLEMENTATION.md`.
