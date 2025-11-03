import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MailContentService } from '../../services/mail-content.service';
import { MailContent } from '../../models/mail-content.model';

@Component({
  selector: 'app-message-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Message Details</mat-card-title>
          <div class="header-actions">
            <button
              mat-raised-button
              color="accent"
              (click)="generateAutoReply()"
              *ngIf="message"
              [disabled]="generatingReply"
            >
              <mat-icon>smart_toy</mat-icon>
              <span *ngIf="!generatingReply">Agent Auto Reply</span>
              <mat-spinner *ngIf="generatingReply" diameter="20"></mat-spinner>
            </button>
            <button mat-raised-button [routerLink]="['/messages']">
              <mat-icon>arrow_back</mat-icon>
              Back to List
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

          <div *ngIf="message && !loading && !error" class="message-details">
            <div class="detail-row">
              <span class="detail-label">Subject:</span>
              <span class="detail-value">{{ message.subject }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">From:</span>
              <span class="detail-value">{{ message.fromEmail }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">To:</span>
              <span class="detail-value">{{ message.toEmail }}</span>
            </div>

            <div class="detail-row full-width">
              <span class="detail-label">Content:</span>
              <div class="detail-value content-box">{{ message.content }}</div>
            </div>

            <div *ngIf="autoReply" class="detail-row full-width auto-reply-section">
              <span class="detail-label">
                <mat-icon class="reply-icon">reply</mat-icon>
                AI Generated Reply:
              </span>
              <div class="detail-value reply-box">{{ autoReply }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .message-details {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .detail-row {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .detail-row.full-width {
        width: 100%;
      }

      .detail-label {
        font-weight: 600;
        color: #5a524c;
        font-size: 0.95rem;
      }

      .detail-value {
        color: #2e383c;
        font-size: 1rem;
        padding: 0.5rem;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .content-box {
        white-space: pre-wrap;
        word-wrap: break-word;
        min-height: 100px;
        padding: 1rem;
        line-height: 1.6;
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

      .auto-reply-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 2px solid #e0e0e0;
      }

      .auto-reply-section .detail-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #2e7d32;
      }

      .reply-icon {
        font-size: 24px;
        height: 24px;
        width: 24px;
      }

      .reply-box {
        background-color: #e8f5e9;
        border-left: 4px solid #4caf50;
      }

      button mat-spinner {
        display: inline-block;
        margin: 0 auto;
      }

      mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
    `,
  ],
})
export class MessageDetailComponent implements OnInit {
  message: MailContent | null = null;
  loading = false;
  error: string | null = null;
  autoReply: string | null = null;
  generatingReply = false;

  constructor(private route: ActivatedRoute, private mailContentService: MailContentService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.loadMessage(+id);
    } else {
      this.error = 'Invalid message ID';
    }
  }

  loadMessage(id: number): void {
    this.loading = true;
    this.error = null;
    this.mailContentService.getMailContentById(id).subscribe({
      next: (message) => {
        this.message = message;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading message:', err);
        this.error = 'Failed to load message. Please try again.';
        this.loading = false;
      },
    });
  }

  generateAutoReply(): void {
    if (!this.message) return;

    this.generatingReply = true;
    this.error = null;

    // Call API to generate AI-powered response
    this.mailContentService.generateResponse(this.message.contentId).subscribe({
      next: (result) => {
        this.autoReply = result.response;
        this.generatingReply = false;
      },
      error: (err) => {
        console.error('Error generating auto-reply:', err);
        this.error = 'Failed to generate auto-reply. Please try again.';
        this.generatingReply = false;
      },
    });
  }
}
