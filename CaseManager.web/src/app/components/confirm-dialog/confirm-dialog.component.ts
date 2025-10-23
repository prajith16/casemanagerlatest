import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon class="dialog-icon" [style.color]="iconColor">{{
        data.icon || 'help_outline'
      }}</mat-icon>
      <span>{{ data.title || 'Confirm Action' }}</span>
    </h2>
    <mat-dialog-content class="dialog-content">
      <p class="dialog-message">{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button (click)="onCancel()">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        mat-raised-button
        [color]="data.confirmColor || 'warn'"
        (click)="onConfirm()"
        cdkFocusInitial
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px 16px 24px !important;
        margin: 0 !important;
      }

      .dialog-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }

      .dialog-header span {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
      }

      .dialog-content {
        padding: 0 24px !important;
        margin: 0 !important;
        overflow: visible !important;
        max-height: none !important;
      }

      .dialog-message {
        font-size: 16px;
        line-height: 1.5;
        color: #555;
        margin: 0;
        padding: 0;
      }

      .dialog-actions {
        padding: 20px 24px !important;
        margin: 0 !important;
        gap: 8px;
        min-height: auto !important;
      }

      @media (max-width: 600px) {
        .dialog-header {
          padding: 16px 20px 12px 20px !important;
        }

        .dialog-content {
          padding: 0 20px !important;
        }

        .dialog-actions {
          padding: 16px 20px !important;
        }
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  get iconColor(): string {
    const colorMap = {
      primary: '#1976d2',
      accent: '#ff4081',
      warn: '#f44336',
    };
    return colorMap[this.data.confirmColor || 'warn'];
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
