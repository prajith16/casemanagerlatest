namespace CaseManager.Api.Models;

/// <summary>
/// Represents a case in the Case Management system
/// </summary>
public class Case
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
}
