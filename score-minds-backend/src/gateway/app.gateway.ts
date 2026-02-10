import { 
  WebSocketGateway, 
  OnGatewayConnection, 
  OnGatewayDisconnect, 
  WebSocketServer 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt'; // Pretpostavljam da koristiš JWT

@WebSocketGateway({ cors: { origin: 'http://localhost:4200' ,credentials: true} }) // Podesi CORS
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

      // Verifikuj korisnika
      const payload = this.jwtService.verify(token);
      const userId = payload.sub; // ili payload.id, zavisi kako si setovao

      // 2. KLJUČNI DEO: Ubaci korisnika u njegovu "ličnu sobu"
      // Ovo ti omogućava da kasnije kažeš: "Pošalji notifikaciju samo Peri"
      const personalRoom = `user_${userId}`;
      client.join(personalRoom);

      console.log(`Korisnik ${userId} se povezao na globalni socket.`);
      
      // Opciono: Pošalji mu odmah poruku dobrodošlice ili nepročitane notifikacije
      client.emit('init-data', { message: 'Dobrodošao nazad!' });

    } catch (e) {
      console.log('Neuspešna autorizacija socketa');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Korisnik diskonektovan');
   
  }

 
  sendNotificationToUser(userId: number, data: any) {
    this.server.to(`user_${userId}`).emit('notification', data);
  }
}