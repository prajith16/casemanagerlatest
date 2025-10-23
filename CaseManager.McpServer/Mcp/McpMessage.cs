using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CaseManager.McpServer.Mcp;

public class McpMessage
{
    [JsonProperty("jsonrpc")]
    public string JsonRpc { get; set; } = "2.0";

    [JsonProperty("id", NullValueHandling = NullValueHandling.Ignore)]
    public object? Id { get; set; }

    [JsonProperty("method", NullValueHandling = NullValueHandling.Ignore)]
    public string? Method { get; set; }

    [JsonProperty("params", NullValueHandling = NullValueHandling.Ignore)]
    public JObject? Params { get; set; }

    [JsonProperty("result", NullValueHandling = NullValueHandling.Ignore)]
    public object? Result { get; set; }

    [JsonProperty("error", NullValueHandling = NullValueHandling.Ignore)]
    public McpError? Error { get; set; }
}

public class McpError
{
    [JsonProperty("code")]
    public int Code { get; set; }

    [JsonProperty("message")]
    public string Message { get; set; } = string.Empty;

    [JsonProperty("data", NullValueHandling = NullValueHandling.Ignore)]
    public object? Data { get; set; }
}
