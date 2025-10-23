using Newtonsoft.Json;

namespace CaseManager.McpServer.Mcp;

public class McpTool
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("description")]
    public string Description { get; set; } = string.Empty;

    [JsonProperty("inputSchema")]
    public object InputSchema { get; set; } = new { };
}

public class ToolResult
{
    [JsonProperty("content")]
    public List<ContentItem> Content { get; set; } = new();
}

public class ContentItem
{
    [JsonProperty("type")]
    public string Type { get; set; } = "text";

    [JsonProperty("text")]
    public string Text { get; set; } = string.Empty;
}
