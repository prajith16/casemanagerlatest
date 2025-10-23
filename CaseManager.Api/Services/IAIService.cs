using CaseManager.Api.Models;

namespace CaseManager.Api.Services;

/// <summary>
/// Service interface for AI-powered chat functionality
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Process a chat message and generate an AI response
    /// </summary>
    /// <param name="message">User's input message</param>
    /// <param name="sessionId">Session ID for conversation tracking</param>
    /// <param name="onChunkReceived">Callback for streaming response chunks</param>
    /// <returns>Complete AI response</returns>
    Task<string> ChatAsync(string message, string sessionId, Action<string>? onChunkReceived = null);

    /// <summary>
    /// Get chat history for a specific session
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    /// <returns>List of chat messages</returns>
    List<ChatMessage> GetChatHistory(string sessionId);

    /// <summary>
    /// Clear chat history for a specific session
    /// </summary>
    /// <param name="sessionId">Session ID</param>
    void ClearChatHistory(string sessionId);
}
