import {
  BadRequestException,
  Body,
  Get,
  HttpStatus,
  Param,
  Post,
  Render,
  Res,
  Query,
  Session,
  NotFoundException,
} from '@nestjs/common';

import { Controller } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { CreateChatDTO, UpdateChatDTO } from 'src/dto/forumis.dto';
import { ChatDbService } from './chat.db.service';
import { UserDbService } from 'src/user.module/user.db.service';
import { UserSessionDTO } from 'src/dto/user.dto';

@Controller('forums/chat')
export class ChatController {
  constructor(
    private readonly chatDbService: ChatDbService,
    private readonly userDbService: UserDbService, // Inject service user untuk mengambil data profil lawan bicara
  ) {}

  /**
   * Halaman Ruang Chat Personal (P2P).
   * Menangkap query string dari halaman pencarian
   * Example : /forums/chat?targetId=xxx
   */
  @Get()
  @Render('forums/chat/chat.ejs')
  async chatPage(
    @Query('targetId') targetId: string,
    @Session() session: Record<string, any>,
  ) {
    const currentUser = session?.user as UserSessionDTO;

    if (!targetId) {
      throw new BadRequestException(
        'Target user ID (lawan bicara) tidak ditemukan.',
      );
    }

    // Ambil data pengguna target (lawan bicara)
    const targetUser = await this.userDbService.findById(targetId);
    if (!targetUser) {
      throw new NotFoundException('User yang ingin dihubungi tidak ditemukan.');
    }
    console.info('Id user yang masu di chat L: ', targetUser);

    // Generate Room ID yang konsisten antara currentUser dan targetUser
    const roomId = this.chatDbService.generateRoomId(currentUser.id, targetId);

    // Ambil riwayat percakapan dari database
    const chats = await this.chatDbService.getRoomChats(roomId);

    return {
      title: `Chat  with ${targetUser.username}`,
      roomId, // Kirim roomId ke EJS agar bisa dipakai oleh Socket.io saat join room
      targetUser,
      chats,
      currentUser,
    };
  }

  /**
   * Endpoint HTTP untuk mengirim pesan via REST API (Fallback jika socket gagal)
   */
  @Post('send')
  async sendChat(
    @Body() data: CreateChatDTO,
    @Session() session: Record<string, any>,
    @Res() res: FastifyReply,
  ) {
    try {
      // Selalu set senderId dari session server demi keamanan (mencegah spoofing)
      data.senderId = session.user._id;

      // Panggil service tanpa melemparkan ForumsDbService
      const chat = await this.chatDbService.createChat(data);

      return res.status(HttpStatus.CREATED).send({
        message: 'Message sent successfully',
        chat,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed send message',
      });
    }
  }

  /**
   * Endpoint HTTP untuk mengedit pesan.
   */
  @Post('update/:id')
  async updateChat(
    @Param('id') id: string,
    @Body() data: UpdateChatDTO,
    @Res() res: FastifyReply,
  ) {
    try {
      const chat = await this.chatDbService.updateChat(id, data);

      return res.status(HttpStatus.OK).send({
        message: 'Message updated',
        chat,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed update message',
      });
    }
  }

  /**
   * Endpoint HTTP untuk menghapus (soft-delete) pesan.
   */
  @Post('delete/:id')
  async deleteChat(@Param('id') id: string, @Res() res: FastifyReply) {
    try {
      await this.chatDbService.deleteChat(id);

      return res.status(HttpStatus.OK).send({
        message: 'Message deleted',
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed delete message',
      });
    }
  }

  /**
   * Halaman history tambahan (Opsional).
   */
  @Get('history')
  @Render('forums/chat/history')
  historyChat() {
    return {
      title: 'Riwayat Obrolan',
    };
  }
}
