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
} from 'src/dto/forumis.dto';

import { ForumsDbService } from './forumis.db.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthUserGuard } from 'src/guards/auth.user';
import { request } from 'http';
import { UserDTO, UserSessionDTO } from 'src/dto/user.dto';
import { Types } from 'mongoose';
import { AuthSupervisorGuard } from 'src/guards/auth.supervisor';
import { SupervisorSessionDTO } from 'src/dto/supervisor.dto';
import { SupervisorDbService } from 'src/supervisor.module/supervisor.db.service';
import { UserDbService } from 'src/user.module/user.db.service';
import { GroupDbService } from './group.db.service';
import { ChatDbService } from './chat.db.service';

@UseGuards(AuthUserGuard)
@Controller('forums')
export class ForumsController {
  constructor(
    private readonly forumsDbService: ForumsDbService,
    private readonly supervisorDbService: SupervisorDbService,
    private readonly userDbService: UserDbService,
    private readonly chatDbService: ChatDbService,
    private readonly groupDbService: GroupDbService,
  ) {}

  /**
   * Forums home page.
   */
  @Get()
  async home(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const user = (req as any).session?.user as UserSessionDTO;
    const svss = (req as any).session?.supervisor as SupervisorSessionDTO;

    // Ambil data User untuk "Pajangan" (sidebar atau list chat baru)
    // ini masuk ke katagori user , jadi pakai id user
    const userRecent = await this.chatDbService.getRecentChats(user.id);

    console.info('user Recent : ', userRecent, '\n');

    // --- KONDISI 1 JIKA SESSION SUPERVISOR AKTIF ---
    if (svss) {
      const svid = new Types.ObjectId(svss.id);
      const userId = new Types.ObjectId(user.id);

      // Ambil forum milik Supervisor (berdasarkan ID Supervisor)
      const rawForumsSupervisor =
        await this.forumsDbService.findAllSupervisorForums(svid);
      const forumsSupervisor = rawForumsSupervisor.map((forum) => {
        const obj = forum.toObject ? forum.toObject() : forum;
        obj.id = obj._id.toString(); // Penting untuk :key Alpine.js
        return obj;
      });

      // Ambil forum milik User Biasa (berdasarkan ID User biasa)
      const rawForumsUser =
        await this.forumsDbService.findAllUserForums(userId);
      const forumsUser = rawForumsUser.map((forum) => {
        const obj = forum.toObject ? forum.toObject() : forum;
        obj.id = obj._id.toString();
        return obj;
      });

      console.info('data user forums : ', forumsUser);

      return res.view('forums/home.ejs', {
        title: 'Supervisor Forums',
        username: svss.username,
        status: 'supervisor', // Tab default yang aktif
        isSupervisor: true,
        forumsSupervisor: forumsSupervisor ?? [],
        forumsUser: forumsUser ?? [],
        userRecent: userRecent ?? [],
      });
    }

    // --- KONDISI 2 JIKA HANYA USER BIASA ---
    const userId = new Types.ObjectId(user.id);
    const rawForumsUser = await this.forumsDbService.findAllUserForums(userId);
    const forumsUser = rawForumsUser.map((forum) => {
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
      forumsUser: forumsUser ?? [],
      userRecent: userRecent ?? [],
    });
  }
  /**
   * Create forum page.
   * ubah ke nama create forums ->  create grub , karena akan di pisah jenis chatting nya
   */
  @UseGuards(AuthSupervisorGuard)
  @Get('create-group')
  @Render('forums/create-group.ejs')
  createForums(@Session() session: Record<string, any>) {
    const svss = session?.supervisor as SupervisorSessionDTO;

    // panggil dari DB karena butuh id dari si supervisor
    // const supervisor = await this.supervisorDbService.findByUsernameEmail(
    //   svss.username,
    //   svss.email,
    // );

    console.info('data supervosir session di create : ', svss);

    return {
      supervisor: {
        supervisorId: svss.id || null,
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
      console.info('forums :data ->', forum);

      return res.status(HttpStatus.OK).send({
        message: 'Forum created successfully',
        forum,
      });
    } catch (error: any) {
      console.error('error : ', error.message);
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed create forum',
      });
    }
  }

  /**
   * Forums home page.
   */
  @Get('search-group')
  @Render('forums/search-group.ejs')
  async searchGrubView() {
    // nantik mungkin jika project nya sangat besar , maka metode mengambil semua data harus di ubah
    const forums = await this.forumsDbService.findAllForums();
    const totalForums = await this.forumsDbService.countForums();

    return {
      title: 'Home Forums',
      forums: forums ?? [],
      totalForums,
    };
  }

  /**
   * Debounced Search
   * ini untuk REST api data forums spesifik yang akan di cari
   */
  @Post('search-group')
  async searchGrub(@Res() res: FastifyReply, @Query('search') search?: string) {
    /*
     | Search forums berdasarkan nama member ( supervisor akan punya tag khusu nantik )
     */
    console.info('search key : ', search);
    const user = (request as any).session?.user as UserSessionDTO;
    const totalForums = await this.forumsDbService.countForums();

    if (!search || search?.trim() === '') {
      return {
        forums: this.forumsDbService.findAllForums(),
        totalForums: totalForums || 0,
      };
    } else {
      const userId = new Types.ObjectId(user.id);
      const forums = await this.forumsDbService.searchforums(search, userId);

      console.info('frums data : ', forums);

      return {
        forums: forums ?? [],
      };
    }
  }

  /**
   * Mengambil halaman pencarian chat personal pertama kali
   * FronEnd akan mengambil data secara terus menerus selam 1 detik ke enpoin ini
   */
  @Get('search-chat')
  @Render('forums/search-chat.ejs') // Render dipindah ke GET agar halaman mau terbuka saat diakses url-nya
  async searchChatView(
    @Session() session: Record<string, any>,
    @Query('search') search?: string,
  ) {
    const currentUser = session?.user;
    //
    // if (!currentUser) {
    //   console.info('User belum login, redirect ke sign-in');
    //   return res.redirect('/user/signIn');
    // }

    let users: UserDTO[] = [];

    // Jika supervisor/user mengetik sesuatu di kotak pencarian
    if (search && search.trim() !== '') {
      console.info('Mencari user dengan kata kunci:', search);

      // Ambil daftar user berdasarkan nama/username, kecualikan diri sendiri (currentUser.id)

      users = await this.userDbService.searchUsersExceptMe(
        search,
        currentUser.id,
      );
    } else {
      //  Tampilkan beberapa user rekomendasi/terbaru jika kolom search masih kosong
      users = await this.userDbService.getRecentActiveUsers(currentUser.id);
    }

    return {
      title: 'Cari Kontak Chat',
      users, // Sekarang yang dikirim adalah daftar USER, bukan forums!
      search: search || '',
      // stats: {
      //   totalChats: , // comming soon
      // },
      currentUser,
    };
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
      const user = session.user as UserSessionDTO;
      console.info('id yang join : ', user.username);

      const forum = await this.forumsDbService.addMember(
        forumId,
        user.id,
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
