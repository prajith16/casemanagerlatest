# Dual-Behavior Chat Implementation Guide

## Overview

The chat widget now has **intelligent dual-behavior** that automatically:

1. **Creates cases** when users request to assign tasks/work
2. **Answers questions** about the Case Manager application

This is implemented using **Semantic Kernel's Function Calling (Auto-Invoke)** approach.

---

## Architecture

```
User Input → ChatController → AIService (Semantic Kernel)
                                    ↓
                          [AI Analyzes Intent]
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
        CreateCase Function              General Q&A Response
        (CaseManagementPlugin)           (Documentation-based)
                    ↓                               ↓
            Case Created in DB              Answer from Context
                    ↓                               ↓
            ✅ Confirmation Message        📖 Informative Response
```

---

## Implementation Details

### 1. **CaseManagementPlugin** (Already Existed, Enhanced)

**Location:** `CaseManager.Api/Services/CaseManagementPlugin.cs`

**Functions Available to AI:**

- `CreateCase(caseName, assignedUsername)` - Creates a new case
- `GetUserByUsername(username)` - Looks up a user
- `ListAllUsers()` - Lists all users
- `GetCaseById(caseId)` - Gets case details

**Key Feature:** The `CreateCase` function has detailed descriptions that guide the AI on when to invoke it:

```csharp
[KernelFunction, Description("Creates a new case in the Case Manager system. Use this function when a user asks to: create a case, create a task, assign a task, assign a case, set up an action item, make a new case, add a case, or any variation of creating work for someone.")]
```

### 2. **Enhanced AIService**

**Location:** `CaseManager.Api/Services/AIService.cs`

**Changes Made:**

- ✅ Registered `CaseManagementPlugin` with Semantic Kernel
- ✅ Enabled automatic function calling with `ToolCallBehavior.AutoInvokeKernelFunctions`
- ✅ Updated system prompt to guide AI on function usage
- ✅ Added dependency injection for the plugin

**Key Code:**

```csharp
// Register the plugin
_kernel.Plugins.AddFromObject(_caseManagementPlugin, "CaseManagement");

// Enable auto function calling
var executionSettings = new OpenAIPromptExecutionSettings
{
    ToolCallBehavior = ToolCallBehavior.AutoInvokeKernelFunctions,
    Temperature = 0.7,
    MaxTokens = 2000
};
```

### 3. **Updated ChatResponse Model**

**Location:** `CaseManager.Api/Models/ChatResponse.cs`

**New Properties:**

- `CaseCreated` - Boolean indicating if a case was created
- `CreatedCaseId` - ID of the created case
- `CreatedCaseName` - Name of the created case
- `FunctionsInvoked` - List of functions called during the interaction

**Benefits:** Frontend can detect case creation and update UI accordingly

### 4. **Enhanced ChatController**

**Location:** `CaseManager.Api/Controllers/ChatController.cs`

**Changes Made:**

- ✅ Parses AI responses to detect case creation
- ✅ Extracts case ID and name from response
- ✅ Returns structured metadata in response

**Detection Logic:**

```csharp
if (response.Contains("✅ Successfully created case"))
{
    chatResponse.CaseCreated = true;
    // Extract case ID and name using regex
}
```

---

## How It Works

### Example 1: Creating a Case

**User Input:**

```
"Create a case to review Q1 budget assigned to jsmith"
```

**AI Behavior:**

1. Analyzes the message and detects case creation intent
2. Automatically calls `CreateCase("review Q1 budget", "jsmith")`
3. Function looks up user "jsmith" → finds user
4. Function creates case in database
5. Function returns success message
6. AI incorporates this into natural response

**Response:**

```json
{
  "message": "✅ Successfully created case 'review Q1 budget' (Case ID: 42). Assigned to: John Smith (jsmith).",
  "sessionId": "abc-123",
  "timestamp": "2025-10-23T10:30:00Z",
  "caseCreated": true,
  "createdCaseId": 42,
  "createdCaseName": "review Q1 budget"
}
```

### Example 2: Answering a Question

**User Input:**

```
"How do I create a new user in the system?"
```

**AI Behavior:**

1. Analyzes the message → no function needed
2. Searches documentation for user creation info
3. Returns informative answer

**Response:**

```json
{
  "message": "To create a new user in Case Manager, navigate to the Users module and click the 'Add User' button. Fill in the required fields: Username, First Name, Last Name, and Address. Click Save to create the user.",
  "sessionId": "abc-123",
  "timestamp": "2025-10-23T10:31:00Z",
  "caseCreated": false
}
```

### Example 3: Invalid User

**User Input:**

```
"Assign a task to fix printer to invaliduser"
```

**AI Behavior:**

1. Detects case creation intent
2. Calls `CreateCase("fix printer", "invaliduser")`
3. Function attempts user lookup → not found
4. Function returns error message
5. AI relays this to user naturally

**Response:**

```json
{
  "message": "Error: Could not find user with username 'invaliduser'. Please check the username and try again.",
  "sessionId": "abc-123",
  "timestamp": "2025-10-23T10:32:00Z",
  "caseCreated": false
}
```

