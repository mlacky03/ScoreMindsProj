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

@WebSocketGateway({ cors: { origin: 'http://localhost:4200' ,credentials: true} }) 
@Controller()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server;

  constructor(private jwtService: JwtService) {}

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

  @EventPattern('update_match') 
  handleMatchUpdate(@Payload() data: any) {
    // data sadrži: { id, homeScore, awayScore... }
    
    console.log(`📡 RabbitMQ -> WebSocket: Update za meč ${data.id}`);

    // Opcija A: Pošalji SVIMA (Najlakše za sad)
    this.server.emit('live_match_update', data);

    // Opcija B (Bolja): Pošalji samo onima koji gledaju taj meč (Room)
    // this.server.to(`match_${data.id}`).emit('live_match_update', data);
  }

 
  sendNotificationToUser(userId: number, data: any) {
    this.server.to(`user_${userId}`).emit('notification', data);
  }

  // @SubscribeMessage('join_match')
  // handleJoinMatch(@MessageBody() matchId: number, @ConnectedSocket() client: Socket) {
  //   const roomName = `match_${matchId}`;
  //   client.join(roomName);
  //   console.log(`Klijent ${client.id} ušao u sobu: ${roomName}`);
  // }

  // @SubscribeMessage('leave_match')
  // handleLeaveMatch(@MessageBody() matchId: number, @ConnectedSocket() client: Socket) {
  //   const roomName = `match_${matchId}`;
  //   client.leave(roomName);
  // }
}