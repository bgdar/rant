// untuk menyimpan chat forums
// src/dto/forum.dto.ts

import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ArrayUnique,
} from 'class-validator';
import { Types } from 'mongoose';

/*
 | ENUM
 *
/**
 * Forum visibility type.
 */
export enum ForumVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
}

/**
 * Member role.
 */
export enum ForumMemberRole {
  MEMBER = 'member',
  SUPERVISOR = 'supervisor',
  OWNER = 'owner', // jadi bgdar di sini wkwkkw
}

/**
 * Chat message type.
 */
export enum ChatType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

/**
 * Forum member object.
 */
export class ForumMemberDTO {
  /**
   * User ID.
   */
  @IsMongoId()
  userId: Types.ObjectId;

  /**
   * Member role.
   */
  @IsEnum(ForumMemberRole)
  role: ForumMemberRole;

  /**
   * Join date.
   */
  joinedAt: Date;
}

/*
 | FORUM DTO
 */

/**
 * Main forum DTO.
 */
export class ForumDTO {
  /**
   * Forum name.
   */
  name: string;

  /**
   * Forum slug/url.
   */
  slug: string;

  /**
   * Forum description.
   */
  description?: string;

  /**
   * Forum image/banner.
   */
  image?: string;

  /**
   * Forum visibility.
   */
  visibility: ForumVisibility;

  /**
   * Forum owner/supervisor id.
   */
  supervisorId: Types.ObjectId;

  /**
   * Forum members.
   */
  members: ForumMemberDTO[];

  /**
   * Forum tags.
   */
  tags: string[];

  /**
   * Total chats/messages.
   */
  totalMessages: number;

  /**
   * Total members.
   */
  totalMembers: number;

  /**
   * Forum locked state.
   */
  isLocked: boolean;

  /**
   * Last message date.
   */
  lastMessageAt: Date | null;

  /**
   * Created date.
   */
  createdAt: Date;

  /**
   * Updated date.
   */
  updatedAt: Date;
}

/**
 * DTO create forum.
 */
export class CreateForumDTO {
  /**
   * Forum title/name.
   */
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  name: string;

  /**
   * Forum slug.
   */
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug: string;

  /**
   * Description.
   */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  /**
   * Forum image/banner.
   */
  @IsOptional()
  @IsString()
  image?: string;

  /**
   * Forum visibility.
   */
  @IsOptional()
  @IsEnum(ForumVisibility)
  visibility?: ForumVisibility;

  /**
   * Supervisor/admin owner id.
   */
  @IsMongoId()
  supervisorId: string;

  /**
   * Forum members.
   */
  @IsOptional()
  @IsArray()
  members?: ForumMemberDTO[];

  /**
   * Tags/categories.
   */
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  tags?: string[];
}

/**
 * DTO update forum.
 */
export class UpdateForumDTO {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(ForumVisibility)
  visibility?: ForumVisibility;

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

/*
 | FORUM MEMBER DTO
 */

/**
 * Add member DTO.
 */
export class AddForumMemberDTO {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsEnum(ForumMemberRole)
  role?: ForumMemberRole;
}

/**
 * Remove member DTO.
 */
export class RemoveForumMemberDTO {
  @IsMongoId()
  userId: string;
}

/**
 * Update member role DTO.
 */
export class UpdateForumMemberRoleDTO {
  @IsMongoId()
  userId: string;

  @IsEnum(ForumMemberRole)
  role: ForumMemberRole;
}

/**
 * Main chat DTO.
 */
export class ChatDTO {
  /**
   * Forum ID.
   */
  forumId: string;

  /**
   * Sender user ID.
   */
  senderId: string;

  /**
   * Message content.
   */
  message: string;

  /**
   * Message type.
   */
  type: ChatType;

  /**
   * File/image url.
   */
  fileUrl?: string;

  /**
   * Reply message id.
   */
  replyTo?: string;

  /**
   * Message edited state.
   */
  isEdited: boolean;

  /**
   * Message deleted state.
   */
  isDeleted: boolean;

  /**
   * Read users.
   */
  readBy: string[];

  /**
   * Created at.
   */
  createdAt: Date;

  /**
   * Updated at.
   */
  updatedAt: Date;
}

/**
 * DTO create/send chat.
 */
export class CreateChatDTO {
  /**
   * Forum ID.
   */
  @IsMongoId()
  forumId: string;

  /**
   * Sender ID.
   */
  @IsMongoId()
  senderId: string;

  /**
   * Message.
   */
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  message: string;

  /**
   * Chat type.
   */
  @IsOptional()
  @IsEnum(ChatType)
  type?: ChatType;

  /**
   * File url.
   */
  @IsOptional()
  @IsString()
  fileUrl?: string;

  /**
   * Reply message id.
   */
  @IsOptional()
  @IsMongoId()
  replyTo?: string;
}

/**
 * DTO update/edit chat.
 */
export class UpdateChatDTO {
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

/**
 * DTO mark message as read.
 */
export class ReadChatDTO {
  @IsMongoId()
  userId: string;
}
