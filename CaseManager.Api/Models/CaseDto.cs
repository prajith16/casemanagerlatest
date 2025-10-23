namespace CaseManager.Api.Models;

/// <summary>
/// DTO for Case with User information
/// </summary>
public class CaseDto
{
    /// <summary>
    /// Unique identifier for the case
    /// </summary>
    public int CaseId { get; set; }

    /// <summary>
    /// Case title or description
    /// </summary>
    public string CaseName { get; set; } = string.Empty;

    /// <summary>
    /// User ID this case is regarding
    /// </summary>
    public int RegardingUserId { get; set; }

    /// <summary>
    /// Indicates whether the case is complete
    /// </summary>
    public bool IsComplete { get; set; }

    /// <summary>
    /// Indicates whether the case can be completed
    /// </summary>
    public bool CanComplete { get; set; }

    /// <summary>
    /// User ID to whom the case is assigned
    /// </summary>
    public int AssignedUserId { get; set; }

    /// <summary>
    /// Assigned user's first name
    /// </summary>
    public string AssignedUserFirstName { get; set; } = string.Empty;

    /// <summary>
    /// Assigned user's last name
    /// </summary>
    public string AssignedUserLastName { get; set; } = string.Empty;

    /// <summary>
    /// Assigned user's username
    /// </summary>
    public string AssignedUserName { get; set; } = string.Empty;
}
