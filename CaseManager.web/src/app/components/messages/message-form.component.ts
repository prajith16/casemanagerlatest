import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MailContentService } from '../../services/mail-content.service';
import { MailContent } from '../../models/mail-content.model';

@Component({
  selector: 'app-message-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Message' : 'Add New Message' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="messageForm"
            (ngSubmit)="onSubmit()"
            aria-label="{{ isEditMode ? 'Edit message form' : 'Add new message form' }}"
          >
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>
                Subject
                <span class="required-indicator" aria-label="required">*</span>
              </mat-label>
              <input
                matInput
                formControlName="subject"
                placeholder="Enter subject"
                aria-required="true"
                aria-describedby="subject-error"
              />
              <mat-error
                id="subject-error"
                *ngIf="messageForm.get('subject')?.hasError('required')"
              >
                Subject is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>
                From Email
                <span class="required-indicator" aria-label="required">*</span>
              </mat-label>
              <input
                matInput
                formControlName="fromEmail"
                type="email"
                placeholder="sender@example.com"
                aria-required="true"
                aria-describedby="fromEmail-error"
              />
              <mat-error
                id="fromEmail-error"
                *ngIf="messageForm.get('fromEmail')?.hasError('required')"
              >
                From email is required
              </mat-error>
              <mat-error *ngIf="messageForm.get('fromEmail')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>
                To Email
                <span class="required-indicator" aria-label="required">*</span>
              </mat-label>
              <input
                matInput
                formControlName="toEmail"
                type="email"
                placeholder="recipient@example.com"
                aria-required="true"
                aria-describedby="toEmail-error"
              />
              <mat-error
                id="toEmail-error"
                *ngIf="messageForm.get('toEmail')?.hasError('required')"
              >
                To email is required
              </mat-error>
              <mat-error *ngIf="messageForm.get('toEmail')?.hasError('email')">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>
                Content
                <span class="required-indicator" aria-label="required">*</span>
              </mat-label>
              <textarea
                matInput
                formControlName="content"
                placeholder="Enter message content"
                rows="8"
                aria-required="true"
                aria-describedby="content-error"
              ></textarea>
              <mat-error
                id="content-error"
                *ngIf="messageForm.get('content')?.hasError('required')"
              >
                Content is required
              </mat-error>
            </mat-form-field>

            <div *ngIf="error" class="error-message" role="alert" aria-live="polite">
              {{ error }}
            </div>

            <mat-card-actions>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="messageForm.invalid || loading"
                [attr.aria-label]="isEditMode ? 'Update message' : 'Create new message'"
              >
                <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
                <mat-spinner *ngIf="loading" diameter="20" aria-label="Saving..."></mat-spinner>
              </button>
              <button
                mat-raised-button
                type="button"
                [routerLink]="['/messages']"
                [disabled]="loading"
                aria-label="Cancel and return to messages list"
              >
                <mat-icon>close</mat-icon>
                <span>Cancel</span>
              </button>
            </mat-card-actions>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .full-width {
        width: 100%;
      }

      .required-indicator {
        color: #d93025;
        font-weight: bold;
        font-size: 1.1em;
      }

      mat-card-actions {
        display: flex;
        gap: 1rem;
        padding: 1.5rem 0 0 0;
      }

      button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      button mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }

      .error-message {
        color: #c0392b;
        background-color: #fdecea;
        padding: 1rem;
        border-radius: 4px;
        border-left: 4px solid #d93025;
        margin-top: 0.5rem;
        font-weight: 500;
        font-size: 15px;
      }

      button mat-spinner {
        display: inline-block;
        margin: 0 auto;
      }

      textarea {
        resize: vertical;
        min-height: 150px;
      }

      /* Enhanced focus indicators */
      input:focus,
      textarea:focus {
        outline: 3px solid #d4a574 !important;
        outline-offset: 2px;
      }

      button:focus {
        outline: 3px solid #d4a574 !important;
        outline-offset: 3px;
      }

      /* Improve form field labels */
      ::ng-deep .mat-mdc-form-field-label {
        color: #1a1a1a !important;
        font-weight: 600 !important;
        font-size: 16px !important;
      }

      /* Improve input text */
      ::ng-deep .mat-mdc-input-element {
        color: #000000 !important;
        font-size: 16px !important;
        font-weight: 500 !important;
      }

      /* Improve error messages */
      ::ng-deep .mat-mdc-form-field-error {
        color: #c0392b !important;
        font-weight: 500 !important;
        font-size: 14px !important;
      }

      /* Improve placeholder text */
      ::ng-deep .mat-mdc-input-element::placeholder {
        color: #4a4a4a !important;
        opacity: 1 !important;
      }

      /* Improve form field outline */
      ::ng-deep .mat-mdc-text-field-wrapper {
        background-color: #ffffff !important;
      }

      ::ng-deep .mat-mdc-form-field-focus-overlay {
        background-color: transparent !important;
      }
    `,
  ],
})
export class MessageFormComponent implements OnInit {
  messageForm: FormGroup;
  isEditMode = false;
  messageId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private mailContentService: MailContentService
  ) {
    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      fromEmail: ['', [Validators.required, Validators.email]],
      toEmail: ['', [Validators.required, Validators.email]],
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.messageId = +id;
      this.isEditMode = true;
      this.loadMessage(this.messageId);
    }
  }

  private loadMessage(id: number): void {
    this.loading = true;
    this.mailContentService.getMailContentById(id).subscribe({
      next: (message) => {
        this.messageForm.patchValue({
          subject: message.subject,
          fromEmail: message.fromEmail,
          toEmail: message.toEmail,
          content: message.content,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading message:', err);
        this.error = 'Failed to load message. Please try again.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.messageForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.messageForm.value;
      const messageData: MailContent = {
        contentId: this.isEditMode && this.messageId ? this.messageId : 0,
        subject: formValue.subject,
        fromEmail: formValue.fromEmail,
        toEmail: formValue.toEmail,
        content: formValue.content,
      };

      const operation =
        this.isEditMode && this.messageId
          ? this.mailContentService.updateMailContent(this.messageId, messageData)
          : this.mailContentService.createMailContent(messageData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/messages']);
        },
        error: (err) => {
          console.error('Error saving message:', err);
          this.error = `Failed to ${
            this.isEditMode ? 'update' : 'create'
          } message. Please try again.`;
          this.loading = false;
        },
      });
    }
  }
}
