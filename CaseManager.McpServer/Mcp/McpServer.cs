using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using CaseManager.McpServer.Services;

namespace CaseManager.McpServer.Mcp;

public class McpServer
{
    private readonly ILogger<McpServer> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly Dictionary<string, Func<JObject?, Task<object>>> _tools;

    public McpServer(ILogger<McpServer> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _tools = new Dictionary<string, Func<JObject?, Task<object>>>
        {
            { "list_completable_cases", ListCompletableCasesAsync },
            { "complete_task", CompleteTaskAsync }
        };
    }

    public async Task RunAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("MCP Server started. Listening on stdio...");

        var stdin = Console.OpenStandardInput();
        var stdout = Console.OpenStandardOutput();

        using var reader = new StreamReader(stdin, Encoding.UTF8);
        using var writer = new StreamWriter(stdout, Encoding.UTF8) { AutoFlush = true };

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var line = await reader.ReadLineAsync(cancellationToken);
                if (string.IsNullOrEmpty(line))
                {
                    continue;
                }

                _logger.LogDebug($"Received: {line}");

                var message = JsonConvert.DeserializeObject<McpMessage>(line);
                if (message == null)
                {
                    continue;
                }

                var response = await HandleMessageAsync(message);
                var responseJson = JsonConvert.SerializeObject(response);

                _logger.LogDebug($"Sending: {responseJson}");
                await writer.WriteLineAsync(responseJson);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing message");
            }
        }
    }

    private async Task<McpMessage> HandleMessageAsync(McpMessage message)
    {
        var response = new McpMessage { Id = message.Id };

        try
        {
            switch (message.Method)
            {
                case "initialize":
                    response.Result = new
                    {
                        protocolVersion = "2024-11-05",
                        capabilities = new
                        {
                            tools = new { }
                        },
                        serverInfo = new
                        {
                            name = "casemanager-mcp-server",
                            version = "1.0.0"
                        }
                    };
                    break;

                case "tools/list":
                    response.Result = new
                    {
                        tools = new[]
                        {
                            new McpTool
                            {
                                Name = "list_completable_cases",
                                Description = "Get all cases where CanComplete is true and assigned to the user",
                                InputSchema = new
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
                            new McpTool
                            {
                                Name = "complete_task",
                                Description = "Complete all assigned tasks for the user by marking cases as complete and creating task actions",
                                InputSchema = new
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
                    var toolName = message.Params?["name"]?.ToString();
                    var arguments = message.Params?["arguments"] as JObject;

                    if (toolName != null && _tools.ContainsKey(toolName))
                    {
                        var result = await _tools[toolName](arguments);
                        response.Result = new ToolResult
                        {
                            Content = new List<ContentItem>
                            {
                                new ContentItem
                                {
                                    Type = "text",
                                    Text = JsonConvert.SerializeObject(result, Formatting.Indented)
                                }
                            }
                        };
                    }
                    else
                    {
                        response.Error = new McpError
                        {
                            Code = -32601,
                            Message = $"Tool not found: {toolName}"
                        };
                    }
                    break;

                default:
                    response.Error = new McpError
                    {
                        Code = -32601,
                        Message = $"Method not found: {message.Method}"
                    };
                    break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling message");
            response.Error = new McpError
            {
                Code = -32603,
                Message = "Internal error",
                Data = ex.Message
            };
        }

        return response;
    }

    private async Task<object> ListCompletableCasesAsync(JObject? args)
    {
        if (args == null)
        {
            throw new ArgumentException("Arguments required for list_completable_cases");
        }

        var userId = args["userId"]?.ToObject<int>() ?? 0;

        if (userId <= 0)
        {
            throw new ArgumentException("Invalid userId");
        }

        using var scope = _serviceProvider.CreateScope();
        var caseService = scope.ServiceProvider.GetRequiredService<IMcpCaseService>();
        var cases = await caseService.GetCompletableCasesAsync(userId);
        return new { cases, count = cases.Count, userId };
    }

    private async Task<object> CompleteTaskAsync(JObject? args)
    {
        if (args == null)
        {
            throw new ArgumentException("Arguments required for complete_task");
        }

        var userId = args["userId"]?.ToObject<int>() ?? 0;

        if (userId <= 0)
        {
            throw new ArgumentException("Invalid userId");
        }

        using var scope = _serviceProvider.CreateScope();
        var caseService = scope.ServiceProvider.GetRequiredService<IMcpCaseService>();
        var completedCount = await caseService.CompleteTaskAsync(userId);
        return new
        {
            success = completedCount > 0,
            message = completedCount > 0 ? $"Completed {completedCount} task(s) successfully" : "No completable tasks found",
            completedCount,
            userId
        };
    }
}
