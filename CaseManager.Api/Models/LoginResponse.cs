namespace CaseManager.Api.Models;

/// <summary>
/// Login response model
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// JWT access token
    /// </summary>
    public required string Token { get; set; }

    /// <summary>
    /// User ID
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Username
    /// </summary>
    public required string UserName { get; set; }

    /// <summary>
    /// User's first name
    /// </summary>
    public required string FirstName { get; set; }

    /// <summary>
    /// User's last name
    /// </summary>
    public required string LastName { get; set; }
}
