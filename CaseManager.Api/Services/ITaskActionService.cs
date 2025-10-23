using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Service interface for TaskAction operations
/// </summary>
public interface ITaskActionService
{
    Task<IEnumerable<TaskAction>> GetAllTaskActionsAsync();
    Task<IEnumerable<TaskActionDto>> GetAllTaskActionsWithUserAsync();
    Task<TaskAction?> GetTaskActionByIdAsync(int id);
    Task<TaskAction> CreateTaskActionAsync(TaskAction taskAction);
    Task<TaskAction> UpdateTaskActionAsync(TaskAction taskAction);
    Task<bool> DeleteTaskActionAsync(int id);
}
