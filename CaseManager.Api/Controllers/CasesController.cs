using Microsoft.AspNetCore.Mvc;
using CaseManager.Api.Models;
using CaseManager.Api.Services;

namespace CaseManager.Api.Controllers;

/// <summary>
/// API Controller for managing Cases
/// </summary>
[Route("api/[controller]")]
[Produces("application/json")]
public class CasesController : BaseController
{
    private readonly ICaseService _caseService;

    public CasesController(ICaseService caseService, ILogger<CasesController> logger)
        : base(logger)
    {
        _caseService = caseService;
    }

    /// <summary>
    /// Get all cases assigned to the current user with assigned user information
    /// </summary>
    /// <returns>List of cases assigned to the current user with user details</returns>
    /// <response code="200">Returns the list of cases with user information</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CaseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CaseDto>>> GetAllCases()
    {
        var userId = CurrentUser.UserId;
        Logger.LogInformation("Getting cases for user {UserId} ({UserName})", userId, CurrentUser.UserName);
        var allCases = await _caseService.GetAllCasesWithUserAsync();
        var userCases = allCases.Where(c => c.AssignedUserId == userId);
        return Ok(userCases);
    }

    /// <summary>
    /// Get a specific case by ID with user details
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <returns>Case details with user information</returns>
    /// <response code="200">Returns the case with user details</response>
    /// <response code="404">Case not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CaseDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CaseDetailDto>> GetCaseById(int id)
    {
        Logger.LogInformation("Getting case details with ID: {CaseId}", id);
        var caseDetail = await _caseService.GetCaseDetailByIdAsync(id);

        if (caseDetail == null)
        {
            Logger.LogWarning("Case with ID: {CaseId} not found", id);
            return NotFound(new { message = $"Case with ID {id} not found" });
        }

        return Ok(caseDetail);
    }

    /// <summary>
    /// Create a new case
    /// </summary>
    /// <param name="caseItem">Case details</param>
    /// <returns>Created case</returns>
    /// <response code="201">Case created successfully</response>
    /// <response code="400">Invalid case data</response>
    [HttpPost]
    [ProducesResponseType(typeof(Case), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Case>> CreateCase([FromBody] Case caseItem)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Logger.LogInformation("Creating new case: {CaseName}", caseItem.CaseName);
        var createdCase = await _caseService.CreateCaseAsync(caseItem);
        return CreatedAtAction(nameof(GetCaseById), new { id = createdCase.CaseId }, createdCase);
    }

    /// <summary>
    /// Update an existing case
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <param name="caseItem">Updated case details</param>
    /// <returns>Updated case</returns>
    /// <response code="200">Case updated successfully</response>
    /// <response code="400">Invalid case data or ID mismatch</response>
    /// <response code="404">Case not found</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Case), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Case>> UpdateCase(int id, [FromBody] Case caseItem)
    {
        if (id != caseItem.CaseId)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            Logger.LogInformation("Updating case with ID: {CaseId}", id);
            var updatedCase = await _caseService.UpdateCaseAsync(caseItem);
            return Ok(updatedCase);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating case with ID: {CaseId}", id);
            return NotFound(new { message = $"Case with ID {id} not found" });
        }
    }

    /// <summary>
    /// Delete a case
    /// </summary>
    /// <param name="id">Case ID</param>
    /// <returns>No content</returns>
    /// <response code="204">Case deleted successfully</response>
    /// <response code="404">Case not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCase(int id)
    {
        Logger.LogInformation("Deleting case with ID: {CaseId}", id);
        var result = await _caseService.DeleteCaseAsync(id);

        if (!result)
        {
            Logger.LogWarning("Case with ID: {CaseId} not found for deletion", id);
            return NotFound(new { message = $"Case with ID {id} not found" });
        }

        return NoContent();
    }
}
