<div align="center">
  <img src="./banner.png" />
</div>

<br>

### Tech Stack

<p align="center">
  <!-- NestJS -->
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  </a>
  <!-- WebSocket -->
<a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank">
  <img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=websocket&logoColor=white" alt="WebSocket"/>
</a>
 <!-- RabitMq -->
<a href="https://www.rabbitmq.com/" target="_blank">
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white" alt="RabbitMQ"/>
</a>
<!-- Socket.IO -->
<a href="https://socket.io/" target="_blank">
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO"/>
</a>
<!-- Fastify -->
<a href="https://fastify.dev/" target="_blank">
  <img src="https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify"/>
</a>
  <!-- EJS -->
  <a href="https://ejs.co/" target="_blank">
    <img src="https://img.shields.io/badge/EJS-8BC34A?style=for-the-badge&logo=javascript&logoColor=black" alt="EJS"/>
  </a>

  <!-- Tailwind CSS -->
  <a href="https://tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"/>
  </a>

  <!-- Alpine.js -->
  <a href="https://alpinejs.dev/" target="_blank">
    <img src="https://img.shields.io/badge/Alpine.js-8BC0D0?style=for-the-badge&logo=alpine.js&logoColor=black" alt="Alpine.js"/>
  </a>
  <!-- MongoDB -->
<a href="https://www.mongodb.com/" target="_blank">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
</a>
<!-- pnpm -->
<a href="https://pnpm.io/" target="_blank">
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm"/>
</a>

</p>

> rant bot to detect abusive words on several social media that use bots

**_Tech Info_** :

- `RabbitMQ` : Messaging yang cocok untuk komunikasi ke **api model server** dan aplikasi **_Bot_** lain

- `argon` : algoritma hashing password
- `class-validator` : validasi pada DTO
- `@fastify/session` : untuk session , jadi project ini mengguankan session tampa perlu redis , kecuali nantik jika sudah gedek
  > di sini tidak menggunkana `@secure-session` karena tidak cocok dengan flash message
- `@fastify/cookie` : karena ada session pastinya ada cookies

  > `@fastify/flash` : tidak stabil di **fastify**

  > Walaupun mengguankan flash , tapi gunakan json return untuk informasi yang lebih interaktif , flash message cukup saat pertama di kirim aja

- `Tailwindcss` : menggunakan Tailwincss CLI yang auto build
  running server + client ( tailwindcss)
  ```bash
  # running tailwindcss untuk generate code
  pnpm run client
  ```
