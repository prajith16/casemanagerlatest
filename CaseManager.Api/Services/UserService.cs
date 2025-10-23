using CaseManager.Api.Models;
using CaseManager.Api.Repositories;

namespace CaseManager.Api.Services;

/// <summary>
/// Service implementation for User operations
/// </summary>
public class UserService : IUserService
{
    private readonly IRepository<User> _repository;

    public UserService(IRepository<User> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        return await _repository.AddAsync(user);
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        return await _repository.UpdateAsync(user);
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        return await _repository.DeleteAsync(id);
    }
}
