#!/bin/bash

# Test script for MCP Server
# This demonstrates how to interact with the MCP server using JSON-RPC messages

cd "$(dirname "$0")/CaseManager.McpServer"

# Start the server in the background
dotnet run &
SERVER_PID=$!

# Give it a moment to start
sleep 2

echo "Testing MCP Server..." >&2
echo "" >&2

# Test 1: Initialize
echo "1. Initializing MCP session..." >&2
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' 

sleep 1

# Test 2: List tools
echo "" >&2
echo "2. Listing available tools..." >&2
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

sleep 1

# Test 3: Call list_completable_cases
echo "" >&2
echo "3. Calling list_completable_cases..." >&2
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_completable_cases","arguments":{}}}'

sleep 1

# Cleanup
kill $SERVER_PID 2>/dev/null
echo "" >&2
echo "Test completed." >&2
