namespace CaseManager.Api.Models;

/// <summary>
/// Represents a chat message in the conversation
/// </summary>
public class ChatMessage
{
    /// <summary>
    /// Role of the message sender (user, assistant, system)
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Content of the message
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the message was created
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
