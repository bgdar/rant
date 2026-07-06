import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Redirect,
  Render,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import argon from 'argon2';
import { SupervisorDbService } from './supervisor.db.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDTO, UpdateUserDTO, UserSessionDTO } from 'src/dto/user.dto';
import { AuthSupervisorGuard } from 'src/guards/auth.supervisor';
import {
  SupervisorDTO,
  SupervisorPermission,
  UpdateToSupervisor,
} from 'src/dto/supervisor.dto';
import { AuthUserGuard } from 'src/guards/auth.user';

@Controller('supervisor')
@UseGuards(AuthUserGuard, AuthSupervisorGuard)
export class SupervisorController {
  constructor(private readonly supervisorModel: SupervisorDbService) {}

  /**
   * supervisor dashboard.
   */
  @Get()
  @Render('supervisor/home.ejs')
  dashboard(@Req() req: FastifyRequest) {
    // const totalUsers =
    //   await this.supervisorModel.countAll();

    // const totalActiveUsers =
    //   await this.supervisorModel.countActiveUsers();
    const sessionSupervisor = (req as any).session?.supervisor as SupervisorDTO;

    return {
      title: 'supervisor Dashboard',

      supervisor: {
        username: sessionSupervisor.username,
        email: sessionSupervisor.email,
        address: sessionSupervisor.address,
      },

      // stats: {
      //   totalUsers,
      //   totalActiveUsers,
      // },
    };
  }

  /**
   * SignIN page supervisor
   */
  @Get('update-user')
  @Render('supervisor/update-user.ejs')
  updateUserView(@Req() req: FastifyRequest) {
    const sessionUser = (req as any).session?.user as UserSessionDTO;

    console.info('akses supervisor update');
    return {
      title: 'update user',
      permissions: JSON.stringify(SupervisorPermission),
      username: sessionUser.username,
      email: sessionUser.email,
    };
  }

