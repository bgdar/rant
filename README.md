<h1 align="center">Rant Model Api </h1>



### Tech 
1. `gin` : paket utama untuk menjalana web server 
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



