using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CaseManager.McpServer.Data;
using CaseManager.McpServer.Models;

namespace CaseManager.McpServer.Services;

public class McpCaseService : IMcpCaseService
{
    private readonly CaseManagerDbContext _context;
    private readonly ILogger<McpCaseService> _logger;

    public McpCaseService(CaseManagerDbContext context, ILogger<McpCaseService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all cases where CanComplete is true and assigned to the user
    /// </summary>
    /// <param name="userId">The ID of the logged in user</param>
    public async Task<List<Case>> GetCompletableCasesAsync(int userId)
    {
        try
        {
            var cases = await _context.Cases
                .Where(c => c.CanComplete && c.AssignedUserId == userId)
                .ToListAsync();

            _logger.LogInformation($"Retrieved {cases.Count} completable cases for user {userId}");
            return cases;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving completable cases for user {userId}");
            throw;
        }
    }

    /// <summary>
    /// Complete all assigned tasks for the user by marking cases as complete and creating task actions
    /// </summary>
    /// <param name="userId">The ID of the logged in user</param>
    public async Task<int> CompleteTaskAsync(int userId)
    {
        try
        {
            // Get all cases assigned to the user that can be completed
            var assignedCases = await _context.Cases
                .Where(c => c.AssignedUserId == userId && c.CanComplete && !c.IsComplete)
                .ToListAsync();

            if (!assignedCases.Any())
            {
                _logger.LogWarning($"No completable cases found for user {userId}");
                return 0;
            }

            // Mark all cases as complete and create task actions
            foreach (var caseEntity in assignedCases)
            {
                // Mark the case as complete
                caseEntity.IsComplete = true;

                // Create a new task action with the case name as the task name
                var taskAction = new TaskAction
                {
                    TaskActionName = caseEntity.CaseName,
                    CaseId = caseEntity.CaseId,
                    UserId = userId
                };

                _context.TaskActions.Add(taskAction);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Completed {assignedCases.Count} cases for user {userId}");
            return assignedCases.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error completing tasks for user {userId}");
            throw;
        }
    }
}
