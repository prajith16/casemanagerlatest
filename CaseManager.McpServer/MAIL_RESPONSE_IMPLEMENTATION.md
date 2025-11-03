# MCP Server - Mail Content Response Implementation

## Overview

Successfully implemented the `mail_content_response` MCP tool that generates AI-powered email responses.

## Implementation Details

### Components Created:

1. **Models**:

   - `MailContent.cs` - Represents incoming mail
   - `MailContentSent.cs` - Stores generated responses

2. **Service**:

   - `IMailContentService.cs` - Service interface
   - `MailContentService.cs` - Implementation with:
     - PDF content extraction using iText7
     - AI response generation using Semantic Kernel
     - Database integration with EF Core

3. **MCP Tool**:
   - Tool name: `mail_content_response`
   - Input: `contentId` (number)
   - Output: Generated formal email response

### How It Works:

1. **Receives contentId** as input parameter
2. **Queries MailContent** table to get the email details
3. **Loads PDF content** from `Casemanager.pdf` for context
4. **Generates AI response** using Semantic Kernel with:
   - System prompt emphasizing polite, formal, professional tone
   - PDF documentation as context
   - Original email content
5. **Saves response** to `MailContentSent` table with:
   - ResponseContent (text type)
   - ContentId (foreign key)
6. **Returns** the generated response

### AI Configuration:

The service supports both:

- **GitHub Models** (primary): Uses `gpt-4o` via Azure AI
- **Azure OpenAI** (fallback): Custom deployment

Configuration in `appsettings.json`:

```json
{
  "GitHubModels": {
    "ApiKey": "your-github-token-here",
    "ModelId": "gpt-4o"
  },
  "AzureOpenAI": {
    "Endpoint": "...",
    "ApiKey": "...",
    "DeploymentName": "..."
  }
}
```

### PDF Integration:

- Uses **iText7** library to extract text from PDF
- Tries multiple paths to locate `Casemanager.pdf`
- Includes full PDF content as context for AI

### Usage Example:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "mail_content_response",
    "arguments": {
      "contentId": 1
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{
        \"success\": true,
        \"message\": \"Mail response generated successfully\",
        \"contentId\": 1,
        \"response\": \"Dear [customer],\\n\\nThank you for contacting...\"
      }"
    }]
  }
}
```

### Dependencies Added:

- `Microsoft.SemanticKernel` (1.0.1)
- `itext7` (8.0.5)

### Database Changes:

- Added `MailContents` DbSet
- Added `MailContentSents` DbSet
- Foreign key relationship established

## Testing:

1. Ensure PDF file exists at expected location
2. Configure AI credentials in `appsettings.json`
3. Create a test mail content entry
4. Call the MCP tool with contentId
5. Verify response is saved in `MailContentSents` table

## Notes:

- Response generation is context-aware using PDF documentation
- Responses are formal, polite, and professional
- Each response is saved for audit/history purposes
- Temperature set to 0.7 for balanced creativity
- Max tokens: 1000 for comprehensive responses
