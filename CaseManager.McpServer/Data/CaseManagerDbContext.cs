using Microsoft.EntityFrameworkCore;
using CaseManager.McpServer.Models;

namespace CaseManager.McpServer.Data;

/// <summary>
/// Database context for the MCP Server
/// </summary>
public class CaseManagerDbContext : DbContext
{
    public CaseManagerDbContext(DbContextOptions<CaseManagerDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Users DbSet
    /// </summary>
    public DbSet<User> Users { get; set; }

    /// <summary>
    /// Cases DbSet
    /// </summary>
    public DbSet<Case> Cases { get; set; }

    /// <summary>
    /// TaskActions DbSet
    /// </summary>
    public DbSet<TaskAction> TaskActions { get; set; }
}
