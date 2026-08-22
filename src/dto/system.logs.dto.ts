// simpan semua logs system 
// - hasil interaksi dari bots juga di simpan di sini , 
// - untuk di tampilkan di halaman supervisor 
// - 

export enum AksiEksekusiType  {
   /**
   * Blokir permanen atau sementara terhadap akun pengguna.
   */
  BAN = "ban",
  /**
   * Membuka blokir akun pengguna yang sebelumnya terkena ban.
   */
  UNBAN = "unban",

  /**
   * Membuat akun pengguna, supervisor, atau entitas baru ke dalam sistem.
   */
  CREATE_USER = "create_user",

  /**
   * Memperbarui data profil, peran (role), atau informasi kontak pengguna.
   */
  UPDATE_USER = "update_user",

  /**
   * Menghapus akun pengguna atau data penting dari sistem.
   */
  DELETE_USER = "delete_user",

  /**
   * Pengguna berhasil masuk (login) ke dalam sistem.
   */
  LOGIN = "login",

  /**
   * Pengguna keluar (logout) dari sistem atau sesi berakhir.
   */
  LOGOUT = "logout",

  /**
   * Mengatur ulang kata sandi pengguna (reset password) oleh supervisor atau sistem.
   */
  RESET_PASSWORD = "reset_password",

  /**
   * Mengubah hak akses atau peran (role) dari akun tertentu.
   */
  CHANGE_ROLE = "change_role",

  /**
   * Mengunduh atau mengekspor data laporan dari sistem.
   */
  EXPORT_DATA = "export_data"}

/*
 * beberapa informasi penting tidak di tampilin ke supervisor 
 */ 
export class SystemLogsDTO {

  // simpan  , nama akun supervisor atau user yang buat akun baru 
  // simpan  , username , username_discord , username_telegram ,username_whatsapp
  /**
   * Status eksekusi log (misal: Success, Failed, Pending).
   */
  status: string;

  /**
   * Waktu kapan aksi tersebut dieksekusi.
   */
  timestamp: Date | string;

  /**
   * Pihak atau akun yang melakukan aksi (Actor).
   */
  pelakuActor: string;

  /**
   * Jenis tindakan atau operasi yang dijalankan.
   */
  aksiEksekusi: AksiEksekusiType;

  /**
   * Objek atau entitas yang menjadi sasaran aksi.
   */
  targetObject: string;

  /**
   * Alamat IP perangkat yang digunakan saat mengeksekusi aksi.
   */
  ipAddress: string;

  /**
   * Informasi tambahan atau pesan error lengkap dari log.
   */
  detail: string;

  /**
   * simpan  , nama akun supervisor atau user yang buat akun baru 
   */
  creatorName?: string;

  /**
   * simpan  , username yang ada di webdashboard utuk forumis
   */
  usernameForumis ?: string;

  /**
   * Username Discord terkait.
   */
  usernameDiscord?: string;

  /**
   * Username Telegram terkait.
   */
  usernameTelegram?: string;

  /**
   * Username WhatsApp atau nomor telepon terkait.
   */
  usernameWhatsapp?: string;
}
