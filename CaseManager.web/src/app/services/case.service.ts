import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Case, CaseDetail } from '../models/case.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CaseService {
  private apiUrl = `${environment.apiUrl}/cases`;

  constructor(private http: HttpClient) {}

  getAllCases(): Observable<Case[]> {
    return this.http.get<Case[]>(this.apiUrl);
  }

  getCaseById(id: number): Observable<CaseDetail> {
    return this.http.get<CaseDetail>(`${this.apiUrl}/${id}`);
  }

  createCase(caseItem: Case): Observable<Case> {
    return this.http.post<Case>(this.apiUrl, caseItem);
  }

  updateCase(id: number, caseItem: Case): Observable<Case> {
    return this.http.put<Case>(`${this.apiUrl}/${id}`, caseItem);
  }

  deleteCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
