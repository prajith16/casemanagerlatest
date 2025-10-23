using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CaseManager.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace CaseManager.Api.Services;

/// <summary>
/// Service for generating JWT tokens
/// </summary>
public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    /// <summary>
    /// Generates a JWT token for the specified user
    /// </summary>
    public string GenerateToken(User user)
    {
        var issuer = _configuration["JwtSettings:Issuer"];
        var audience = _configuration["JwtSettings:Audience"];
        var secretKey = _configuration["JwtSettings:SecretKey"];

        if (string.IsNullOrEmpty(secretKey))
        {
            throw new InvalidOperationException("JWT SecretKey is not configured");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Generate correlation ID
        var correlationId = Guid.NewGuid().ToString();

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("userId", user.UserId.ToString()),
            new Claim("userName", user.UserName),
            new Claim("firstName", user.FirstName),
            new Claim("lastName", user.LastName),
            new Claim("correlationId", correlationId),
            new Claim(ClaimTypes.Name, user.UserName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
