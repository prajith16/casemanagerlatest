import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MailContentSent } from '../models/mail-content-sent.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MailContentSentService {
  private apiUrl = `${environment.apiUrl}/mailcontentsents`;

  constructor(private http: HttpClient) {}

  getAllMailContentSents(): Observable<MailContentSent[]> {
    return this.http.get<MailContentSent[]>(this.apiUrl);
  }

  getMailContentSentById(id: number): Observable<MailContentSent> {
    return this.http.get<MailContentSent>(`${this.apiUrl}/${id}`);
  }

  deleteMailContentSent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
