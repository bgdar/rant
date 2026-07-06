import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from './user.dto';

export enum SupervisorRole {
  TRAINEE = 'Trainee',
  TEACHER = 'Teacher',
  MANAGER = 'Manager',
  DIRECTOR = 'Director',
  CEO = 'CEO',
}

export enum SupervisorPermission {
  CREATEUSER = 'createUser',
  DELETEUSER = "deleteUser",
}

/**
 * Basic Supervisor DTO
 *
 */
export class SupervisorDTO {
  /** Nama lengkap dari supervisor untuk kebutuhan tampilan profil dan laporan */
  fullName: string;

  /** Kode unik/nama pengguna yang digunakan supervisor untuk masuk (login) ke sistem */
  username: string;

  /** Alamat email aktif untuk komunikasi sistem, notifikasi, dan pemulihan kata sandi */
  email: string;

  /** Kata sandi yang sudah tersandi (hashed password) untuk keamanan autentikasi akun */
  password: string;

  // --- OTORISASI & HAK AKSES ---

  /** Peran pengguna dalam sistem ,  supervisor memeiliki beberapa jenis roll
  role: string;

  /** Daftar spesifik hak akses/fitur yang boleh dieksekusi (misal: ['create_user', 'export_log']) */
  permissions: SupervisorPermission[];
  // --- STATUS AKUN (STATE) ---
  /** Menentukan apakah akun ini sedang aktif atau dinonaktifkan sementara oleh sistem/admin utama */
  isActive: boolean;

  /** Status verifikasi email; memastikan supervisor telah melakukan aktivasi via tautan email */
  isVerified: boolean;

  /** Status pemblokiran akun; jika bernilai 'true', supervisor tidak akan bisa mengakses sistem sama sekali */
  isBanned: boolean;

  // --- REKAM JEJAK / AUDIT METRICS ---

  /** Catatan tanggal dan waktu terakhir kali supervisor berhasil masuk ke dalam aplikasi */
  lastLogin: Date;

  /** Menyimpan token sesi aktif (seperti JWT) untuk memvalidasi request API yang dikirim */
  token: string;

  /** Statistik jumlah total login untuk memantau seberapa sering supervisor ini aktif */
  loginCount: number;

  // --- PROFIL TAMBAHAN ---

  /** URL atau nama file gambar/foto profil untuk dipasang di bagian pojok kanan atas atau halaman profil */
  avatar: string;

  /** Nomor telepon resmi yang bisa dihubungi atau digunakan untuk keperluan verifikasi dua langkah (2FA) */
  phone: string;

  /** Alamat domisili atau kantor dari supervisor jika diperlukan untuk data administrasi */
  address: string;

  /** * Daftar ID User (Bawahan/Staff) yang berada di bawah pengawasan langsung supervisor ini.
   * Bersifat opsional (?) karena supervisor baru mungkin belum memiliki bawahan yang terikat.
   */
  usersId?: string[];
}
/*
 * supervisor yang login akan punya session ini
 */
export class SupervisorSessionDTO {
  id : string ;
  fullName: string;
  username: string;
  email: string;
  role: string;
  permissions: SupervisorPermission[];
  token: string;
  phone: string;
}

/**
 * DTO create supervisor.
 */
export class CreateSupervisorDTO {
  @IsString()
  fullName: string;

  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['Trainee', 'Teacher', 'Manager', 'Director', 'CEO'])
  role?: string;

  @IsOptional()
  @IsArray()
  permissions?: string[];

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

/**
 * di gunakan di create user baru.
 * untuk merepresentasikan data yang di kriim
 */
export class UpdateToSupervisor {
  fullname: string;
  // password: string; // gak usah password lah 

  role: string;

  permissions: SupervisorPermission[];

  isActive: boolean;

  isVerified: boolean;

  isBanned: boolean;

  lastLogin: Date;

  phone?: string;

  avatar?: string;

  address: string;
}

/**
 * DTO update supervisor.
 */
export class UpdateSupervisorDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(SupervisorRole)
  role?: string;

  @IsOptional()
  permissions?: SupervisorPermission[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isBanned?: boolean;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

/**
 * DTO login supervisor/admin.
 */
export class LoginSupervisorDTO {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

/**
 * DTO update role.
 */
export class UpdateSupervisorRoleDTO {
  @IsEnum(SupervisorRole)
  role: string;
}

/**
 * DTO add permission.
 */
export class AddPermissionDTO {
  @IsEnum(SupervisorPermission)
  permission: SupervisorPermission;
}

// log untuk supervisor
export class LogSuppervisor {
  ip: number;

  fullname: string;
  username: String;

  role: string;

  lastLogin: Date;

  payload: Object;
}

export class DataPengguna {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
