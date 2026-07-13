import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Types } from 'mongoose';
import { ForumDTO, ForumMemberRole, ForumVisibility } from 'src/dto/forumis.dto';

/**
 * Forum member schema.
 */
@Schema({
  _id: false,
})
// export class ForumMember implements ForumMemberDTO { // tidak cocok dengan type Response yang mengguankan string dari pada type database , walaupun database support
export class ForumisMember {
  /**
   * User ID.
   */
  @Prop({
    type: Types.ObjectId,

    ref: 'User',

    required: true,
  })
  userId: Types.ObjectId;

  /**
   * Member role.
   *
   * Example:
   * - member
   * - moderator
   * - supervisor
   * - owner
   */
  @Prop({
    type: String,

    enum: Object.values(ForumMemberRole),

    default: 'member',
  })
  role: string;

  /**
   * Joined date.
   */
  @Prop({
    default: Date.now,
  })
  joinedAt: Date;
}

export const ForumMemberSchema = SchemaFactory.createForClass(ForumisMember);

export type ForumDocument = HydratedDocument<Forumis>;

/**
 * Main forum schema.
 *
 * Features:
 * - Forum rooms
 * - Group discussion
 * - Community chat
 * - Realtime message room
 */
@Schema({
  timestamps: true,
})
// export class Forum implements ForumDTO { // gak bisa di gunakan karana tidak cocok dengn type response dan type database
export class Forumis {
  /**
   * Forum name/title.
   */
  @Prop({
    required: true,

    trim: true,

    minlength: 3,

    maxlength: 60,
  })
  name: string;

  /**
   * Forum slug/url.
   */
  @Prop({
    required: true,

    unique: true,

    lowercase: true,

    trim: true,
  })
  slug: string;

  /**
   * Forum description.
   */
  @Prop({
    default: null,

    maxlength: 500,
  })
  description: string;

  /**
   * Forum image/banner.
   */
  @Prop({
    default: null,
  })
  image: string;

  /**
   * Forum visibility.
   *
   * Example:
   * - public
   * - private
   * - protected
   */
  @Prop({
    type: String,

    enum: ForumVisibility,

    default: ForumVisibility.PUBLIC,
  })
  visibility: ForumVisibility;

  /**
   * Forum owner supervisor/admin.
   */
  @Prop({
    type: Types.ObjectId,

    ref: 'Supervisor',

    required: true,
  })
  supervisorId: Types.ObjectId;

  /**
   * Forum members.
   */
  @Prop({
    type: [ForumMemberSchema],

    default: [],
  })
  members: ForumisMember[];

  /**
   * Forum categories/tags.
   */
  @Prop({
    type: [String],

    default: [],
  })
  tags: string[];

  /**
   * Total messages.
   */
  @Prop({
    default: 0,
  })
  totalMessages: number;

  /**
   * Total members.
   */
  @Prop({
    default: 0,
  })
  totalMembers: number;

  /**
   * Forum locked state.
   */
  @Prop({
    default: false,
  })
  isLocked: boolean;

  /**
   * Forum archived state.
   */
  @Prop({
    default: false,
  })
  isArchived: boolean;

  /**
   * Last message datetime.
   */
  @Prop({
    default: null,
    type: Date,
  })
  lastMessageAt: Date | null;
}

export const ForumisSchema = SchemaFactory.createForClass(Forumis);
