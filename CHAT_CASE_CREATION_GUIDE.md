# Chat Widget - AI-Powered Case Creation

## Overview

The chat widget now supports **AI-powered case creation** using Semantic Kernel function calling. Users can create cases naturally by chatting with the Digital Worker, which will automatically detect intent and create cases with proper user assignments.

**NEW: Real-time Updates** - When a case is created via chat:

- ✅ The case grid automatically refreshes to show the new case
- ✅ If the case is assigned to the logged-in user, they receive an in-chat notification
- ✅ Updates are broadcast via SignalR to all connected clients

## Implementation Details

### Architecture

- **Semantic Kernel Function Calling**: The AI automatically detects when users want to create cases and invokes the appropriate functions
- **CaseManagementPlugin**: A plugin with KernelFunctions that the AI can call to perform operations
- **Automatic User Lookup**: The system looks up users by username and creates cases with proper IDs
- **SignalR Real-time Updates**: Case creation events are broadcast to all connected clients
- **Automatic UI Refresh**: The case grid listens for case creation events and refreshes automatically
- **User Notifications**: Assigned users receive in-chat notifications when cases are created for them

### Components Added

1. **CaseManagementPlugin** (`Services/CaseManagementPlugin.cs`)

   - `CreateCase()` - Creates a case with assigned and regarding users
   - `GetUserByUsername()` - Looks up users by username
   - `ListAllUsers()` - Lists all available users
   - `GetCaseById()` - Gets case details

2. **IUserService Extension** (`Services/IUserService.cs`)

   - `GetUserByUsernameAsync()` - New method to find users by username

3. **Updated AIService** (`Services/AIService.cs`)
   - Registers CaseManagementPlugin with the kernel
   - Enables `AutoInvokeKernelFunctions` for automatic function calling
   - Creates scoped plugin instances per request

## Usage Examples

### Example 1: Natural Language Case Creation

**User:** "Create a case for jdoe to review timesheet for asmith"

**AI Response:**

```
✅ Successfully created case 'review timesheet' (Case ID: 4).
Assigned to: John Doe (jdoe).
Regarding: Alice Smith (asmith).
```

### Example 2: More Formal Request

**User:** "I need to assign a task to bjones regarding jdoe to verify documents"

**AI Response:**

```
✅ Successfully created case 'verify documents' (Case ID: 5).
Assigned to: Bob Jones (bjones).
Regarding: John Doe (jdoe).
```

### Example 3: Full Case Description

**User:** "Make a new case called 'Budget Review for Q4' assigned to asmith about bjones"

**AI Response:**

```
✅ Successfully created case 'Budget Review for Q4' (Case ID: 6).
Assigned to: Alice Smith (asmith).
Regarding: Bob Jones (bjones).
```

### Example 4: List Available Users First

**User:** "Who can I assign cases to?"

**AI Response:**

```
Available users in the system:
- John Doe (Username: jdoe, ID: 1)
- Alice Smith (Username: asmith, ID: 2)
- Bob Jones (Username: bjones, ID: 3)
```

**User:** "Create a case for asmith to contact bjones"

**AI Response:**

```
✅ Successfully created case 'contact bjones' (Case ID: 7).
Assigned to: Alice Smith (asmith).
Regarding: Bob Jones (bjones).
```

## Error Handling

The system handles various error cases gracefully:

### Invalid Username

**User:** "Create a case for invalid_user regarding jdoe"

**AI Response:**

```
Error: Could not find user with username 'invalid_user'. Please check the username and try again.
```

### Both Users Invalid

**User:** "Assign task to user1 about user2"

**AI Response:**

```
Error: Could not find user with username 'user1'. Please check the username and try again.
```

## Available Usernames (Default Seed Data)

- `jdoe` - John Doe
- `asmith` - Alice Smith
- `bjones` - Bob Jones

## Technical Details

### Function Calling Flow

1. User sends message via chat widget
2. AIService receives message and adds to chat history
3. Semantic Kernel analyzes the message
4. AI detects intent to create a case
5. AI automatically calls `CreateCase` function with extracted parameters
6. Function validates users exist via `GetUserByUsernameAsync`
7. Function creates case via `CaseService.CreateCaseAsync`
8. **Function broadcasts SignalR event with case details**
9. Function returns success message
10. AI incorporates result into conversational response
11. Response streamed back to user

### Real-time Update Flow

1. `CaseManagementPlugin.CreateCase()` creates the case in the database
2. Plugin broadcasts `CaseCreated` event via SignalR to all connected clients
3. **Frontend (ChatService)** receives the event
4. **ChatWidgetComponent** processes the event:
   - Calls `CaseUpdateService.notifyCaseUpdate()` to refresh the grid
   - If assigned to current user, shows in-chat notification
   - Flashes the chat icon to draw attention
5. **CaseListComponent** (already listening to `CaseUpdateService`) refreshes the grid
6. New case appears in the grid immediately without manual refresh

### SignalR Event Payload

```typescript
{
  caseId: number,
  caseName: string,
  assignedUserId: number,
  assignedUserName: string,
  timestamp: Date
}
```

### Execution Settings

```csharp
var executionSettings = new OpenAIPromptExecutionSettings
{
    ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
    Temperature = 0.7,
    MaxTokens = 2000
};
```

### Plugin Registration

```csharp
// Create a scope to get the case management plugin
using var scope = _serviceProvider.CreateScope();
var plugin = scope.ServiceProvider.GetRequiredService<CaseManagementPlugin>();

// Create a kernel with the plugin for this request
var kernelWithPlugin = _kernel.Clone();
kernelWithPlugin.Plugins.AddFromObject(plugin, "CaseManagement");
```

## Benefits

✅ **Natural Language Understanding** - Users don't need to follow rigid syntax
✅ **Automatic Parameter Extraction** - AI extracts usernames and descriptions from natural text
✅ **Conversational** - Feels like talking to a helpful assistant
✅ **Error Handling** - Clear error messages when users don't exist
✅ **Extensible** - Easy to add more functions (delete cases, update cases, etc.)
✅ **Context Aware** - Can reference previous conversation context
✅ **Real-time Updates** - Case grid refreshes automatically via SignalR
✅ **User Notifications** - Assigned users are notified immediately in chat
✅ **Multi-user Support** - All connected clients see updates instantly

## Future Enhancements

Potential additional functions to add:

- `UpdateCase()` - Modify existing cases
- `DeleteCase()` - Remove cases
- `CompleteCase()` - Mark cases as complete
- `AssignTaskAction()` - Add task actions to cases
- `GetMyCases()` - Get cases assigned to current user
- `SearchCases()` - Search cases by criteria

## Testing

To test the implementation:

1. Start the API: `dotnet run --project CaseManager.Api`
2. Start the frontend: `cd CaseManager.web && npm start`
3. Login to the application
4. Open the chat widget
5. Try the example commands above

You can verify case creation by:

- Checking the response in the chat
- Navigating to the Cases page
- Using Swagger UI to query `/api/Cases`
