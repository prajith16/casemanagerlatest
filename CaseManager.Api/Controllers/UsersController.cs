using Microsoft.AspNetCore.Mvc;
using CaseManager.Api.Models;
using CaseManager.Api.Services;

namespace CaseManager.Api.Controllers;

/// <summary>
/// API Controller for managing Users
/// </summary>
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController : BaseController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
        : base(logger)
    {
        _userService = userService;
    }

    /// <summary>
    /// Get all users
    /// </summary>
    /// <returns>List of all users</returns>
    /// <response code="200">Returns the list of users</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<User>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<User>>> GetAllUsers()
    {
        Logger.LogInformation("Getting all users. Requested by: {UserName} (ID: {UserId})",
            CurrentUser.UserName, CurrentUser.UserId);
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    /// <summary>
    /// Get a specific user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    /// <response code="200">Returns the user</response>
    /// <response code="404">User not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<User>> GetUserById(int id)
    {
        Logger.LogInformation("Getting user with ID: {UserId}", id);
        var user = await _userService.GetUserByIdAsync(id);

        if (user == null)
        {
            Logger.LogWarning("User with ID: {UserId} not found", id);
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        return Ok(user);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <param name="user">User details</param>
    /// <returns>Created user</returns>
    /// <response code="201">User created successfully</response>
    /// <response code="400">Invalid user data</response>
    [HttpPost]
    [ProducesResponseType(typeof(User), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<User>> CreateUser([FromBody] User user)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Logger.LogInformation("Creating new user: {UserName}", user.UserName);
        var createdUser = await _userService.CreateUserAsync(user);
        return CreatedAtAction(nameof(GetUserById), new { id = createdUser.UserId }, createdUser);
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="user">Updated user details</param>
    /// <returns>Updated user</returns>
    /// <response code="200">User updated successfully</response>
    /// <response code="400">Invalid user data or ID mismatch</response>
    /// <response code="404">User not found</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(User), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<User>> UpdateUser(int id, [FromBody] User user)
    {
        if (id != user.UserId)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            Logger.LogInformation("Updating user with ID: {UserId}", id);
            var updatedUser = await _userService.UpdateUserAsync(user);
            return Ok(updatedUser);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating user with ID: {UserId}", id);
            return NotFound(new { message = $"User with ID {id} not found" });
        }
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>No content</returns>
    /// <response code="204">User deleted successfully</response>
    /// <response code="404">User not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteUser(int id)
    {
        Logger.LogInformation("Deleting user with ID: {UserId}", id);
        var result = await _userService.DeleteUserAsync(id);

        if (!result)
        {
            Logger.LogWarning("User with ID: {UserId} not found for deletion", id);
            return NotFound(new { message = $"User with ID {id} not found" });
        }

        return NoContent();
    }
}
