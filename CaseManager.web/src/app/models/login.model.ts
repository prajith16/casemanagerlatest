export interface LoginRequest {
  userName: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  userName: string;
  firstName: string;
  lastName: string;
}
