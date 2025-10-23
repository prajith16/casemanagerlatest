namespace CaseManager.Api.Models;

/// <summary>
/// DTO for TaskAction with User information
/// </summary>
public class TaskActionDto
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

    /// <summary>
    /// User's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's full name
    /// </summary>
    public string UserName { get; set; } = string.Empty;
}
