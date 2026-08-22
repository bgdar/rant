// data dto ini akan di isi oleh Bot bot nantiknya , sehingga dashboard cuman memasukan saja isinya
// - data yang di simpan adalah groub saja
// cek di aplikasi bot bot nya *dar ada repositoy sendiri

import { MessageType } from "./forumis.dto";

/**
 * Main chat DTO.
 */
export class GroupMessageDiscordDTO {
  /**
   * Forum ID. , karena forum di gunakan di group
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
  type: MessageType;

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

  /*
   * response ai  , ini ada yang eperlu di tambha lagi
   */
  messageResponseModel?: string;

  /*
   * tanggal model response
   */
  dateResponseModel?: Date;
}

/**
 * Main chat DTO.
 */
export class GroupMessageTelegramDTO {
  /**
   * Forum ID. , karena forum di gunakan di group
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
  type: MessageType;

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

  /*
   * response ai  , ini ada yang eperlu di tambha lagi
   */
  messageResponseModel?: string;

  /*
   * tanggal model response
   */
  dateResponseModel?: Date;
}

/**
 * Main chat DTO.
 */
export class GroupMessageWhatsAppDTO {
  /**
   * Forum ID. , karena forum di gunakan di group
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
  type: MessageType;

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

  /*
   * response ai  , ini ada yang eperlu di tambha lagi
   */
  messageResponseModel?: string;

  /*
   * tanggal model response
   */
  dateResponseModel?: Date;
}
