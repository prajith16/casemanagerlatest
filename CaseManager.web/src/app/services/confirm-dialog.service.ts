import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  constructor(private dialog: MatDialog) {}

  /**
   * Opens a confirmation dialog
   * @param data Configuration for the dialog
   * @returns Observable that emits true if confirmed, false if cancelled
   */
  confirm(data: ConfirmDialogData | string): Observable<boolean> {
    const dialogData: ConfirmDialogData = typeof data === 'string' ? { message: data } : data;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: false,
      autoFocus: true,
    });

    return dialogRef.afterClosed();
  }

  /**
   * Shorthand for delete confirmation
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn',
      icon: 'delete_forever',
    });
  }

  /**
   * Shorthand for generic action confirmation
   */
  confirmAction(action: string, itemName?: string): Observable<boolean> {
    const message = itemName
      ? `Are you sure you want to ${action} "${itemName}"?`
      : `Are you sure you want to ${action}?`;

    return this.confirm({
      title: 'Confirm Action',
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      confirmColor: 'primary',
      icon: 'info',
    });
  }
}
