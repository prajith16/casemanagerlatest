using Microsoft.AspNetCore.Mvc;
using CaseManager.Api.Models;
using CaseManager.Api.Services;

namespace CaseManager.Api.Controllers;

/// <summary>
/// API Controller for managing Mail Contents
/// </summary>
[Route("api/[controller]")]
[Produces("application/json")]
public class MailContentsController : BaseController
{
    private readonly IMailContentService _mailContentService;

    public MailContentsController(IMailContentService mailContentService, ILogger<MailContentsController> logger)
        : base(logger)
    {
        _mailContentService = mailContentService;
    }

    /// <summary>
    /// Get all mail contents
    /// </summary>
    /// <returns>List of all mail contents</returns>
    /// <response code="200">Returns the list of mail contents</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MailContent>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<MailContent>>> GetAllMailContents()
    {
        Logger.LogInformation("Getting all mail contents");
        var mailContents = await _mailContentService.GetAllMailContentsAsync();
        return Ok(mailContents);
    }

    /// <summary>
    /// Get a specific mail content by ID
    /// </summary>
    /// <param name="id">Mail Content ID</param>
    /// <returns>Mail content details</returns>
    /// <response code="200">Returns the mail content</response>
    /// <response code="404">Mail content not found</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(MailContent), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MailContent>> GetMailContentById(int id)
    {
        Logger.LogInformation("Getting mail content with ID: {ContentId}", id);
        var mailContent = await _mailContentService.GetMailContentByIdAsync(id);

        if (mailContent == null)
        {
            Logger.LogWarning("Mail content with ID: {ContentId} not found", id);
            return NotFound(new { message = $"Mail content with ID {id} not found" });
        }

        return Ok(mailContent);
    }

    /// <summary>
    /// Create a new mail content
    /// </summary>
    /// <param name="mailContent">Mail content details</param>
    /// <returns>Created mail content</returns>
    /// <response code="201">Mail content created successfully</response>
    /// <response code="400">Invalid mail content data</response>
    [HttpPost]
    [ProducesResponseType(typeof(MailContent), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MailContent>> CreateMailContent([FromBody] MailContent mailContent)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Logger.LogInformation("Creating new mail content with subject: {Subject}", mailContent.Subject);
        var createdMailContent = await _mailContentService.CreateMailContentAsync(mailContent);
        return CreatedAtAction(nameof(GetMailContentById), new { id = createdMailContent.ContentId }, createdMailContent);
    }

    /// <summary>
    /// Update an existing mail content
    /// </summary>
    /// <param name="id">Mail Content ID</param>
    /// <param name="mailContent">Updated mail content details</param>
    /// <returns>Updated mail content</returns>
    /// <response code="200">Mail content updated successfully</response>
    /// <response code="400">Invalid mail content data or ID mismatch</response>
    /// <response code="404">Mail content not found</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(MailContent), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MailContent>> UpdateMailContent(int id, [FromBody] MailContent mailContent)
    {
        if (id != mailContent.ContentId)
        {
            return BadRequest(new { message = "ID mismatch" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            Logger.LogInformation("Updating mail content with ID: {ContentId}", id);
            var updatedMailContent = await _mailContentService.UpdateMailContentAsync(mailContent);
            return Ok(updatedMailContent);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error updating mail content with ID: {ContentId}", id);
            return NotFound(new { message = $"Mail content with ID {id} not found" });
        }
    }

    /// <summary>
    /// Delete a mail content
    /// </summary>
    /// <param name="id">Mail Content ID</param>
    /// <returns>No content</returns>
    /// <response code="204">Mail content deleted successfully</response>
    /// <response code="404">Mail content not found</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMailContent(int id)
    {
        Logger.LogInformation("Deleting mail content with ID: {ContentId}", id);
        var result = await _mailContentService.DeleteMailContentAsync(id);

        if (!result)
        {
            Logger.LogWarning("Mail content with ID: {ContentId} not found for deletion", id);
            return NotFound(new { message = $"Mail content with ID {id} not found" });
        }

        return NoContent();
    }

    /// <summary>
    /// Generate AI-powered response for a mail content
    /// </summary>
    /// <param name="id">Mail Content ID</param>
    /// <returns>Generated response</returns>
    /// <response code="200">Response generated successfully</response>
    /// <response code="404">Mail content not found</response>
    /// <response code="500">Error generating response</response>
    [HttpPost("{id}/generate-response")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> GenerateResponse(int id)
    {
        try
        {
            Logger.LogInformation("Generating AI response for mail content ID: {ContentId}", id);
            var response = await _mailContentService.GenerateMailResponseAsync(id);

            return Ok(new
            {
                success = true,
                message = "Response generated successfully",
                contentId = id,
                response
            });
        }
        catch (ArgumentException ex)
        {
            Logger.LogWarning(ex, "Mail content not found: {ContentId}", id);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error generating response for mail content ID: {ContentId}", id);
            return StatusCode(500, new { message = "Error generating response. Please try again." });
        }
    }
}
