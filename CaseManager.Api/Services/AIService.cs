using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;
using System.Collections.Concurrent;
using System.Text;
using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// AI Service implementation using Semantic Kernel and Azure OpenAI
/// </summary>
public class AIService : IAIService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletionService;
    private readonly ILogger<AIService> _logger;
    private readonly string _documentationContent;
    private readonly ConcurrentDictionary<string, ChatHistory> _sessionHistories;
    private const int MaxHistoryMessages = 20;

    public AIService(IConfiguration configuration, ILogger<AIService> logger)
    {
        _logger = logger;
        _sessionHistories = new ConcurrentDictionary<string, ChatHistory>();

        // Load documentation content - try multiple paths
        var possiblePaths = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "CASE_MANAGER_DOCUMENTATION.txt"),
            Path.Combine(Directory.GetCurrentDirectory(), "CASE_MANAGER_DOCUMENTATION.txt"),
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "CASE_MANAGER_DOCUMENTATION.txt")
        };

        string? docPath = possiblePaths.FirstOrDefault(File.Exists);

        if (docPath != null)
        {
            _documentationContent = File.ReadAllText(docPath);
            _logger.LogInformation("Loaded documentation from {Path} with {Length} characters", docPath, _documentationContent.Length);
        }
        else
        {
            _documentationContent = "Documentation not found.";
            _logger.LogWarning("Documentation file not found. Tried paths: {Paths}", string.Join(", ", possiblePaths));
        }

        // Try Azure OpenAI first, fall back to GitHub Models
        var azureEndpoint = configuration["AzureOpenAI:Endpoint"];
        var azureApiKey = configuration["AzureOpenAI:ApiKey"];
        var azureDeployment = configuration["AzureOpenAI:DeploymentName"];
        var githubApiKey = configuration["GitHubModels:ApiKey"];
        var githubModelId = configuration["GitHubModels:ModelId"];

        var builder = Kernel.CreateBuilder();

        // Try Azure OpenAI configuration
        if (!string.IsNullOrEmpty(azureEndpoint) &&
            !string.IsNullOrEmpty(azureApiKey) &&
            !azureApiKey.Contains("your-azure-openai") &&
            !string.IsNullOrEmpty(azureDeployment))
        {
            try
            {
                builder.AddAzureOpenAIChatCompletion(
                    deploymentName: azureDeployment,
                    endpoint: azureEndpoint,
                    apiKey: azureApiKey);

                _logger.LogInformation("Configured Azure OpenAI with deployment: {Deployment}", azureDeployment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to configure Azure OpenAI, trying GitHub Models");
                ConfigureGitHubModels(builder, githubApiKey, githubModelId);
            }
        }
        // Fall back to GitHub Models
        else if (!string.IsNullOrEmpty(githubApiKey) && !githubApiKey.Contains("your-github"))
        {
            ConfigureGitHubModels(builder, githubApiKey, githubModelId);
        }
        else
        {
            throw new InvalidOperationException(
                "No valid AI configuration found. Please configure either AzureOpenAI or GitHubModels in appsettings.json");
        }

        _kernel = builder.Build();
        _chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();
    }

    private void ConfigureGitHubModels(IKernelBuilder builder, string? apiKey, string? modelId)
    {
        if (string.IsNullOrEmpty(apiKey) || apiKey.Contains("your-github"))
        {
            throw new InvalidOperationException("GitHub Models API key not configured");
        }

        // GitHub Models uses Azure OpenAI-compatible API with specific endpoint format
        var endpoint = "https://models.inference.ai.azure.com";
        var model = modelId ?? "gpt-4o";

        builder.AddAzureOpenAIChatCompletion(
            deploymentName: model,
            endpoint: endpoint,
            apiKey: apiKey,
            modelId: model);

        _logger.LogInformation("Configured GitHub Models with model: {Model} at {Endpoint}", model, endpoint);
    }

    public async Task<string> ChatAsync(string message, string sessionId, Action<string>? onChunkReceived = null)
    {
        try
        {
            var history = GetOrCreateHistory(sessionId);

            // Add user message to history
            history.AddUserMessage(message);

            // Log user message
            _logger.LogInformation("User message in session {SessionId}: {Message}",
                sessionId, message.Length > 100 ? message.Substring(0, 100) + "..." : message);

            // Get streaming response
            var responseBuilder = new StringBuilder();

            await foreach (var chunk in _chatCompletionService.GetStreamingChatMessageContentsAsync(history))
            {
                var content = chunk.Content;
                if (!string.IsNullOrEmpty(content))
                {
                    responseBuilder.Append(content);
                    onChunkReceived?.Invoke(content);
                }
            }

            var fullResponse = responseBuilder.ToString();

            // Add assistant response to history
            history.AddAssistantMessage(fullResponse);

            // Trim history if too long
            TrimHistory(history);

            _logger.LogInformation("AI response in session {SessionId}: {Length} characters",
                sessionId, fullResponse.Length);

            return fullResponse;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ChatAsync for session {SessionId}", sessionId);
            throw;
        }
    }

    public List<ChatMessage> GetChatHistory(string sessionId)
    {
        if (_sessionHistories.TryGetValue(sessionId, out var history))
        {
            return history.Select(h => new ChatMessage
            {
                Role = h.Role.ToString().ToLower(),
                Content = h.Content ?? string.Empty,
                Timestamp = DateTime.UtcNow
            }).ToList();
        }

        return new List<ChatMessage>();
    }

    public void ClearChatHistory(string sessionId)
    {
        _sessionHistories.TryRemove(sessionId, out _);
        _logger.LogInformation("Cleared chat history for session {SessionId}", sessionId);
    }

    private ChatHistory GetOrCreateHistory(string sessionId)
    {
        return _sessionHistories.GetOrAdd(sessionId, _ =>
        {
            var history = new ChatHistory();

            // Add system prompt with documentation
            var systemPrompt = $@"You are the Digital Worker, an AI assistant for the Case Manager application. 
You help users understand and use the Case Manager system effectively.

Here is the complete documentation for the Case Manager application:

{_documentationContent}

Your responsibilities:
1. Answer questions about the Case Manager application features and functionality
2. Explain how to create users, cases, and task actions
3. Help users understand authentication and authorization
4. Clarify business processes and workflows
5. Provide troubleshooting assistance
6. Guide users through the application features

Always be helpful, professional, and reference the documentation when answering questions.
Keep responses concise but informative. If you don't know something, say so honestly.";

            history.AddSystemMessage(systemPrompt);

            _logger.LogInformation("Created new chat history for session {SessionId}", sessionId);
            return history;
        });
    }

    private void TrimHistory(ChatHistory history)
    {
        // Keep system message + last N messages
        if (history.Count > MaxHistoryMessages + 1)
        {
            var systemMessage = history.FirstOrDefault();
            var recentMessages = history.Skip(history.Count - MaxHistoryMessages).ToList();

            history.Clear();
            if (systemMessage != null)
            {
                history.Add(systemMessage);
            }
            foreach (var msg in recentMessages)
            {
                history.Add(msg);
            }

            _logger.LogInformation("Trimmed chat history to {Count} messages", history.Count);
        }
    }
}
