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
  private activeLocks = new Map<number, { socketId: string, userId: number, userName: string }[]>();

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

      client['user'] = payload;

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
    for (const predictionId of this.activeLocks.keys()) {
      this.removeUserFromQueue(predictionId, client.id);
    }

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

  brodcastPredictionComputedChange(predictionId: number, data: any) {
    this.server.to(`prediction_${predictionId}`).emit('prediction_computed', data);
  }

  brodcastPredictionListChagne(predictionId: number, data: any,groupId:number) {
    const roomName = `all_predictions_list_${groupId}`;

    this.server.to(roomName).emit('prediction-list-changed', data);
  }

  brodcastPersonalListChange(data:any)
  {
    this.server.to('personal_list_changed_' + data.userId).emit('personal-list-changed', data);
  }

  brodcastUserAddedToGroup(userId:number,groupId:number)
  { 
    this.server.to(`user_${userId}`).emit('added_to_group', { groupId });
  }

  @SubscribeMessage('request_edit_lock')
  handleRequestLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { predictionId: number }
  ) {
    const predictionId = data.predictionId;
    const queue = this.activeLocks.get(predictionId) || [];

    const userId = client['user']?.sub;
    const userName = client['user']?.username || `Korisnik ID: ${userId}`;


    if (!queue.find(req => req.socketId === client.id)) {
      queue.push({ socketId: client.id, userId, userName });
      this.activeLocks.set(predictionId, queue);
    }


    if (queue[0].socketId === client.id) {
      client.emit('edit_lock_status', { locked: true, isMe: true });


      client.to(`prediction_${predictionId}`).emit('edit_lock_status', {
        locked: true,
        isMe: false,
        editorName: userName
      });
    } else {
      client.emit('edit_lock_status', {
        locked: true,
        isMe: false,
        editorName: queue[0].userName,
        queuePosition: queue.findIndex(req => req.socketId === client.id)
      });
    }
  }

  @SubscribeMessage('form_value_changed')
  handleFormValueChanged(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { predictionId: number, data: any }
  ) {
    const queue = this.activeLocks.get(payload.predictionId);

    
    if (queue && queue.length > 0 && queue[0].socketId === client.id) {
      client.to(`prediction_${payload.predictionId}`).emit('live_form_update', payload.data);
    }
  }

  @SubscribeMessage('release_edit_lock')
  handleReleaseLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { predictionId: number }
  ) {
    this.removeUserFromQueue(data.predictionId, client.id);
  }

  private removeUserFromQueue(predictionId: number, socketId: string) {
    const queue = this.activeLocks.get(predictionId);
    if (!queue) return;

    const wasFirst = queue[0]?.socketId === socketId;
    const updatedQueue = queue.filter(req => req.socketId !== socketId);

    if (updatedQueue.length === 0) {
      
      this.activeLocks.delete(predictionId);
      if (wasFirst) {
        this.server.to(`prediction_${predictionId}`).emit('edit_lock_status', { locked: false, isMe: false });
      }
    } else {
      this.activeLocks.set(predictionId, updatedQueue);
      
      if (wasFirst) {
        
        const nextUser = updatedQueue[0];
        
       
        this.server.to(nextUser.socketId).emit('edit_lock_status', { locked: true, isMe: true });
        
      
        this.server.to(`prediction_${predictionId}`).except(nextUser.socketId).emit('edit_lock_status', {
          locked: true,
          isMe: false,
          editorName: nextUser.userName
        });
      }
    }
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