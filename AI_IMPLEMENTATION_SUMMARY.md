# AI Chat Implementation Summary

## What Was Created

### 1. NuGet Packages Added

- **Microsoft.SemanticKernel** (v1.30.0) - AI orchestration framework
- **Microsoft.AspNetCore.SignalR** (v1.1.0) - Real-time communication

### 2. Configuration (appsettings.json)

Added two AI provider configurations:

- **AzureOpenAI**: Endpoint, ApiKey, DeploymentName, ModelId
- **GitHubModels**: ApiKey, ModelId

### 3. Models Created

- `ChatMessage.cs` - Represents a single message in conversation
- `ChatRequest.cs` - Request model for chat endpoint
- `ChatResponse.cs` - Response model from chat endpoint

### 4. Service Layer

**IAIService.cs / AIService.cs**

- Implements Semantic Kernel integration
- Manages chat history per session (concurrent dictionary)
- Loads documentation content into system prompt
- Supports streaming responses
- Auto-trims history to last 20 messages
- Falls back from Azure OpenAI to GitHub Models

Key Features:

- `ChatAsync()` - Process messages with streaming support
- `GetChatHistory()` - Retrieve conversation history
- `ClearChatHistory()` - Reset session

### 5. SignalR Hub

**ChatHub.cs**

- Real-time WebSocket communication
- Events: `ReceiveMessageChunk`, `ReceiveMessageComplete`
- Supports streaming AI responses to frontend

### 6. API Controller

**ChatController.cs**

- Inherits from BaseController (requires JWT authentication)
- POST `/api/Chat` - Send message, get response
- GET `/api/Chat/history/{sessionId}` - Get history
- DELETE `/api/Chat/history/{sessionId}` - Clear history
- Integrates with SignalR for real-time streaming

### 7. Program.cs Updates

- Registered AIService as Singleton
- Added SignalR services
- Updated CORS to allow credentials (required for SignalR)
- Mapped ChatHub to `/chatHub` endpoint
- Added JWT authentication for SignalR (query string token)

### 8. Documentation

- **CASE_MANAGER_DOCUMENTATION.txt** - Comprehensive app documentation for AI context
- **AI_CHAT_README.md** - Configuration and usage guide
- **test-chat.sh** - Test script for API endpoints

## How It Works

### Flow Diagram

```
User → ChatController → AIService → Semantic Kernel → Azure OpenAI/GitHub Models
                           ↓
                      ChatHistory (ConcurrentDictionary)
                           ↓
                      SignalR Hub → Frontend (real-time chunks)
```

### Request Flow

1. User sends POST request with message and optional sessionId
2. ChatController authenticates via JWT (CurrentUser context)
3. AIService retrieves or creates chat history for session
4. Documentation content included in system prompt
5. Semantic Kernel sends request to AI provider
6. Response streamed in chunks via SignalR
7. Complete response returned in HTTP response
8. History updated with user message and AI response

### Session Management

- Each user conversation has unique sessionId (GUID)
- Chat history stored in memory (ConcurrentDictionary)
- System prompt includes full documentation on first message
- History limited to 20 messages + system prompt
- Users can clear history or start new session

### AI Provider Selection

Priority order:

1. **Azure OpenAI** - If endpoint, apiKey, and deployment configured
2. **GitHub Models** - Fallback if Azure not configured
3. **Error** - If neither configured properly

## Configuration Required

### For Azure OpenAI:

```json
"AzureOpenAI": {
  "Endpoint": "https://your-resource.openai.azure.com/",
  "ApiKey": "actual-api-key",
  "DeploymentName": "gpt-4",
  "ModelId": "gpt-4"
}
```

### For GitHub Models:

```json
"GitHubModels": {
  "ApiKey": "github-token-with-models-scope",
  "ModelId": "gpt-4o"
}
```

## API Endpoints

### POST /api/Chat

```bash
curl -X POST http://localhost:5226/api/Chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"message":"How do I create a case?","sessionId":"optional-session-id"}'
```

Response:

```json
{
  "message": "To create a case in the Case Manager application...",
  "sessionId": "uuid-here",
  "timestamp": "2025-10-22T12:00:00Z"
}
```

### GET /api/Chat/history/{sessionId}

Returns array of ChatMessage objects for the session.

### DELETE /api/Chat/history/{sessionId}

Clears conversation history for the session.

## SignalR Integration

### Connection

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5226/chatHub", {
    accessTokenFactory: () => localStorage.getItem("auth_token"),
  })
  .build();
