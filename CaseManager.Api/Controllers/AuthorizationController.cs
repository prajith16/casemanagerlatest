using CaseManager.Api.Data;
using CaseManager.Api.Models;
using CaseManager.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CaseManager.Api.Controllers;

/// <summary>
/// Controller for authentication and authorization
/// </summary>
[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AuthorizationController : ControllerBase
{
    private readonly CaseManagerDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthorizationController> _logger;

    public AuthorizationController(
        CaseManagerDbContext context,
        ITokenService tokenService,
        ILogger<AuthorizationController> logger)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token
    /// </summary>
    /// <param name="request">Login request containing username</param>
    /// <returns>JWT token and user information</returns>
    /// <response code="200">Returns the JWT token and user details</response>
    /// <response code="400">If the request is invalid</response>
    /// <response code="401">If the username is not found</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
        {
            _logger.LogWarning("Login attempt with empty username");
            return BadRequest(new { message = "Username is required" });
        }

        // Find user by username
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.UserName == request.UserName);

        if (user == null)
        {
            _logger.LogWarning("Login attempt with invalid username: {UserName}", request.UserName);
            return Unauthorized(new { message = "Invalid username" });
        }

        // Generate JWT token
        var token = _tokenService.GenerateToken(user);

        _logger.LogInformation("User {UserName} logged in successfully", user.UserName);

        return Ok(new LoginResponse
        {
            Token = token,
            UserId = user.UserId,
            UserName = user.UserName,
            FirstName = user.FirstName,
            LastName = user.LastName
        });
    }

    /// <summary>
    /// Logs out the current user (client-side token invalidation)
    /// </summary>
    /// <returns>Success message</returns>
    /// <response code="200">Logout successful</response>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Logout()
    {
        // In a simple JWT implementation, logout is handled client-side by removing the token
        // For more advanced scenarios, you might implement token blacklisting
        _logger.LogInformation("User logout requested");
        return Ok(new { message = "Logout successful. Please remove the token from client storage." });
    }
}
