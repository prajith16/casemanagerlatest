using Microsoft.EntityFrameworkCore;
using CaseManager.Api.Models;

namespace CaseManager.Api.Data;

/// <summary>
/// Database context for the Case Manager application
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

    /// <summary>
    /// MailContents DbSet
    /// </summary>
    public DbSet<MailContent> MailContents { get; set; }

    /// <summary>
    /// MailContentSents DbSet
    /// </summary>
    public DbSet<MailContentSent> MailContentSents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed Users
        modelBuilder.Entity<User>().HasData(
            new User
            {
                UserId = 1,
                UserName = "jdoe",
                FirstName = "John",
                LastName = "Doe",
                Address = "123 Main St, New York, NY 10001"
            },
            new User
            {
                UserId = 2,
                UserName = "asmith",
                FirstName = "Alice",
                LastName = "Smith",
                Address = "456 Oak Ave, Los Angeles, CA 90001"
            },
            new User
            {
                UserId = 3,
                UserName = "bjones",
                FirstName = "Bob",
                LastName = "Jones",
                Address = "789 Pine Rd, Chicago, IL 60601"
            }
        );

        // Seed Cases
        modelBuilder.Entity<Case>().HasData(
            new Case
            {
                CaseId = 1,
                CaseName = "Customer Support Request",
                IsComplete = false,
                CanComplete = true,
                AssignedUserId = 2
            },
            new Case
            {
                CaseId = 2,
                CaseName = "Technical Issue Investigation",
                IsComplete = false,
                CanComplete = false,
                AssignedUserId = 3
            },
            new Case
            {
                CaseId = 3,
                CaseName = "Account Verification",
                IsComplete = true,
                CanComplete = true,
                AssignedUserId = 1
            }
        );

        // Seed TaskActions
        modelBuilder.Entity<TaskAction>().HasData(
            new TaskAction
            {
                TaskActionId = 1,
                TaskActionName = "Initial Review",
                CaseId = 1,
                UserId = 2
            },
            new TaskAction
            {
                TaskActionId = 2,
                TaskActionName = "Gather Requirements",
                CaseId = 1,
                UserId = 2
            },
            new TaskAction
            {
                TaskActionId = 3,
                TaskActionName = "Diagnose Problem",
                CaseId = 2,
                UserId = 3
            },
            new TaskAction
            {
                TaskActionId = 4,
                TaskActionName = "Verify Documents",
                CaseId = 3,
                UserId = 1
            }
        );
    }
}
