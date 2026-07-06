import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';

import {
  CreateForumDTO,
  ForumMemberRole,
  ForumVisibility,
  UpdateForumDTO,
} from 'src/dto/forum.dto';

import { ForumsDbService } from './forums.db.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthUserGuard } from 'src/guards/auth.user';
import { request } from 'http';
import { UserSessionDTO } from 'src/dto/user.dto';
import { Types } from 'mongoose';
import { AuthSupervisorGuard } from 'src/guards/auth.supervisor';
import { SupervisorSessionDTO } from 'src/dto/supervisor.dto';
import { SupervisorDbService } from 'src/supervisor.module/supervisor.db.service';

@UseGuards(AuthUserGuard)
@Controller('forums')
export class ForumsController {
  constructor(
    private readonly forumsDbService: ForumsDbService,
    private readonly supervisorDbService: SupervisorDbService,
  ) {}

  /**
   * Forums home page.
   */
@Get()
  async home(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const user = (req as any).session?.user as UserSessionDTO;
    const svss = (req as any).session?.supervisor as SupervisorSessionDTO;

    // if (!user) {
    //   console.info('Belum login user, redirect ke signIn');
    //   return res.redirect('/user/signIn');
    // }

    // --- KONDISI 1 JIKA SESSION SUPERVISOR AKTIF ---
    if (svss) {
      const svid = new Types.ObjectId(svss.id);
      const userId = new Types.ObjectId(user.id);

      // Ambil forum milik Supervisor (berdasarkan ID Supervisor)
      const rawForumsSupervisor = await this.forumsDbService.findAllSupervisorForums(svid);
      const forumsSupervisor = rawForumsSupervisor.map(forum => {
        const obj = forum.toObject ? forum.toObject() : forum;
        obj.id = obj._id.toString(); // Penting untuk :key Alpine.js
        return obj;
      });

      // Ambil forum milik User Biasa (berdasarkan ID User biasa)
      const rawForumsUser = await this.forumsDbService.findAllUserForums(userId);
      const forumsUser = rawForumsUser.map(forum => {
        const obj = forum.toObject ? forum.toObject() : forum;
        obj.id = obj._id.toString();
        return obj;
      });

      console.info(`[Supervisor Mode] Mengirim ${forumsSupervisor.length} forum SV dan ${forumsUser.length} forum User.`);

      return res.view('forums/home.ejs', {
        title: 'Supervisor Forums',
        username: svss.username,
        status: 'supervisor', // Tab default yang aktif
        isSupervisor: true,
        forumsSupervisor: forumsSupervisor,
        forumsUser: forumsUser, 
      });
    }

    // --- KONDISI 2 JIKA HANYA USER BIASA ---
    const userId = new Types.ObjectId(user.id);
    const rawForumsUser = await this.forumsDbService.findAllUserForums(userId);
    const forumsUser = rawForumsUser.map(forum => {
      const obj = forum.toObject ? forum.toObject() : forum;
      obj.id = obj._id.toString();
      return obj;
    });

    console.info(`[User Mode] Mengirim ${forumsUser.length} forum User.`);

    return res.view('forums/home.ejs', {
      title: 'Home Forums',
      username: user.username,
      status: 'user', // Tab default yang aktif
      isSupervisor: false,
      forumsSupervisor: [], // Dikosongkan agar JSON.stringify tidak error di EJS
      forumsUser: forumsUser,
    });
  }
  /**
   * Create forum page.
   */
  @UseGuards(AuthSupervisorGuard)
  @Get('create-forum')
  @Render('forums/create-forum.ejs')
  async createForums(@Session() session: Record<string, any>) {
    const svss = session?.supervisor as SupervisorSessionDTO;

    // panggil dari DB karena butuh id dari si supervisor
    // const supervisor = await this.supervisorDbService.findByUsernameEmail(
    //   svss.username,
    //   svss.email,
    // );

    console.info('data supervosir session di create : ', svss);

    return {
      supervisor: {
        supervisorId : svss.id || null,
        role: svss?.role,
      },
      forumsVisibility: Object.values(ForumVisibility), // kirim semua unuk di pilih retunt array
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
      // Add supervisor ID

      // Create forum

      const forum = await this.forumsDbService.createForum(data);
      console.info("forums :data ->",forum)

      return res.status(HttpStatus.OK).send({
        message: 'Forum created successfully',
        forum,
      });
    } catch (error: any) {
      console.error("error : ",error.message)
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed create forum',
      });
    }
  }

  /**
   * Forums home page.
   */

  @Get('search')
  searchForumsView() {
    const forums = this.forumsDbService.findAllForums();

    return {
      forums: forums,
    };
  }

  @Post('search')
  @Render('forums/search.ejs')
  async searchForums(
    @Res() res: FastifyReply,
    @Query('search') search?: string,
  ) {
    /*
     | Search forums berdasarkan nama member ( supervisor akan punya tag khusu nantik )
     */
    console.info('search key : ', search);
    const user = (request as any).session?.user as UserSessionDTO;

    if (user) {
      if (search) {
        const userId = new Types.ObjectId(user.id);
        const forums = await this.forumsDbService.searchforums(search, userId);

        console.info('frums data : ', forums);

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
      } else {
        return res;
      }
    } else {
      console.info('gagal login');
      res.redirect('user/signIn');
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
