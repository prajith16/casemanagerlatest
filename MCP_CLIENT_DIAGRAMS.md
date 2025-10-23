# MCP Client Architecture Diagram

## System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         ANGULAR FRONTEND                               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    Chat Widget Component                         │ │
│  │                                                                  │ │
│  │  • Display MCP tools                                            │ │
│  │  • Handle user interactions                                     │ │
│  │  • Show tool results                                            │ │
│  └─────────────────────────┬────────────────────────────────────────┘ │
│                            │                                          │
│                            │ Injects & Uses                           │
│                            ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    MCP Client Service                            │ │
│  │                                                                  │ │
│  │  • Initialize connection                                        │ │
│  │  • Manage tools list                                            │ │
│  │  • Provide Observable API:                                      │ │
│  │    - listCompletableCases(userId): Observable<Response>         │ │
│  │    - completeTasks(userId): Observable<Response>                │ │
│  │  • Handle errors & fallbacks                                    │ │
│  └─────────────────────────┬────────────────────────────────────────┘ │
│                            │                                          │
│                            │ Uses                                     │
│                            ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                   MCP Transport Service                          │ │
│  │                                                                  │ │
│  │  • JSON-RPC 2.0 protocol                                        │ │
│  │  • HTTP communication                                           │ │
│  │  • Methods:                                                     │ │
│  │    - initialize()                                               │ │
│  │    - listTools()                                                │ │
│  │    - callTool(name, args)                                       │ │
│  └─────────────────────────┬────────────────────────────────────────┘ │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             │ HTTP POST
                             │ /api/mcp/rpc
                             │ JSON-RPC 2.0
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                            ▼                       .NET BACKEND       │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                      MCP Controller                              │ │
│  │                      /api/mcp/rpc                                │ │
│  │                                                                  │ │
│  │  Handles JSON-RPC methods:                                      │ │
│  │  • initialize        → Returns server info & capabilities       │ │
│  │  • tools/list        → Returns available tools                  │ │
│  │  • tools/call        → Executes specified tool                  │ │
│  └─────────────────────────┬────────────────────────────────────────┘ │
│                            │                                          │
│                            │ Executes                                 │
│                            ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                        MCP Tools                                 │ │
│  │                                                                  │ │
│  │  ┌────────────────────────────────────────────────────────────┐ │ │
│  │  │  list_completable_cases                                    │ │ │
│  │  │  • Query cases where CanComplete = true                    │ │ │
│  │  │  • Filter by AssignedUserId                                │ │ │
│  │  │  • Return cases array with count                           │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  │                                                                  │ │
│  │  ┌────────────────────────────────────────────────────────────┐ │ │
│  │  │  complete_task                                             │ │ │
│  │  │  • Find completable cases for user                         │ │ │
│  │  │  • Mark IsComplete = true                                  │ │ │
│  │  │  • Create TaskAction records                               │ │ │
│  │  │  • Return success message & count                          │ │ │
│  │  └────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────┬────────────────────────────────────────┘ │
│                            │                                          │
│                            │ Accesses                                 │
│                            ▼                                          │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    Database (SQLite)                             │ │
│  │                                                                  │ │
│  │  Tables:                                                         │ │
│  │  • Cases                                                         │ │
│  │  • TaskActions                                                   │ │
│  │  • Users                                                         │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

## Message Flow Diagram

```
User                ChatWidget          McpClient           Transport           Backend
 │                      │                   │                   │                   │
 │  Click Tool          │                   │                   │                   │
 │─────────────────────>│                   │                   │                   │
 │                      │                   │                   │                   │
 │                      │  listCases(1)     │                   │                   │
 │                      │──────────────────>│                   │                   │
 │                      │                   │                   │                   │
 │                      │                   │  callTool(...)    │                   │
 │                      │                   │──────────────────>│                   │
 │                      │                   │                   │                   │
 │                      │                   │                   │  POST /api/mcp/rpc│
 │                      │                   │                   │──────────────────>│
 │                      │                   │                   │                   │
 │                      │                   │                   │  JSON-RPC Request │
 │                      │                   │                   │  {                │
 │                      │                   │                   │    "method":      │
 │                      │                   │                   │    "tools/call",  │
 │                      │                   │                   │    "params": {...}│
 │                      │                   │                   │  }                │
 │                      │                   │                   │                   │
 │                      │                   │                   │    Execute Tool   │
 │                      │                   │                   │    Query DB       │
 │                      │                   │                   │                   │
 │                      │                   │                   │  JSON-RPC Response│
 │                      │                   │                   │<──────────────────│
 │                      │                   │                   │                   │
 │                      │                   │  Observable.next  │                   │
 │                      │                   │<──────────────────│                   │
 │                      │                   │                   │                   │
 │                      │  Observable.next  │                   │                   │
 │                      │<──────────────────│                   │                   │
 │                      │                   │                   │                   │
 │  Display Results     │                   │                   │                   │
 │<─────────────────────│                   │                   │                   │
 │                      │                   │                   │                   │
```

