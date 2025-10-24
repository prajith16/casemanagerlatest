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

    /// <summary>
    /// Indicates if a case was created during this interaction
    /// </summary>
    public bool CaseCreated { get; set; } = false;

    /// <summary>
    /// The ID of the created case (if applicable)
    /// </summary>
    public int? CreatedCaseId { get; set; }

    /// <summary>
    /// The name of the created case (if applicable)
    /// </summary>
    public string? CreatedCaseName { get; set; }

    /// <summary>
    /// List of function calls that were executed during this interaction
    /// </summary>
    public List<string>? FunctionsInvoked { get; set; }
}