  @Post('update-user')
  async handleUpdateUser(
    @Body() updateSupervisor: UpdateToSupervisor,
    @Res() res: FastifyReply,
    @Req() req: FastifyRequest,
    @Session() session: Record<string, any>,
  ) {
    try {
      const sessionUser = (req as any).session?.user as UserSessionDTO;

      // Ambil ID supervisor, misal dari session atau dari objek DTO/hidden input form
      // Contoh: const supervisorId = req.session.user.id;
      // const supervisorId = sessionUser.i;

      // Validasi & Proteksi Password seperti alur sebelumnya
      // if (
      //   !updateSupervisor.password ||
      //   updateSupervisor.password.trim() === ''
      // ) {
      //   return res.status(HttpStatus.BAD_GATEWAY).send({
      //     message: 'Isi dulu aswword nya',
      //     status: 'warning',
      //   });
      // } else {
      //   // Jika ada password baru, lakukan hashing
      //   updateSupervisor.password = await argon.hash(updateSupervisor.password);
      // }

      // Konversi data string dari form HTML menjadi Boolean untuk tipe data target
      updateSupervisor.isActive = String(updateSupervisor.isActive) === 'true';
      updateSupervisor.isVerified =
        String(updateSupervisor.isVerified) === 'true';
      updateSupervisor.isBanned = String(updateSupervisor.isBanned) === 'true';

      const result = await this.supervisorModel.create({
        fullName: updateSupervisor.fullname || '',
        username: sessionUser.username,
        email: sessionUser.email,
        // supervisorId :
        // password: updateSupervisor.password, //  gak ada pakai password
        phone: updateSupervisor.phone,
        address: updateSupervisor.address,
        avatar: updateSupervisor.avatar,
        permissions: Object.values(updateSupervisor.permissions) || [],

        isActive: updateSupervisor.isActive,
        isVerified: updateSupervisor.isVerified,
      });

      if (!result) {
        // Jika gagal, render balik ke halaman form dengan pesan error
        return res.status(HttpStatus.EXPECTATION_FAILED).send({
          status: 'error',
          message: 'Gagal memperbarui data supervisor',
        });
      }

      // session untuk supervisor
      session.supervisor = {
        id: result.id,
        username: result.username,
        email: result.email,
      };
      return res.redirect('/supervisor/profile?status=updated_success');
    } catch (error) {
      console.error('Error saat submit update user:', error);

      // Jika internal error, tampilkan kembali halaman dengan log error
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        title: 'Update User',
        error: 'Terjadi kesalahan sistem saat menyimpan data.',
        user: updateSupervisor,
      });
    }
  }

  /**
   * Endpoint untuk memperbarui profil data Supervisor
   */
  @Put('update/:id')
  async updateSupervisor(
    @Param('id') id: string,
    @Body() updateData: SupervisorDTO,
    @Res() res: FastifyReply,
  ) {
    try {
      // 1. Validasi minimal: Pastikan ID supervisor dikirimkan
      if (!id) {
        throw new BadRequestException(
          'ID Supervisor tidak valid atau tidak ditemukan.',
        );
      }

      // Jika password diisi, lakukan proses hashing di tingkat Service sebelum disimpan.
      if (updateData.password && updateData.password.trim() !== '') {
        // Logika hashing (misal bcrypt) diserahkan ke internal service
        // updateData.password = await this.supervisorService.hashPassword(updateData.password);
      } else {
        // Jika password dikirim kosong/tidak diubah, hapus dari objek agar tidak menimpa password lama
        // delete updateData.password;
      }

      //Panggil service untuk mengeksekusi perubahan ke database
      const updatedSupervisor = await this.supervisorModel.update(
        id,
        updateData,
      );

      if (!updatedSupervisor) {
        return res.status(HttpStatus.NOT_FOUND).send({
          status: 'success',
          message: `Gagal memperbarui. Supervisor dengan ID ${id} tidak ditemukan.`,
        });
      }

      return res.status(HttpStatus.OK).send({
        success: true,
        message: 'Data profil supervisor berhasil diperbarui.',
        data: {
          username: updatedSupervisor.username,
          email: updatedSupervisor.email,
          fullName: updatedSupervisor.fullName,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // Penanganan jika terjadi kendala server atau database crash
      console.error('Error saat update supervisor:', error);
      throw new InternalServerErrorException(
        'Terjadi kesalahan internal server saat memperbarui data.',
      );
    }
  }

  @Get('profile')
  profile() {
    // pundah ke profile user ja
    return Redirect('/user/profile', 200);
  }

  /**
   * Render all users.
   */
  @Get('/users')
  @Render('supervisor/users/home.ejs')
  async usersView() {
    const users = await this.supervisorModel.findAll();

    return {
      title: 'Manage Users',
      users,
    };
  }

  /**
   * Get single user detail.
   */
  @Get('/users/:id')
  async userDetail(
    @Param('id') id: string,

    @Res() res: FastifyReply,
  ) {
    try {
      const user = await this.supervisorModel.findById(id);

      return res.status(HttpStatus.OK).send({
        message: 'User found',
        user,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: 'User not found',
      });
    }
  }

  /**
   * Render create user page.
   */
  @Get('/users/create')
  @Render('supervisor/users/create.ejs')
  createUserView() {
    return {
      title: 'Create User',
    };
  }

  /**
   * Create user by supervisor.
   * Gunakan create dari user sebelumnya
   */
  @Post('/users/create')
  async createUser(
    @Body() data: CreateUserDTO,
    @Session() session: Record<string, any>,
    @Res() res: FastifyReply,
  ) {
    try {
      const hashPassword = await argon.hash(data.password);

      const supervisor = await this.supervisorModel.create({
        ...data,
        password: hashPassword,
      });
      session.supervisor = {
        id: supervisor._id.toString(),
        username: supervisor.username,
        email: supervisor.email,
        role: supervisor.role,
      };

      // req.session.set('supervisor', {
      //   id: supervisor._id.toString(),
      //   username: supervisor.username,
      //   email: supervisor.email,
      //   role: supervisor.role,
      // });
      // sudah di atur di session
      // res.setCookie('isSupervisorLogin', supervisor.username, {
      //   httpOnly: true,
      //   maxAge: 1000 * 60 * 60 * 24,
      //   secure: false,
      // });

      return res.status(HttpStatus.CREATED).send({
        message: 'User created successfully',

        supervisor,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed create user',
        status: 'error',
      });
    }
  }

  /**
   * Update user data.
   */
  @Post('/users/update/:id')
  async updateUser(
    @Param('id') id: string,

    @Body() data: UpdateUserDTO,

    @Res() res: FastifyReply,
  ) {
    try {
      if (data.password) {
        data.password = await argon.hash(data.password);
      }

      const user = await this.supervisorModel.update(id, data);

      return res.status(HttpStatus.OK).send({
        message: 'User updated successfully',

        user,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed update user',
        status: 'error',
      });
    }
  }

  /**
   * Delete user.
   */
  @Post('/users/delete/:id')
  async deleteUser(
    @Param('id') id: string,

    @Res() res: FastifyReply,
  ) {
    try {
      await this.supervisorModel.delete(id);

      return res.status(HttpStatus.OK).send({
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed delete user',
        status: 'error',
      });
    }
  }

  /**
   * Toggle active status user.
   */
  @Post('/users/toggle/:id')
  async toggleUser(
    @Param('id') id: string,

    @Res() res: FastifyReply,
  ) {
    try {
      const user = await this.supervisorModel.toggleActive(id);

      return res.status(HttpStatus.OK).send({
        message: 'User status updated',

        user,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed toggle user',
      });
    }
  }

  /**
   * Change role user.
   */
  @Post('/users/role/:id')
  async updateRole(
    @Param('id') id: string,

    @Body('role') role: string,

    @Res() res: FastifyReply,
  ) {
    try {
      const user = await this.supervisorModel.updateRole(id, role);

      return res.status(HttpStatus.OK).send({
        message: 'Role updated successfully',

        user,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed update role',
        status: 'error',
      });
    }
  }

  /**
   * Search username.
   */
  @Post('/users/search')
  async searchUser(
    @Body('username')
    username: string,

    @Res() res: FastifyReply,
  ) {
    try {
      // cari berdasarkan username aja
      const users = await this.supervisorModel.search(username);

      // kirim dalam bentuk Ajax
      return res.status(HttpStatus.OK).send({
        message: 'Search result',
        users,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Search failed',
        status: 'error',
      });
    }
  }

  /**
   * Logout supervisor.
   */
  @Get('/logout')
  logout(
    // @Session() session: Record<string, any>,
    @Req() req: FastifyRequest,

    @Res() res: FastifyReply,
  ) {
    req.session.destroy(() => {
      // res.clearCookie('token');

      res.redirect('/user/signIn');
    });
  }
}
