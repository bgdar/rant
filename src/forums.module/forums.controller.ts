import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Render,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';

import {
  CreateChatDTO,
  CreateForumDTO,
  ForumMemberRole,
  UpdateChatDTO,
  UpdateForumDTO,
} from 'src/dto/forumDTO';

import { ForumsDbService } from './forums.db.service';
import type { FastifyReply } from 'fastify';
import { AuthGuard } from 'src/guards/auth';
@UseGuards(AuthGuard)
@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsDbService: ForumsDbService) {}

  /**
   * Forums home page.
   *
   * Menampilkan:
   * - daftar semua forum
   * - latest forums
   * - search forum
   */
  @Get()
  @Render('forums/home.ejs')
  async home(@Query('search') search?: string) {
    /*
     | Search forums
     */

    const forums = search
      ? await this.forumsDbService.searchForums(search)
      : await this.forumsDbService.findAllForums();

    /*
     | Stats
     */

    const totalForums = await this.forumsDbService.countForums();

    const totalChats = await this.forumsDbService.countChats();

    return {
      title: 'Home Forums',

      forums,

      search,

      stats: {
        totalForums,
        totalChats,
      },
    };
  }

  /**
   * Create forum page.
   */
  @Get('create-forum')
  @Render('forums/create-forum.ejs')
  createForums() {
    return {
      title: 'Create Forum',
    };
  }

  /**
   * Create new forum.
   */
  @Post('create-forum')
  async createForumPost(
    @Body() data: CreateForumDTO,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    try {
      /*
       | Add supervisor ID
       */

      data.supervisorId = session.user._id;

      /*
       | Create forum
       */

      const forum = await this.forumsDbService.createForum(data);

      return res.status(HttpStatus.OK).send({
        message: 'Forum created successfully',

        forum,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed create forum',
      });
    }
  }

  /**
   * Specific forum page/chat room.
   * jadi saat di pilih forums nya , ini adalah halaman di mana forums spesifik di tampilkan
   *
   * Example:
   * /forums/chat/javascript
   */
  @Get('chat/:slug')
  @Render('forums/chat.ejs')
  async forumsPage(
    @Param('slug') slug: string,

    @Session() session: Record<string, any>,
  ) {
    const forum = await this.forumsDbService.findForumBySlug(slug);

    /*
     | Chats
     */

    const chats = await this.forumsDbService.getForumChats(
      forum._id.toString(),
    );

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
  @Post('chat/send')
  async sendChat(
    @Body() data: CreateChatDTO,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    try {
      /*
       | Inject sender
       */

      data.senderId = session.user._id;

      /*
       | Create chat
       */

      const chat = await this.forumsDbService.createChat(data);

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
  @Post('chat/update/:id')
  async updateChat(
    @Param('id') id: string,

    @Body() data: UpdateChatDTO,

    @Res() res: FastifyReply,
  ) {
    try {
      const chat = await this.forumsDbService.updateChat(id, data);

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
  @Post('chat/delete/:id')
  async deleteChat(
    @Param('id') id: string,

    @Res() res: FastifyReply,
  ) {
    try {
      await this.forumsDbService.deleteChat(id);

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
   * Join forum.
   */
  @Post('join/:forumId')
  async joinForum(
    @Param('forumId')
    forumId: string,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    try {
      const forum = await this.forumsDbService.addMember(
        forumId,

        session.user._id,

        ForumMemberRole.MEMBER,
      );

      return res.status(HttpStatus.OK).send({
        message: 'Successfully joined forum',

        forum,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed join forum',
      });
    }
  }

  /**
   * Leave forum.
   */
  @Post('leave/:forumId')
  async leaveForum(
    @Param('forumId')
    forumId: string,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    try {
      const forum = await this.forumsDbService.removeMember(
        forumId,

        session.user._id,
      );

      return res.status(200).send({
        message: 'Successfully left forum',

        forum,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed leave forum',
      });
    }
  }

  /**
   * Update forum info.
   */
  @Post('update/:id')
  async updateForum(
    @Param('id') id: string,

    @Body() data: UpdateForumDTO,

    @Res() res: FastifyReply,
  ) {
    try {
      const forum = await this.forumsDbService.updateForum(id, data);

      return res.status(200).send({
        message: 'Forum updated successfully',

        forum,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed update forum',
      });
    }
  }

  /**
   * Delete forum.
   */
  @Post('delete/:id')
  async deleteForum(
    @Param('id') id: string,

    @Res() res: FastifyReply,
  ) {
    try {
      await this.forumsDbService.deleteForum(id);

      return res.status(200).send({
        message: 'Forum deleted successfully',
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed delete forum',
      });
    }
  }
}
