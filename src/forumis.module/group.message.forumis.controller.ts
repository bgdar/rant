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
import { ForumisRepository } from '@/repository/forumis.repository';
import type { FastifyReply } from 'fastify';
import { GroupMessageForumisRepository } from '@/repository/group.message.forumis.repository';
import {
  CreateGroupMessageForumisDTO,
  UpdateGroupMessageForumisDTO,
} from 'src/dto/forumis.dto';
import { UserSessionDTO } from 'src/dto/user.dto';
import { AuthUserGuard } from 'src/guards/auth.user';

@UseGuards(AuthUserGuard)
@Controller('forums/group')
export class GroupMessageForumisController {
  constructor(
    private readonly forumsRepo: ForumisRepository,
    private readonly groupRepo: GroupMessageForumisRepository,
  ) {}

  /**
   * Halaman Grup Chat Spesifik.
   * Menggunakan :slug untuk memuat forum tertentu berdasarkan text yang di kirim ke backEnd.
   *
   */
  @Get(':slug')
  // @Render('forumis/message/group.ejs') // menyesuikan mesage 
  async groupPage(
    @Param('slug') slug: string,
    @Session() session: Record<string, any>,
    @Res() res : FastifyReply,
  ) {
    const currentUser = session.user as UserSessionDTO;
    //Cari data forum berdasarkan slug
    const forum = await this.forumsRepo.findForumisBySlug(slug);

    if (forum) {
    // Ambil riwayat chat grup menggunakan forumId (dari _id forum)
    const chats = await this.groupRepo.getForumChats(forum.id);

    return res.view("forumis/message/group.ejs", {
      title: forum.name,
      forum: forum || {},
      chats: chats ?? [],
      currentUser: currentUser,
    });
  }else {
    return res.view("forumis/home.ejs",{
      title :"forumu",
      message : "forumu tidak di temukan",
      status : HttpStatus.NOT_FOUND , 
    })

  }
  }

  /**
   * Send group message (Fallback HTTP).
   */
  @Post('send')
  async sendGroupMessage(
    @Body() data: CreateGroupMessageForumisDTO,
    @Session() session: Record<string, any>,
    @Res() res: FastifyReply,
  ) {
    try {
      data.senderId = session.user._id;

      // Menggunakan service grup yang benar
      const groupChat = await this.groupRepo.createGroub(data, this.forumsRepo);

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
    @Body() data: UpdateGroupMessageForumisDTO,
    @Res() res: FastifyReply,
  ) {
    try {
      const chat = await this.groupRepo.updateChat(id, data);
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
      await this.groupRepo.deleteChat(id);
      return res.status(HttpStatus.OK).send({
        message: 'Message deleted',
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed to delete message',
      });
    }
  }
}
