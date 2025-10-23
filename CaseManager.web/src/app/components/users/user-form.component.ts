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
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
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
          <mat-card-title>{{ isEditMode ? 'Edit User' : 'Add New User' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="userForm"
            (ngSubmit)="onSubmit()"
            aria-label="{{ isEditMode ? 'Edit user form' : 'Add new user form' }}"
          >
            <mat-form-field appearance="fill" class="full-width">
              <mat-label
                >Username <span class="required-indicator" aria-label="required">*</span></mat-label
              >
              <input
                matInput
                formControlName="userName"
                placeholder="Enter username"
                aria-required="true"
                aria-describedby="userName-error"
              />
              <mat-error id="userName-error" *ngIf="userForm.get('userName')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label
                >First Name
                <span class="required-indicator" aria-label="required">*</span></mat-label
              >
              <input
                matInput
                formControlName="firstName"
                placeholder="Enter first name"
                aria-required="true"
                aria-describedby="firstName-error"
              />
              <mat-error
                id="firstName-error"
                *ngIf="userForm.get('firstName')?.hasError('required')"
              >
                First name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label
                >Last Name
                <span class="required-indicator" aria-label="required">*</span></mat-label
              >
              <input
                matInput
                formControlName="lastName"
                placeholder="Enter last name"
                aria-required="true"
                aria-describedby="lastName-error"
              />
              <mat-error id="lastName-error" *ngIf="userForm.get('lastName')?.hasError('required')">
                Last name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label
                >Address <span class="required-indicator" aria-label="required">*</span></mat-label
              >
              <textarea
                matInput
                formControlName="address"
                placeholder="Enter address"
                rows="3"
                aria-required="true"
                aria-describedby="address-error"
              ></textarea>
              <mat-error id="address-error" *ngIf="userForm.get('address')?.hasError('required')">
                Address is required
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
                [disabled]="userForm.invalid || loading"
                [attr.aria-label]="isEditMode ? 'Update user' : 'Create new user'"
              >
                <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
                <mat-spinner *ngIf="loading" diameter="20" aria-label="Saving..."></mat-spinner>
              </button>
              <button
                mat-raised-button
                type="button"
                [routerLink]="['/users']"
                [disabled]="loading"
                aria-label="Cancel and return to users list"
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
        max-width: 600px;
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

      /* Enhanced focus indicators for 508 compliance */
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

      /* Improve textarea */
      ::ng-deep textarea.mat-mdc-input-element {
        line-height: 1.5 !important;
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
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      userName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(this.userId);
    }
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error = 'Failed to load user. Please try again.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = null;

      const userData: User = {
        userId: this.userId || 0,
        ...this.userForm.value,
      };

      const operation = this.isEditMode
        ? this.userService.updateUser(this.userId!, userData)
        : this.userService.createUser(userData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/users']);
        },
        error: (err) => {
          console.error('Error saving user:', err);
          this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} user. Please try again.`;
          this.loading = false;
        },
      });
    }
  }
}
