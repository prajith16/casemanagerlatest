using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Interface for MailContent service operations
/// </summary>
public interface IMailContentService
{
    Task<IEnumerable<MailContent>> GetAllMailContentsAsync();
    Task<MailContent?> GetMailContentByIdAsync(int id);
    Task<MailContent> CreateMailContentAsync(MailContent mailContent);
    Task<MailContent> UpdateMailContentAsync(MailContent mailContent);
    Task<bool> DeleteMailContentAsync(int id);
    Task<string> GenerateMailResponseAsync(int contentId);
}
