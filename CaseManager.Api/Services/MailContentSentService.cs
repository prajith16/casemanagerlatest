using CaseManager.Api.Models;
using CaseManager.Api.Repositories;

namespace CaseManager.Api.Services;

/// <summary>
/// Service implementation for MailContentSent operations
/// </summary>
public class MailContentSentService : IMailContentSentService
{
    private readonly IRepository<MailContentSent> _repository;

    public MailContentSentService(IRepository<MailContentSent> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MailContentSent>> GetAllMailContentSentsAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<MailContentSent?> GetMailContentSentByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<bool> DeleteMailContentSentAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
