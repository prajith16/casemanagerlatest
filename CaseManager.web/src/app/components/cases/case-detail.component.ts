import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CaseService } from '../../services/case.service';
import { CaseDetail } from '../../models/case.model';

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="container">
      <mat-card *ngIf="case; else loading">
        <mat-card-header>
          <mat-card-title>Case Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-row">
            <span class="label">Case ID:</span>
            <span class="value">{{ case.caseId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Case Name:</span>
            <span class="value">{{ case.caseName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Assigned User:</span>
            <span class="value"
              >{{ case.assignedUserFirstName }} {{ case.assignedUserLastName }}</span
            >
          </div>
          <div class="detail-row">
            <span class="label">Is Complete:</span>
            <span class="value">
              <mat-checkbox [checked]="case.isComplete" disabled></mat-checkbox>
            </span>
          </div>
          <div class="detail-row">
            <span class="label">Can Complete:</span>
            <span class="value">
              <mat-checkbox [checked]="case.canComplete" disabled></mat-checkbox>
            </span>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [routerLink]="['/cases']">Back to Cases</button>
          <button mat-raised-button color="accent" [routerLink]="['/cases/edit', case.caseId]">
            Edit Case
          </button>
        </mat-card-actions>
      </mat-card>

      <ng-template #loading>
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      </ng-template>

      <mat-card *ngIf="error" class="error-card">
        <mat-card-content>
          <p class="error-message">{{ error }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [routerLink]="['/cases']">Back to Cases</button>
        </mat-card-actions>
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

      mat-card {
        margin-bottom: 1rem;
      }

      .detail-row {
        display: flex;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e0e0e0;
        align-items: center;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 600;
        width: 200px;
        color: #5a524c;
      }

      .value {
        flex: 1;
        color: #2e383c;
      }

      mat-card-actions {
        display: flex;
        gap: 1rem;
        padding: 1rem;
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 3rem;
      }

      .error-card {
        background-color: #fdecea;
        border: 1px solid #e74c3c;
      }

      .error-message {
        color: #c0392b;
        margin: 0;
      }
    `,
  ],
})
export class CaseDetailComponent implements OnInit {
  case: CaseDetail | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCase(+id);
    } else {
      this.error = 'No case ID provided';
    }
  }

  private loadCase(id: number): void {
    this.caseService.getCaseById(id).subscribe({
      next: (caseItem) => {
        this.case = caseItem;
      },
      error: (err) => {
        console.error('Error loading case:', err);
        this.error = 'Failed to load case details. Please try again.';
      },
    });
  }
}
