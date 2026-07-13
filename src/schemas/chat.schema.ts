import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Types } from 'mongoose';
import { ChatType } from 'src/dto/forumis.dto';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({
  timestamps: true, // Otomatis meng-handle createdAt dan updatedAt berupa Date
})
// Di dalam Schema Mongoose: Wajib menggunakan Types.ObjectId. , jadi gak implement dengan ChatDTO
export class Chat {
  /**
   * Room ID unik untuk obrolan 1-on-1 (Misal: "p2p_userIdA_userIdB").
   * Wajib dideklarasikan agar compound index di bawah bekerja dengan valid.
   */
  @Prop({
    type: String,
    required: true,
    index: true,
  })
  roomId: Types.ObjectId;

  /**
   * Sender user ID.
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  senderId: Types.ObjectId;

  /**
   * Receiver user ID (Penerima chat).
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  receiverId: Types.ObjectId;

  /**
   * Chat message content.
   */
  @Prop({
    required: true,
    trim: true,
    maxlength: 3000,
  })
  message: string;

  /**
   * Message type.
   */
  @Prop({
    type: String,
    enum: ChatType,
    default: 'text',
  })
  type: ChatType;

  /**
   * File/image URL.
   */
  @Prop({
    default: null,
  })
  fileUrl: string;

  /**
   * Reply to chat ID (Self-reference ke skema Chat ini sendiri).
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'Chat',
    default: null,
  })
  replyTo: Types.ObjectId;

  /**
   * Status baca (Boolean untuk personal chat).
   */
  @Prop({
    type: Boolean,
    default: false,
    index: true,
  })
  isRead: boolean;

  /**
   * Message edited state.
   */
  @Prop({
    default: false,
  })
  isEdited: boolean;

  /**
   * Message deleted state (Soft delete).
   */
  @Prop({
    default: false,
  })
  isDeleted: boolean;

  /**
   * Pin message di dalam room pribadi.
   */
  @Prop({
    default: false,
  })
  isPinned: boolean;

  /**
   * Message reactions.
   */
  @Prop({
    type: [
      {
        userId: {
          type: Types.ObjectId,
          ref: 'User',
        },
        emoji: {
          type: String,
        },
      },
    ],
    default: [],
  })
  reactions: {
    userId: Types.ObjectId;
    emoji: string;
  }[];

  // Properti otomatis dari timestamps (diperlukan untuk memenuhi implements ChatDTO)
  createdAt: Date;
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

/**
 * Compound Indexing tingkat lanjut.
 * Membuat proses pencarian riwayat obrolan berdasarkan roomId dan sorting pesan terbaru (createdAt)
 * menjadi instan tanpa membebani performa RAM server (No COLLSCAN).
 */
ChatSchema.index({ roomId: 1, createdAt: -1 });
