using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using CaseManager.Api.Models;
using CaseManager.Api.Services;
using CaseManager.Api.Hubs;

namespace CaseManager.Api.Controllers;

/// <summary>
/// API Controller for AI chat functionality
/// </summary>
[Route("api/[controller]")]
[Produces("application/json")]
public class ChatController : BaseController
{
    private readonly IAIService _aiService;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(
        IAIService aiService,
        IHubContext<ChatHub> hubContext,
        ILogger<ChatController> logger)
        : base(logger)
    {
        _aiService = aiService;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Send a chat message and receive AI response
    /// </summary>
    /// <param name="request">Chat request with user message and session ID</param>
    /// <returns>AI response</returns>
    /// <response code="200">Returns the AI response</response>
    /// <response code="400">Invalid request</response>
    [HttpPost]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ChatResponse>> SendMessage([FromBody] ChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Message cannot be empty" });
        }

        // Generate session ID if not provided
        var sessionId = !string.IsNullOrEmpty(request.SessionId)
            ? request.SessionId
            : Guid.NewGuid().ToString();

        Logger.LogInformation(
            "Chat request from user {UserId} ({UserName}) in session {SessionId}",
            CurrentUser.UserId,
            CurrentUser.UserName,
            sessionId);

        try
        {
            var response = await _aiService.ChatAsync(
                request.Message,
                sessionId,
                chunk =>
                {
                    // Send each chunk via SignalR for real-time streaming
                    _hubContext.Clients.All.SendAsync("ReceiveMessageChunk", sessionId, chunk);
                });

            // Notify completion
            await _hubContext.Clients.All.SendAsync("ReceiveMessageComplete", sessionId);

            return Ok(new ChatResponse
            {
                Message = response,
                SessionId = sessionId,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Error processing chat message for session {SessionId}", sessionId);
            return StatusCode(500, new { message = "An error occurred processing your request" });
        }
    }

    /// <summary>
    /// Get chat history for a session
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>List of chat messages</returns>
    /// <response code="200">Returns the chat history</response>
    [HttpGet("history/{sessionId}")]
    [ProducesResponseType(typeof(List<ChatMessage>), StatusCodes.Status200OK)]
    public ActionResult<List<ChatMessage>> GetHistory(string sessionId)
    {
        Logger.LogInformation(
            "Getting chat history for session {SessionId} by user {UserId}",
            sessionId,
            CurrentUser.UserId);

        var history = _aiService.GetChatHistory(sessionId);
        return Ok(history);
    }

    /// <summary>
    /// Clear chat history for a session
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>Success message</returns>
    /// <response code="200">History cleared successfully</response>
    [HttpDelete("history/{sessionId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult ClearHistory(string sessionId)
    {
        Logger.LogInformation(
            "Clearing chat history for session {SessionId} by user {UserId}",
            sessionId,
            CurrentUser.UserId);

        _aiService.ClearChatHistory(sessionId);
        return Ok(new { message = "Chat history cleared successfully" });
    }
}
