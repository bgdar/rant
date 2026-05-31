<h1 align="center">Rant Model Api </h1>



### Tech 
 
1. `RabbitMQ` : ini pengganti web server jadi akan di kirim berdasarkan antarian permintaan, untuk 3 alasan utama:

   - Anti-Gagal (Data Aman): Jika bot media sosial Anda tiba-tiba mati atau terkena rate limit (blokir sementara), data hasil model AI tidak akan hilang. Data akan disimpan aman di antrean RabbitMQ sampai bot menyala kembali.
   -. Pembagi Tugas yang Pintar: RabbitMQ bisa menyaring dan mengarahkan data secara otomatis. Data untuk Telegram masuk ke antrean Telegram, data untuk Discord masuk ke antrean Discord, tanpa membuat Server Model AI  pusing memformatnya.
   -. ServerTetap Ringan & Stabil: Server utama tidak akan crash atau kehabisan RAM meskipun ada ratusan bot dan ribuan pengguna web yang meminta data secara bersamaan, karena semua beban request antre dengan teratur.

> di sini publicher dan comsumer di satukan dalam 1 conection untuk menghemat resource , sehingga mirip *gateway*
password : quest
username : quest
<br>
2. `github.com/yalue/onnxruntime_go`` : untuk load file mdel `.onxx`
    install dengan :
    ```bash
    go get github.com/yalue/onnxruntime_go
    ```
3. `onnxruntime.so` : file runtime untuk menjalankan `.onxx` dari ***microsoft*** 
    install, dan di load di envariomentnya yakni file `onnxruntime.so` (ambil yang mana aka)  :
    ```bash
    # untuk linux x86_64 || linux moderen 
    wget https://github.com/microsoft/onnxruntime/releases/download/v1.26.0/onnxruntime-linux-x64-1.26.0.tgz
    
    ```


