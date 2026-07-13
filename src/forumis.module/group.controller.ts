import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Session,
  Res,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ForumsDbService } from './forumis.db.service';
import type { FastifyReply } from 'fastify';
import { GroupDbService } from './group.db.service';
import { CreateGroupDTO, UpdateGroupDTO } from 'src/dto/forumis.dto';
import { UserSessionDTO } from 'src/dto/user.dto';
import { AuthUserGuard } from 'src/guards/auth.user';

@UseGuards(AuthUserGuard)
@Controller('forums/group')
export class GroupController {
  constructor(
    private readonly forumsDbService: ForumsDbService,
    private readonly groupDbService: GroupDbService,
  ) {}

  /**
   * Halaman Grup Chat Spesifik.
   * Menggunakan :slug untuk memuat forum tertentu berdasarkan text yang di kirim ke backEnd.
   *
   */
  @Get(':slug')
  @Render('forums/chat/group.ejs')
  async groupPage(
    @Param('slug') slug: string,
    @Session() session: Record<string, any>,
  ) {
    const currentUser = session.user as UserSessionDTO;
    //Cari data forum berdasarkan slug
    const forum = await this.forumsDbService.findForumBySlug(slug);

    // Ambil riwayat chat grup menggunakan forumId (dari _id forum)
    const chats = await this.groupDbService.getForumChats(forum._id.toString());

    return {
      title: forum.name,
      forum: forum || {},
      chats: chats ?? [],
      currentUser: currentUser,
    };
  }

  /**
   * Send group message (Fallback HTTP).
   */
  @Post('send')
  async sendGroupMessage(
    @Body() data: CreateGroupDTO,
    @Session() session: Record<string, any>,
    @Res() res: FastifyReply,
  ) {
    try {
      data.senderId = session.user._id;

      // Menggunakan service grup yang benar
      const groupChat = await this.groupDbService.createGroub(
        data,
        this.forumsDbService,
      );

      return res.status(HttpStatus.CREATED).send({
        message: 'Message sent successfully',
        chat: groupChat,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed to send message',
      });
    }
  }

  /**
   * Edit message.
   */
  @Post('update/:id')
  async updateGroupMessage(
    @Param('id') id: string,
    @Body() data: UpdateGroupDTO,
    @Res() res: FastifyReply,
  ) {
    try {
      const chat = await this.groupDbService.updateChat(id, data);
      return res.status(HttpStatus.OK).send({
        message: 'Message updated',
        chat,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed to update message',
      });
    }
  }

  /**
   * Delete message.
   */
  @Post('delete/:id')
  async deleteGroupMessage(@Param('id') id: string, @Res() res: FastifyReply) {
    try {
      await this.groupDbService.deleteChat(id);
      return res.status(HttpStatus.OK).send({
        message: 'Message deleted',
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed to delete message',
      });
    }
  }
  @Get('history')
  @Render('forums/chat/history')
  historyChat() {}
}
