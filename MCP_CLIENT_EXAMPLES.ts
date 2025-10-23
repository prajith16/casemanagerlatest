// Example usage of MCP Client in Angular components

import { Component, OnInit } from "@angular/core";
import { McpClientService, McpTool } from "./services/mcp-client.service";
import { AuthService } from "./services/auth.service";

/**
 * Example 1: Basic Tool Execution
 */
@Component({
  selector: "app-example-basic",
  template: `
    <button (click)="listCases()">List My Cases</button>
    <button (click)="completeTasks()">Complete Tasks</button>
  `,
})
export class ExampleBasicComponent {
  constructor(
    private mcpClient: McpClientService,
    private authService: AuthService
  ) {}

  listCases() {
    const userId = this.authService.getCurrentUser()?.userId;

    this.mcpClient.listCompletableCases(userId).subscribe({
      next: (response) => {
        console.log(`Found ${response.count} completable cases`);
        response.cases.forEach((c) => {
          console.log(`- ${c.caseName} (ID: ${c.caseId})`);
        });
      },
      error: (error) => {
        console.error("Failed to list cases:", error);
      },
    });
  }

  completeTasks() {
    const userId = this.authService.getCurrentUser()?.userId;

    this.mcpClient.completeTasks(userId).subscribe({
      next: (response) => {
        alert(response.message);
      },
      error: (error) => {
        alert("Failed to complete tasks: " + error.message);
      },
    });
  }
}

/**
 * Example 2: Display Available Tools
 */
@Component({
  selector: "app-example-tools",
  template: `
    <h3>Available MCP Tools</h3>
    <div *ngFor="let tool of tools">
      <h4>{{ tool.name }}</h4>
      <p>{{ tool.description }}</p>
      <button (click)="executeTool(tool)">Execute</button>
    </div>
  `,
})
export class ExampleToolsComponent implements OnInit {
  tools: McpTool[] = [];

  constructor(
    private mcpClient: McpClientService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get tools synchronously
    this.tools = this.mcpClient.getTools();

    // Or subscribe to tool updates
    this.mcpClient.tools$.subscribe((tools) => {
      this.tools = tools;
      console.log("Tools updated:", tools);
    });
  }

  executeTool(tool: McpTool) {
    const userId = this.authService.getCurrentUser()?.userId;

    // Execute tool based on name
    if (tool.name === "list_completable_cases") {
      this.mcpClient
        .listCompletableCases(userId)
        .subscribe((response) => console.log("Tool result:", response));
    } else if (tool.name === "complete_task") {
      this.mcpClient
        .completeTasks(userId)
        .subscribe((response) => console.log("Tool result:", response));
    }
  }
}

/**
 * Example 3: Advanced Error Handling
 */
@Component({
  selector: "app-example-advanced",
})
export class ExampleAdvancedComponent {
  isLoading = false;
  errorMessage = "";

  constructor(private mcpClient: McpClientService) {}

  async executeWithErrorHandling() {
    this.isLoading = true;
    this.errorMessage = "";

    try {
      const userId = 1;

      // Convert Observable to Promise for async/await
      const response = await this.mcpClient
        .listCompletableCases(userId)
        .toPromise();

      if (response.count === 0) {
        this.errorMessage = "No completable cases found";
      } else {
        console.log("Success:", response);
      }
    } catch (error: any) {
      this.errorMessage = error.message || "An error occurred";
      console.error("Error:", error);
    } finally {
      this.isLoading = false;
    }
  }
}

/**
 * Example 4: Using RxJS Operators
 */
import { map, catchError, retry } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-example-rxjs",
})
export class ExampleRxJSComponent {
  constructor(private mcpClient: McpClientService) {}

  listCasesWithRetry() {
    const userId = 1;

    this.mcpClient
      .listCompletableCases(userId)
      .pipe(
        // Retry up to 3 times on failure
        retry(3),

        // Transform the response
        map((response) => ({
          ...response,
          caseNames: response.cases.map((c) => c.caseName),
        })),

        // Handle errors gracefully
        catchError((error) => {
          console.error("Failed after retries:", error);
          return of({ cases: [], count: 0, userId, caseNames: [] });
        })
      )
      .subscribe((result) => {
        console.log("Case names:", result.caseNames);
      });
  }
}

/**
 * Example 5: Combining Multiple Tool Calls
 */
import { forkJoin } from "rxjs";

@Component({
  selector: "app-example-combined",
})
export class ExampleCombinedComponent {
  constructor(private mcpClient: McpClientService) {}

  async listAndComplete() {
    const userId = 1;

    // First, list the cases
    this.mcpClient.listCompletableCases(userId).subscribe({
      next: (listResponse) => {
        if (listResponse.count > 0) {
          console.log(`Found ${listResponse.count} cases to complete`);

          // Then, complete them
          this.mcpClient.completeTasks(userId).subscribe({
            next: (completeResponse) => {
              console.log(completeResponse.message);
            },
          });
        } else {
          console.log("No cases to complete");
        }
      },
    });
  }

