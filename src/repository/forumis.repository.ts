// src/services/forums-db.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import {
  CreateForumisDTO,
  ForumisMemberRole,
  ForumisVisibility,
  UpdateForumisDTO,
} from 'src/dto/forumis.dto';
import {
  ChatMessageForumis,
  ChatMessageForumisDocument,
} from '@/schemas/chat.message.forumis.schema';
import { Forumis, ForumDocument } from 'src/schemas/forumis.schema';
import { UserRole } from '@/dto/user.dto';

/**
 * Forums Database Service
 *
 * Beda dengan Group , ini adalah database untuk forums utama nya
 * group.repository dan chat.repository adalah database yang menyimpan chatting message
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
export class ForumisRepository {
  constructor(
    @InjectModel(Forumis.name)
    private readonly forumModel: Model<ForumDocument>,

    @InjectModel(ChatMessageForumis.name)
    private readonly chatModel: Model<ChatMessageForumisDocument>,
  ) {}

  /**
   * Create new forum.
   */
  async createForumis(data: CreateForumisDTO) {
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

      // Paksa supervisorId menjadi Mongoose ObjectId yang asli
      supervisorId: new Types.ObjectId(data.supervisorId),

      // id : data.
      // members : data.members?.map(member => {
      //   ...member,

      // })

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
  async findAllUserForumis(userId: Types.ObjectId) {
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
  async findAllSupervisorForumis(supervisorId: Types.ObjectId) {
    return this.forumModel.find({
      supervisorId: supervisorId,
    });
  }

  /**
   * Get all forums.
   */
  async findAllForumis() {
    return this.forumModel.find().sort({
      updatedAt: -1,
    });
  }

  /**
   * Get public forums.
   */
  async findPublicForumis() {
    return this.forumModel.find({
      visibility: ForumisVisibility.PUBLIC,
    });
  }

  /**
   * Find forum by ID.
   */
  async findForumisById(id: string) {
    const forum = await this.forumModel.findById(id);

    if (!forum) {
      throw new NotFoundException('Forum not found');
    }

    return forum;
  }

  /**
   * Find forum by slug.
   */
  async findForumisBySlug(slug: string) {
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
  async searchforumis(keyword: string, userId: Types.ObjectId) {
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
  async updateForumis(
    id: string,

    data: UpdateForumisDTO,
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
  async archiveForumis(id: string) {
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
  async deleteForumis(id: string) {
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

    role: ForumisMemberRole = ForumisMemberRole.MEMBER,
  ) {
    const forum = await this.findForumisById(forumId);

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
    const forum = await this.findForumisById(forumId);

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

    role: ForumisMemberRole,
  ) {
    const forum = await this.findForumisById(forumId);

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

  /*
   * hitung totola forum yang sudah di buat oleh supervisor berdasarkan id supervisor
   */
  async countTotalSupervisorForum(supervisorId: string) {
    return await this.forumModel.countDocuments({ supervisorId });
  }

  /*
   * dapatkan total user di forums tertentu
   */
  // async countUserGroub(forum_name : string){
  //   const forum = this.findForumisById()
  //
  //   return this.forumModel.countDocuments({
  //
  //   })

  // }

  /**
   * Count active forums.
   */
  async countActiveForums() {
    return this.forumModel.countDocuments({
      isArchived: false,
    });
  }
}
