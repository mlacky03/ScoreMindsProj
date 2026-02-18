import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@WebSocketGateway({ cors: { origin: 'http://localhost:4200', credentials: true } })
@Controller()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;

  constructor(private jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;


      const personalRoom = `user_${userId}`;
      client.join(personalRoom);

      console.log(`Korisnik ${userId} se povezao na globalni socket.`);

      client.emit('init-data', { message: 'Dobrodošao nazad!' });

    } catch (e) {
      console.log('Neuspešna autorizacija socketa');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Korisnik diskonektovan');

  }
  broadcastMatchUpdate(matchId: number, data: any) {
    const roomName = `match_${matchId}`;
    this.server.to(roomName).emit('live_match_update', data);
  }


  sendNotificationToUser(userId: number, data: any) {
    this.server.to(`user_${userId}`).emit('notification', data);
  }

  broadcastMatchStatusChange(matchId: number, status: string) {
    this.server.to('all_matches_list').emit('match_status_changed', { id: matchId, status });
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    console.log(`Socket ${client.id} ušao u sobu: ${room}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    console.log(`Socket ${client.id} izašao iz sobe: ${room}`);
  }

}