- `fontawesome` : font di project ini
  cek di web aslinya :
  [font icon](https://fontawesome.com/kits/999cf0108d/icons)

- `session` + `cokiess` +`guard` : 2agar keamana di setiap view nantik

##### Coomin Soon

- `Redis` : saat aplikais besar nantik dan karena mengguankan **Session** maka sesi login pengguna akan di simpan dan di tangani oleh **_Redis_**
- `Speech-to-Text (STT) ` : ini untuk kasus `**Audio**`  jadi kita ubah ke text dahulu baru di handle oleh model nantinya
> ini sulit dan lama , butuh trining model terpisah agar akurasi untuk bahasa daerah cocok 

### Bot

- `bot discord` : https://github.com/bgdar/bot-discord/tree/rant
- `bot-telegram` : https://github.com/bgdar/bot-telegram/tree/rant
- `bot-whatsApp` ( coming soon ):

### User

ada 2 jenis katori user
**_User_**
user biasa yang masuk ke grub atau berinteraksi dengan bot app
user akan punya **akun** yang terkoneksi ke bot

- `role` ( daftar keadaan suatu user ) :

1. **Normal** (Normal)-> Toxic 0% - 20%: Pengguna berkomunikasi secara wajar, sopan, dan kooperatif.
2. **Suspicious** (Mencurigakan) -> Toxic 21% - 40%: Mulai menggunakan sarkasme atau sindiran tipis yang berpotensi memancing emosi pengguna lain.
3. **Dangerous** (Berbahaya) -> Toxic 41% - 60%: Frekuensi penggunaan kata-kata kasar atau provokasi mulai meningkat dan mengganggu kenyamanan.
4. **Extreme** (Sangat Beracun) -> Toxic 61% - 100%: Pelanggaran berat seperti flaming, penghinaan, atau harassment (pelecehan) secara terang-terangan.

**_Supervisor_**
pendamping atau admin yang mengelola **grub**

> Karena menggunakan session maka pilih
> Id supervisor dengan id user itu 'BERBEDA'

Forums Detail :

- forums hanya bisa di buat oleh supervisor maka harus login ulang jika user login ,

  > idenya saat login cek apakah sudah ada akun supervisor yang sama , jika ada maka supervisor juga login

- `role` (status supervisor) :
  > untuk bebera role `coming soon`

1. **Trainee (Siswa / Magang)**: Pengawas pemula yang hanya bisa memantau dan melaporkan pelanggaran dasar tanpa hak eksekusi langsung.
2. **Teacher (Guru / Moderator)** : Pengawas operasional yang berhak menegur, memberi peringatan, dan meredam situasi konflik ringan.
3. **Manager (Manajer / Pengawas)** : Pengawas senior yang memiliki wewenang untuk membekukan akun sementara dan mengedit konten yang melanggar.
4. **Director (Direktur / Kepala)**: Pengawas tingkat tinggi yang mengambil keputusan strategis dan menangani kasus pelanggaran berat.
5. **CEO (Bos Besar / Pemilik)**: Pengawas tertinggi dengan kendali penuh atas sistem, kebijakan, serta otoritas mutlak untuk blokir permanen.

### Sosmed

> handle Sosmed

- `sosmed.controller` : handle untuk **Api** sosmed di sini , baik login , berpindah halaman dan lainya

### Dataset

- **Jenis Data**

1. data-keyword : daftar kata kata Lexicon (kata) , berguna untuk **filter** , **deteksi awal ( sebelum ke model )**
2. database : daftar word ( kalimat ) yang di gunakan olek model AI (seperti : jigsaw-toxic-comment-classification-challenge )

- **Dataset Column info**

| Column          | Arti                | Penjelasan                                                                         |
| --------------- | ------------------- | ---------------------------------------------------------------------------------- |
| `text`          | Teks komentar       | Isi kalimat atau komentar yang dianalisis oleh model NLP                           |
| `toxic`         | Beracun / Toxic     | Menandakan komentar mengandung unsur negatif, kasar, ofensif, atau tidak sopan     |
| `severe_toxic`  | Sangat toxic        | Toxic tingkat berat, biasanya lebih agresif, ekstrem, atau sangat kasar            |
| `obscene`       | Kata cabul / vulgar | Mengandung kata-kata kotor, porno, atau vulgar                                     |
| `threat`        | Ancaman             | Mengandung ancaman kepada seseorang                                                |
| `insult`        | Penghinaan          | Menghina, merendahkan, atau menyerang seseorang                                    |
| `identity_hate` | Kebencian identitas | Ujaran kebencian terhadap identitas tertentu seperti ras, agama, suku, gender, dll |

### Model Api

> ada di branch :[Model server]("https://github.com/bgdar/rant/tree/model-api")

- di sini model **AI** untuk prediksi di jalakna dan juga handle response untuk menghasilkan response text untuk **Bots** gunakan
- di sini iniasialisais pertama _RabbitMQ_ untuk membuat daftar **queue - queue** yang di perlukna untuk komunikasi aplikasi

### RabbitMQ

> RabbitMQ file ada fi module `rant`

untuk masuk ke web RabbitMQ

- Default port and port now : `5672`
- masuk ke url : <http://localhost:15672>
- default password : `guest` , username : `guest`

**queue** :

- **queue-telegram** : untuk mengirim data metah ke queue dan masuk ke **Model Server Api**
- **queue-telegram-response** : hasil yang di kembalikan oleh **Model Server Api** dengan response text
- **queue-discord**
- **queue-discord-response**
- **queue-dashboard**
- **queue-dashboard-response**

- **_queue-user_** : berisi data user yang akan di gunakan di setiap apliakasi , ada ID untuk memastikan user login ke setiap aplikasi

#### Format data untuk Receiver && Production

##### User accest

data user

```json
{
    username : "bisa saja berubah di setiap aplikasi sosmed ( cari tahu cara menghadle nya)",
    discord_id : "121212121",
    telegram_id : "1212121212",
    akun : "user || supervisor"
    role : "user role atau supervisor role"
}

```

##### Model Api accest

data ( payload ) yang masuk ke server yang menjalakan model dan response nya

- data di queue dengan nama `queue-<media social>` :
  data yang media sosial kirim ke rabbitmq

```json
 {
     "chat_id": ,
    "text": ,
    "plafrom": "telegra, || discord || dashboard"
}
```

- data di queue dengan nama `queue-<media social>-response` :
  data yang di kriim dari rabbitmq

```json
 {
     "chat_id": ,
    "response": string,
    is_toxic  : boolean
    "plafrom": string
}
```

> ini data memang harus selau di kirim sih untuk di cek di server model nya

### Docker

**_docker compose_** :

- `mongodb` : database utama
- `monggodb-express` : antarmuka adminitratif berbasis web
  > akses di web : localhost = `http://localhost:8081/db/rant/`

```bash
# jalanakn di directory docker
cd docker

# jalanak compise file
docker compose run -d
```

```bash
# test ping container
docker exec -it mongo-express-rant ping mongodb-rant

# login with password
docker exec -it mongodb-rant mongosh -u dar -p dar-rant --authenticationDatabase admin
```

### Database ( monggoDB )

Database name : **`rant`**
Biarkan WEb app ini menjadi pusat uatamanay , jadi semua data aakn di simpan di database 1 ini ( rant )

> file dengan extensi nama_file.db.service.ts : adalah file model untuk database nya

1. Data Dummmy untuk semua bot
2. Table database rant menentukan spesifikasi bahasa untuk rant nya ( indo , aceh , english) itu berdasarkan table nya

##### hunggiFace

dataset juga di simpan di sini

- **dataset indo** : <https://huggingface.co/datasets/bgdar/dataset-rant-indo>
- **dataset aceh** : <https://huggingface.co/datasets/bgdar/dataset-rant-aceh>

### Response

**_Json response_** :

- `message` : informasi yang di kirim dari server baik atau buruk
- `status` : status message :
  1. success : message berhasil
  2. info :
  3. warning :
  4. error :

### App Color

- #ff0000 ( main color )
- #000000
- #ffffff
- #999999 ( medium gray)

### Folder info

- `forums.module` : modular untuk forums di web ini yang mempunyai `chat` , `grub`
- `rant

### FIle info

`nama.db.service` : untuk Model atau komunikasi ke database

### Poblem

1. Untuk menjalanakn , yang di hosting tidak hanya web tapi juga semua Bot , berdasarkan kataogi sosmed

### License

> Module di sini gak rapi sesuia konsep nest , tapi ide sendiri wkwkw

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
