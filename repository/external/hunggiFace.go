package repository

import (
	"fmt"
	"io"
	"net/http"
	"os"
)

// dapatkan data dari hunggiface , untuk update data keyword dan dataset respose
// filter ke data response \n
// urlPath : path ke file hunggiface \n
// pathSave : path di mana data di simpan \n
func GetDataHunggiFace(token string, bhs string, urlPath string, pathSave string) bool {

	if token == "" {
		fmt.Println("butuh token ")
		return false
	}

	req, err := http.NewRequest("GET", urlPath, nil)
	if err != nil {
		fmt.Printf("Gagal membuat request: %v\n", err)
		return false
	}

	req.Header.Set("Authorization", "Bearer "+token)

	// excecusi request untuk mendapatkan data file
	client := &http.Client{}
	response, err := client.Do(req)
	if err != nil {
		fmt.Printf("Gagal mengunduh data: %v\n", err)
		return false
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		fmt.Printf("Error: Server merespons dengan status %s\n", response.Status)
		return false
	}
	// simpan atau buat baru jika sudah ada
	out, err := os.Create(pathSave)
	if err != nil {
		fmt.Printf("Gagal membuat file lokal: %v\n", err)
		return false
	}
	defer out.Close()

	_, err = io.Copy(out, response.Body)
	if err != nil {
		fmt.Printf("Gagal menulis data ke file: %v\n", err)
		return false
	}

	return true

}
