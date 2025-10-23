namespace CaseManager.Api.Models;

/// <summary>
/// Response model for chat endpoint
/// </summary>
public class ChatResponse
{
    /// <summary>
    /// AI assistant's response message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Session ID for the conversation
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp of the response
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
