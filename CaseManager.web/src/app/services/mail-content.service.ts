import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MailContent } from '../models/mail-content.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MailContentService {
  private apiUrl = `${environment.apiUrl}/mailcontents`;

  constructor(private http: HttpClient) {}

  getAllMailContents(): Observable<MailContent[]> {
    return this.http.get<MailContent[]>(this.apiUrl);
  }

  getMailContentById(id: number): Observable<MailContent> {
    return this.http.get<MailContent>(`${this.apiUrl}/${id}`);
  }

  createMailContent(mailContent: MailContent): Observable<MailContent> {
    return this.http.post<MailContent>(this.apiUrl, mailContent);
  }

  updateMailContent(id: number, mailContent: MailContent): Observable<MailContent> {
    return this.http.put<MailContent>(`${this.apiUrl}/${id}`, mailContent);
  }

  deleteMailContent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateResponse(
    id: number
  ): Observable<{ success: boolean; message: string; contentId: number; response: string }> {
    return this.http.post<{
      success: boolean;
      message: string;
      contentId: number;
      response: string;
    }>(`${this.apiUrl}/${id}/generate-response`, {});
  }
}