```

### Event Handlers

```javascript
connection.on("ReceiveMessageChunk", (sessionId, chunk) => {
  // Append chunk to UI in real-time
  appendToMessage(chunk);
});

connection.on("ReceiveMessageComplete", (sessionId) => {
  // Message complete, finalize UI
  finalizeMessage();
});
```

## Security Features

1. **JWT Authentication Required**

   - All endpoints require valid JWT token
   - Token passed via Authorization header or query string (SignalR)
   - CurrentUser context available in controller

2. **CORS Configuration**

   - Restricted to localhost:4200
   - Credentials allowed for SignalR
   - Configurable for production

3. **API Key Protection**
   - Keys stored in appsettings.json
   - Should use environment variables or Azure Key Vault in production
   - Never commit real keys to source control

## Testing

### Manual Test

```bash
# Run the test script
./test-chat.sh
```

### Via Swagger

1. Navigate to http://localhost:5226/swagger
2. Login to get JWT token
3. Authorize with token
4. Test /api/Chat endpoint

### Via Postman

Import these requests:

- POST /api/Authorization/login
- POST /api/Chat
- GET /api/Chat/history/{sessionId}
- DELETE /api/Chat/history/{sessionId}

## Next Steps for Frontend Integration

### 1. Install SignalR Client

```bash
npm install @microsoft/signalr
```

### 2. Create Chat Service

```typescript
export class ChatService {
  private connection: signalR.HubConnection;

  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5226/chatHub", {
        accessTokenFactory: () => localStorage.getItem("auth_token"),
      })
      .build();
  }

  async sendMessage(message: string, sessionId: string) {
    return this.http.post("/api/Chat", { message, sessionId });
  }
}
```

### 3. Create Chat Component

- Chat input field
- Message display area
- Streaming response animation
- Session management
- History loading

## Benefits

1. **Real-Time Experience**

   - Streaming responses via SignalR
   - No waiting for complete response
   - Better user experience

2. **Context Awareness**

   - Full documentation in AI context
   - Conversation history maintained
   - Accurate, application-specific answers

3. **Flexible AI Provider**

   - Supports Azure OpenAI (production)
   - Supports GitHub Models (development/testing)
   - Easy to switch providers

4. **Scalable Architecture**

   - Semantic Kernel abstracts AI complexity
   - Session-based history management
   - Ready for horizontal scaling

5. **Secure**
   - JWT authentication required
   - User context tracked
   - CORS protection

## Troubleshooting

### Build Errors

- Ensure .NET 8.0 SDK installed
- Run `dotnet restore` to fetch packages
- Check NuGet package versions compatible

### Runtime Errors

- Configure AI provider keys in appsettings.json
- Ensure documentation file exists and is copied to output
- Check CORS settings match frontend URL
- Verify JWT token is valid and not expired

### SignalR Connection Issues

- Enable credentials in CORS policy
- Pass token in query string for SignalR
- Check browser console for connection errors
- Verify hub endpoint mapped correctly

## Performance Considerations

1. **Memory Usage**

   - Chat history stored in-memory
   - Consider Redis for production scaling
   - History auto-trimmed to 20 messages

2. **Token Limits**

   - Documentation is ~15,000 characters
   - Monitor token usage with AI provider
   - Consider chunking documentation if needed

3. **Rate Limiting**
   - GitHub Models has free tier limits
   - Implement retry logic with backoff
   - Use Azure OpenAI for production

## File Structure

```
CaseManager.Api/
├── Controllers/
│   └── ChatController.cs
├── Services/
│   ├── IAIService.cs
│   └── AIService.cs
├── Models/
│   ├── ChatMessage.cs
│   ├── ChatRequest.cs
│   └── ChatResponse.cs
├── Hubs/
│   └── ChatHub.cs
├── CASE_MANAGER_DOCUMENTATION.txt
├── AI_CHAT_README.md
└── appsettings.json (updated)

Root/
└── test-chat.sh
```

## Success Metrics

✅ Build succeeds with no errors
✅ Semantic Kernel and SignalR packages installed
✅ AI service registered and injectable
✅ Chat endpoints exposed in Swagger
✅ SignalR hub mapped and accessible
✅ Documentation loaded into AI context
✅ JWT authentication enforced
✅ CORS configured for SignalR
✅ Test script provided

## Status: READY FOR TESTING

The implementation is complete. Configure AI provider keys in appsettings.json and start testing!
