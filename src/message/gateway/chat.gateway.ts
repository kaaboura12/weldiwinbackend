import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message.service';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    // Extract token from handshake auth or query
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    if (token) {
      try {
        const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
        const payload = this.jwtService.verify(token as string, { secret });
        client.data.user = payload;
      } catch (error) {
        // Invalid token - client can still connect but won't have user data
        console.warn('WebSocket connection with invalid token');
      }
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup
  }

  /**
   * Join a room by roomId
   */
  @SubscribeMessage('joinRoom')
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.data.user) {
      return { error: 'Unauthorized' };
    }
    client.join(`room:${data.roomId}`);
    this.server.to(`room:${data.roomId}`).emit('presence', { userId: client.id, state: 'joined', roomId: data.roomId });
    return { ok: true, roomId: data.roomId };
  }

  /**
   * Leave a room by roomId
   */
  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(`room:${data.roomId}`);
    this.server.to(`room:${data.roomId}`).emit('presence', { userId: client.id, state: 'left', roomId: data.roomId });
    return { ok: true, roomId: data.roomId };
  }

  /**
   * Send a text message via WebSocket (real-time)
   */
  @SubscribeMessage('sendText')
  async onSendText(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { roomId: string; text: string; senderModel: 'User' | 'Child'; senderId: string },
  ) {
    if (!client.data.user) {
      return { error: 'Unauthorized' };
    }
    try {
      const msg = await this.messageService.sendText(body, client.data.user);
      this.server.to(`room:${body.roomId}`).emit('newMessage', msg);
      return msg;
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Send call signaling (WebRTC offer/answer/ICE)
   */
  @SubscribeMessage('signal')
  async onSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: {
      roomId: string;
      senderModel: 'User' | 'Child';
      senderId: string;
      type: 'CALL_OFFER' | 'CALL_ANSWER' | 'ICE_CANDIDATE';
      payload: Record<string, any>;
    },
  ) {
    if (!client.data.user) {
      return { error: 'Unauthorized' };
    }
    try {
      const message = await this.messageService.sendSignal(
        {
          roomId: body.roomId,
          senderModel: body.senderModel,
          senderId: body.senderId,
          type: body.type,
          payload: body.payload,
        },
        client.data.user,
      );
      // Broadcast to all clients in the room except sender
      client.to(`room:${body.roomId}`).emit('signal', message);
      return { ok: true, message };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

