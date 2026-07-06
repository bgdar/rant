import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateChatDTO, UpdateChatDTO } from 'src/dto/forum.dto';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { ForumsDbService } from './forums.db.service';
import { Model } from 'mongoose';

@Injectable()
export class ChatDbServiceService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<ChatDocument>,
  ) {}

  /**
   * Send message/chat.
   */
  async createChat(data: CreateChatDTO, forumsModel: ForumsDbService) {
    /*
     | Check forum
     */

    const forum = await forumsModel.findForumById(data.forumId);

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
   * Count chats.
   */
  async countChats() {
    return this.chatModel.countDocuments();
  }
}
