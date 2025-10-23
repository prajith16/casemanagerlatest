using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Service interface for Case operations
/// </summary>
public interface ICaseService
{
    Task<IEnumerable<Case>> GetAllCasesAsync();
    Task<IEnumerable<CaseDto>> GetAllCasesWithUserAsync();
    Task<Case?> GetCaseByIdAsync(int id);
    Task<CaseDetailDto?> GetCaseDetailByIdAsync(int id);
    Task<Case> CreateCaseAsync(Case caseItem);
    Task<Case> UpdateCaseAsync(Case caseItem);
    Task<bool> DeleteCaseAsync(int id);
}
