using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaseManager.McpServer.Models;

/// <summary>
/// Represents mail content in the system
/// </summary>
public class MailContent
{
    [Key]
    public int ContentId { get; set; }

    public string Subject { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string Content { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;

    public string ToEmail { get; set; } = string.Empty;
}
