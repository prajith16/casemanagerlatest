using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using CaseManager.McpServer.Data;
using CaseManager.McpServer.Services;
using CaseManager.McpServer.Mcp;

var builder = Host.CreateApplicationBuilder(args);

// Configure logging to stderr only (stdout is reserved for MCP protocol)
builder.Logging.ClearProviders();
builder.Logging.AddConsole(options =>
{
    options.LogToStandardErrorThreshold = LogLevel.Trace;
});

// Add database context
builder.Services.AddDbContext<CaseManagerDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=../CaseManager.Api/casemanager.db"));

// Add services
builder.Services.AddScoped<IMcpCaseService, McpCaseService>();
builder.Services.AddScoped<IMailContentService, MailContentService>();
builder.Services.AddSingleton<McpServer>();

// Add the MCP background service
builder.Services.AddHostedService<McpBackgroundService>();

var host = builder.Build();

// Ensure database is created
using (var scope = host.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CaseManagerDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

await host.RunAsync();