---

## Supported User Intents for Case Creation

The AI recognizes various phrasings:

- ✅ "Create a case for..."
- ✅ "Assign a task to..."
- ✅ "Make a new ticket for..."
- ✅ "Set up an action item for..."
- ✅ "Create work for..."
- ✅ "Add a case for..."
- ✅ "Can you create a task..."

**Natural Language Examples:**

```
"Create a case to send monthly report assigned to alice"
"Assign a task to bob for reviewing documents"
"Make a new ticket for charlie to fix the server"
"Set up a case for dana to approve the budget"
```

---

## Benefits of This Approach

### 1. **Natural Conversation Flow**

Users don't need to learn specific commands or syntax. They can speak naturally.

### 2. **Automatic Parameter Extraction**

The AI extracts:

- Task description (case name)
- Assigned user (username)
- Handles variations in phrasing

### 3. **Intelligent Routing**

AI automatically decides:

- When to create a case (action required)
- When to answer from documentation (information request)

### 4. **Error Handling**

Built-in validation:

- User existence checks
- Clear error messages
- Fallback to Q&A if unclear

### 5. **Extensible**

Easy to add more functions:

- Complete cases
- Update cases
- Assign cases to multiple users
- Create users

### 6. **Context Awareness**

Maintains conversation history, allowing:

- Follow-up questions
- Reference to previous cases
- Multi-turn interactions

---

## Frontend Integration

The Angular chat widget can now:

1. **Detect Case Creation:**

```typescript
if (response.caseCreated) {
  // Show success notification
  // Refresh case list
  // Highlight new case
}
```

2. **Handle Different Response Types:**

```typescript
if (response.caseCreated && response.createdCaseId) {
  this.showNotification(`Case #${response.createdCaseId} created!`);
  this.refreshCases();
} else {
  // Just display the informational response
  this.displayMessage(response.message);
}
```

3. **Provide Rich Feedback:**

```html
<div *ngIf="response.caseCreated" class="success-banner">
  ✅ Case Created:
  <a [routerLink]="['/cases', response.createdCaseId]">
    {{ response.createdCaseName }}
  </a>
</div>
```

---

## Testing the Implementation

### Test Cases:

#### 1. **Simple Case Creation**

```
Input: "Create a case to review budget for jsmith"
Expected: Case created successfully
```

#### 2. **Multiple Variations**

```
Input: "Assign a task to alice for fixing printer"
Input: "Make a new ticket for bob to send report"
Input: "Set up a case for charlie to verify documents"
Expected: All create cases successfully
```

#### 3. **Invalid User**

```
Input: "Create a case for nonexistentuser"
Expected: Error message about user not found
```

#### 4. **General Questions**

```
Input: "How do I create a user?"
Input: "What is Case Manager?"
Input: "How does authentication work?"
Expected: Informational responses from documentation
```

#### 5. **Mixed Conversation**

```
Input 1: "What is a case?"
Response: Informational answer
Input 2: "Create one for alice to review docs"
Response: Case created (AI understands context)
```

---

## Configuration

### Required Settings (appsettings.json):

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://your-resource.openai.azure.com",
    "ApiKey": "your-api-key",
    "DeploymentName": "gpt-4o"
  },
  "GitHubModels": {
    "ApiKey": "your-github-token",
    "ModelId": "gpt-4o"
  }
}
```

**Note:** The system tries Azure OpenAI first, then falls back to GitHub Models.

---

## Logging

All function calls are logged:

```
[INFO] CreateCase function called - CaseName: 'review budget', AssignedTo: 'jsmith'
[INFO] Looking up assigned user: jsmith
[INFO] Found assigned user: John Smith (ID: 1)
[INFO] Creating case with AssignedUserId=1
[INFO] Case created successfully - CaseId: 42, CaseName: review budget
[INFO] Broadcasted case creation notification - CaseId: 42, AssignedUserId: 1
```

---

## Future Enhancements

### Potential Additions:

1. **Regarding Field Support**

   - Add optional `regardingUsername` parameter
   - Track who requested the case

2. **Priority Levels**

   - Extract urgency from user message
   - Set case priority automatically

3. **Due Dates**

   - Parse temporal expressions ("by tomorrow", "end of week")
   - Set case deadlines

4. **Bulk Operations**

   - Create multiple cases at once
   - Assign to teams

5. **Case Templates**

   - Recognize common case types
   - Apply predefined templates

6. **Completion via Chat**
   - "Mark case 42 as complete"
   - Update case status through conversation

---

## Summary

✅ **Implemented:** Dual-behavior chat using Semantic Kernel Function Calling
✅ **Case Creation:** Automatic via natural language
✅ **Q&A:** Documentation-based responses
✅ **User Lookup:** Automatic username resolution
✅ **Error Handling:** Graceful validation and messages
✅ **Metadata Tracking:** Frontend can detect case creation
✅ **Extensible:** Easy to add more functions

The chat widget is now a powerful, intelligent assistant that can both answer questions and take actions in the Case Manager system!
