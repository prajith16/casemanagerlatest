using CaseManager.Api.Models;
using CaseManager.Api.Repositories;
using CaseManager.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CaseManager.Api.Services;

/// <summary>
/// Service implementation for TaskAction operations
/// </summary>
public class TaskActionService : ITaskActionService
{
    private readonly IRepository<TaskAction> _repository;
    private readonly CaseManagerDbContext _context;

    public TaskActionService(IRepository<TaskAction> repository, CaseManagerDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<IEnumerable<TaskAction>> GetAllTaskActionsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<IEnumerable<TaskActionDto>> GetAllTaskActionsWithUserAsync()
    {
        var taskActionsWithUser = await (from ta in _context.TaskActions
                                         join u in _context.Users on ta.UserId equals u.UserId
                                         select new TaskActionDto
                                         {
                                             TaskActionId = ta.TaskActionId,
                                             TaskActionName = ta.TaskActionName,
                                             CaseId = ta.CaseId,
                                             UserId = ta.UserId,
                                             FirstName = u.FirstName,
                                             LastName = u.LastName,
                                             UserName = u.UserName
                                         }).ToListAsync();

        return taskActionsWithUser;
    }

    public async Task<TaskAction?> GetTaskActionByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<TaskAction> CreateTaskActionAsync(TaskAction taskAction)
    {
        return await _repository.AddAsync(taskAction);
    }

    public async Task<TaskAction> UpdateTaskActionAsync(TaskAction taskAction)
    {
        return await _repository.UpdateAsync(taskAction);
    }

    public async Task<bool> DeleteTaskActionAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
