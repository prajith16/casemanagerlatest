namespace CaseManager.Api.Models;

/// <summary>
/// Request model for chat endpoint
/// </summary>
public class ChatRequest
{
    /// <summary>
    /// User's input message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Session ID for tracking conversation history
    /// </summary>
    public string? SessionId { get; set; }
}
