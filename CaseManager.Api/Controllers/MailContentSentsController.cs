using Microsoft.AspNetCore.Mvc;
using CaseManager.Api.Models;
using CaseManager.Api.Services;

namespace CaseManager.Api.Controllers;

/// <summary>
/// API Controller for managing Mail Content Sent responses
/// </summary>
[Route("api/[controller]")]
[Produces("application/json")]
public class MailContentSentsController : BaseController
{
    private readonly IMailContentSentService _mailContentSentService;

    public MailContentSentsController(IMailContentSentService mailContentSentService, ILogger<MailContentSentsController> logger)
        : base(logger)
    {
        _mailContentSentService = mailContentSentService;
    }

    /// <summary>
    /// Get all mail content sent responses
    /// </summary>
    /// <returns>List of all mail content sent responses</returns>
    /// <response code="200">Returns the list of mail content sent responses</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MailContentSent>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MailContentSent>>> GetAllMailContentSents()
    {
        Logger.LogInformation("Getting all mail content sent responses");
        var mailContentSents = await _mailContentSentService.GetAllMailContentSentsAsync();
        return Ok(mailContentSents);
    }

    /// <summary>
    /// Get a specific mail content sent by ID
    /// </summary>
    /// <param name="id">Mail Content Sent ID</param>
    /// <returns>Mail content sent details</returns>
    /// <response code="200">Returns the mail content sent</response>
    /// <response code="404">Mail content sent not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MailContentSent), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MailContentSent>> GetMailContentSentById(int id)
    {
        Logger.LogInformation("Getting mail content sent with ID: {MailContentSentId}", id);
        var mailContentSent = await _mailContentSentService.GetMailContentSentByIdAsync(id);

        if (mailContentSent == null)
        {
            Logger.LogWarning("Mail content sent with ID: {MailContentSentId} not found", id);
            return NotFound(new { message = $"Mail content sent with ID {id} not found" });
        }

        return Ok(mailContentSent);
    }

    /// <summary>
    /// Delete a mail content sent response
    /// </summary>
    /// <param name="id">Mail Content Sent ID</param>
    /// <returns>No content</returns>
    /// <response code="204">Mail content sent deleted successfully</response>
    /// <response code="404">Mail content sent not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMailContentSent(int id)
    {
        Logger.LogInformation("Deleting mail content sent with ID: {MailContentSentId}", id);
        var result = await _mailContentSentService.DeleteMailContentSentAsync(id);

        if (!result)
        {
            Logger.LogWarning("Mail content sent with ID: {MailContentSentId} not found for deletion", id);
            return NotFound(new { message = $"Mail content sent with ID {id} not found" });
        }

        return NoContent();
    }
}
