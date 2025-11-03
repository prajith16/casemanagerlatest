import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { UserListComponent } from './components/users/user-list.component';
import { UserDetailComponent } from './components/users/user-detail.component';
import { UserFormComponent } from './components/users/user-form.component';
import { CaseListComponent } from './components/cases/case-list.component';
import { CaseDetailComponent } from './components/cases/case-detail.component';
import { CaseFormComponent } from './components/cases/case-form.component';
import { TaskActionListComponent } from './components/task-actions/task-action-list.component';
import { TaskActionDetailComponent } from './components/task-actions/task-action-detail.component';
import { MessageListComponent } from './components/messages/message-list.component';
import { MessageDetailComponent } from './components/messages/message-detail.component';
import { MessageFormComponent } from './components/messages/message-form.component';
import { MessageResponseListComponent } from './components/message-responses/message-response-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/users', pathMatch: 'full' },

  // User routes - protected by auth guard
  { path: 'users', component: UserListComponent, canActivate: [authGuard] },
  { path: 'users/add', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/edit/:id', component: UserFormComponent, canActivate: [authGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [authGuard] },

  // Case routes - protected by auth guard
  { path: 'cases', component: CaseListComponent, canActivate: [authGuard] },
  { path: 'cases/add', component: CaseFormComponent, canActivate: [authGuard] },
  { path: 'cases/edit/:id', component: CaseFormComponent, canActivate: [authGuard] },
  { path: 'cases/:id', component: CaseDetailComponent, canActivate: [authGuard] },

  // TaskAction routes - protected by auth guard
  { path: 'task-actions', component: TaskActionListComponent, canActivate: [authGuard] },
  { path: 'task-actions/:id', component: TaskActionDetailComponent, canActivate: [authGuard] },

  // Message routes - protected by auth guard
  { path: 'messages', component: MessageListComponent, canActivate: [authGuard] },
  { path: 'messages/add', component: MessageFormComponent, canActivate: [authGuard] },
  { path: 'messages/edit/:id', component: MessageFormComponent, canActivate: [authGuard] },
  { path: 'messages/:id', component: MessageDetailComponent, canActivate: [authGuard] },

  // Message Response routes - protected by auth guard
  { path: 'message-responses', component: MessageResponseListComponent, canActivate: [authGuard] },
];
