using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using CaseManager.McpServer.Data;
using CaseManager.McpServer.Models;

namespace CaseManager.McpServer.Services;

/// <summary>
/// Service for generating AI-powered mail responses
/// </summary>
public class MailContentService : IMailContentService
{
    private readonly CaseManagerDbContext _context;
    private readonly ILogger<MailContentService> _logger;
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatCompletionService;
    private readonly string _pdfContent;

    public MailContentService(
        CaseManagerDbContext context,
        ILogger<MailContentService> logger,
        IConfiguration configuration)
    {
        _context = context;
        _logger = logger;

        // Load PDF content
        _pdfContent = LoadPdfContent();

        // Initialize Semantic Kernel
        var builder = Kernel.CreateBuilder();

        // Try GitHub Models configuration
        var githubApiKey = configuration["GitHubModels:ApiKey"];
        var githubModelId = configuration["GitHubModels:ModelId"] ?? "gpt-4o";

        if (!string.IsNullOrEmpty(githubApiKey) && !githubApiKey.Contains("your-github"))
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("https://models.inference.ai.azure.com")
            };

            builder.AddOpenAIChatCompletion(
                modelId: githubModelId,
                apiKey: githubApiKey,
                httpClient: httpClient);

            _logger.LogInformation("Configured GitHub Models with model: {Model}", githubModelId);
        }
        else
        {
            // Try Azure OpenAI as fallback
            var azureEndpoint = configuration["AzureOpenAI:Endpoint"];
            var azureApiKey = configuration["AzureOpenAI:ApiKey"];
            var azureDeployment = configuration["AzureOpenAI:DeploymentName"];

            if (!string.IsNullOrEmpty(azureEndpoint) && !string.IsNullOrEmpty(azureApiKey) &&
                !azureApiKey.Contains("your-azure") && !string.IsNullOrEmpty(azureDeployment))
            {
                builder.AddAzureOpenAIChatCompletion(
                    deploymentName: azureDeployment,
                    endpoint: azureEndpoint,
                    apiKey: azureApiKey);

                _logger.LogInformation("Configured Azure OpenAI with deployment: {Deployment}", azureDeployment);
            }
            else
            {
                throw new InvalidOperationException(
                    "No valid AI configuration found. Please configure either AzureOpenAI or GitHubModels in appsettings.json");
            }
        }

        _kernel = builder.Build();
        _chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();
    }

    public async Task<string> GenerateMailResponseAsync(int contentId)
    {
        try
        {
            // Query the mail content
            var mailContent = await _context.MailContents
                .FirstOrDefaultAsync(m => m.ContentId == contentId);

            if (mailContent == null)
            {
                throw new ArgumentException($"Mail content with ID {contentId} not found");
            }

            _logger.LogInformation("Generating response for mail content ID: {ContentId}", contentId);

            // Generate AI response
            var response = await GenerateAIResponseAsync(mailContent);

            // Save to MailContentSent table
            var mailContentSent = new MailContentSent
            {
                ContentId = contentId,
                ResponseContent = response
            };

            _context.MailContentSents.Add(mailContentSent);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully saved mail response for content ID: {ContentId}", contentId);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating mail response for content ID: {ContentId}", contentId);
            throw;
        }
    }

    private async Task<string> GenerateAIResponseAsync(MailContent mailContent)
    {
        var chatHistory = new ChatHistory();

        // System prompt with PDF context
        var systemPrompt = $@"You are a professional customer service representative for a Case Management system. 
Your task is to generate polite, formal, and helpful email responses to customer inquiries.

Use the following documentation as context for your responses:

{_pdfContent}

Guidelines:
1. Be polite, professional, and empathetic
2. Address the customer's concerns directly
3. Reference the Case Manager documentation when relevant
4. Keep responses concise but informative
5. Use proper business email formatting
6. Sign off professionally

Generate a complete email response that can be sent directly to the customer.";

        chatHistory.AddSystemMessage(systemPrompt);

        // User prompt with the mail content
        var userPrompt = $@"Generate a professional email response to the following inquiry:

From: {mailContent.FromEmail}
To: {mailContent.ToEmail}
Subject: {mailContent.Subject}

Message:
{mailContent.Content}

Please provide a complete, polite, and formal response email.";

        chatHistory.AddUserMessage(userPrompt);

        // Generate response
        var executionSettings = new OpenAIPromptExecutionSettings
        {
            Temperature = 0.7,
            MaxTokens = 1000
        };

        var result = await _chatCompletionService.GetChatMessageContentAsync(
            chatHistory,
            executionSettings,
            _kernel);

        return result.Content ?? "Unable to generate response";
    }

    private string LoadPdfContent()
    {
        try
        {
            // Try multiple possible paths for the PDF
            var possiblePaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "Casemanager.pdf"),
                Path.Combine(Directory.GetCurrentDirectory(), "Casemanager.pdf"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "CaseManager.Api", "Casemanager.pdf"),
                "/Users/prajith/Documents/Sandbox/DotNet/csharp-sdk/cpy/casemanager/CaseManager.Api/Casemanager.pdf"
            };

            string? pdfPath = possiblePaths.FirstOrDefault(File.Exists);

            if (pdfPath == null)
            {
                _logger.LogWarning("Casemanager.pdf not found in any expected location. Tried: {Paths}",
                    string.Join(", ", possiblePaths));
                return "Case Manager documentation not available.";
            }

            _logger.LogInformation("Loading PDF from: {Path}", pdfPath);

            // Extract text from PDF
            using var pdfReader = new PdfReader(pdfPath);
            using var pdfDocument = new PdfDocument(pdfReader);

            var strategy = new LocationTextExtractionStrategy();
            var content = new System.Text.StringBuilder();

            for (int i = 1; i <= pdfDocument.GetNumberOfPages(); i++)
            {
                var page = pdfDocument.GetPage(i);
                var text = PdfTextExtractor.GetTextFromPage(page, strategy);
                content.AppendLine(text);
            }

            var extractedText = content.ToString();
            _logger.LogInformation("Successfully extracted {Length} characters from PDF", extractedText.Length);

            return extractedText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading PDF content");
            return "Case Manager documentation not available.";
        }
    }
}
