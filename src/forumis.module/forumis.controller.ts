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
  CreateForumisDTO,
  ForumisDTO,
  ForumisMemberRole,
  ForumisVisibility,
  UpdateForumisDTO,
} from 'src/dto/forumis.dto';
import { ForumisRepository } from '@/repository/forumis.repository';

import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthUserGuard } from 'src/guards/auth.user';
import { request } from 'http';
import { UserDTO, UserSessionDTO } from 'src/dto/user.dto';
import { Types } from 'mongoose';
import { AuthSupervisorGuard } from 'src/guards/auth.supervisor';
import { SupervisorSessionDTO } from 'src/dto/supervisor.dto';
import { SupervisorRepository } from '@/repository/supervisor.repository';
import { UserRepository } from '@/repository/user.repository';
import { GroupMessageForumisRepository } from '@/repository/group.message.forumis.repository';
import { ChatMessageForumisRepository } from '@/repository/chat.message.forumis.repository';

@UseGuards(AuthUserGuard)
@Controller('forums')
export class ForumsController {
  constructor(
    private readonly forumisRepo: ForumisRepository,
    private readonly supervisorRepo: SupervisorRepository,
    private readonly userRepo: UserRepository,
    private readonly chatRepo: ChatMessageForumisRepository,
    private readonly groupRepo: GroupMessageForumisRepository,
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
    const userRecent = await this.chatRepo.getRecentChats(user.id);


    // --- kondisi 1 jika session supervisor aktif ---
    if (svss) {
      const svid = new Types.ObjectId(svss.id);
      const userId = new Types.ObjectId(user.id);

      // Ambil forum milik Supervisor (berdasarkan ID Supervisor)
      const rawForumsSupervisor =
        await this.forumisRepo.findAllSupervisorForumis(svid);
      const forumsSupervisor = rawForumsSupervisor.map((forum) => {
        const obj = forum.toObject ? forum.toObject() : forum;
        obj.id = obj._id.toString(); // Penting untuk :key Alpine.js
        return obj;
      });

      // Ambil forum milik User Biasa (berdasarkan ID User biasa)
      const rawForumsUser = await this.forumisRepo.findAllUserForumis(userId);
      const forumsUser = rawForumsUser.map((forum) => {
        const obj = forum.toObject ? forum.toObject() : forum;
        obj.id = obj._id.toString();
        return obj;
      });


      return res.view('forumis/home.ejs', {
        title: 'Supervisor Forums',
        username: svss.username,
        status: 'supervisor', // Tab default yang aktif
        isSupervisor: true,
        forumsSupervisor: forumsSupervisor ?? [],
        forumsUser: forumsUser ?? [],
        userRecent: userRecent ?? [],
      });
    }

    // --- kondisi 2 jika hanya user biasa ---
    const userId = new Types.ObjectId(user.id);
    const rawForumsUser = await this.forumisRepo.findAllUserForumis(userId);
    const forumsUser = rawForumsUser.map((forum) => {
      const obj = forum.toObject ? forum.toObject() : forum;
      obj.id = obj._id.toString();
      return obj;
    });

    console.info(`[User Mode] Mengirim ${forumsUser.length} forum User.`);

    return res.view('forumis/home.ejs', {
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
  @Render('forumis/create-group.ejs')
  createForums(@Session() session: Record<string, any>) {
    const svss = session?.supervisor as SupervisorSessionDTO;

    // panggil dari DB karena butuh id dari si supervisor
    // const supervisor = await this.supervisorRepo.findByUsernameEmail(
    //   svss.username,
    //   svss.email,
    // );

    console.info('data supervosir session di create : ', svss);

    return {
      supervisor: {
        supervisorId: svss.id || null,
        role: svss?.role,
      },
      forumsVisibility: Object.values(ForumisVisibility), // kirim semua unuk di pilih retunt array
      title: 'Create Forum',
    };
  }

  /**
   * Create new forum.
   */
  @Post('create-forum')
  async createForumPost(
    @Body() data: CreateForumisDTO,

    @Session() session: Record<string, any>,

    @Res() res: FastifyReply,
  ) {
    try {

      console.info("data : ",data)


      const forum = await this.forumisRepo.createForumis(data);

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
  @Render('forumis/search-group.ejs')
  async searchGrubView() {
    // nantik mungkin jika project nya sangat besar , maka metode mengambil semua data harus di ubah
    const forums = await this.forumisRepo.findAllForumis();
    const totalForums = await this.forumisRepo.countForums();

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
    const user = (request as any).session?.user as UserSessionDTO;
    const totalForums = await this.forumisRepo.countForums();

    if (!search || search?.trim() === '') {
      return {
        forums: this.forumisRepo.findAllForumis(),
        totalForums: totalForums || 0,
      };
    } else {
      const userId = new Types.ObjectId(user.id);
      const forums = await this.forumisRepo.searchforumis(search, userId);

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
  @Render('forumis/search-chat.ejs') // Render dipindah ke GET agar halaman mau terbuka saat diakses url-nya
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

      users = await this.userRepo.searchUsersExceptMe(search, currentUser.id);
    } else {
      //  Tampilkan beberapa user rekomendasi/terbaru jika kolom search masih kosong
      users = await this.userRepo.getRecentActiveUsers(currentUser.id);
    }

    return {
      title: 'Cari Kontak Chat',
      users, // di yang dikirim adalah daftar USER, utuk p2p
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
      const supervisor = session.supervisor as SupervisorSessionDTO;
      console.info('id yang join : ', user.username);

      const forum = await this.forumisRepo.addMember(
        forumId,
        user.id,
        ForumisMemberRole.MEMBER,
      );

      // update supervisor agar menerima id users untuk di simpan
      // - seharusnya gak akan di tambah user yang pembuat groub atau user pertama , karena ini aktif wakttu join
      await this.supervisorRepo.addNewUser(supervisor.id, user.id);

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
      const forum = await this.forumisRepo.removeMember(
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

    @Body() data: UpdateForumisDTO,

    @Res() res: FastifyReply,
  ) {
    try {
      const forum = await this.forumisRepo.updateForumis(id, data);

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
      await this.forumisRepo.deleteForumis(id);

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
