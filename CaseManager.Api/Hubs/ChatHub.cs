using Microsoft.AspNetCore.SignalR;

namespace CaseManager.Api.Hubs;

/// <summary>
/// SignalR Hub for real-time chat communication
/// </summary>
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Send a chat message chunk to the client
    /// </summary>
    public async Task SendMessageChunk(string sessionId, string chunk)
    {
        await Clients.Caller.SendAsync("ReceiveMessageChunk", sessionId, chunk);
    }

    /// <summary>
    /// Indicate that the message is complete
    /// </summary>
    public async Task SendMessageComplete(string sessionId)
    {
        await Clients.Caller.SendAsync("ReceiveMessageComplete", sessionId);
    }
}
