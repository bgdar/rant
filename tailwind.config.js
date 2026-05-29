/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./views/**/*.ejs', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        mainPrimary: '#FF0000', // Merah Utama (Warna dasar Anda)
        mainSecondary: '#CC0000', // Merah Gelap (Untuk Hover / State aktif)
        mainAccent: '#FF4D4D', // Merah Terang (Untuk Highlight / Elemen penting)
        mainMuted: '#FFE5E5', // Merah Sangat Muda (Untuk Latar Belakang / Tint)

        blackPrimary: '#000000', // Hitam Pekat (Warna dasar Anda)
        blackSecondary: '#1F1F1F', // Hitam Arang (Untuk Komponen UI / Card)
        blackAccent: '#333333', // Hitam Keabuan (Untuk Teks Utama / Batasan Kontras)
        blackMuted: '#555555', // Hitam Pudar (Untuk Teks Sekunder / Keterangan)

        whitePrimary: '#FFFFFF', // Putih Bersih (Warna dasar Anda)
        whiteSecondary: '#F5F5F5', // Putih Asap (Untuk Latar Belakang Halaman / Canvas)
        whiteAccent: '#EAEAEA', // Putih Keabuan (Untuk Latar Belakang Komponen / Input)
        whiteMuted: '#DCDCDC', // Putih Pudar (Untuk Border Halus)

        grayPrimary: '#999999', // Abu-abu Medium (Warna dasar Anda)
        graySecondary: '#777777', // Abu-abu Tua (Untuk Teks yang Kurang Kontras)
        grayAccent: '#BBBBBB', // Abu-abu Terang (Untuk Placeholder / Garis Pembagi)
        grayMuted: '#E0E0E0', // Abu-abu Sangat Terang (Untuk Latar Belakang Tabel)
      },

      // Opsional: Menambahkan box shadow yang halus agar sesuai dengan desain elegan
      boxShadow: {
        soft: '0 10px 40px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
