import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from 'src/schemas/chat.schema';
import { Model } from 'mongoose';
import {
  ChatType,
  CreateChatDTO,
  UpdateChatDTO,
  ReadChatDTO,
} from 'src/dto/forumis.dto';

@Injectable()
export class ChatDbService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<ChatDocument>,
  ) {}

  /**
   * Helper untuk membuat Room ID unik & konsisten bagi 2 user yang mengobrol.
   * Mengurutkan ID agar p2p_A_B dan p2p_B_A menghasilkan string ruangan yang sama.
   */
  generateRoomId(userIdA: string, userIdB: string): string {
    const sortedIds = [userIdA, userIdB].sort();
    return `p2p_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Mengirim pesan chat personal baru (1-on-1).
   * Tidak butuh ForumsDbService lagi karena chat personal terpisah dari forum.
   */
  async createChat(data: CreateChatDTO) {
    // Otomatis buatkan roomId jika tidak dikirim dari sisi client
    const finalRoomId =
      data.roomId || this.generateRoomId(data.senderId, data.receiverId);

    const chat = await this.chatModel.create({
      ...data,
      roomId: finalRoomId,
      type: data.type || ChatType.TEXT,
      isRead: false,
      isEdited: false,
      isDeleted: false,
    });

    return chat;
  }

  /**
   * Mengambil riwayat chat room personal tertentu (Lama ke Baru).
   */
  async getRoomChats(roomId: string) {
    return this.chatModel
      .find({
        roomId,
        isDeleted: false, // Jangan muat pesan yang sudah dihapus
      })
      .sort({
        createdAt: 1, // Urutan maju untuk diletakkan di layar chatbox
      });
  }

  /**
   * Mengambil pesan teratas/terbaru dengan batasan limit (untuk lazy load/pagination).
   */
  async getLatestChats(roomId: string, limit = 30) {
    return this.chatModel
      .find({
        roomId,
        isDeleted: false,
      })
      .sort({
        createdAt: -1,
      })
      .limit(limit);
  }

  /**
   * Mencari satu pesan spesifik berdasarkan ID.
   */
  async findChatById(id: string) {
    const chat = await this.chatModel.findById(id);

    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat tidak ditemukan atau telah dihapus');
    }

    return chat;
  }

  /**
   * Mengubah / Mengedit isi teks pesan.
   */
  async updateChat(id: string, data: UpdateChatDTO) {
    const chat = await this.chatModel.findByIdAndUpdate(
      id,
      {
        ...data,
        isEdited: true, // Otomatis set true
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
   * Menghapus pesan secara soft-delete.
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
   * Menandai masal semua pesan di room tersebut sebagai 'Sudah Dibaca'.
   * Dipicu saat lawan bicara membuka room chat kamu.
   */
  async markRoomAsRead(dto: ReadChatDTO) {
    return this.chatModel.updateMany(
      {
        roomId: dto.roomId,
        receiverId: dto.readerId, // Hanya pesan yang ditujukan ke saya
        isRead: false, // Yang statusnya masih belum dibaca
      },
      {
        $set: {
          isRead: true, // Ubah status menjadi true (Centang Dua Biru)
        },
      },
    );
  }

  /**
   * Menghitung total semua data chat personal di database.
   */
  async countChats() {
    return this.chatModel.countDocuments();
  }

  /**
   * Mengambil daftar user unik yang pernah berinteraksi (chatting) dengan user tertentu.
   * * Alur logika (Pipeline):
   * 1. $match: Filter semua chat yang melibatkan user (sebagai pengirim atau penerima).
   * 2. $sort: Urutkan berdasarkan waktu chat terbaru.
   * 3. $project: Tentukan siapa 'lawan bicara' (partnerId) berdasarkan kondisi sender/receiver.
   * 4. $group: Hapus duplikat agar satu partner hanya muncul satu kali (ID unik).
   * 5. $lookup: Gabungkan dengan koleksi 'users' untuk mengambil detail profil (nama, foto).
   * 6. $unwind: Mengubah array hasil lookup menjadi objek tunggal.
   * 7. $project: Bentuk ulang hasil akhir agar hanya mengembalikan data profil yang diperlukan saja.
   *
   * @example ouput :
   *  [
  {
    "_id": "668d2f1a9b2c3d4e5f6g7h8i",
    "name": "Budi Santoso",
    "username": "budi_s",
    "image": "https://example.com/images/budi.jpg"
  },
  ..]
   */
  async getRecentChats(myId: string) {
    const recent = await this.chatModel.aggregate([
      {
        $match: {
          $or: [{ senderId: myId }, { receiverId: myId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          partnerId: {
            $cond: [{ $eq: ['$senderId', myId] }, '$receiverId', '$senderId'],
          },
        },
      },
      { $group: { _id: '$partnerId' } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'partnerInfo',
        },
      },
      { $unwind: '$partnerInfo' },
      {
        $project: {
          name: '$partnerInfo.name',
          username: '$partnerInfo.username',
          image: '$partnerInfo.image',
        },
      },
    ]);
    return recent ?? [];
  }
}
