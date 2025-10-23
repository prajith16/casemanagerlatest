using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CaseManager.McpServer.Mcp;

public class McpBackgroundService : BackgroundService
{
    private readonly ILogger<McpBackgroundService> _logger;
    private readonly McpServer _mcpServer;

    public McpBackgroundService(ILogger<McpBackgroundService> logger, McpServer mcpServer)
    {
        _logger = logger;
        _mcpServer = mcpServer;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CaseManager MCP Server Background Service is starting...");

        try
        {
            await _mcpServer.RunAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Fatal error in MCP Server");
            throw;
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("CaseManager MCP Server Background Service is stopping...");
        await base.StopAsync(cancellationToken);
    }
}
