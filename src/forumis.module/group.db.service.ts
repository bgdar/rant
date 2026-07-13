import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupDocument, Group } from 'src/schemas/group.schema';
import { ForumsDbService } from './forumis.db.service';
import {
  ChatType,
  CreateGroupDTO,
  ReadGroupDTO,
  UpdateGroupDTO,
} from 'src/dto/forumis.dto';

@Injectable()
export class GroupDbService {
  constructor(
    @InjectModel(Group.name)
    private readonly groupModel: Model<GroupDocument>,
  ) {}

  /**
   * Send message/chat ke dalam grup.
   */
  async createGroub(data: CreateGroupDTO, forumsModel: ForumsDbService) {
    // Check forum apakah ada dan statusnya terkunci/tidak
    const forum = await forumsModel.findForumById(data.forumId);
    if (!forum) {
      throw new NotFoundException('Forum tidak ditemukan');
    }

    if (forum.isLocked) {
      throw new BadRequestException(
        'Forum terkunci, tidak dapat mengirim pesan',
      );
    }

    //  Create message grup
    const grubMessage = await this.groupModel.create({
      ...data,
      type: data.type || ChatType.TEXT,
      isEdited: false,
      isDeleted: false,
      readBy: [data.senderId], // Otomatis menganggap pengirim sudah membaca pesannya sendiri
    });

    // Update forum stats
    forum.totalMessages += 1;
    forum.lastMessageAt = new Date();
    await forum.save();

    // Populate data pengirim sebelum dikembalikan ke Gateway/Controller
    // Agar saat di-broadcast ke Socket.io, frontend tahu siapa nama pengirimnya
    return grubMessage.populate('senderId', 'name username image');
  }

  /**
   * Get forum chats (Urutan lama ke baru untuk chat room history).
   */
  async getForumChats(forumId: string) {
    return this.groupModel
      .find({
        forumId,
        isDeleted: false,
      })
      .populate('senderId', 'name username image') // <--- WAJIB TAMBAH INI
      .sort({
        createdAt: 1,
      });
  }

  /**
   * Get latest chats (Urutan terbaru dengan limit, cocok untuk lazy loading/pagination).
   */
  async getLatestChats(forumId: string, limit = 30) {
    return this.groupModel
      .find({
        forumId,
        isDeleted: false,
      })
      .populate('senderId', 'name username image') // <--- WAJIB TAMBAH INI
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  }

  /**
   * Find chat by ID.
   */
  async findChatById(id: string) {
    const chat = await this.groupModel
      .findById(id)
      .populate('senderId', 'name username'); // Tambahan opsional untuk jaga-jaga

    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found atau telah dihapus');
    }

    return chat;
  }

  /**
   * Update/edit isi chat.
   */
  async updateChat(id: string, data: UpdateGroupDTO) {
    const chat = await this.groupModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          isEdited: true,
        },
        {
          new: true,
        },
      )
      .populate('senderId', 'name username'); // Ambil data pengirim terbaru

    if (!chat) {
      throw new NotFoundException('Chat tidak ditemukan');
    }

    return chat;
  }

  /**
   * Soft delete chat grup.
   */
  async deleteChat(id: string) {
    const chat = await this.groupModel.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      {
        new: true,
      },
    );

    if (!chat) {
      throw new NotFoundException('Chat tidak ditemukan');
    }

    return {
      success: true,
      message: 'Chat berhasil dihapus (soft-delete)',
    };
  }

  /**
   * Mark SATU chat spesifik as read.
   */
  async markAsRead(chatId: string, userId: string) {
    return this.groupModel.findByIdAndUpdate(
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
   * Mark SEMUA chat di dalam forum tersebut sebagai terbaca oleh user terkait.
   */
  async markGroupMessagesAsRead(dto: ReadGroupDTO) {
    return this.groupModel.updateMany(
      {
        forumId: dto.forumId,
        senderId: { $ne: dto.userId },
        readBy: { $ne: dto.userId },
      },
      {
        $addToSet: { readBy: dto.userId },
      },
    );
  }

  /**
   * Count total seluruh chat grup di database.
   */
  async countChats() {
    return this.groupModel.countDocuments();
  }
}
