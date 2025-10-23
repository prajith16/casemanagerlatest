using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Service for generating JWT tokens
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates a JWT token for the specified user
    /// </summary>
    /// <param name="user">User to generate token for</param>
    /// <returns>JWT token string</returns>
    string GenerateToken(User user);
}
