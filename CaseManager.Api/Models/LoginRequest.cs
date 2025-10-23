namespace CaseManager.Api.Models;

/// <summary>
/// Login request model
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Username for authentication
    /// </summary>
    public required string UserName { get; set; }
}
