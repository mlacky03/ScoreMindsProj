import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Tvoj auth servis

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | undefined;
  private readonly URL = 'http://localhost:3000'; // Tvoj backend

  constructor(private authService: AuthService) {}

  // Ovu metodu zoveš u AppComponent
  connect() {
    // Ako smo već konektovani, ne radi ništa
    if (this.socket?.connected) return;

    const token = this.authService.getToken(); // Tvoja metoda za dohvatanje tokena

    // 1. Konekcija sa Auth Tokenom
    this.socket = io(this.URL, {
      auth: { token }, // Ovo šaljemo backendu u 'handleConnection'
      reconnection: true,
      autoConnect: true
    });

    // Debugging
    this.socket.on('connect', () => console.log('Socket povezan! ID:', this.socket?.id));
    this.socket.on('connect_error', (err) => console.error('Socket greška:', err));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Slušalac za notifikacije (zamenjuje SSE stream)
  onNotification(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('notification', (data) => {
        observer.next(data);
      });
    });
  }
}