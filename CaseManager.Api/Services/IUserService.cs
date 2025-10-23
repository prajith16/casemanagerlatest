using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Service interface for User operations
/// </summary>
public interface IUserService
{
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User?> GetUserByIdAsync(int id);
    Task<User> CreateUserAsync(User user);
    Task<User> UpdateUserAsync(User user);
    Task<bool> DeleteUserAsync(int id);
}
