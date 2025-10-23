using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CaseManager.Api.Data;
using CaseManager.Api.Models;
using Newtonsoft.Json.Linq;
using System.Text.Json;

namespace CaseManager.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class McpController : BaseController
{
    private readonly CaseManagerDbContext _context;

    public McpController(ILogger<McpController> logger, CaseManagerDbContext context) : base(logger)
    {
        _context = context;
    }

    /// <summary>
    /// HTTP bridge for MCP protocol - handles JSON-RPC requests
    /// This endpoint provides an HTTP interface to MCP functionality
    /// </summary>
    [HttpPost("rpc")]
    [AllowAnonymous] // Temporarily allow anonymous for testing
    public async Task<IActionResult> McpRpc([FromBody] JsonDocument requestDoc)
    {
        try
        {
            var root = requestDoc.RootElement;
            var method = root.GetProperty("method").GetString();
            var id = root.TryGetProperty("id", out var idProp) ? idProp.GetInt32() : 0;

            JsonElement parameters = default;
            root.TryGetProperty("params", out parameters);

            Logger.LogInformation($"Received MCP RPC request: method={method}, id={id}");

            object? result = null;

            switch (method)
            {
                case "initialize":
                    result = new
                    {
                        protocolVersion = "2024-11-05",
                        capabilities = new { tools = new { } },
                        serverInfo = new
                        {
                            name = "casemanager-mcp-server",
                            version = "1.0.0"
                        }
                    };
                    break;

                case "tools/list":
                    result = new
                    {
                        tools = new[]
                        {
                            new
                            {
                                name = "list_completable_cases",
                                description = "Get all cases where CanComplete is true and assigned to the user",
                                inputSchema = new
                                {
                                    type = "object",
                                    properties = new
                                    {
                                        userId = new
                                        {
                                            type = "number",
                                            description = "The ID of the logged in user"
                                        }
                                    },
                                    required = new[] { "userId" }
                                }
                            },
                            new
                            {
                                name = "complete_task",
                                description = "Complete all assigned tasks for the user by marking cases as complete",
                                inputSchema = new
                                {
                                    type = "object",
                                    properties = new
                                    {
                                        userId = new
                                        {
                                            type = "number",
                                            description = "The ID of the logged in user"
                                        }
                                    },
                                    required = new[] { "userId" }
                                }
                            }
                        }
                    };
                    break;

                case "tools/call":
                    var toolName = parameters.TryGetProperty("name", out var nameElem) ? nameElem.GetString() : null;
                    JsonElement args = default;
                    parameters.TryGetProperty("arguments", out args);

                    if (toolName == "list_completable_cases")
                    {
                        var userId = args.TryGetProperty("userId", out var userIdElem) ? userIdElem.GetInt32() : 0;
                        var cases = await _context.Cases
                            .Where(c => c.CanComplete && c.AssignedUserId == userId && !c.IsComplete)
                            .ToListAsync();

                        var toolResult = new
                        {
                            cases,
                            count = cases.Count,
                            userId
                        };

                        result = new
                        {
                            content = new[]
                            {
                                new
                                {
                                    type = "text",
                                    text = System.Text.Json.JsonSerializer.Serialize(toolResult)
                                }
                            }
                        };
                    }
                    else if (toolName == "complete_task")
                    {
                        var userId = args.TryGetProperty("userId", out var userIdElem) ? userIdElem.GetInt32() : 0;

                        var assignedCases = await _context.Cases
                            .Where(c => c.AssignedUserId == userId && c.CanComplete && !c.IsComplete)
                            .ToListAsync();

                        var completedCount = 0;
                        if (assignedCases.Any())
                        {
                            foreach (var caseEntity in assignedCases)
                            {
                                caseEntity.IsComplete = true;
                                var taskAction = new TaskAction
                                {
                                    TaskActionName = caseEntity.CaseName,
                                    CaseId = caseEntity.CaseId,
                                    UserId = userId
                                };
                                _context.TaskActions.Add(taskAction);
                            }
                            await _context.SaveChangesAsync();
                            completedCount = assignedCases.Count;
                        }

                        var toolResult = new
                        {
                            success = completedCount > 0,
                            message = completedCount > 0
                                ? $"Completed {completedCount} task(s) successfully"
                                : "No completable tasks found",
                            completedCount,
                            userId
                        };

                        result = new
                        {
                            content = new[]
                            {
                                new
                                {
                                    type = "text",
                                    text = System.Text.Json.JsonSerializer.Serialize(toolResult)
                                }
                            }
                        };
                    }
                    else
                    {
                        return Ok(new
                        {
                            jsonrpc = "2.0",
                            id,
                            error = new
                            {
                                code = -32601,
                                message = $"Tool not found: {toolName}"
                            }
                        });
                    }
                    break;

                default:
                    return Ok(new
                    {
                        jsonrpc = "2.0",
                        id,
                        error = new
                        {
                            code = -32601,
                            message = $"Method not found: {method}"
                        }
                    });
            }

            Logger.LogInformation($"MCP RPC successful: method={method}");

            return Ok(new
            {
                jsonrpc = "2.0",
                id,
                result
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error handling MCP RPC request");
            var root = requestDoc.RootElement;
            var id = root.TryGetProperty("id", out var idProp) ? idProp.GetInt32() : 0;
            return Ok(new
            {
                jsonrpc = "2.0",
                id,
                error = new
                {
                    code = -32603,
                    message = "Internal error",
                    data = ex.Message
                }
            });
        }
    }

    [HttpPost("list-completable-cases")]
    public async Task<IActionResult> ListCompletableCases([FromBody] McpRequest request)
    {
        try
        {
            var cases = await _context.Cases
                .Where(c => c.CanComplete && c.AssignedUserId == request.UserId && !c.IsComplete)
                .ToListAsync();

            Logger.LogInformation($"Retrieved {cases.Count} completable cases for user {request.UserId}");

            return Ok(new
            {
                cases,
                count = cases.Count,
                userId = request.UserId
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error calling MCP list_completable_cases");
            return StatusCode(500, new { error = "Failed to retrieve completable cases" });
        }
    }

    [HttpPost("complete-tasks")]
    public async Task<IActionResult> CompleteTasks([FromBody] McpRequest request)
    {
        try
        {
            // Get all cases assigned to the user that can be completed
            var assignedCases = await _context.Cases
                .Where(c => c.AssignedUserId == request.UserId && c.CanComplete && !c.IsComplete)
                .ToListAsync();

            if (!assignedCases.Any())
            {
                Logger.LogWarning($"No completable cases found for user {request.UserId}");
                return Ok(new
                {
                    success = false,
                    message = "No completable tasks found",
                    completedCount = 0,
                    userId = request.UserId
                });
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
                    UserId = request.UserId
                };

                _context.TaskActions.Add(taskAction);
            }

            await _context.SaveChangesAsync();

            Logger.LogInformation($"Completed {assignedCases.Count} cases for user {request.UserId}");

            return Ok(new
            {
                success = true,
                message = $"Completed {assignedCases.Count} task(s) successfully",
                completedCount = assignedCases.Count,
                userId = request.UserId
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error calling MCP complete_task");
            return StatusCode(500, new { error = "Failed to complete tasks" });
        }
    }
}

public class McpRequest
{
    public int UserId { get; set; }
}
