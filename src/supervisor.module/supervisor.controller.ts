import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Render,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import argon from 'argon2';
import { SupervisorDbService } from './supervisor.db.service';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserDTO, UpdateUserDTO } from 'src/dto/user.dto';

@Controller('supervisor')
export class SupervisorController {
  constructor(private readonly supervisorDbService: SupervisorDbService) {}

  /**
   * supervisor dashboard.
   */
  @Get('/')
  @Render('supervisor/home.ejs')
  dashboard(@Session() session: Record<string, any>) {
    // const totalUsers =
    //   await this.supervisorDbService.countAll();

    // const totalActiveUsers =
    //   await this.supervisorDbService.countActiveUsers();

    return {
      title: 'supervisor Dashboard',

      user: session.user || 'none',

      // stats: {
      //   totalUsers,
      //   totalActiveUsers,
      // },
    };
  }

  /**
   * Render all users.
   */
  @Get('/users')
  @Render('supervisor/users/home.ejs')
  async usersView() {
    const users = await this.supervisorDbService.findAll();

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
      const user = await this.supervisorDbService.findById(id);

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
    @Req() req: FastifyRequest,
  ) {
    try {
      const hashPassword = await argon.hash(data.password);

      const supervisor = await this.supervisorDbService.create({
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

      const user = await this.supervisorDbService.update(id, data);

      return res.status(HttpStatus.OK).send({
        message: 'User updated successfully',

        user,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed update user',
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
      await this.supervisorDbService.delete(id);

      return res.status(HttpStatus.OK).send({
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed delete user',
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
      const user = await this.supervisorDbService.toggleActive(id);

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
      const user = await this.supervisorDbService.updateRole(id, role);

      return res.status(HttpStatus.OK).send({
        message: 'Role updated successfully',

        user,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Failed update role',
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
      const users = await this.supervisorDbService.search(username);

      // kirim dalam bentuk Ajax
      return res.status(HttpStatus.OK).send({
        message: 'Search result',
        users,
      });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: error.message || 'Search failed',
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
