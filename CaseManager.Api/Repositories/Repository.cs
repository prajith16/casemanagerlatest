using Microsoft.EntityFrameworkCore;
using CaseManager.Api.Data;

namespace CaseManager.Api.Repositories;

/// <summary>
/// Generic repository implementation for CRUD operations
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class Repository<T> : IRepository<T> where T : class
{
    private readonly CaseManagerDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository(CaseManagerDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        // Detach any existing tracked entity with the same key
        var existingEntry = _context.ChangeTracker.Entries<T>()
            .FirstOrDefault(e => e.Entity == entity);

        if (existingEntry == null)
        {
            // Find any tracked entity with the same ID
            var trackedEntries = _context.ChangeTracker.Entries<T>().ToList();
            foreach (var entry in trackedEntries)
            {
                entry.State = EntityState.Detached;
            }
        }

        _context.Entry(entity).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
            return false;

        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
