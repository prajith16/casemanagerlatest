import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Case Manager Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" aria-label="Login form">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>
                Username <span class="required-indicator" aria-label="required">*</span>
              </mat-label>
              <input
                matInput
                formControlName="userName"
                placeholder="Enter your username"
                aria-required="true"
                aria-describedby="userName-error"
                autofocus
              />
              <mat-icon matPrefix>person</mat-icon>
              <mat-error
                id="userName-error"
                *ngIf="loginForm.get('userName')?.hasError('required')"
              >
                Username is required
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
                [disabled]="loginForm.invalid || loading"
                class="full-width"
                aria-label="Login to Case Manager"
              >
                <mat-icon *ngIf="!loading">login</mat-icon>
                <span *ngIf="!loading">Login</span>
                <mat-spinner *ngIf="loading" diameter="20" aria-label="Logging in..."></mat-spinner>
              </button>
            </mat-card-actions>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 1rem;
      }

      .login-card {
        width: 100%;
        max-width: 400px;
      }

      mat-card-header {
        display: flex;
        justify-content: center;
        margin-bottom: 1.5rem;
      }

      mat-card-title {
        text-align: center;
        font-size: 28px !important;
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
        flex-direction: column;
        padding: 1.5rem 0 0 0;
        margin: 0;
      }

      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 48px;
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
        font-weight: 500;
        font-size: 15px;
      }

      button mat-spinner {
        display: inline-block;
        margin: 0 auto;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.error = err.error?.message || 'Invalid username. Please try again.';
          this.loading = false;
        },
      });
    }
  }
}
