# AI Chat Configuration

## Overview

The Case Manager application now includes an AI-powered chat assistant called "Digital Worker" that uses Semantic Kernel with Azure OpenAI or GitHub Models to answer questions about the application.

## Features

- Real-time streaming responses via SignalR
- Chat history tracking per session
- Context-aware responses using documentation
- Supports both Azure OpenAI and GitHub Models

## Configuration

### Option 1: Azure OpenAI (Recommended for Production)

Update `appsettings.json` with your Azure OpenAI credentials:

```json
"AzureOpenAI": {
  "Endpoint": "https://your-resource-name.openai.azure.com/",
  "ApiKey": "your-azure-openai-api-key-here",
  "DeploymentName": "gpt-4",
  "ModelId": "gpt-4"
}
```

**Steps to get Azure OpenAI credentials:**

1. Go to Azure Portal (https://portal.azure.com)
2. Create or select an Azure OpenAI resource
3. Go to "Keys and Endpoint" section
4. Copy the endpoint URL and API key
5. Deploy a model (e.g., gpt-4 or gpt-35-turbo)
6. Note the deployment name

### Option 2: GitHub Models (Free Tier Available)

Update `appsettings.json` with your GitHub Models API key:

```json
"GitHubModels": {
  "ApiKey": "your-github-models-api-key-here",
  "ModelId": "gpt-4o"
}
```

**Steps to get GitHub Models API key:**

1. Go to https://github.com/settings/tokens
2. Generate a new personal access token with "models" scope
3. Or use GitHub Copilot API key if you have access
4. Copy the token and paste it in appsettings.json

**Available Models:**

- gpt-4o (recommended)
- gpt-4o-mini
- gpt-4
- gpt-3.5-turbo

## API Endpoints

### POST /api/Chat

Send a chat message and receive AI response.

**Request:**

```json
{
  "message": "How do I create a new case?",
  "sessionId": "optional-session-id"
}
```

**Response:**

```json
{
  "message": "AI response here...",
  "sessionId": "uuid-session-id",
  "timestamp": "2025-10-22T12:00:00Z"
}
```

**Headers:**

- Authorization: Bearer {jwt-token}

### GET /api/Chat/history/{sessionId}

Get chat history for a specific session.

### DELETE /api/Chat/history/{sessionId}

Clear chat history for a specific session.

## SignalR Hub

**Hub URL:** `/chatHub`

**Events:**

- `ReceiveMessageChunk` - Receives streaming response chunks
- `ReceiveMessageComplete` - Notifies when response is complete

**Connection:**

```javascript
const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5226/chatHub", {
    accessTokenFactory: () => localStorage.getItem("auth_token"),
  })
  .build();

connection.on("ReceiveMessageChunk", (sessionId, chunk) => {
  console.log("Chunk:", chunk);
});

connection.on("ReceiveMessageComplete", (sessionId) => {
  console.log("Message complete");
});

await connection.start();
```

## Testing the Chat API

### Using curl:

```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:5226/api/Authorization/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jdoe"}' | jq -r '.token')

# Send chat message
curl -X POST http://localhost:5226/api/Chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"What is the Case Manager application?","sessionId":"test-session-1"}'
```

### Using Swagger:

1. Navigate to http://localhost:5226/swagger
2. Click "Authorize" button
3. Login via /api/Authorization/login to get token
4. Enter token in format: `Bearer {your-token}`
5. Try the /api/Chat endpoint

## How It Works

1. **User sends message** via POST /api/Chat
2. **AI Service** loads documentation and chat history
3. **Semantic Kernel** processes the request with Azure OpenAI/GitHub Models
4. **Streaming Response** sent via SignalR in real-time chunks
5. **Chat History** saved for context in future messages
6. **Complete response** returned in HTTP response

## Chat History Management

- Each session maintains its own conversation history
- System prompt includes full documentation for context
- History limited to last 20 messages to manage token usage
- Users can clear history via DELETE endpoint

## Documentation Context

The AI assistant has access to the complete Case Manager documentation (`CASE_MANAGER_DOCUMENTATION.txt`) which includes:

- Application features and architecture
- User guides for creating users, cases, and tasks
- API endpoint specifications
- Authentication and authorization details
- Troubleshooting guides
- Business rules and workflows

## Troubleshooting

### "No valid AI configuration found"

- Ensure either AzureOpenAI or GitHubModels section is properly configured in appsettings.json
- API keys must not contain placeholder text like "your-azure-openai-api-key-here"

### SignalR connection fails

- Check CORS configuration allows credentials
- Ensure JWT token is passed in query string: `?access_token={token}`
- Verify backend is running on correct port (5226)

### Documentation not loaded

- Ensure `CASE_MANAGER_DOCUMENTATION.txt` exists in the API project root
- Check file is copied to output directory on build
- Verify file path in logs

### Rate limiting errors

- GitHub Models has rate limits on free tier
- Consider using Azure OpenAI for production
- Implement retry logic with exponential backoff

## Security Notes

- All chat endpoints require JWT authentication
- API keys should be stored in environment variables or Azure Key Vault in production
- Never commit API keys to source control
- Use Azure Managed Identity when deploying to Azure

## Future Enhancements

- Multi-language support
- Voice input/output
- File upload analysis
- Integration with case data for contextual answers
- Custom prompts per user role
- Analytics and feedback collection