## JSON-RPC Protocol Flow

```
Step 1: Initialize Connection
─────────────────────────────

Frontend                                    Backend
   │                                           │
   │  {                                        │
   │    "jsonrpc": "2.0",                      │
   │    "id": 1,                               │
   │    "method": "initialize",                │
   │    "params": {                            │
   │      "protocolVersion": "2024-11-05"      │
   │    }                                      │
   │  }                                        │
   │──────────────────────────────────────────>│
   │                                           │
   │                                           │
   │  {                                        │
   │    "jsonrpc": "2.0",                      │
   │    "id": 1,                               │
   │    "result": {                            │
   │      "protocolVersion": "2024-11-05",     │
   │      "serverInfo": {                      │
   │        "name": "casemanager-mcp-server"   │
   │      }                                    │
   │    }                                      │
   │  }                                        │
   │<──────────────────────────────────────────│
   │                                           │


Step 2: List Available Tools
─────────────────────────────

Frontend                                    Backend
   │                                           │
   │  {                                        │
   │    "jsonrpc": "2.0",                      │
   │    "id": 2,                               │
   │    "method": "tools/list",                │
   │    "params": {}                           │
   │  }                                        │
   │──────────────────────────────────────────>│
   │                                           │
   │                                           │
   │  {                                        │
   │    "jsonrpc": "2.0",                      │
   │    "id": 2,                               │
   │    "result": {                            │
   │      "tools": [                           │
   │        {                                  │
   │          "name": "list_completable_cases",│
   │          "description": "Get cases..."    │
   │        }                                  │
   │      ]                                    │
   │    }                                      │
   │  }                                        │
   │<──────────────────────────────────────────│
   │                                           │


Step 3: Call a Tool
───────────────────

Frontend                                    Backend
   │                                           │
   │  {                                        │
   │    "jsonrpc": "2.0",                      │
   │    "id": 3,                               │
   │    "method": "tools/call",                │
   │    "params": {                            │
   │      "name": "list_completable_cases",    │
   │      "arguments": {                       │
   │        "userId": 1                        │
   │      }                                    │
   │    }                                      │
   │  }                                        │
   │──────────────────────────────────────────>│
   │                                           │
   │                         Query Database    │
   │                         Execute Logic     │
   │                                           │
   │  {                                        │
   │    "jsonrpc": "2.0",                      │
   │    "id": 3,                               │
   │    "result": {                            │
   │      "content": [                         │
   │        {                                  │
   │          "type": "text",                  │
   │          "text": "{\"cases\":[...],       │
   │                   \"count\":5}"           │
   │        }                                  │
   │      ]                                    │
   │    }                                      │
   │  }                                        │
   │<──────────────────────────────────────────│
   │                                           │
```

## Service Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Services                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ChatWidgetComponent                                       │
│   ├── depends on: McpClientService                          │
│   ├── depends on: ChatService                               │
│   └── depends on: AuthService                               │
│                                                             │
│   McpClientService                                          │
│   ├── depends on: HttpClient                                │
│   └── depends on: McpTransportService                       │
│                                                             │
│   McpTransportService                                       │
│   └── depends on: HttpClient                                │
│                                                             │
│   AuthService                                               │
│   └── depends on: HttpClient                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│   User   │────>│    UI    │────>│  Service │────>│    API   │
│          │     │          │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                 │
     │                │                 │                 │
     │    Action      │    Observable   │   HTTP/JSON-RPC │
     │                │                 │                 │
     ▼                ▼                 ▼                 ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Click   │     │ Display  │     │  Parse   │     │  Query   │
│  Tool    │     │ Result   │     │ Response │     │    DB    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Error Handling                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  McpTransportService                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  try {                                                 │ │
│  │    HTTP Request                                        │ │
│  │  } catch (NetworkError) {                              │ │
│  │    throw "Connection failed"                           │ │
│  │  }                                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                                                   │
│         ▼                                                   │
│  McpClientService                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  catchError(error => {                                 │ │
│  │    console.error(error);                               │ │
│  │    return fallbackData;                                │ │
│  │  })                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                                                   │
│         ▼                                                   │
│  Component                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  .subscribe({                                          │ │
│  │    next: (data) => { /* success */ },                 │ │
│  │    error: (error) => { /* show error to user */ }     │ │
│  │  })                                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Client State                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BehaviorSubject<Tool[]>                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Initial: []                                           │ │
│  │  After Init: [tool1, tool2]                            │ │
│  │  Subscribers notified on change                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  Component State                                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  mcpTools: McpTool[] = [];                             │ │
│  │  executingTool: string | null = null;                  │ │
│  │  isLoading: boolean = false;                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Legend

```
┌────────┐
│  Box   │  = Component/Service/Module
└────────┘

    │
    │      = Data flow / Dependency
    ▼

───────>   = Method call / HTTP request

<──────    = Response / Return value

• Bullet   = Feature / Capability
```
