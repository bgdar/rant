// src/services/supervisor-db.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { Supervisor, SupervisorDocument } from 'src/schemas/supervisor.schema';

/**
 *
 * Service untuk:
 * - CRUD supervisor
 * - Authentication helper
 * - Permission management
 * - Account management
 * - Statistics
 * - User Management
 */
@Injectable()
export class SupervisorDbService {
  constructor(
    @InjectModel(Supervisor.name)
    private readonly supervisorModel: Model<SupervisorDocument>,
  ) {}

  /**
   *   * Info :
   * jangan gunakan type tapi langsung kembalikna aja document ynag di dapat sekarang ,
   * Membuat supervisor baru.
   */
  async create(data: Partial<Supervisor>) {
    const existEmail = await this.supervisorModel.findOne({
      email: data.email,
    });

    if (existEmail) {
      throw new BadRequestException('Email already exists');
    }

    const existUsername = await this.supervisorModel.findOne({
      username: data.username,
    });

    if (existUsername) {
      throw new BadRequestException('Username already exists');
    }

    const supervisor = await this.supervisorModel.create(data);

    return supervisor;
  }

  /**
   * Get all supervisors.
   */
  async findAll() {
    return this.supervisorModel.find().select('-password');
  }

  /**
   * Get supervisor by ID.
   *   * Info :
   * jangan gunakan type tapi langsung kembalikna aja document ynag di dapat sekarang ,
   */
  async findById(id: string) {
    const supervisor = await this.supervisorModel
      .findById(id)
      .select('-password');

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return supervisor;
  }

  /**
   * find by username adn password
   * Info :
   * jangan gunakan type tapi langsung kembalikna aja document ynag di dapat sekarang ,
   */
  async findByUsernameEmail(email: string, username: string) {
    return this.supervisorModel.findOne({
      email,
      username,
    });
  }

  /**
   * Find by email.
   */
  async findByEmail(email: string) {
    return this.supervisorModel.findOne({
      email,
    });
  }

  /**
   * Find by username.
   */
  async findByUsername(username: string) {
    return this.supervisorModel.findOne({
      username,
    });
  }

  /**
   * Find active supervisors.
   */
  async findActive() {
    return this.supervisorModel.find({
      isActive: true,
    });
  }

  /**
   * Search supervisor.
   */
  async search(keyword: string) {
    return this.supervisorModel.find({
      $or: [
        {
          fullName: {
            $regex: keyword,
            $options: 'i',
          },
        },

        {
          username: {
            $regex: keyword,
            $options: 'i',
          },
        },

        {
          email: {
            $regex: keyword,
            $options: 'i',
          },
        },
      ],
    });
  }

  /**
   * Update supervisor.
   */
  async update(
    id: string,

    data: Partial<Supervisor>,
  ) {
    const supervisor = await this.supervisorModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return supervisor;
  }

  /**
   * Update role.
   */
  async updateRole(
    id: string,

    role: string,
  ) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        role,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Toggle active status.
   */
  async toggleActive(id: string) {
    const supervisor = await this.supervisorModel.findById(id);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    supervisor.isActive = !supervisor.isActive;

    await supervisor.save();

    return supervisor;
  }

  /**
   * Ban supervisor.
   */
  async ban(id: string) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        isBanned: true,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Unban supervisor.
   */
  async unban(id: string) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        isBanned: false,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Verify account.
   */
  async verify(id: string) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        isVerified: true,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Add permission.
   */
  async addPermission(
    id: string,

    permission: string,
  ) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          permissions: permission,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   * Remove permission.
   */
  async removePermission(
    id: string,

    permission: string,
  ) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          permissions: permission,
        },
      },
      {
        new: true,
      },
    );
  }

  /*
   | TAGS
   */

  /**
   * Add tag.
   */
  async addTag(
    id: string,

    tag: string,
  ) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          tags: tag,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   * Remove tag.
   */
  async removeTag(
    id: string,

    tag: string,
  ) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          tags: tag,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   * Update login supervisor
   * @param id
   * @param token
   * @returns
   */
  async updateLogin(
    id: string,

    token: string,
  ) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        token,

        lastLogin: new Date(),

        $inc: {
          loginCount: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   * Clear login token.
   */
  async clearToken(id: string) {
    return this.supervisorModel.findByIdAndUpdate(
      id,
      {
        token: null,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Delete supervisor.
   */
  async delete(id: string) {
    const supervisor = await this.supervisorModel.findByIdAndDelete(id);

    if (!supervisor) {
      throw new NotFoundException('Supervisor not found');
    }

    return {
      message: 'Supervisor deleted successfully',
    };
  }

  /**
   * Delete inactive supervisors.
   */
  // async deleteInactive() {
  //   return this.supervisorModel.deleteMany({
  //     isActive: false,
  //   });
  // }

  /*
   | STATS
   */

  /**
   * Count all supervisors.
   */
  async countAll() {
    return this.supervisorModel.countDocuments();
  }

  /**
   * Count active supervisors.
   */
  async countActive() {
    return this.supervisorModel.countDocuments({
      isActive: true,
    });
  }

  /**
   * Count banned supervisors.
   */
  async countBanned() {
    return this.supervisorModel.countDocuments({
      isBanned: true,
    });
  }

  /**
   * Count verified supervisors.
   */
  async countVerified() {
    return this.supervisorModel.countDocuments({
      isVerified: true,
    });
  }

  /*
   | USER SETION
   */

  countActiveUser() {}
}
