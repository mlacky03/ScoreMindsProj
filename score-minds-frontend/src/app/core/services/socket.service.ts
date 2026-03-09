import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service'; // Tvoj auth servis

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | undefined;
  private readonly URL = 'http://localhost:3000';

  private activeRooms = new Set<string>();

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
    this.socket.on('connect', () => {
      console.log('✅ Socket povezan! ID:', this.socket?.id);
      this.rejoinRooms();
    });

    this.socket.on('connect_error', (err) => console.error('Socket greška:', err));
  }

  disconnect() {
    if (this.socket) {
      console.log("diskonektovan si");
      this.socket.disconnect();
      this.socket = undefined;  
      this.activeRooms.clear();
    }
  }

  private rejoinRooms() {
    if (this.activeRooms.size > 0 && this.socket?.connected) {
      console.log('🔄 Vraćam se u sobe:', Array.from(this.activeRooms));
      this.activeRooms.forEach(room => {
        this.joinRoom(room);
      });
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

  onMatchListUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('match_list_changed', (data) => {
        observer.next(data);
      });
    });
  }
  onPredictionUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('prediction_computed', (data) => {
        observer.next(data);
      });
    });
  }
  onPredictionListUpdate(): Observable<any> {
    console.log("uso sam u socket");
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('prediction-list-changed', (data) => {
        console.log("primio sam update za prediction list", data);
        observer.next(data);
      });
    });
  }
  onPersonalListUpdate(): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('personal-list-changed', (data) => {
        observer.next(data);
      });
    });
  }
  onGroupPredictionDelete():Observable<any>
  {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on('prediction_deleted', (data) => {
        observer.next(data);
      });
    });
  }

  joinMatchRooms(matchIds: number[]) {
    if (!matchIds || matchIds.length === 0) return;
    
    const roomsToJoin = matchIds.map(id => `match_${id}`);
    roomsToJoin.forEach(room => this.activeRooms.add(room));
    if (this.socket?.connected) {
      this.socket.emit('join_room', roomsToJoin); 
    } else {
      console.log(`⏳ Paket soba stavljen na čekanje (socket se još povezuje).`);
    }
  }

  leaveMatchRooms(matchIds: number[]) {
    if (!matchIds || matchIds.length === 0) return;

    const roomsToLeave = matchIds.map(id => `match_${id}`);
    roomsToLeave.forEach(room => this.activeRooms.delete(room));

    if (this.socket?.connected) {
      this.socket.emit('leave_room', roomsToLeave);
    }
    else{
      console.log("izbugljena konekcija niste u sobi");
    }

  }

  onAddedToGroup(): Observable<any> {
    return this.on('added_to_group');
  }

  joinRoom(roomName: string) {
    this.activeRooms.add(roomName);
    if (this.socket?.connected) {
      console.log('🔄 Vraćam se u sobe:', Array.from(this.activeRooms));

      this.socket.emit('join_room', roomName);
      
    } else {
      console.log(`⏳ Soba '${roomName}' stavljena na čekanje (socket se još povezuje).`);
    }
  }

  leaveRoom(roomName: string) {
    this.activeRooms.delete(roomName);
    if (this.socket?.connected) {
      console.log('🔄 Izlazim iz sobe:', roomName);

      this.socket.emit('leave_room', roomName);
    }
  }
}