  // Alternative: Execute in parallel
  listAndCompleteParallel() {
    const userId = 1;

    forkJoin({
      list: this.mcpClient.listCompletableCases(userId),
      complete: this.mcpClient.completeTasks(userId),
    }).subscribe({
      next: (results) => {
        console.log("List result:", results.list);
        console.log("Complete result:", results.complete);
      },
    });
  }
}

/**
 * Example 6: Custom Tool Execution
 */
@Component({
  selector: "app-example-custom",
})
export class ExampleCustomComponent {
  constructor(private mcpClient: McpClientService) {}

  // Generic method to call any tool
  callToolByName(toolName: string, args: any) {
    this.mcpClient.callTool(toolName, args).subscribe({
      next: (response) => {
        console.log("Tool response:", response);

        // Parse the content from MCP response
        if (response.content && response.content.length > 0) {
          const textContent = response.content[0].text;
          const result = JSON.parse(textContent);
          console.log("Parsed result:", result);
        }
      },
      error: (error) => {
        console.error("Tool error:", error);
      },
    });
  }

  executeCustomTool() {
    // Call any tool by name
    this.callToolByName("list_completable_cases", { userId: 1 });
  }
}

/**
 * Example 7: Service Integration
 */
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class TaskManagementService {
  constructor(
    private mcpClient: McpClientService,
    private authService: AuthService
  ) {}

  /**
   * Get pending tasks count
   */
  async getPendingTasksCount(): Promise<number> {
    const userId = this.authService.getCurrentUser()?.userId;
    if (!userId) return 0;

    const response = await this.mcpClient
      .listCompletableCases(userId)
      .toPromise();

    return response?.count || 0;
  }

  /**
   * Complete all pending tasks
   */
  async completeAllPendingTasks(): Promise<string> {
    const userId = this.authService.getCurrentUser()?.userId;
    if (!userId) return "User not logged in";

    const response = await this.mcpClient.completeTasks(userId).toPromise();

    return response?.message || "Unknown result";
  }

  /**
   * Check if user has pending tasks
   */
  async hasPendingTasks(): Promise<boolean> {
    const count = await this.getPendingTasksCount();
    return count > 0;
  }
}

/**
 * Example 8: Testing with Mock
 */

// Mock service for testing
class MockMcpClientService {
  listCompletableCases(userId: number) {
    return of({
      cases: [{ caseId: 1, caseName: "Test Case", canComplete: true }],
      count: 1,
      userId,
    });
  }

  completeTasks(userId: number) {
    return of({
      success: true,
      message: "Completed 1 task(s)",
      completedCount: 1,
      userId,
    });
  }

  getTools() {
    return [
      {
        name: "list_completable_cases",
        description: "List cases",
        inputSchema: {},
      },
    ];
  }
}

// In your test file
describe("MyComponent", () => {
  let component: MyComponent;
  let mcpClient: MockMcpClientService;

  beforeEach(() => {
    mcpClient = new MockMcpClientService();
    component = new MyComponent(mcpClient as any);
  });

  it("should list cases", (done) => {
    component.listCases();

    mcpClient.listCompletableCases(1).subscribe((response) => {
      expect(response.count).toBe(1);
      expect(response.cases.length).toBe(1);
      done();
    });
  });
});

/**
 * Example 9: Real-time Updates
 */
import { interval } from "rxjs";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "app-example-realtime",
})
export class ExampleRealtimeComponent implements OnInit, OnDestroy {
  taskCount$ = new BehaviorSubject<number>(0);
  private subscription?: Subscription;

  constructor(private mcpClient: McpClientService) {}

  ngOnInit() {
    const userId = 1;

    // Poll for updates every 30 seconds
    this.subscription = interval(30000)
      .pipe(switchMap(() => this.mcpClient.listCompletableCases(userId)))
      .subscribe((response) => {
        this.taskCount$.next(response.count);
      });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}

/**
 * Example 10: Loading States
 */
@Component({
  selector: "app-example-loading",
  template: `
    <button (click)="loadCases()" [disabled]="isLoading">
      {{ isLoading ? "Loading..." : "Load Cases" }}
    </button>

    <div *ngIf="cases.length > 0">
      <div *ngFor="let case of cases">
        {{ case.caseName }}
      </div>
    </div>

    <div *ngIf="error" class="error">
      {{ error }}
    </div>
  `,
})
export class ExampleLoadingComponent {
  cases: any[] = [];
  isLoading = false;
  error = "";

  constructor(private mcpClient: McpClientService) {}

  loadCases() {
    this.isLoading = true;
    this.error = "";
    this.cases = [];

    const userId = 1;

    this.mcpClient.listCompletableCases(userId).subscribe({
      next: (response) => {
        this.cases = response.cases;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message || "Failed to load cases";
        this.isLoading = false;
      },
    });
  }
}
