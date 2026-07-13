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
  userId: Types.ObjectId;

  @IsOptional()
  @IsEnum(ForumMemberRole)
  role?: ForumMemberRole;
}

/**
 * Remove member DTO.
 */
export class RemoveForumMemberDTO {
  @IsMongoId()
  userId: Types.ObjectId;
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

//
// DTO UTUK CHAT --------------------------------
//

/**
 * Main chat DTO.
 * Untuk Chatting antar user
 */
export class ChatDTO {
  /**
   * Unique Chat Room ID for 1-on-1 (Opsional tapi sangat bagus)
   * Gabungan enkripsi ID kedua user (misal: "userA_userB")
   * agar query riwayat chat mereka berdua sangat instan.
   */
  roomId?: string;

  /**
   * Sender user ID.
   * Siapa yang mengirim pesan.
   */
  senderId: Types.ObjectId;

  /**
   * Receiver user ID.
   * KEJUTAN UTAMA: Siapa yang menerima pesan ini.
   */
  receiverId: Types.ObjectId;

  /**
   * Message content.
   */
  message: string;

  /**
   * Message type (text, image, file, dll).
   */
  type: ChatType;

  /**
   * File/image url.
   */
  fileUrl?: string;

  /**
   * Reply message ID.
   * Untuk fitur "Balas Pesan" tertentu.
   */
  replyTo?: Types.ObjectId;

  /**
   * Read status.
   * Cukup boolean karena hanya ada 1 penerima (bukan grup).
   * True jika si receiverId sudah membuka chat room.
   */
  isRead: boolean;

  /**
   * Message edited state.
   */
  isEdited: boolean;

  /**
   * Message deleted state.
   */
  isDeleted: boolean;

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
 * DTO Create/Send Chat (Pribadi)
 */
export class CreateChatDTO {
  /**
   * Sender ID.
   * ID pengguna yang mengirim chat.
   */
  @IsMongoId()
  senderId: string;

  /**
   * Receiver ID.
   * WAJIB DIISI: ID pengguna tujuan agar server tahu ke mana pesan dikirim.
   */
  @IsMongoId()
  receiverId: string;

  /**
   * Room ID.
   * Opsional diisi oleh client, atau bisa di-generate otomatis
   * di sisi backend gabungan dari senderId_receiverId.
   */
  @IsOptional()
  @IsString()
  roomId?: string;

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
 * DTO Update/Edit Chat (Pribadi)
 */
export class UpdateChatDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(3000)
  message?: string;

  /**
   * Status apakah pesan telah diubah.
   * Biasanya di-set true otomatis di backend jika properti 'message' berubah.
   */
  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;

  /**
   * Status soft-delete pesan.
   */
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

/**
 * DTO Mark Message as Read (Pribadi)
 * Mengubah status dibaca dari sisi penerima.
 */
export class ReadChatDTO {
  /**
   * Room ID atau Chat ID spesifik.
   * Saat user membuka ruang chat pribadi, client mengirim roomId
   * untuk menandai semua pesan di room tersebut yang targetnya adalah dia menjadi isRead: true.
   */
  @IsString()
  roomId: string;

  /**
   * Siapa yang membaca pesan (si penerima asli).
   */
  @IsMongoId()
  readerId: string;
}

//
// DTO UTUK GROUP --------------------------------
//

/**
 * Main chat DTO.
 */
export class GroupDTO {
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
export class CreateGroupDTO {
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
export class UpdateGroupDTO {
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
export class ReadGroupDTO {
  /**
   * Forum/Grup ID tempat user sedang membaca pesan.
   */
  @IsMongoId()
  forumId: string;

  /**
   * User ID yang sedang membaca pesan.
   */
  @IsMongoId()
  userId: string;
}
