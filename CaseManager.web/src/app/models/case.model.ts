export interface Case {
  caseId: number;
  caseName: string;
  isComplete: boolean;
  canComplete: boolean;
  assignedUserId: number;
  assignedUserFirstName?: string;
  assignedUserLastName?: string;
  assignedUserName?: string;
}

export interface CaseDetail extends Case {
  assignedUserFirstName: string;
  assignedUserLastName: string;
}
