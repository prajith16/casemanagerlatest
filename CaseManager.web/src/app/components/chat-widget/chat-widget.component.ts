import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ChatService } from '../../services/chat.service';
import { McpClientService, McpTool } from '../../services/mcp-client.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../models/chat.model';
import { Subscription } from 'rxjs';
import { marked } from 'marked';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { CaseUpdateService } from '../../services/case-update.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
  ],
  template: `
    <div class="chat-widget" [class.expanded]="isExpanded" [class.minimized]="!isExpanded">
      <!-- Chat Toggle Button -->
      <button
        *ngIf="!isExpanded"
        mat-fab
        color="primary"
        class="chat-toggle"
        (click)="toggleChat()"
        matTooltip="Chat with Digital Worker"
      >
        <mat-icon>chat</mat-icon>
      </button>

      <!-- Chat Window -->
      <div *ngIf="isExpanded" class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-content">
            <mat-icon class="ai-icon">smart_toy</mat-icon>
            <div class="header-text">
              <h3>Digital Worker</h3>
              <p class="subtitle">AI Assistant</p>
            </div>
          </div>
          <div class="header-actions">
            <button mat-icon-button (click)="clearChat()" matTooltip="Clear chat">
              <mat-icon>delete_outline</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleChat()" matTooltip="Minimize">
              <mat-icon>minimize</mat-icon>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" #messagesContainer>
          <!-- Loading tasks indicator -->
          <div *ngIf="loadingTasks" class="loading-tasks">
            <mat-spinner diameter="32"></mat-spinner>
            <p>Checking for pending tasks...</p>
          </div>

          <!-- Pending Tasks Section -->
          <div
            *ngIf="!loadingTasks && pendingTasks.length > 0 && !hasCompletedInitialTasks"
            class="pending-tasks-section"
          >
            <div class="tasks-header">
              <mat-icon class="tasks-icon">assignment</mat-icon>
              <h4>You have {{ pendingTasks.length }} task(s) to complete</h4>
            </div>
            <div class="tasks-list">
              <mat-card *ngFor="let task of pendingTasks; let i = index" class="task-card">
                <mat-card-content>
                  <div class="task-number">{{ i + 1 }}</div>
                  <div class="task-details">
                    <div class="task-name">{{ task.caseName || task.CaseName || 'No Name' }}</div>
                    <div class="task-meta">
                      <span class="task-badge" *ngIf="task.canComplete">
                        <mat-icon>check_circle_outline</mat-icon>
                        Ready to Complete
                      </span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
            <div class="tasks-actions">
              <button
                mat-raised-button
                color="primary"
                class="complete-all-btn"
                (click)="completeAllTasks()"
                [disabled]="executingTool === 'complete_task'"
              >
                <mat-icon>done_all</mat-icon>
                Complete All Tasks
                <mat-spinner *ngIf="executingTool === 'complete_task'" diameter="20"></mat-spinner>
              </button>
            </div>
          </div>

          <!-- Welcome message when no messages and not loading and no pending tasks -->
          <div
            *ngIf="messages.length === 0 && !loadingTasks && pendingTasks.length === 0"
            class="welcome-message"
          >
            <mat-icon class="welcome-icon">waving_hand</mat-icon>
            <h4>Hello! I'm your Digital Worker</h4>
            <p>Ask me anything about the Case Manager application!</p>
          </div>

          <div
            *ngFor="let message of messages"
            class="message"
            [class.user-message]="message.role === 'user'"
            [class.assistant-message]="message.role === 'assistant'"
          >
            <div class="message-avatar">
              <mat-icon *ngIf="message.role === 'user'">person</mat-icon>
              <mat-icon *ngIf="message.role === 'assistant'">smart_toy</mat-icon>
            </div>
            <div class="message-content">
              <div class="message-text" [innerHTML]="formatMessageContent(message.content)"></div>
              <!-- Show complete button if this is a tasks message and there are pending tasks -->
              <button
                *ngIf="
                  pendingTasks.length > 0 &&
                  message.content.includes('task(s) that can be completed')
                "
                mat-raised-button
                color="primary"
                class="complete-tasks-btn"
                (click)="completeAllTasks()"
                [disabled]="executingTool === 'complete_task'"
              >
                <mat-icon>check_circle</mat-icon>
                Complete All Tasks
                <mat-spinner *ngIf="executingTool === 'complete_task'" diameter="16"></mat-spinner>
              </button>
              <div class="message-time">
                {{ message.timestamp | date : 'short' }}
              </div>
            </div>
          </div>

          <div *ngIf="isLoading" class="message assistant-message typing">
            <div class="message-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <mat-form-field appearance="outline" class="input-field">
            <input
              matInput
              [(ngModel)]="currentMessage"
              (keyup.enter)="sendMessage()"
              placeholder="Ask me anything..."
              [disabled]="isLoading"
            />
          </mat-form-field>
          <button
            mat-fab
            color="primary"
            class="send-button"
            (click)="sendMessage()"
            [disabled]="!currentMessage.trim() || isLoading"
          >
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-widget {
        position: fixed;
        z-index: 1000;
      }

      .chat-widget.minimized {
        bottom: 20px;
        right: 20px;
      }

      .chat-toggle {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .chat-window {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px;
        height: 700px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .chat-header {
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .ai-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .header-text h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        font-size: 12px;
        opacity: 0.9;
      }

      .header-actions {
        display: flex;
        gap: 4px;
      }

      .header-actions button {
        color: white;
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f5f5f5;
      }

      .welcome-message {
        text-align: center;
        padding: 40px 20px;
      }

      .welcome-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ffa726;
        margin: 0 auto 16px;
      }

      .welcome-message h4 {
        margin: 0 0 8px 0;
        color: #333;
      }

      .welcome-message p {
        color: #666;
        margin: 0 0 24px 0;
      }

      .suggested-questions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 300px;
        margin: 0 auto;
      }

      .suggestion-btn {
        text-align: left;
        font-size: 13px;
        padding: 8px 16px;
      }

      .message {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .message-avatar {
        flex-shrink: 0;
      }

      .message-avatar mat-icon {
        width: 36px;
        height: 36px;
        font-size: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        padding: 4px;
      }

      .user-message .message-avatar mat-icon {
        background: #1976d2;
        color: white;
      }

      .assistant-message .message-avatar mat-icon {
        background: #388e3c;
        color: white;
      }

      .message-content {
        flex: 1;
        max-width: calc(100% - 48px);
      }

      .message-text {
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        word-wrap: break-word;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .user-message .message-text {
        background: #e3f2fd;
      }

      .message-time {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        padding: 0 4px;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
        background: white;
        border-radius: 12px;
        width: fit-content;
      }

      .typing-indicator span {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%,
        60%,
        100% {
          transform: translateY(0);
        }
        30% {
          transform: translateY(-10px);
        }
      }

      .chat-input {
        padding: 16px;
        background: white;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .input-field {
        flex: 1;
        margin: 0;
      }

      .input-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }

      .send-button {
        width: 48px;
        height: 48px;
        min-width: 48px;
      }

      /* Scrollbar styling */
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      .chat-messages::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
      }

      .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .chat-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 40px);
          max-width: 400px;
        }
      }

      /* Loading tasks */
      .loading-tasks {
        text-align: center;
        padding: 40px 20px;
      }

      .loading-tasks p {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
      }

      /* Pending Tasks Section */
      .pending-tasks-section {
        background: white;
        border-radius: 12px;
        padding: 20px;
        margin: 16px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
      }

      .tasks-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e3f2fd;
      }

      .tasks-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #1976d2;
      }

      .tasks-header h4 {
        margin: 0;
        color: #1976d2;
        font-size: 16px;
        font-weight: 600;
      }

      .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        max-height: 300px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .task-card {
        cursor: default;
        transition: all 0.2s ease;
        background: #f8f9fa;
        padding: 0 !important;
        overflow: hidden;
      }

      .task-card:hover {
        background: #e3f2fd;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .task-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px !important;
      }

      .task-number {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }

      .task-details {
        flex: 1;
        min-width: 0;
      }

      .task-name {
        font-weight: 500;
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
        line-height: 1.4;
      }

      .task-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .task-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: #e8f5e9;
        color: #2e7d32;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
      }

      .task-badge mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .tasks-actions {
        display: flex;
        justify-content: center;
        padding-top: 8px;
      }

      .complete-all-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px !important;
        font-size: 15px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      }

      .complete-all-btn mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .complete-all-btn:hover:not(:disabled) {
        box-shadow: 0 6px 16px rgba(25, 118, 210, 0.4);
        transform: translateY(-2px);
      }

      .complete-all-btn:disabled {
        opacity: 0.6;
      }

      .tasks-list::-webkit-scrollbar {
        width: 6px;
      }

      .tasks-list::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      .tasks-list::-webkit-scrollbar-thumb {
        background: #bbb;
        border-radius: 3px;
      }

      /* Complete tasks button */
      .complete-tasks-btn {
        margin-top: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .complete-tasks-btn mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .complete-tasks-btn mat-spinner {
        margin-left: 8px;
      }

      .message-text ::ng-deep {
        line-height: 1.6;
        color: #333;
      }

      .message-text ::ng-deep h1,
      .message-text ::ng-deep h2,
      .message-text ::ng-deep h3,
      .message-text ::ng-deep h4,
      .message-text ::ng-deep h5,
      .message-text ::ng-deep h6 {
        margin: 16px 0 8px 0;
        font-weight: 600;
        color: #1976d2;
      }

      .message-text ::ng-deep h1 {
        font-size: 1.5em;
      }
      .message-text ::ng-deep h2 {
        font-size: 1.3em;
      }
      .message-text ::ng-deep h3 {
        font-size: 1.2em;
      }
      .message-text ::ng-deep h4 {
        font-size: 1.1em;
      }

      .message-text ::ng-deep p {
        margin: 8px 0;
      }

      .message-text ::ng-deep ul,
      .message-text ::ng-deep ol {
        margin: 8px 0;
        padding-left: 24px;
      }

      .message-text ::ng-deep li {
        margin: 4px 0;
      }

      .message-text ::ng-deep code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        color: #e91e63;
      }

      .message-text ::ng-deep pre {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 12px 0;
        border-left: 4px solid #1976d2;
      }

      .message-text ::ng-deep pre code {
        background: transparent;
        padding: 0;
        color: #333;
      }

      .message-text ::ng-deep blockquote {
        margin: 12px 0;
        padding: 8px 16px;
        border-left: 4px solid #ddd;
        background: #f9f9f9;
        color: #666;
      }

      .message-text ::ng-deep strong {
        font-weight: 600;
        color: #000;
      }

      .message-text ::ng-deep em {
        font-style: italic;
      }

      .message-text ::ng-deep hr {
        margin: 16px 0;
        border: none;
        border-top: 2px solid #e0e0e0;
      }

      .message-text ::ng-deep a {
        color: #1976d2;
        text-decoration: none;
      }

      .message-text ::ng-deep a:hover {
        text-decoration: underline;
      }

      .message-text ::ng-deep table {
        width: 100%;
        border-collapse: collapse;
        margin: 12px 0;
      }

      .message-text ::ng-deep th,
      .message-text ::ng-deep td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      .message-text ::ng-deep th {
        background: #f5f5f5;
        font-weight: 600;
      }
    `,
  ],
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  isExpanded = false;
  messages: ChatMessage[] = [];
  currentMessage = '';
  isLoading = false;
  currentStreamingMessage = '';
  private subscriptions: Subscription[] = [];

  // MCP related properties
  mcpTools: McpTool[] = [];
  executingTool: string | null = null;
  currentUser: any = null;
  pendingTasks: any[] = [];
  hasCheckedTasks = false;
  loadingTasks = false;
  hasCompletedInitialTasks = false;

  suggestedQuestions = [
    'How do I create a new case?',
    'What is the Case Manager application?',
    'How does authentication work?',
    'How do I assign a task to a user?',
  ];

  constructor(
    private chatService: ChatService,
    private mcpClient: McpClientService,
    private authService: AuthService,
    private confirmDialog: ConfirmDialogService,
    private caseUpdateService: CaseUpdateService
  ) {}

  async ngOnInit() {
    // Get current user
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Subscribe to case updates
    this.subscriptions.push(
      this.caseUpdateService.caseUpdated$.subscribe(() => {
        // Refresh pending tasks when a case is updated
        if (this.currentUser && this.isExpanded) {
          this.hasCheckedTasks = false;
          this.checkPendingTasks();
        }
      })
    );

    // Get MCP tools
    this.mcpTools = this.mcpClient.getTools();

    try {
      await this.chatService.startConnection();

      // Subscribe to message chunks
      this.subscriptions.push(
        this.chatService.getMessageChunks().subscribe((data) => {
          if (data.sessionId === this.chatService.getSessionId()) {
            this.currentStreamingMessage += data.chunk;
            this.updateLastMessage(this.currentStreamingMessage);
          }
        })
      );

      // Subscribe to message complete
      this.subscriptions.push(
        this.chatService.getMessageComplete().subscribe((sessionId) => {
          if (sessionId === this.chatService.getSessionId()) {
            this.isLoading = false;
            this.scrollToBottom();
          }
        })
      );
    } catch (error) {
      console.error('Failed to connect to chat service:', error);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.chatService.stopConnection();
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      setTimeout(() => this.scrollToBottom(), 100);
      // Check for pending tasks on first open
      if (!this.hasCheckedTasks && this.currentUser) {
        this.checkPendingTasks();
      }
    }
  }

  askQuestion(question: string) {
    this.currentMessage = question;
    this.sendMessage();
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: this.currentMessage,
      timestamp: new Date(),
    };

    this.messages.push(userMessage);
    const messageText = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;
    this.currentStreamingMessage = '';

    // Add placeholder for assistant message
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    this.messages.push(assistantMessage);

    this.scrollToBottom();

    try {
      this.chatService.sendMessage(messageText).subscribe({
        next: (response) => {
          // Update the last message with complete response
          this.updateLastMessage(response.message);
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.updateLastMessage('Sorry, I encountered an error. Please try again.');
          this.isLoading = false;
          this.scrollToBottom();
        },
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
    }
  }

  clearChat() {
    this.confirmDialog
      .confirm({
        title: 'Clear Chat History',
        message: 'Are you sure you want to clear the chat history? This action cannot be undone.',
        confirmText: 'Clear',
        cancelText: 'Cancel',
        confirmColor: 'warn',
        icon: 'delete_sweep',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.chatService.clearChatHistory(this.chatService.getSessionId()).subscribe({
            next: () => {
              this.messages = [];
              this.chatService.resetSession();
            },
            error: (error) => {
              console.error('Error clearing chat:', error);
            },
          });
        }
      });
  }

  private updateLastMessage(content: string) {
    if (this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content = content;
        lastMessage.timestamp = new Date();
      }
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  // Check for pending tasks on first load
  checkPendingTasks() {
    if (!this.currentUser || this.hasCheckedTasks) {
      return;
    }

    this.loadingTasks = true;
    this.hasCheckedTasks = true;
    const userId = this.currentUser.userId;

    this.mcpClient.listCompletableCases(userId).subscribe({
      next: (response) => {
        this.loadingTasks = false;
        console.log('MCP Response:', response);
        console.log('Cases:', response.cases);
        if (response.cases && response.cases.length > 0) {
          console.log('First case:', response.cases[0]);
        }
        this.pendingTasks = response.cases || [];
        // Tasks will be displayed in the dedicated pending tasks section
        this.scrollToBottom();
      },
      error: (error) => {
        this.loadingTasks = false;
        console.error('Error checking pending tasks:', error);
      },
    });
  }

  completeAllTasks() {
    if (!this.currentUser || this.executingTool) {
      return;
    }

    this.executingTool = 'complete_task';
    const userId = this.currentUser.userId;
    const tasksCount = this.pendingTasks.length;

    this.mcpClient.completeTasks(userId).subscribe({
      next: (response) => {
        this.executingTool = null;
        this.pendingTasks = [];
        this.hasCompletedInitialTasks = true;

        // Notify that cases have been updated
        this.caseUpdateService.notifyCaseUpdate();

        const message: ChatMessage = {
          role: 'assistant',
          content: `✅ Successfully completed ${tasksCount} task(s)!\n\nAll your pending tasks have been marked as complete and task actions have been created.`,
          timestamp: new Date(),
        };
        this.messages.push(message);
        this.scrollToBottom();
      },
      error: (error) => {
        this.executingTool = null;
        this.addMcpErrorMessage('Failed to complete tasks', error);
      },
    });
  }

  private formatTasksMessage(tasks: any[]): string {
    let message = `📋 You have ${tasks.length} task(s) that can be completed:\n\n`;

    tasks.forEach((task, index) => {
      message += `${index + 1}. ${task.caseName}\n`;
    });

    return message;
  }

  // MCP Tool Methods
  executeMcpTool(tool: McpTool) {
    if (!this.currentUser || this.executingTool) {
      return;
    }

    this.executingTool = tool.name;
    const userId = this.currentUser.userId;

    if (tool.name === 'list_completable_cases') {
      this.mcpClient.listCompletableCases(userId).subscribe({
        next: (response) => {
          this.executingTool = null;
          this.addMcpResultMessage(
            `Found ${response.count} completable case(s) assigned to you:`,
            response.cases
          );
        },
        error: (error) => {
          this.executingTool = null;
          this.addMcpErrorMessage('Failed to list completable cases', error);
        },
      });
    } else if (tool.name === 'complete_task') {
      this.mcpClient.completeTasks(userId).subscribe({
        next: (response) => {
          this.executingTool = null;

          // Notify that cases have been updated
          this.caseUpdateService.notifyCaseUpdate();

          this.addMcpResultMessage(response.message, {
            completedCount: response.completedCount,
            userId: response.userId,
          });
        },
        error: (error) => {
          this.executingTool = null;
          this.addMcpErrorMessage('Failed to complete tasks', error);
        },
      });
    }
  }

  private addMcpResultMessage(summary: string, data: any) {
    const message: ChatMessage = {
      role: 'assistant',
      content: `${summary}\n\n${JSON.stringify(data, null, 2)}`,
      timestamp: new Date(),
    };
    this.messages.push(message);
    this.scrollToBottom();
  }

  private addMcpErrorMessage(message: string, error: any) {
    const errorMessage: ChatMessage = {
      role: 'assistant',
      content: `❌ ${message}: ${error.message || 'Unknown error'}`,
      timestamp: new Date(),
    };
    this.messages.push(errorMessage);
    this.scrollToBottom();
  }

  formatToolName(toolName: string): string {
    return toolName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getToolIcon(toolName: string): string {
    switch (toolName) {
      case 'list_completable_cases':
        return 'list_alt';
      case 'complete_task':
        return 'check_circle';
      default:
        return 'build';
    }
  }

  formatMessageContent(content: string): string {
    try {
      // Parse markdown to HTML
      const html = marked.parse(content, { async: false }) as string;
      return html;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to simple newline replacement
      return content.replace(/\n/g, '<br>');
    }
  }
}
