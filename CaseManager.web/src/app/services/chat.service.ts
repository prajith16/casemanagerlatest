import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { ChatMessage, ChatRequest, ChatResponse } from '../models/chat.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;
  private hubConnection: signalR.HubConnection | null = null;
  private messageChunk$ = new Subject<{ sessionId: string; chunk: string }>();
  private messageComplete$ = new Subject<string>();
  private sessionId: string = '';

  constructor(private http: HttpClient) {
    this.sessionId = this.generateSessionId();
  }

  getMessageChunks(): Observable<{ sessionId: string; chunk: string }> {
    return this.messageChunk$.asObservable();
  }

  getMessageComplete(): Observable<string> {
    return this.messageComplete$.asObservable();
  }

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = localStorage.getItem('auth_token');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5226/chatHub', {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessageChunk', (sessionId: string, chunk: string) => {
      this.messageChunk$.next({ sessionId, chunk });
    });

    this.hubConnection.on('ReceiveMessageComplete', (sessionId: string) => {
      this.messageComplete$.next(sessionId);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR connected');
    } catch (err) {
      console.error('Error connecting to SignalR:', err);
      throw err;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      console.log('SignalR disconnected');
    }
  }

  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      message,
      sessionId: this.sessionId,
    };
    return this.http.post<ChatResponse>(this.apiUrl, request);
  }

  getChatHistory(sessionId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${sessionId}`);
  }

  clearChatHistory(sessionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/history/${sessionId}`);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  resetSession(): void {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
