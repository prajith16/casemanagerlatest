using CaseManager.Api.Models;

namespace CaseManager.Api.Repositories;

/// <summary>
/// Generic repository interface for CRUD operations
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface IRepository<T> where T : class
{
    /// <summary>
    /// Get all entities
    /// </summary>
    Task<IEnumerable<T>> GetAllAsync();

    /// <summary>
    /// Get entity by ID
    /// </summary>
    Task<T?> GetByIdAsync(int id);

    /// <summary>
    /// Add new entity
    /// </summary>
    Task<T> AddAsync(T entity);

    /// <summary>
    /// Update existing entity
    /// </summary>
    Task<T> UpdateAsync(T entity);

    /// <summary>
    /// Delete entity by ID
    /// </summary>
    Task<bool> DeleteAsync(int id);
}
