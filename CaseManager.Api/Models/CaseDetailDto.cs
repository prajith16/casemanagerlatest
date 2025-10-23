namespace CaseManager.Api.Models;

/// <summary>
/// Data Transfer Object for Case details with user information
/// </summary>
public class CaseDetailDto
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
    /// First name of the user this case is regarding
    /// </summary>
    public string RegardingUserFirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the user this case is regarding
    /// </summary>
    public string RegardingUserLastName { get; set; } = string.Empty;

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
    /// First name of the assigned user
    /// </summary>
    public string AssignedUserFirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the assigned user
    /// </summary>
    public string AssignedUserLastName { get; set; } = string.Empty;
}
