export interface TaskAction {
  taskActionId: number;
  taskActionName: string;
  caseId: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  userName?: string;
}
