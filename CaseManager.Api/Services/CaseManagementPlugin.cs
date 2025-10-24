using System.ComponentModel;
using Microsoft.SemanticKernel;
using Microsoft.AspNetCore.SignalR;
using CaseManager.Api.Models;
using CaseManager.Api.Hubs;

namespace CaseManager.Api.Services;

/// <summary>
/// Semantic Kernel plugin for case management operations
/// Enables AI to create cases and lookup users via function calling
/// </summary>
public class CaseManagementPlugin
{
    private readonly ICaseService _caseService;
    private readonly IUserService _userService;
    private readonly ILogger<CaseManagementPlugin> _logger;
    private readonly IHubContext<ChatHub> _hubContext;

    public CaseManagementPlugin(
        ICaseService caseService,
        IUserService userService,
        ILogger<CaseManagementPlugin> logger,
        IHubContext<ChatHub> hubContext)
    {
        _caseService = caseService;
        _userService = userService;
        _logger = logger;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Creates a new case with the specified details
    /// </summary>
    [KernelFunction, Description("Creates a new case in the Case Manager system. Use this function when a user asks to: create a case, create a task, assign a task, assign a case, set up an action item, make a new case, add a case, or any variation of creating work for someone. The function requires the task/case description and the username of who should do the work (assignedUsername).")]
    public async Task<string> CreateCase(
        [Description("The case name or description of the task/action item to be completed. Extract this from what the user wants done. Examples: 'sending message', 'review budget', 'verify documents'.")] string caseName,
        [Description("The username of the person who will be assigned to work on this case. Look for phrases like 'assign to username', 'for username to do', 'username should do'. This is who will perform the work.")] string assignedUsername)
    {
        try
        {
            _logger.LogInformation(
                "CreateCase function called - CaseName: '{CaseName}', AssignedTo: '{AssignedUsername}'",
                caseName, assignedUsername);

            // Validate inputs
            if (string.IsNullOrWhiteSpace(caseName))
            {
                _logger.LogWarning("CreateCase called with empty case name");
                return "Error: Case name cannot be empty.";
            }

            if (string.IsNullOrWhiteSpace(assignedUsername))
            {
                _logger.LogWarning("CreateCase called with empty assigned username");
                return "Error: Assigned username cannot be empty.";
            }

            // Look up assigned user
            _logger.LogInformation("Looking up assigned user: {Username}", assignedUsername);
            var assignedUser = await _userService.GetUserByUsernameAsync(assignedUsername);
            if (assignedUser == null)
            {
                _logger.LogWarning("Assigned user not found: {Username}", assignedUsername);
                return $"Error: Could not find user with username '{assignedUsername}'. Please check the username and try again.";
            }

            _logger.LogInformation("Found assigned user: {FirstName} {LastName} (ID: {UserId})",
                assignedUser.FirstName, assignedUser.LastName, assignedUser.UserId);

            // Create the case
            _logger.LogInformation("Creating case with AssignedUserId={AssignedId}",
                assignedUser.UserId);

            var newCase = new Case
            {
                CaseName = caseName,
                AssignedUserId = assignedUser.UserId,
                IsComplete = false,
                CanComplete = true
            };

            var createdCase = await _caseService.CreateCaseAsync(newCase);

            _logger.LogInformation(
                "Case created successfully - CaseId: {CaseId}, CaseName: {CaseName}",
                createdCase.CaseId, createdCase.CaseName);

            // Broadcast case creation to all connected clients via SignalR
            await _hubContext.Clients.All.SendAsync("CaseCreated", new
            {
                caseId = createdCase.CaseId,
                caseName = createdCase.CaseName,
                assignedUserId = assignedUser.UserId,
                assignedUserName = assignedUser.UserName,
                timestamp = DateTime.UtcNow
            });

            _logger.LogInformation(
                "Broadcasted case creation notification - CaseId: {CaseId}, AssignedUserId: {AssignedUserId}",
                createdCase.CaseId, assignedUser.UserId);

            return $"✅ Successfully created case '{createdCase.CaseName}' (Case ID: {createdCase.CaseId}). " +
                   $"Assigned to: {assignedUser.FirstName} {assignedUser.LastName} ({assignedUser.UserName}).";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating case");
            return $"Error creating case: {ex.Message}";
        }
    }

    /// <summary>
    /// Looks up a user by username
    /// </summary>
    [KernelFunction, Description("Finds a user in the system by their username. Use this to get user details or verify if a user exists.")]
    public async Task<string> GetUserByUsername(
        [Description("The username to search for")] string username)
    {
        try
        {
            _logger.LogInformation("GetUserByUsername function called - Username: {Username}", username);

            var user = await _userService.GetUserByUsernameAsync(username);

            if (user == null)
            {
                _logger.LogWarning("User not found: {Username}", username);
                return $"No user found with username '{username}'.";
            }

            return $"User found: {user.FirstName} {user.LastName} (Username: {user.UserName}, ID: {user.UserId})";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error looking up user");
            return $"Error looking up user: {ex.Message}";
        }
    }

    /// <summary>
    /// Lists all available users in the system
    /// </summary>
    [KernelFunction, Description("Gets a list of all users in the Case Manager system. Use this when the user asks about available users or who they can assign cases to.")]
    public async Task<string> ListAllUsers()
    {
        try
        {
            _logger.LogInformation("ListAllUsers function called");

            var users = await _userService.GetAllUsersAsync();
            var userList = users.ToList();

            if (!userList.Any())
            {
                return "No users found in the system.";
            }

            var userInfo = userList.Select(u =>
                $"- {u.FirstName} {u.LastName} (Username: {u.UserName}, ID: {u.UserId})");

            return $"Available users in the system:\n{string.Join("\n", userInfo)}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing users");
            return $"Error listing users: {ex.Message}";
        }
    }

    /// <summary>
    /// Gets details about a specific case
    /// </summary>
    [KernelFunction, Description("Gets detailed information about a case by its ID. Use this when the user asks about a specific case or wants to check case details.")]
    public async Task<string> GetCaseById(
        [Description("The case ID to look up")] int caseId)
    {
        try
        {
            _logger.LogInformation("GetCaseById function called - CaseId: {CaseId}", caseId);

            var caseDetail = await _caseService.GetCaseDetailByIdAsync(caseId);

            if (caseDetail == null)
            {
                return $"No case found with ID {caseId}.";
            }

            var status = caseDetail.IsComplete ? "Complete" : "In Progress";
            return $"Case ID {caseDetail.CaseId}: '{caseDetail.CaseName}'\n" +
                   $"Status: {status}\n" +
                   $"Assigned to: {caseDetail.AssignedUserFirstName} {caseDetail.AssignedUserLastName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting case details");
            return $"Error getting case details: {ex.Message}";
        }
    }
}
