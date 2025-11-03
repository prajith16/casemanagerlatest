using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaseManager.McpServer.Models;

/// <summary>
/// Represents sent mail content responses
/// </summary>
public class MailContentSent
{
    [Key]
    public int MailContentSentId { get; set; }

    [Column(TypeName = "text")]
    public string ResponseContent { get; set; } = string.Empty;

    public int ContentId { get; set; }

    [ForeignKey("ContentId")]
    public MailContent? MailContent { get; set; }
}
