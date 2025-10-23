import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CaseUpdateService {
  private caseUpdatedSubject = new Subject<void>();
  public caseUpdated$ = this.caseUpdatedSubject.asObservable();

  /**
   * Notify subscribers that a case has been added, updated, or deleted
   */
  notifyCaseUpdate(): void {
    this.caseUpdatedSubject.next();
  }
}
