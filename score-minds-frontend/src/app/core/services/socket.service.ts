import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Tvoj auth servis

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | undefined;
  private readonly URL = 'http://localhost:3000';



  private readonly instanceId = Math.floor(Math.random() * 10000);

  constructor(private authService: AuthService) {
    console.log(`🛠️ KREIRAN SocketService [ID: ${this.instanceId}]`);
  }

  connect() {
    console.group(`🔌 Pokušaj konekcije na servisu [ID: ${this.instanceId}]`);
    console.trace('Ko me je pozvao?');
    console.groupEnd();
    //if (this.socket?.connected) return;
    if (this.socket) {
      console.log('⚠️ Socket već postoji, preskačem kreiranje nove konekcije.');
      return;
    }
    const token = this.authService.getToken();

    this.socket = io(this.URL, {
      auth: { token },
      reconnection: true,
      autoConnect: true
    });


    this.socket.on('connect', () => console.log('Socket povezan! ID:', this.socket?.id));
    this.socket.on('connect_error', (err) => console.error('Socket greška:', err));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }


  onNotification(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('notification', (data) => {
        observer.next(data);
      });
    });
  }
  emit(eventName: string, data: any) {
    if (!this.socket) {
      console.warn(`Pokusaj emitovanja '${eventName}' ali socket nije povezan!`);
      return;
    }
    this.socket.emit(eventName, data);
  }
  on(eventName: string): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) {
        console.warn(`Pokusaj slusanja '${eventName}' ali socket nije povezan!`);
        return;
      }

      
      const handler = (data: any) => {
        observer.next(data);
      };

      
      this.socket.on(eventName, handler);

      return () => {
        this.socket?.off(eventName, handler);
      };
    });
  }


  onMatchUpdate(): Observable<any> {
    return new Observable(observer => {

      if (!this.socket) return;

      this.socket.on('live_match_update', (data) => {
        observer.next(data);
      });
    });
  }

  onMatchListUpdate():Observable<any>
  {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('match_status_changed', (data) => {
        observer.next(data);
      });
    });
  }
  onPredictionUpdate():Observable<any>
  {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('prediction_computed', (data) => {
        observer.next(data);
      });
    });
  }

  joinRoom(roomName: string) {
    this.socket?.emit('join_room', roomName);
  }

  leaveRoom(roomName: string) {
    this.socket?.emit('leave_room', roomName);
  }
}