// src/services/forums-db.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import {
  CreateChatDTO,
  CreateForumDTO,
  ForumMemberRole,
  UpdateChatDTO,
  UpdateForumDTO,
} from 'src/dto/forumDTO';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { Forum, ForumDocument } from 'src/schemas/forum.schema';

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
    @InjectModel(Forum.name)
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
     |--------------------------------------------------------------------------
     | Create forum
     |--------------------------------------------------------------------------
     */

    const forum = await this.forumModel.create({
      ...data,

      totalMembers: data.members?.length || 0,

      totalMessages: 0,

      isLocked: false,

      lastMessageAt: null,
    });

    return forum;
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
      visibility: 'public',
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
   */
  async searchForums(keyword: string) {
    return this.forumModel.find({
      $or: [
        {
          name: {
            $regex: keyword,
            $options: 'i',
          },
        },

        {
          description: {
            $regex: keyword,
            $options: 'i',
          },
        },

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
   * Send message/chat.
   */
  async createChat(data: CreateChatDTO) {
    /*
     | Check forum
     */

    const forum = await this.findForumById(data.forumId);

    if (forum.isLocked) {
      throw new BadRequestException('Forum locked');
    }

    /*
     | Create message
     */

    const chat = await this.chatModel.create({
      ...data,

      type: data.type || 'text',

      isEdited: false,

      isDeleted: false,

      readBy: [],
    });

    /*
     | Update forum stats
     */

    forum.totalMessages += 1;

    forum.lastMessageAt = new Date();

    await forum.save();

    return chat;
  }

  /**
   * Get forum chats.
   */
  async getForumChats(forumId: string) {
    return this.chatModel
      .find({
        forumId,

        isDeleted: false,
      })
      .sort({
        createdAt: 1,
      });
  }

  /**
   * Get latest chats.
   */
  async getLatestChats(
    forumId: string,

    limit = 30,
  ) {
    return this.chatModel
      .find({
        forumId,
      })
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  }

  /**
   * Find chat by ID.
   */
  async findChatById(id: string) {
    const chat = await this.chatModel.findById(id);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  /**
   * Update/edit chat.
   */
  async updateChat(
    id: string,

    data: UpdateChatDTO,
  ) {
    const chat = await this.chatModel.findByIdAndUpdate(
      id,
      {
        ...data,

        isEdited: true,
      },
      {
        new: true,
      },
    );

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  /**
   * Soft delete chat.
   */
  async deleteChat(id: string) {
    const chat = await this.chatModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      {
        new: true,
      },
    );

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return {
      message: 'Chat deleted successfully',
    };
  }

  /**
   * Mark chat as read.
   */
  async markAsRead(
    chatId: string,

    userId: string,
  ) {
    return this.chatModel.findByIdAndUpdate(
      chatId,
      {
        $addToSet: {
          readBy: userId,
        },
      },
      {
        new: true,
      },
    );
  }

  /**
   * Count forums.
   */
  async countForums() {
    return this.forumModel.countDocuments();
  }

  /**
   * Count chats.
   */
  async countChats() {
    return this.chatModel.countDocuments();
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
