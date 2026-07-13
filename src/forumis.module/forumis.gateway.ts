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
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatDbService } from './chat.db.service';
import {
  CreateChatDTO,
  CreateGroupDTO,
  ReadChatDTO,
  ReadGroupDTO,
} from 'src/dto/forumis.dto';
import { GroupDbService } from './group.db.service';
import { ForumsDbService } from './forumis.db.service';

import { RabbitMqDashboardClientProvider } from 'src/rant.module/rabbitMq.dashboard.client.provider';
import { QueueDashboardDTO } from 'src/dto/rant.dto';

// User bisa bergabung dengan mengirim id ke joinedRoom
//  user akan mengirim data login ke message
//  user akan keluar ke leftRoom
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ForumsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // SERVER
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ForumsGateway');

  constructor(
    private configService: ConfigService,
    private readonly chatDbService: ChatDbService,
    private readonly groupDbService: GroupDbService,
    private readonly forumsDbService: ForumsDbService, // Di-inject karena dibutuhkan oleh fungsi createGrub
    // Queue RabbitMq untuk kirim data di predksi
    private readonly rabbitDashboard: RabbitMqDashboardClientProvider,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Ready');
    const port = this.configService.get<number>('WEBSOCKETPORT') || 3051;

    this.server.attach(port);
  }

  // CONNECT
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    client.emit('system', {
      message: 'Welcome to Forums Chat',
    });
  }

  // DISCONNECT
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  //
  // gateway untuk chating per user ( per to per )----------------------
  //

  @SubscribeMessage('joinChatRoom')
  handleJoinRoom(
    @MessageBody()
    data: { roomId?: string; senderId: string; receiverId: string },

    @ConnectedSocket()
    client: Socket,
  ) {
    //Peer-to-Peer (atau Person-to-Person) , di pisahkan agar tidak bentrok
    // Gunakan roomId dari client, atau generate otomatis secara konsisten dari backend
    const room =
      data.roomId ||
      this.chatDbService.generateRoomId(data.senderId, data.receiverId);

    // Memasukkan koneksi socket client ke dalam room terisolasi
    client.join(room);

    this.logger.log(`Client ${client.id} joined room ${room}`);

    client.emit('joinChatRoom', {
      roomId: room,
      message: 'Joined chat forum successfully',
    });
  }

  // CHAT MESSAGE
  @SubscribeMessage('chatMessage')
  async handleChatMessage(
    @MessageBody()
    payload: CreateChatDTO,
    @ConnectedSocket()
    client: Socket,
  ) {
    // Pastikan Room ID ter-generate dengan benar
    const room =
      payload.roomId ||
      this.chatDbService.generateRoomId(payload.senderId, payload.receiverId);
    payload.roomId = room;

    try {
      //Simpan pesan chat ke dalam Database MongoDB melalui ChatDbService
      const savedChat = await this.chatDbService.createChat(payload);

      // Siarkan (Broadcast) pesan tersebut HANYA kepada orang yang ada di dalam room ini (Sender & Receiver)
      this.server.to(room).emit('chatMessage', savedChat);

      this.logger.log(
        `[P2P Chat] Pesan dikirim di ${room}: ${payload.message}`,
      );
    } catch (error) {
      this.logger.error(`Gagal memproses pesan chat: ${error.message}`);
      client.emit('error', { message: 'Gagal mengirim pesan' });
    }
  }

  /**
   *  Membaca Pesan (Centang Biru Real-time)
   * Dipicu ketika user lawan bicara membuka obrolan dan melihat pesan baru
   */
  @SubscribeMessage('readChatMessage')
  async handleReadChatMessage(
    @MessageBody() payload: ReadChatDTO,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Update status isRead: true di MongoDB
      await this.chatDbService.markRoomAsRead(payload);

      // Beritahu lawan bicara di room tersebut bahwa pesannya telah dibaca (untuk trigger UI centang biru)
      this.server.to(payload.roomId).emit('messagesMarkedAsRead', {
        roomId: payload.roomId,
        readerId: payload.readerId,
      });
    } catch (error) {
      this.logger.error(`Gagal memperbarui status baca: ${error.message}`);
    }
  }

  /**
   * agar pesan tidak macek jadi di pisahkan supaya prediksi chat nya secara paraller
   * Menghindari menghindari race condition jika di gabungkan ke chatMessage
   */
  @SubscribeMessage('sendChatPredik')
  async handleChatPredik(
    @MessageBody()
    data: {
      forumId: string; // room pada chat yang mengirim pesan
      chatId: number;
      roomId: string;
      message: string;
    },
  ) {
    const roomId = await this.chatDbService.findChatById(data.forumId);

    try {
      if (roomId || data.message.length >= 0) {
        const dashboard = new QueueDashboardDTO(
          data.chatId,
          'chat',
          data.message,
        );
        const result = await this.rabbitDashboard.sendForPredict(dashboard);

        console.info('result prediksi  : ', result);

        //
        // di sini data yang di dapat dari result pasti akan ada yang bentrok , ( prediksi untuk sekarang ) , maka ini tambahan validasi
        //

        if (result.katagori == 'chat') {
          this.logger.log(`result prediksi ${roomId} : ${result}`);

          // this.server.emit('resultChatPredik', result);
          // Kirim balik ke ruangan spesifik (Bukan server.emit global)
          // Gunakan data.roomId agar hanya user di room tersebut yang menerima
          this.server.to(data.roomId).emit('resultChatPredik', result);
        }
      } else {
        this.logger.warn(
          'predik chat , room id tidak di temukan dan messagekosong',
          '\n',
        );
      }
    } catch (err) {
      this.logger.error(`Gagal prediksi chatPredik , hadil`);
    }
  }

  //
  // gateway untuk chating per grub ( Forums Useed ) ----------------------
  //

  /**
   * EVENT: Masuk ke dalam Ruang Forum (Grup)
   */
  @SubscribeMessage('joinGrubRoom')
  handleGrubJoinRoom(
    @MessageBody()
    data: { forumId: string },
    @ConnectedSocket()
    client: Socket,
  ) {
    // Penamaan room dipisahkan khusus untuk grup agar tidak bentrok dengan chat personal
    const room = `group_${data.forumId}`; // Typo 'groub_' diperbaiki menjadi 'group_'

    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);

    client.emit('joinGrubRoom', {
      forumId: data.forumId,
      message: 'Berhasil bergabung ke ruang obrolan grup.',
    });
  }

  /**
   * EVENT: Mengirim Pesan Chat ke Grup
   */
  @SubscribeMessage('grubMessage')
  async handleGrubMessage(
    @MessageBody()
    payload: CreateGroupDTO, // Menggunakan DTO agar struktur data konsisten
    @ConnectedSocket()
    client: Socket,
  ) {
    const room = `group_${payload.forumId}`;

    try {
      // Simpan ke MongoDB & Update statistik totalMessages di Forum
      const savedChat = await this.groupDbService.createGroub(
        payload,
        this.forumsDbService,
      );

      //Broadcast data yang sudah tersimpan (lengkap dengan _id, createdAt, & populate senderId)
      this.server.to(room).emit('grubMessage', savedChat);

      this.logger.log(
        `[Group Chat] Message in ${payload.forumId}: ${payload.message}`,
      );
    } catch (error: any) {
      this.logger.error(`Gagal memproses pesan grup: ${error.message}`);
      client.emit('error', {
        message: error.message || 'Gagal mengirim pesan ke grup',
      });
    }
  }

  /**
   * EVENT: Membaca Pesan Grup (Read Receipt)
   * Dipicu saat anggota grup membuka halaman forum
   */
  @SubscribeMessage('readGroupMessage')
  async handleReadGroupMessage(
    @MessageBody() payload: ReadGroupDTO,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Masukkan ID user ke array readBy di database
      await this.groupDbService.markGroupMessagesAsRead(payload);

      // (Opsional) Broadcast agar UI orang lain tahu bahwa user ini sedang online dan membaca
      const room = `group_${payload.forumId}`;
      this.server.to(room).emit('grubMessagesMarkedAsRead', {
        forumId: payload.forumId,
        readerId: payload.userId,
      });
    } catch (error: any) {
      this.logger.error(`Gagal memperbarui status baca grup: ${error.message}`);
    }
  }

  /**
   * agar pesan tidak macek jadi di pisahkan supaya prediksi chat nya secara paraller
   */
  @SubscribeMessage('sendGroupPredik')
  async handleGroupPredik(
    @MessageBody()
    data: {
      forumId: string; // room pada chat yang mengirim pesan
      user: string;
      isTyping: boolean;
      message: string;
      user_id: number;
    },
  ) {
    const roomId = await this.chatDbService.findChatById(data.forumId);

    try {
      if (roomId || data.message.length >= 0) {
        const dashboard = new QueueDashboardDTO(
          data.user_id,
          'group',
          data.message,
        );

        const result = await this.rabbitDashboard.sendForPredict(dashboard);
        this.logger.log(`result prediksi ${roomId} : ${result}`);

        this.server.emit('resultGroupPredik', result);
      } else {
        this.logger.warn(
          'predik chat , room id tidak di temukan dan messagekosong',
        );
      }
    } catch (err) {
      this.logger.error(`Gagal prediksi GroupPredik , hadil`);
    }
  }

  //
  // other gateway----------------------
  //

  // TYPING EVENT
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
   * leaving with 2 room like chat and grub
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
