
#!/bin/bash


if [ -f .env ]; then
  # Membaca dan mengekspor variabel dari .env secara aman
  export $(grep -v '^#' .env | xargs)
else
  echo "Peringatan: File .env tidak ditemukan!"
fi


#
# Datatset -------------------- 
#
echo "Apakah ingin mendownload data? (y/n)"
read -r jawaban

if [[ "$jawaban" =~ ^[Yy]$ ]]; then
    echo "Memulai proses download / update data..."
    # Menjalankan file Go dengan environment variable yang sudah di-load
    go run ./repository/exc-data.go
else
    echo "Proses dibatalkan."
fi

#
# Model -------------------- 
#

echo "Apakah ingin mendownload Model? (y/n)"
read -r jawaban

if [[ "$jawaban" =~ ^[Yy]$ ]]; then
    echo "Memulai proses download / update Model..."
    # Menjalankan file Go dengan environment variable yang sudah di-load
    go run ./repository/exc-model.go
else
    echo "Proses dibatalkan."
fi
