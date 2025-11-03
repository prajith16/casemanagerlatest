import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MailContentService } from '../../services/mail-content.service';
import { MailContent } from '../../models/mail-content.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Messages</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" [routerLink]="['/messages/add']">
              <mat-icon>add</mat-icon>
              Add Message
            </button>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="loading" class="loading">
            <mat-spinner></mat-spinner>
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>

          <table
            mat-table
            [dataSource]="messages"
            *ngIf="!loading && !error"
            class="messages-table"
          >
            <ng-container matColumnDef="subject">
              <th mat-header-cell *matHeaderCellDef>Subject</th>
              <td mat-cell *matCellDef="let message">{{ message.subject }}</td>
            </ng-container>

            <ng-container matColumnDef="fromEmail">
              <th mat-header-cell *matHeaderCellDef>From</th>
              <td mat-cell *matCellDef="let message">{{ message.fromEmail }}</td>
            </ng-container>

            <ng-container matColumnDef="toEmail">
              <th mat-header-cell *matHeaderCellDef>To</th>
              <td mat-cell *matCellDef="let message">{{ message.toEmail }}</td>
            </ng-container>

            <ng-container matColumnDef="content">
              <th mat-header-cell *matHeaderCellDef>Content</th>
              <td mat-cell *matCellDef="let message">
                <div class="content-preview">{{ message.content }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let message">
                <div class="action-buttons">
                  <button
                    mat-icon-button
                    color="primary"
                    [routerLink]="['/messages', message.contentId]"
                    matTooltip="View Details"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="accent"
                    [routerLink]="['/messages/edit', message.contentId]"
                    matTooltip="Edit"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteMessage(message.contentId)"
                    matTooltip="Delete"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <div *ngIf="!loading && !error && messages.length === 0" class="no-data">
            No messages found. Click "Add Message" to create one.
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 1400px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .messages-table {
        width: 100%;
        margin-top: 1rem;
      }

      .content-preview {
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .action-buttons {
        display: flex;
        gap: 0.25rem;
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }

      .error-message {
        color: #e74c3c;
        background-color: #fdecea;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
      }

      .no-data {
        text-align: center;
        padding: 3rem;
        color: #666;
      }

      th {
        font-weight: 600;
        color: #5a524c;
      }

      td {
        color: #2e383c;
      }

      mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
    `,
  ],
})
export class MessageListComponent implements OnInit {
  messages: MailContent[] = [];
  displayedColumns: string[] = ['subject', 'fromEmail', 'toEmail', 'content', 'actions'];
  loading = false;
  error: string | null = null;

  constructor(
    private mailContentService: MailContentService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.error = null;
    this.mailContentService.getAllMailContents().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.error = 'Failed to load messages. Please try again.';
        this.loading = false;
      },
    });
  }

  deleteMessage(id: number): void {
    const messageToDelete = this.messages.find((m) => m.contentId === id);
    const subject = messageToDelete?.subject || `Message #${id}`;

    this.confirmDialog.confirmDelete(subject).subscribe((confirmed) => {
      if (confirmed) {
        this.mailContentService.deleteMailContent(id).subscribe({
          next: () => {
            this.loadMessages();
          },
          error: (err) => {
            console.error('Error deleting message:', err);
            this.error = 'Failed to delete message. Please try again.';
          },
        });
      }
    });
  }
}
