import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Custom HTTP Transport for MCP
 * Since the MCP server uses stdio, we need an HTTP bridge to communicate with it.
 * This service provides HTTP-based communication that bridges to the MCP server.
 */
@Injectable({
  providedIn: 'root',
})
export class McpTransportService {
  private messageId = 0;

  constructor(private http: HttpClient) {}

  /**
   * Generate a unique message ID for JSON-RPC requests
   */
  private getNextId(): number {
    return ++this.messageId;
  }

  /**
   * Send a JSON-RPC request to the MCP server via HTTP bridge
   */
  async sendRequest(method: string, params?: any): Promise<any> {
    const message = {
      jsonrpc: '2.0',
      id: this.getNextId(),
      method,
      params: params || {},
    };

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await firstValueFrom(
        this.http.post<any>('/api/mcp/rpc', message, {
          headers: new HttpHeaders(headers),
        })
      );

      if (response.error) {
        throw new Error(`MCP Error: ${response.error.message}`);
      }

      return response.result;
    } catch (error: any) {
      console.error('MCP Transport Error:', error);
      throw error;
    }
  }

  /**
   * Initialize the MCP connection
   */
  async initialize(): Promise<any> {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'casemanager-angular-client',
        version: '1.0.0',
      },
    });
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any> {
    return this.sendRequest('tools/list');
  }

  /**
   * Call a specific tool
   */
  async callTool(name: string, args: any): Promise<any> {
    return this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }
}
