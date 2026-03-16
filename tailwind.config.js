/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./views/**/*.ejs', './src/**/*.ts'],
  theme: {
    extend: {
      colors: {
        // Nama variabel bisa disesuaikan dengan selera Anda
        main: '#FF0000', // Merah Utama
        blackmain: '#000000', // Hitam Pekat
        whitemain: '#FFFFFF', // Putih Bersih
        graymid: '#999999', // Abu-abu Medium
      },
      // Opsional: Menambahkan box shadow yang halus agar sesuai dengan desain elegan
      boxShadow: {
        soft: '0 10px 40px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
