import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CaseService } from '../../services/case.service';
import { Case } from '../../models/case.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { CaseUpdateService } from '../../services/case-update.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Cases</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" [routerLink]="['/cases/add']">
              <mat-icon>add</mat-icon>
              Add Case
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

          <table mat-table [dataSource]="cases" *ngIf="!loading && !error" class="cases-table">
            <ng-container matColumnDef="caseName">
              <th mat-header-cell *matHeaderCellDef>Case Name</th>
              <td mat-cell *matCellDef="let case">{{ case.caseName }}</td>
            </ng-container>

            <ng-container matColumnDef="assignedUser">
              <th mat-header-cell *matHeaderCellDef>Assigned User</th>
              <td mat-cell *matCellDef="let case">
                {{ case.assignedUserFirstName }} {{ case.assignedUserLastName }}
              </td>
            </ng-container>

            <ng-container matColumnDef="isComplete">
              <th mat-header-cell *matHeaderCellDef>Complete</th>
              <td mat-cell *matCellDef="let case">
                <mat-checkbox [checked]="case.isComplete" disabled></mat-checkbox>
              </td>
            </ng-container>

            <ng-container matColumnDef="canComplete">
              <th mat-header-cell *matHeaderCellDef>Can Complete</th>
              <td mat-cell *matCellDef="let case">
                <mat-checkbox [checked]="case.canComplete" disabled></mat-checkbox>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let case">
                <div class="action-buttons">
                  <button
                    mat-icon-button
                    color="primary"
                    [routerLink]="['/cases', case.caseId]"
                    matTooltip="View Details"
                  >
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="accent"
                    [routerLink]="['/cases/edit', case.caseId]"
                    matTooltip="Edit"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteCase(case.caseId)"
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

          <div *ngIf="!loading && !error && cases.length === 0" class="no-data">
            No cases found. Click "Add Case" to create one.
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

      .cases-table {
        width: 100%;
        margin-top: 1rem;
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
export class CaseListComponent implements OnInit, OnDestroy {
  cases: Case[] = [];
  displayedColumns: string[] = ['caseName', 'assignedUser', 'isComplete', 'canComplete', 'actions'];
  loading = false;
  error: string | null = null;
  private caseUpdateSubscription?: Subscription;

  constructor(
    private caseService: CaseService,
    private confirmDialog: ConfirmDialogService,
    private caseUpdateService: CaseUpdateService
  ) {}

  ngOnInit(): void {
    this.loadCases();

    // Subscribe to case updates to reload grid when tasks are completed
    this.caseUpdateSubscription = this.caseUpdateService.caseUpdated$.subscribe(() => {
      console.log('Case update detected, reloading cases grid...');
      this.loadCases();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.caseUpdateSubscription) {
      this.caseUpdateSubscription.unsubscribe();
    }
  }

  loadCases(): void {
    this.loading = true;
    this.error = null;
    this.caseService.getAllCases().subscribe({
      next: (cases) => {
        this.cases = cases;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cases:', err);
        this.error = 'Failed to load cases. Please try again.';
        this.loading = false;
      },
    });
  }

  deleteCase(id: number): void {
    const caseToDelete = this.cases.find((c) => c.caseId === id);
    const caseName = caseToDelete?.caseName || `Case #${id}`;

    this.confirmDialog.confirmDelete(caseName).subscribe((confirmed) => {
      if (confirmed) {
        this.caseService.deleteCase(id).subscribe({
          next: () => {
            // Check if the deleted case was completable
            if (caseToDelete?.canComplete) {
              this.caseUpdateService.notifyCaseUpdate();
            }
            this.loadCases();
          },
          error: (err) => {
            console.error('Error deleting case:', err);
            this.error = 'Failed to delete case. Please try again.';
          },
        });
      }
    });
  }
}
