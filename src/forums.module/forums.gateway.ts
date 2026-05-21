import {
  // ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ForumsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /*
   | SERVER
   */

  @WebSocketServer()
  server: Server;

  private logger = new Logger('ForumsGateway');

  afterInit() {
    this.logger.log('WebSocket Gateway Ready');
  }

  /*
   | CONNECT
   */

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    client.emit('system', {
      message: 'Welcome to Forums Chat',
    });
  }

  /*
   | DISCONNECT
   */

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /*
   | JOIN FORUM ROOM
   */

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody()
    data: { forumId: string },

    @ConnectedSocket()
    client: Socket,
  ) {
    const room = data.forumId;

    client.join(room);

    this.logger.log(`Client ${client.id} joined room ${room}`);

    client.emit('joinedRoom', {
      forumId: room,
      message: 'Joined forum successfully',
    });
  }

  /*
   | CHAT MESSAGE
   */

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody()
    payload: {
      forumId: string;

      message: string;

      senderId?: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const { forumId, message } = payload;

    /*
     | BROADCAST TO ROOM
     */

    this.server.to(forumId).emit('message', {
      forumId,

      message,

      senderId: payload.senderId || client.id,

      time: new Date().toISOString(),
    });

    /*
     | LOG
     */

    this.logger.log(`Message in ${forumId}: ${message}`);
  }

  /*
   | TYPING EVENT (OPTIONAL)
   */

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: {
      forumId: string;
      user: string;
      isTyping: boolean;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    this.server.to(data.forumId).emit('typing', {
      user: data.user,
      isTyping: data.isTyping,
    });
  }

  /*
   | LEAVE ROOM (OPTIONAL)
   */

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody()
    data: { forumId: string },

    @ConnectedSocket()
    client: Socket,
  ) {
    client.leave(data.forumId);

    client.emit('leftRoom', {
      forumId: data.forumId,
    });
  }
}
