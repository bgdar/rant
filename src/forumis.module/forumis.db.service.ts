// src/services/forums-db.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import {
  CreateForumDTO,
  ForumMemberRole,
  ForumVisibility,
  UpdateForumDTO,
} from 'src/dto/forumis.dto';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { Forumis, ForumDocument } from 'src/schemas/forumis.schema';

/**
 * Forums Database Service
 *
 * Features:
 * - CRUD forum
 * - Member management
 * - Chat system
 * - Read/unread system
 * - Forum moderation
 * - Forum statistics
 */
@Injectable()
export class ForumsDbService {
  constructor(
    @InjectModel(Forumis.name)
    private readonly forumModel: Model<ForumDocument>,

    @InjectModel(Chat.name)
    private readonly chatModel: Model<ChatDocument>,
  ) {}

  /**
   * Create new forum.
   */
  async createForum(data: CreateForumDTO) {
    /*
     | Check slug
     */

    const exist = await this.forumModel.findOne({
      slug: data.slug,
    });

    if (exist) {
      throw new BadRequestException('Forum slug already exists');
    }

    /*
     | Create forum
     */

    const forum = await this.forumModel.create({
      ...data,

      // 1. Paksa supervisorId menjadi Mongoose ObjectId yang asli
      supervisorId: new Types.ObjectId(data.supervisorId),

      // 2. Jika ada members yang diinput saat create, paksa userId-nya menjadi ObjectId juga
      members:
        data.members?.map((member) => ({
          ...member,
          userId: new Types.ObjectId(member.userId),
        })) || [],

      // id : data.
      // members : data.members?.map(member => {
      //   ...member,

      // })

      totalMembers: data.members?.length || 0,

      totalMessages: 0,

      isLocked: false,

      lastMessageAt: null,
    });

    return forum;
  }

  /**
   * Dapatkan seamuForum yang user n
   * - pakek di home
   **/
  async findAllUserForums(userId: Types.ObjectId) {
    const targetId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    // return this.forumModel.find({
    //   'members.userId': userId,
    // });
    return this.forumModel.find({
      members: {
        $elemMatch: {
          userId: targetId,
        },
      },
    });
  }

  /**
   * Dapatkan seamuForum yang supervisor buat
   * - pakek di home
   **/
  async findAllSupervisorForums(supervisorId: Types.ObjectId) {
    return this.forumModel.find({
      supervisorId: supervisorId,
    });
  }

  /**
   * Get all forums.
   */
  async findAllForums() {
    return this.forumModel.find().sort({
      updatedAt: -1,
    });
  }

  /**
   * Get public forums.
   */
  async findPublicForums() {
    return this.forumModel.find({
      visibility: ForumVisibility.PUBLIC,
    });
  }

  /**
   * Find forum by ID.
   */
  async findForumById(id: string) {
    const forum = await this.forumModel.findById(id);

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  /**
   * Find forum by slug.
   */
  async findForumBySlug(slug: string) {
    const forum = await this.forumModel.findOne({
      slug,
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  /**
   * Search forums.
   * userId : untuk forums yang ada usernta di sini
   */
  async searchforums(keyword: string, userId: Types.ObjectId) {
    return this.forumModel.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: 'i',
          },
        },
        // cari berdasarkan id members
        { 'members.userId': userId },

        {
          description: {
            $regex: keyword,
            $options: 'i',
          },
        },

        // sesuakan member
        {
          tags: {
            $in: [keyword],
          },
        },
      ],
    });
  }

  /*
   | UPDATE FORUM
   */

  /**
   * Update forum.
   */
  async updateForum(
    id: string,

    data: UpdateForumDTO,
  ) {
    const forum = await this.forumModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  /**
   * Lock forum.
   */
  async lockForum(id: string) {
    return this.forumModel.findByIdAndUpdate(
      id,
      {
        isLocked: true,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Unlock forum.
   */
  async unlockForum(id: string) {
    return this.forumModel.findByIdAndUpdate(
      id,
      {
        isLocked: false,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Archive forum.
   */
  async archiveForum(id: string) {
    return this.forumModel.findByIdAndUpdate(
      id,
      {
        isArchived: true,
      },
      {
        new: true,
      },
    );
  }

  /**
   * Delete forum.
   */
  async deleteForum(id: string) {
    const forum = await this.forumModel.findByIdAndDelete(id);

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    /*
     | Delete chats
     */

    await this.chatModel.deleteMany({
      forumId: id,
    });

    return {
      message: 'Forum deleted successfully',
    };
  }

  /**
   * Add member to forum.
   */
  async addMember(
    forumId: string,

    userId: string,

    role: ForumMemberRole = ForumMemberRole.MEMBER,
  ) {
    const forum = await this.findForumById(forumId);

    /*
     | Check duplicate
     */

    const exist = forum.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (exist) {
      throw new BadRequestException('User already joined');
    }

    /*
     | Push member
     */

    forum.members.push({
      // convert ke type ObjectID
      userId: new Types.ObjectId(userId),
      role,
      joinedAt: new Date(),
    });

    forum.totalMembers = forum.members.length;

    await forum.save();

    return forum;
  }

  /**
   * Remove member.
   */
  async removeMember(
    forumId: string,

    userId: string,
  ) {
    const forum = await this.findForumById(forumId);

    forum.members = forum.members.filter(
      (member) => member.userId.toString() !== userId,
    );

    forum.totalMembers = forum.members.length;

    await forum.save();

    return forum;
  }

  /**
   * Cek jika member ada , guankan saat forums di tampilkan
   **/
  // async cekMemberInForums(name : string ) :  boolean {
  // }

  /**
   * Update member role.
   */
  async updateMemberRole(
    forumId: string,

    userId: string,

    role: ForumMemberRole,
  ) {
    const forum = await this.findForumById(forumId);

    const member = forum.members.find((m) => m.userId.toString() === userId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.role = role;

    await forum.save();

    return forum;
  }

  /**
   * Count forums.
   */
  async countForums() {
    return this.forumModel.countDocuments();
  }
  /**
   * Count active forums.
   */
  async countActiveForums() {
    return this.forumModel.countDocuments({
      isArchived: false,
    });
  }
}
