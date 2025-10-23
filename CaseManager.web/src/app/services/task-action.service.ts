import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskAction } from '../models/task-action.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskActionService {
  private apiUrl = `${environment.apiUrl}/taskactions`;

  constructor(private http: HttpClient) {}

  getAllTaskActions(): Observable<TaskAction[]> {
    return this.http.get<TaskAction[]>(this.apiUrl);
  }

  getTaskActionById(id: number): Observable<TaskAction> {
    return this.http.get<TaskAction>(`${this.apiUrl}/${id}`);
  }

  createTaskAction(taskAction: TaskAction): Observable<TaskAction> {
    return this.http.post<TaskAction>(this.apiUrl, taskAction);
  }

  updateTaskAction(id: number, taskAction: TaskAction): Observable<TaskAction> {
    return this.http.put<TaskAction>(`${this.apiUrl}/${id}`, taskAction);
  }

  deleteTaskAction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
