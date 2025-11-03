namespace CaseManager.McpServer.Services;

/// <summary>
/// Interface for mail content service operations
/// </summary>
public interface IMailContentService
{
    /// <summary>
    /// Generate an AI-powered response for a mail content and save it
    /// </summary>
    /// <param name="contentId">The ID of the mail content to respond to</param>
    /// <returns>The generated response content</returns>
    Task<string> GenerateMailResponseAsync(int contentId);
}
