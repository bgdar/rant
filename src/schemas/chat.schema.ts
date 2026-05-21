import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

/**
 * Chat schema.
 *
 * Features:
 * - Forum realtime message
 * - Reply message
 * - Read status
 * - Soft delete
 * - File/image support
 */
@Schema({
  timestamps: true,
})
export class Chat {
  /**
   * Forum ID.
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
  })
  senderId: Types.ObjectId;

  /**
   * Chat message.
   */
  @Prop({
    required: true,

    trim: true,

    maxlength: 3000,
  })
  message: string;

  /**
   * Message type.
   *
   * Example:
   * - text
   * - image
   * - file
   * - system
   */
  @Prop({
    type: String,

    enum: ['text', 'image', 'file', 'system'],

    default: 'text',
  })
  type: string;

  /**
   * File/image URL.
   */
  @Prop({
    default: null,
  })
  fileUrl: string;

  /**
   * Reply to chat ID.
   */
  @Prop({
    type: Types.ObjectId,

    ref: 'Chat',

    default: null,
  })
  replyTo: Types.ObjectId;

  /**
   * Message edited state.
   */
  @Prop({
    default: false,
  })
  isEdited: boolean;

  /**
   * Message deleted state.
   */
  @Prop({
    default: false,
  })
  isDeleted: boolean;

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
   * Pin message.
   */
  @Prop({
    default: false,
  })
  isPinned: boolean;

  /**
   * Message reactions.
   *
   * Example:
   * [
   *   {
   *     userId: "...",
   *     emoji: "🔥"
   *   }
   * ]
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
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
