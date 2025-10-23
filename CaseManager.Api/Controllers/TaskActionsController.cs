using Microsoft.AspNetCore.Mvc;
using CaseManager.Api.Models;
using CaseManager.Api.Services;

namespace CaseManager.Api.Controllers;

/// <summary>
/// API Controller for managing Task Actions
/// </summary>
[Route("api/[controller]")]
[Produces("application/json")]
public class TaskActionsController : BaseController
{
    private readonly ITaskActionService _taskActionService;

    public TaskActionsController(ITaskActionService taskActionService, ILogger<TaskActionsController> logger)
        : base(logger)
    {
        _taskActionService = taskActionService;
    }

    /// <summary>
    /// Get all task actions with user information
    /// </summary>
    /// <returns>List of all task actions with user details</returns>
    /// <response code="200">Returns the list of task actions with user information</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TaskActionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TaskActionDto>>> GetAllTaskActions()
    {
        Logger.LogInformation("Getting all task actions with user information");
        var taskActions = await _taskActionService.GetAllTaskActionsWithUserAsync();
        return Ok(taskActions);
    }

    /// <summary>
    /// Get a specific task action by ID
    /// </summary>
    /// <param name="id">Task Action ID</param>
    /// <returns>Task Action details</returns>
    /// <response code="200">Returns the task action</response>
    /// <response code="404">Task Action not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(TaskAction), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskAction>> GetTaskActionById(int id)
    {
        Logger.LogInformation("Getting task action with ID: {TaskActionId}", id);
        var taskAction = await _taskActionService.GetTaskActionByIdAsync(id);

        if (taskAction == null)
        {
            Logger.LogWarning("Task action with ID: {TaskActionId} not found", id);
            return NotFound(new { message = $"Task action with ID {id} not found" });
        }

        return Ok(taskAction);
    }

    /// <summary>
    /// Create a new task action
    /// </summary>
    /// <param name="taskAction">Task Action details</param>
    /// <returns>Created task action</returns>
    /// <response code="201">Task Action created successfully</response>
    /// <response code="400">Invalid task action data</response>
    [HttpPost]
    [ProducesResponseType(typeof(TaskAction), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TaskAction>> CreateTaskAction([FromBody] TaskAction taskAction)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Logger.LogInformation("Creating new task action: {TaskActionName}", taskAction.TaskActionName);
        var createdTaskAction = await _taskActionService.CreateTaskActionAsync(taskAction);
        return CreatedAtAction(nameof(GetTaskActionById), new { id = createdTaskAction.TaskActionId }, createdTaskAction);
    }

    /// <summary>
    /// Update an existing task action
    /// </summary>
    /// <param name="id">Task Action ID</param>
    /// <param name="taskAction">Updated task action details</param>
    /// <returns>Updated task action</returns>
    /// <response code="200">Task Action updated successfully</response>
    /// <response code="400">Invalid task action data or ID mismatch</response>
    /// <response code="404">Task Action not found</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(TaskAction), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskAction>> UpdateTaskAction(int id, [FromBody] TaskAction taskAction)
    {
        if (id != taskAction.TaskActionId)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingTaskAction = await _taskActionService.GetTaskActionByIdAsync(id);
        if (existingTaskAction == null)
        {
            Logger.LogWarning("Task action with ID: {TaskActionId} not found for update", id);
            return NotFound(new { message = $"Task action with ID {id} not found" });
        }

        Logger.LogInformation("Updating task action with ID: {TaskActionId}", id);
        var updatedTaskAction = await _taskActionService.UpdateTaskActionAsync(taskAction);
        return Ok(updatedTaskAction);
    }

    /// <summary>
    /// Delete a task action
    /// </summary>
    /// <param name="id">Task Action ID</param>
    /// <returns>No content</returns>
    /// <response code="204">Task Action deleted successfully</response>
    /// <response code="404">Task Action not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTaskAction(int id)
    {
        Logger.LogInformation("Deleting task action with ID: {TaskActionId}", id);
        var result = await _taskActionService.DeleteTaskActionAsync(id);

        if (!result)
        {
            Logger.LogWarning("Task action with ID: {TaskActionId} not found for deletion", id);
            return NotFound(new { message = $"Task action with ID {id} not found" });
        }

        return NoContent();
    }
}
