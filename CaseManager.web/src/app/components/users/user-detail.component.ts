import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="container">
      <mat-card *ngIf="user; else loading">
        <mat-card-header>
          <mat-card-title>User Details</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="detail-row">
            <span class="label">User ID:</span>
            <span class="value">{{ user.userId }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Username:</span>
            <span class="value">{{ user.userName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">First Name:</span>
            <span class="value">{{ user.firstName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Last Name:</span>
            <span class="value">{{ user.lastName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Address:</span>
            <span class="value">{{ user.address }}</span>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [routerLink]="['/users']">Back to Users</button>
          <button mat-raised-button color="accent" [routerLink]="['/users/edit', user.userId]">
            Edit User
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
          <button mat-raised-button color="primary" [routerLink]="['/users']">Back to Users</button>
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
        width: 150px;
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
export class UserDetailComponent implements OnInit {
  user: User | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(+id);
    } else {
      this.error = 'No user ID provided';
    }
  }

  private loadUser(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user details. Please try again.';
      },
    });
  }
}
