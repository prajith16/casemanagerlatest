import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MailContentSentService } from '../../services/mail-content-sent.service';
import { MailContentSent } from '../../models/mail-content-sent.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-message-response-list',
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
          <mat-card-title>Message Responses</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button [routerLink]="['/messages']">
              <mat-icon>arrow_back</mat-icon>
              Back to Messages
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
            [dataSource]="responses"
            *ngIf="!loading && !error"
            class="responses-table"
          >
            <ng-container matColumnDef="mailContentSentId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let response">{{ response.mailContentSentId }}</td>
            </ng-container>

            <ng-container matColumnDef="contentId">
              <th mat-header-cell *matHeaderCellDef>Content ID</th>
              <td mat-cell *matCellDef="let response">{{ response.contentId }}</td>
            </ng-container>

            <ng-container matColumnDef="responseContent">
              <th mat-header-cell *matHeaderCellDef>Response</th>
              <td mat-cell *matCellDef="let response">
                <div class="content-preview">{{ response.responseContent }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let response">
                <div class="action-buttons">
                  <button
                    mat-icon-button
                    color="primary"
                    (click)="viewResponse(response)"
                    matTooltip="View Full Response"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteResponse(response.mailContentSentId)"
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

          <div *ngIf="!loading && !error && responses.length === 0" class="no-data">
            No message responses found.
          </div>

          <!-- Full Response Modal -->
          <div *ngIf="selectedResponse" class="modal-overlay" (click)="closeModal()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Response Details</h2>
                <button mat-icon-button (click)="closeModal()">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
              <div class="modal-body">
                <div class="detail-row">
                  <strong>Response ID:</strong> {{ selectedResponse.mailContentSentId }}
                </div>
                <div class="detail-row">
                  <strong>Content ID:</strong> {{ selectedResponse.contentId }}
                </div>
                <div class="detail-row full-response">
                  <strong>Full Response:</strong>
                  <div class="response-text">{{ selectedResponse.responseContent }}</div>
                </div>
              </div>
            </div>
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

      .responses-table {
        width: 100%;
        margin-top: 1rem;
      }

      .content-preview {
        max-width: 400px;
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

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        border-radius: 8px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .detail-row {
        margin-bottom: 1rem;
      }

      .full-response {
        margin-top: 1.5rem;
      }

      .response-text {
        margin-top: 0.5rem;
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.6;
        max-height: 400px;
        overflow-y: auto;
      }
    `,
  ],
})
export class MessageResponseListComponent implements OnInit {
  responses: MailContentSent[] = [];
  displayedColumns: string[] = ['mailContentSentId', 'contentId', 'responseContent', 'actions'];
  loading = false;
  error: string | null = null;
  selectedResponse: MailContentSent | null = null;

  constructor(
    private mailContentSentService: MailContentSentService,
    private confirmDialog: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadResponses();
  }

  loadResponses(): void {
    this.loading = true;
    this.error = null;
    this.mailContentSentService.getAllMailContentSents().subscribe({
      next: (responses) => {
        this.responses = responses;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading message responses:', err);
        this.error = 'Failed to load message responses. Please try again.';
        this.loading = false;
      },
    });
  }

  viewResponse(response: MailContentSent): void {
    this.selectedResponse = response;
  }

  closeModal(): void {
    this.selectedResponse = null;
  }

  deleteResponse(id: number): void {
    const responseToDelete = this.responses.find((r) => r.mailContentSentId === id);
    const identifier = `Response #${id}`;

    this.confirmDialog.confirmDelete(identifier).subscribe((confirmed) => {
      if (confirmed) {
        this.mailContentSentService.deleteMailContentSent(id).subscribe({
          next: () => {
            this.loadResponses();
          },
          error: (err) => {
            console.error('Error deleting message response:', err);
            this.error = 'Failed to delete message response. Please try again.';
          },
        });
      }
    });
  }
}
