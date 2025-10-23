import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { McpTransportService } from './mcp-transport.service';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface McpListCompletableCasesResponse {
  cases: any[];
  count: number;
  userId: number;
}

export interface McpCompleteTaskResponse {
  success: boolean;
  message: string;
  completedCount: number;
  userId: number;
}

/**
 * MCP Client Service using the Model Context Protocol
 * This service uses a custom transport layer to communicate with the MCP server
 * following the official MCP SDK pattern.
 */
@Injectable({
  providedIn: 'root',
})
export class McpClientService {
  private isInitialized = false;
  private availableTools: McpTool[] = [];
  private toolsSubject = new BehaviorSubject<McpTool[]>([]);
  public tools$ = this.toolsSubject.asObservable();

  constructor(private http: HttpClient, private transport: McpTransportService) {
    this.initializeClient();
  }

  /**
   * Initialize the MCP client connection
   */
  private async initializeClient(): Promise<void> {
    try {
      console.log('Initializing MCP client...');

      // Initialize the connection
      const initResponse = await this.transport.initialize();
      console.log('MCP Server initialized:', initResponse);

      // List available tools
      const toolsResponse = await this.transport.listTools();
      console.log('Available MCP tools:', toolsResponse);

      if (toolsResponse && toolsResponse.tools) {
        this.availableTools = toolsResponse.tools;
        this.toolsSubject.next(this.availableTools);
      }

      this.isInitialized = true;
      console.log('MCP client ready');
    } catch (error) {
      console.error('Error initializing MCP client:', error);
      // Fallback to hardcoded tools if initialization fails
      this.availableTools = this.getFallbackTools();
      this.toolsSubject.next(this.availableTools);
    }
  }

  /**
   * Get fallback tools if MCP server is unavailable
   */
  private getFallbackTools(): McpTool[] {
    return [
      {
        name: 'list_completable_cases',
        description: 'Get all cases where CanComplete is true and assigned to you',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'The ID of the logged in user',
            },
          },
          required: ['userId'],
        },
      },
      {
        name: 'complete_task',
        description: 'Complete all assigned tasks by marking cases as complete',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'The ID of the logged in user',
            },
          },
          required: ['userId'],
        },
      },
    ];
  }

  /**
   * List all completable cases assigned to the user using MCP
   */
  listCompletableCases(userId: number): Observable<McpListCompletableCasesResponse> {
    return from(
      (async () => {
        try {
          const response = await this.transport.callTool('list_completable_cases', { userId });

          // Parse the response from MCP tool result
          if (response && response.content && response.content.length > 0) {
            const content = response.content[0];
            if (content.type === 'text') {
              const result = JSON.parse(content.text);
              return result;
            }
          }

          // Fallback if response format is unexpected
          return {
            cases: [],
            count: 0,
            userId,
          };
        } catch (error) {
          console.error('Error calling list_completable_cases via MCP:', error);
          throw error;
        }
      })()
    );
  }

  /**
   * Complete all tasks assigned to the user using MCP
   */
  completeTasks(userId: number): Observable<McpCompleteTaskResponse> {
    return from(
      (async () => {
        try {
          const response = await this.transport.callTool('complete_task', { userId });

          // Parse the response from MCP tool result
          if (response && response.content && response.content.length > 0) {
            const content = response.content[0];
            if (content.type === 'text') {
              const result = JSON.parse(content.text);
              return result;
            }
          }

          // Fallback if response format is unexpected
          return {
            success: false,
            message: 'Unexpected response format',
            completedCount: 0,
            userId,
          };
        } catch (error) {
          console.error('Error calling complete_task via MCP:', error);
          throw error;
        }
      })()
    );
  }

  /**
   * Get available MCP tools
   */
  getTools(): McpTool[] {
    return this.availableTools.length > 0 ? this.availableTools : this.getFallbackTools();
  }

  /**
   * Call any MCP tool by name with arguments
   */
  callTool(toolName: string, args: any): Observable<any> {
    return from(
      (async () => {
        try {
          const response = await this.transport.callTool(toolName, args);
          return response;
        } catch (error) {
          console.error(`Error calling tool ${toolName}:`, error);
          throw error;
        }
      })()
    );
  }

  /**
   * Check if the client is initialized
   */
  isClientReady(): boolean {
    return this.isInitialized;
  }
}
