namespace CaseManager.McpServer.Models;

/// <summary>
/// Represents a user in the system
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Username for login
    /// </summary>
    public string UserName { get; set; } = string.Empty;

    /// <summary>
    /// User's first name
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// User's last name
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// User's address
    /// </summary>
    public string Address { get; set; } = string.Empty;
}
