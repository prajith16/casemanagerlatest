#!/bin/bash

# Interactive MCP Server Tester
# This script sends JSON-RPC messages to the MCP server and displays responses

echo "=== CaseManager MCP Server Interactive Tester ===" >&2
echo "" >&2

# Change to the server directory
cd "$(dirname "$0")/CaseManager.McpServer"

# Function to send a message and read response
send_message() {
    local message="$1"
    local description="$2"
    
    echo ">>> $description" >&2
    echo "Request: $message" >&2
    echo "" >&2
    
    echo "$message"
    sleep 0.5
}

# Start dotnet run and pipe to it
{
    # Initialize
    send_message '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' "Initialize MCP Session"
    
    # List tools
    send_message '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' "List Available Tools"
    
    # Call list_completable_cases
    send_message '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_completable_cases","arguments":{}}}' "Get Completable Cases"
    
    # Sleep to allow server to process
    sleep 2
} | dotnet run 2>&1 | while IFS= read -r line; do
    # Check if it's a JSON response (starts with {)
    if [[ "$line" == "{"* ]]; then
        echo "Response:" >&2
        echo "$line" | jq . 2>/dev/null || echo "$line"
        echo "" >&2
    else
        # Print non-JSON lines to stderr (logs)
        echo "$line" >&2
    fi
done

echo "=== Test Complete ===" >&2
