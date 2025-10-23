using System.Security.Claims;
using CaseManager.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CaseManager.Api.Controllers;

/// <summary>
/// Base controller with authentication and user context
/// </summary>
[Authorize]
[ApiController]
public abstract class BaseController : ControllerBase
{
    /// <summary>
    /// Gets the current authenticated user's context from JWT claims
    /// </summary>
    protected UserContext CurrentUser
    {
        get
        {
            var userId = User.FindFirst("userId")?.Value;
            var userName = User.FindFirst("userName")?.Value;
            var firstName = User.FindFirst("firstName")?.Value;
            var lastName = User.FindFirst("lastName")?.Value;
            var correlationId = User.FindFirst("correlationId")?.Value;

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(userName))
            {
                throw new UnauthorizedAccessException("User context not found in token");
            }

            return new UserContext
            {
                UserId = int.Parse(userId),
                UserName = userName,
                FirstName = firstName ?? string.Empty,
                LastName = lastName ?? string.Empty,
                CorrelationId = correlationId ?? string.Empty
            };
        }
    }

    /// <summary>
    /// Gets the logger for the derived controller
    /// </summary>
    protected ILogger Logger { get; }

    protected BaseController(ILogger logger)
    {
        Logger = logger;
    }
}
