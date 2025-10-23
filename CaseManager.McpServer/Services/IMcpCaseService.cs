using CaseManager.McpServer.Models;

namespace CaseManager.McpServer.Services;

public interface IMcpCaseService
{
    /// <summary>
    /// Get all cases where CanComplete is true and assigned to the user
    /// </summary>
    /// <param name="userId">The ID of the logged in user</param>
    Task<List<Case>> GetCompletableCasesAsync(int userId);

    /// <summary>
    /// Complete all assigned tasks for the user by marking cases as complete and creating task actions
    /// </summary>
    /// <param name="userId">The ID of the logged in user</param>
    Task<int> CompleteTaskAsync(int userId);
}
