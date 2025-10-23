export interface Case {
  caseId: number;
  caseName: string;
  regardingUserId: number;
  isComplete: boolean;
  canComplete: boolean;
  assignedUserId: number;
  assignedUserFirstName?: string;
  assignedUserLastName?: string;
  assignedUserName?: string;
}

export interface CaseDetail extends Case {
  regardingUserFirstName: string;
  regardingUserLastName: string;
  assignedUserFirstName: string;
  assignedUserLastName: string;
}
