import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CaseService } from '../../services/case.service';
import { UserService } from '../../services/user.service';
import { Case } from '../../models/case.model';
import { User } from '../../models/user.model';
import { CaseUpdateService } from '../../services/case-update.service';

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Case' : 'Add New Case' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form
            [formGroup]="caseForm"
            (ngSubmit)="onSubmit()"
            aria-label="{{ isEditMode ? 'Edit case form' : 'Add new case form' }}"
          >
            <mat-form-field appearance="fill" class="full-width">
              <mat-label
                >Case Name
                <span class="required-indicator" aria-label="required">*</span></mat-label
              >
              <input
                matInput
                formControlName="caseName"
                placeholder="Enter case name"
                aria-required="true"
                aria-describedby="caseName-error"
              />
              <mat-error id="caseName-error" *ngIf="caseForm.get('caseName')?.hasError('required')">
                Case name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label
                >Assigned User
                <span class="required-indicator" aria-label="required">*</span></mat-label
              >
              <mat-select
                formControlName="assignedUserId"
                placeholder="Select assigned user"
                aria-required="true"
                aria-describedby="assignedUserId-error"
              >
                <mat-option *ngFor="let user of users" [value]="user.userId">
                  {{ user.firstName }} {{ user.lastName }} ({{ user.userName }})
                </mat-option>
              </mat-select>
              <mat-error
                id="assignedUserId-error"
                *ngIf="caseForm.get('assignedUserId')?.hasError('required')"
              >
                Assigned user is required
              </mat-error>
            </mat-form-field>

            <div class="checkbox-group">
              <mat-checkbox
                formControlName="canComplete"
                aria-label="Mark if case can be completed"
              >
                Can Complete
              </mat-checkbox>
            </div>

            <div *ngIf="error" class="error-message" role="alert" aria-live="polite">
              {{ error }}
            </div>

            <mat-card-actions>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="caseForm.invalid || loading"
                [attr.aria-label]="isEditMode ? 'Update case' : 'Create new case'"
              >
                <mat-icon *ngIf="!loading">{{ isEditMode ? 'save' : 'add' }}</mat-icon>
                <span *ngIf="!loading">{{ isEditMode ? 'Update' : 'Create' }}</span>
                <mat-spinner *ngIf="loading" diameter="20" aria-label="Saving..."></mat-spinner>
              </button>
              <button
                mat-raised-button
                type="button"
                [routerLink]="['/cases']"
                [disabled]="loading"
                aria-label="Cancel and return to cases list"
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

      .checkbox-group {
        padding: 0.75rem 0;
        font-size: 16px;
        color: #000000;
        font-weight: 600;
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

      mat-checkbox:focus-within {
        outline: 3px solid #d4a574;
        outline-offset: 4px;
        border-radius: 4px;
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

      /* Improve checkbox labels */
      ::ng-deep .mdc-checkbox__label {
        color: #000000 !important;
        font-weight: 600 !important;
        font-size: 16px !important;
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
export class CaseFormComponent implements OnInit {
  caseForm: FormGroup;
  isEditMode = false;
  caseId: number | null = null;
  loading = false;
  error: string | null = null;
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private caseService: CaseService,
    private userService: UserService,
    private caseUpdateService: CaseUpdateService
  ) {
    this.caseForm = this.fb.group({
      caseName: ['', Validators.required],
      assignedUserId: ['', Validators.required],
      isComplete: [false],
      canComplete: [false],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.caseId = +id;
      this.isEditMode = true;
      this.loadCase(this.caseId);
    }
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.error = 'Failed to load users. Please refresh the page.';
      },
    });
  }

  private loadCase(id: number): void {
    this.loading = true;
    this.caseService.getCaseById(id).subscribe({
      next: (caseItem) => {
        this.caseForm.patchValue({
          caseName: caseItem.caseName,
          assignedUserId: caseItem.assignedUserId,
          isComplete: caseItem.isComplete,
          canComplete: caseItem.canComplete,
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading case:', err);
        this.error = 'Failed to load case. Please try again.';
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.caseForm.valid) {
      this.loading = true;
      this.error = null;

      const formValue = this.caseForm.value;
      const caseData: Case = {
        caseId: this.isEditMode && this.caseId ? this.caseId : 0,
        caseName: formValue.caseName,
        assignedUserId: +formValue.assignedUserId,
        isComplete: formValue.isComplete,
        canComplete: formValue.canComplete,
      };

      const operation =
        this.isEditMode && this.caseId
          ? this.caseService.updateCase(this.caseId, caseData)
          : this.caseService.createCase(caseData);

      operation.subscribe({
        next: () => {
          // Always notify on update since canComplete might have changed
          // On create, only notify if canComplete is true
          if (this.isEditMode || caseData.canComplete) {
            this.caseUpdateService.notifyCaseUpdate();
          }
          this.router.navigate(['/cases']);
        },
        error: (err) => {
          console.error('Error saving case:', err);
          this.error = `Failed to ${this.isEditMode ? 'update' : 'create'} case. Please try again.`;
          this.loading = false;
        },
      });
    }
  }
}
