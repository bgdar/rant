// src/schemas/supervisor.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';
import { SupervisorDTO } from 'src/dto/supervisorDTO';

export type SupervisorDocument = HydratedDocument<Supervisor>;

/**
 * Supervisor Schema
 *
 * Digunakan untuk:
 * - Admin
 * - Supervisor
 * - Staff management
 * - Dashboard monitoring
 */
@Schema({
  timestamps: true,
})
export class Supervisor implements SupervisorDTO {
  /**
   * Nama lengkap supervisor.
   */
  @Prop({
    required: true,
    trim: true,
  })
  fullName: string;

  /**
   * Username login.
   */
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  username: string;

  /**
   * Email supervisor.
   */
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  /**
   * Password hash bcrypt.
   */
  @Prop({
    required: true,
  })
  password: string;

  /**
   * Role account.
   *
   * Example:
   * - supervisor
   * - admin
   * - owner
   */
  @Prop({
    default: 'supervisor',
    enum: ['supervisor', 'admin', 'owner'],
  })
  role: string;

  /**
   * Permission list.
   *
   * Example:
   * [
   *   "manage_users",
   *   "manage_products",
   *   "view_dashboard"
   * ]
   */
  @Prop({
    type: [String],
    default: [],
  })
  permissions: string[];

  /**
   * Status active account.
   */
  @Prop({
    default: true,
  })
  isActive: boolean;

  /**
   * Account verified.
   */
  @Prop({
    default: false,
  })
  isVerified: boolean;

  /**
   * Account banned.
   */
  @Prop({
    default: false,
  })
  isBanned: boolean;

  /**
   * Last login date.
   */
  @Prop({
    default: null,
  })
  lastLogin: Date;

  /**
   * Login token/session id.
   */
  @Prop({
    default: null,
  })
  token: string;

  /**
   * Total login counter.
   */
  @Prop({
    default: 0,
  })
  loginCount: number;

  /**
   * Profile image.
   */
  @Prop({
    default: null,
  })
  avatar: string;

  /**
   * Phone number.
   */
  @Prop({
    default: null,
  })
  phone: string;

  /**
   * Address.
   */
  @Prop({
    default: null,
  })
  address: string;

  /**
   * Custom tags.
   */
  @Prop({
    type: [String],
    default: [],
  })
  tags: string[];
}

export const SupervisorSchema = SchemaFactory.createForClass(Supervisor);
