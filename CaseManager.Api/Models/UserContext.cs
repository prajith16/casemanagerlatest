namespace CaseManager.Api.Models;

/// <summary>
/// Contains the current authenticated user's information from JWT claims
/// </summary>
public class UserContext
{
    /// <summary>
    /// User ID from JWT token
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Username from JWT token
    /// </summary>
    public required string UserName { get; set; }

    /// <summary>
    /// First name from JWT token
    /// </summary>
    public required string FirstName { get; set; }

    /// <summary>
    /// Last name from JWT token
    /// </summary>
    public required string LastName { get; set; }

    /// <summary>
    /// Correlation ID from JWT token
    /// </summary>
    public required string CorrelationId { get; set; }
}
