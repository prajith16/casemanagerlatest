namespace CaseManager.Api.Models;

/// <summary>
/// Represents a user in the Case Management system
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Username for the user
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// First name of the user
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Last name of the user
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Address of the user
    /// </summary>
    public string Address { get; set; } = string.Empty;
}
