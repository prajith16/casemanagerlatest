using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Interface for MailContentSent service operations
/// </summary>
public interface IMailContentSentService
{
    Task<IEnumerable<MailContentSent>> GetAllMailContentSentsAsync();
    Task<MailContentSent?> GetMailContentSentByIdAsync(int id);
    Task<bool> DeleteMailContentSentAsync(int id);
}
