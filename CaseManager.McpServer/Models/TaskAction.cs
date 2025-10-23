namespace CaseManager.McpServer.Models;

/// <summary>
/// Represents a task action associated with a case
/// </summary>
public class TaskAction
{
    /// <summary>
    /// Unique identifier for the task action
    /// </summary>
    public int TaskActionId { get; set; }

    /// <summary>
    /// Task action description
    /// </summary>
    public string TaskActionName { get; set; } = string.Empty;

    /// <summary>
    /// Associated case ID
    /// </summary>
    public int CaseId { get; set; }

    /// <summary>
    /// User ID responsible for this task action
    /// </summary>
    public int UserId { get; set; }
}
