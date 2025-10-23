import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskActionService } from '../../services/task-action.service';
import { TaskAction } from '../../models/task-action.model';

@Component({
  selector: 'app-task-action-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="container">
      <mat-card *ngIf="taskAction; else loading">
        <mat-card-header>
          <mat-card-title>Task Action Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-row">
            <span class="label">Task Action ID:</span>
            <span class="value">{{ taskAction.taskActionId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Task Action Name:</span>
            <span class="value">{{ taskAction.taskActionName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Case ID:</span>
            <span class="value">{{ taskAction.caseId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">User ID:</span>
            <span class="value">{{ taskAction.userId }}</span>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [routerLink]="['/task-actions']">
            Back to Task Actions
          </button>
          <button
            mat-raised-button
            color="accent"
            [routerLink]="['/task-actions/edit', taskAction.taskActionId]"
          >
            Edit Task Action
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
          <button mat-raised-button color="primary" [routerLink]="['/task-actions']">
            Back to Task Actions
          </button>
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
export class TaskActionDetailComponent implements OnInit {
  taskAction: TaskAction | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskActionService: TaskActionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTaskAction(+id);
    } else {
      this.error = 'No task action ID provided';
    }
  }

  private loadTaskAction(id: number): void {
    this.taskActionService.getTaskActionById(id).subscribe({
      next: (taskAction) => {
        this.taskAction = taskAction;
      },
      error: (err) => {
        console.error('Error loading task action:', err);
        this.error = 'Failed to load task action details. Please try again.';
      },
    });
  }
}
