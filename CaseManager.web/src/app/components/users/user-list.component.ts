import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Users</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <button
          mat-raised-button
          color="primary"
          routerLink="/users/add"
          style="margin-bottom: 20px;"
        >
          <mat-icon>add</mat-icon> Add User
        </button>

        <table mat-table [dataSource]="users" class="mat-elevation-z8">
          <ng-container matColumnDef="userName">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let user">{{ user.userName }}</td>
          </ng-container>

          <ng-container matColumnDef="firstName">
            <th mat-header-cell *matHeaderCellDef>First Name</th>
            <td mat-cell *matCellDef="let user">{{ user.firstName }}</td>
          </ng-container>

          <ng-container matColumnDef="lastName">
            <th mat-header-cell *matHeaderCellDef>Last Name</th>
            <td mat-cell *matCellDef="let user">{{ user.lastName }}</td>
          </ng-container>

          <ng-container matColumnDef="address">
            <th mat-header-cell *matHeaderCellDef>Address</th>
            <td mat-cell *matCellDef="let user">{{ user.address }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button color="primary" [routerLink]="['/users', user.userId]">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button color="accent" [routerLink]="['/users/edit', user.userId]">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user.userId)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        margin: 20px;
      }

      table {
        width: 100%;
      }
    `,
  ],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['userName', 'firstName', 'lastName', 'address', 'actions'];

  constructor(private userService: UserService, private confirmDialog: ConfirmDialogService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => (this.users = data),
      (error) => console.error('Error loading users', error)
    );
  }

  deleteUser(id: number): void {
    const user = this.users.find((u) => u.userId === id);
    const userName = user ? `${user.firstName} ${user.lastName}` : `User #${id}`;

    this.confirmDialog.confirmDelete(userName).subscribe((confirmed) => {
      if (confirmed) {
        this.userService.deleteUser(id).subscribe(() => {
          this.loadUsers();
        });
      }
    });
  }
}
