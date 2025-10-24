using CaseManager.Api.Models;
using CaseManager.Api.Repositories;
using CaseManager.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace CaseManager.Api.Services;

/// <summary>
/// Service implementation for Case operations
/// </summary>
public class CaseService : ICaseService
{
    private readonly IRepository<Case> _repository;
    private readonly CaseManagerDbContext _context;

    public CaseService(IRepository<Case> repository, CaseManagerDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public async Task<IEnumerable<Case>> GetAllCasesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<IEnumerable<CaseDto>> GetAllCasesWithUserAsync()
    {
        var casesWithUser = await (from c in _context.Cases
                                   join u in _context.Users on c.AssignedUserId equals u.UserId
                                   select new CaseDto
                                   {
                                       CaseId = c.CaseId,
                                       CaseName = c.CaseName,
                                       IsComplete = c.IsComplete,
                                       CanComplete = c.CanComplete,
                                       AssignedUserId = c.AssignedUserId,
                                       AssignedUserFirstName = u.FirstName,
                                       AssignedUserLastName = u.LastName,
                                       AssignedUserName = u.UserName
                                   }).ToListAsync();

        return casesWithUser;
    }

    public async Task<Case?> GetCaseByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<CaseDetailDto?> GetCaseDetailByIdAsync(int id)
    {
        var caseDetail = await _context.Cases
            .Where(c => c.CaseId == id)
            .Join(_context.Users,
                c => c.AssignedUserId,
                u => u.UserId,
                (c, assignedUser) => new CaseDetailDto
                {
                    CaseId = c.CaseId,
                    CaseName = c.CaseName,
                    IsComplete = c.IsComplete,
                    CanComplete = c.CanComplete,
                    AssignedUserId = c.AssignedUserId,
                    AssignedUserFirstName = assignedUser.FirstName,
                    AssignedUserLastName = assignedUser.LastName
                })
            .FirstOrDefaultAsync();

        return caseDetail;
    }

    public async Task<Case> CreateCaseAsync(Case caseItem)
    {
        return await _repository.AddAsync(caseItem);
    }

    public async Task<Case> UpdateCaseAsync(Case caseItem)
    {
        return await _repository.UpdateAsync(caseItem);
    }

    public async Task<bool> DeleteCaseAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
