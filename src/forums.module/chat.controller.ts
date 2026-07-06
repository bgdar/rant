import {
  Body,
  Get,
  HttpStatus,
  Param,
  Post,
  Render,
  Res,
  Session,
} from '@nestjs/common';

import { Controller } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { CreateChatDTO, UpdateChatDTO } from 'src/dto/forum.dto';
import { ForumsDbService } from './forums.db.service';
import { ChatDbServiceService } from './chat.db.service.service';

@Controller('forums/chat') // muali dai forums semuanya
export class ChatController {
  constructor(
    private readonly forumsDbService: ForumsDbService,
    private readonly chatDbService: ChatDbServiceService,
  ) {}

  /**
   * Specific forum page/chat room.
   * jadi saat di pilih forums nya , ini adalah halaman di mana forums spesifik di tampilkan
   *
   * Example:
   * /forums/chat/javascript
   */
  @Get(':slug')
  @Render('forums/chat/chat.ejs')
  async chatPage(
    @Param('slug') slug: string,

    @Session() session: Record<string, any>,
  ) {
    const forum = await this.forumsDbService.findForumBySlug(slug);
    const chats = await this.chatDbService.findChatById(forum._id.toString());

    return {
      title: forum.name,

      forum,

      chats,

      currentUser: session.user,
    };
  }

  /**
   * Send forum message.
   */
  @Post('send')
  async sendChat(
    @Body() data: CreateChatDTO,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    try {
      // Inject sender

      data.senderId = session.user._id;

      // Create chat

      const chat = await this.chatDbService.createChat(
        data,
        this.forumsDbService,
      );

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
   * Edit message.
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
   * Delete message.
   */
  @Post('delete/:id')
  async deleteChat(
    @Param('id') id: string,

    @Res() res: FastifyReply,
  ) {
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

  @Get('history')
  @Render('forums/chat/history')
  historyChat() {}
}
