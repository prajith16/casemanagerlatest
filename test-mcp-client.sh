#!/bin/bash

# Test script for MCP Client Implementation

echo "==================================="
echo "MCP Client Implementation Test"
echo "==================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${YELLOW}Step 1: Checking if backend API is running...${NC}"
if curl -s http://localhost:5226/api/cases > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is running${NC}"
else
    echo -e "${RED}✗ Backend API is not running. Please start it first.${NC}"
    echo "  Run: cd CaseManager.Api && dotnet run"
    exit 1
fi
echo ""

# Test initialize endpoint
echo -e "${YELLOW}Step 2: Testing MCP initialize...${NC}"
INIT_RESPONSE=$(curl -s -X POST http://localhost:5226/api/mcp/rpc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }' 2>&1)

if echo "$INIT_RESPONSE" | grep -q "protocolVersion"; then
    echo -e "${GREEN}✓ MCP initialize successful${NC}"
    echo "  Response: $(echo $INIT_RESPONSE | jq -r '.result.serverInfo.name' 2>/dev/null || echo 'JSON parse error')"
else
    echo -e "${RED}✗ MCP initialize failed${NC}"
    echo "  Response: $INIT_RESPONSE"
fi
echo ""

# Test tools/list endpoint
echo -e "${YELLOW}Step 3: Testing MCP tools/list...${NC}"
TOOLS_RESPONSE=$(curl -s -X POST http://localhost:5226/api/mcp/rpc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' 2>&1)

if echo "$TOOLS_RESPONSE" | grep -q "tools"; then
    echo -e "${GREEN}✓ MCP tools/list successful${NC}"
    TOOL_COUNT=$(echo $TOOLS_RESPONSE | jq -r '.result.tools | length' 2>/dev/null || echo '0')
    echo "  Found $TOOL_COUNT tools"
else
    echo -e "${RED}✗ MCP tools/list failed${NC}"
    echo "  Response: $TOOLS_RESPONSE"
fi
echo ""

# Test tools/call endpoint (list_completable_cases)
echo -e "${YELLOW}Step 4: Testing MCP tools/call (list_completable_cases)...${NC}"
CALL_RESPONSE=$(curl -s -X POST http://localhost:5226/api/mcp/rpc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_completable_cases",
      "arguments": {
        "userId": 1
      }
    }
  }' 2>&1)

if echo "$CALL_RESPONSE" | grep -q "content"; then
    echo -e "${GREEN}✓ MCP tools/call successful${NC}"
    echo "  Tool executed successfully"
else
    echo -e "${RED}✗ MCP tools/call failed${NC}"
    echo "  Response: $CALL_RESPONSE"
fi
echo ""

echo "==================================="
echo "Test Summary"
echo "==================================="
echo ""
echo -e "${YELLOW}Note:${NC} The tests above require:"
echo "  1. Backend API running (CaseManager.Api)"
echo "  2. Valid authentication token"
echo "  3. Database with test data"
echo ""
echo "To test the full MCP client in Angular:"
echo "  1. Start the backend: cd CaseManager.Api && dotnet run"
echo "  2. Start the frontend: cd CaseManager.web && npm start"
echo "  3. Open browser to http://localhost:4200"
echo "  4. Login and open the chat widget"
echo "  5. Try the MCP tools in the widget"
echo ""
