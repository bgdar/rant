import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ChatType } from 'src/dto/forumis.dto';

export type GroupDocument = HydratedDocument<Group>;

@Schema({
  timestamps: true, // Otomatis membuat kolom createdAt dan updatedAt berupa Date
})
// Di dalam Schema Mongoose: Wajib menggunakan Types.ObjectId., jadi gak impelement denagn GroubDTO
export class Group {
  /**
   * Forum / Group ID.
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'Forum',
    required: true,
    index: true,
  })
  forumId: Types.ObjectId;

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
   * Chat message content.
   */
  @Prop({
    required: true,
    trim: true,
    maxlength: 3000,
  })
  message: string;

  /**
   * Message type menggunakan Enum.
   */
  @Prop({
    type: String,
    enum: ChatType,
    default: 'text',
  })
  type: ChatType; // Diubah ke tipe ChatType agar mematuhi DTO

  /**
   * File/image URL.
   */
  @Prop({
    default: null,
  })
  fileUrl: string;

  /**
   * Reply to chat ID.
   * PERBAIKAN: Diubah ke 'Group' agar sesuai dengan nama kelas skema ini.
   */
  @Prop({
    type: Types.ObjectId,
    ref: 'Group',
    default: null,
  })
  replyTo: Types.ObjectId;

  /**
   * Read by users.
   */
  @Prop({
    type: [Types.ObjectId],
    ref: 'User',
    default: [],
  })
  readBy: Types.ObjectId[];

  /**
   * Pin message di dalam grup oleh supervisor/admin.
   */
  @Prop({
    default: false,
  })
  isPinned: boolean;

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

  // Properti otomatis dari timestamps (Wajib ditulis jika kamu menggunakan implements DTO)
  createdAt: Date;
  updatedAt: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

// Compound Index untuk mempercepat query internal forum
GroupSchema.index({ forumId: 1, createdAt: -1 });
