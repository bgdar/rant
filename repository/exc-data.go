package main

import (
	"log"
	"os"
	"path/filepath"
	constans "rant/constants"
	external "rant/repository/external"
)


func main() {
	token := os.Getenv("HF_TOKEN")

	cwd, err := os.Getwd()
	if err != nil { 
		log.Fatalf("Gagal mendapatkan CWD: %v", err)
	}

	// Menggunakan filepath.Join agar path "../data/..." tergabung dengan benar
	pathDataKeyword := filepath.Join(cwd,  "data", "datakeyword")
	pathDataResponse := filepath.Join(cwd,  "data", "dataResponse")
	
	// Perbaikan nama file dan variabel yang tertukar
	pathKeywordAceh := filepath.Join(pathDataKeyword, "data.keyword.aceh.json")
	pathKeywordIndo := filepath.Join(pathDataKeyword, "data.keyword.indo.json")
	pathResponseAceh := filepath.Join(pathDataResponse, "data.response.aceh.json")
	pathResponseIndo := filepath.Join(pathDataResponse, "data.response.indo.json")

	
	if !external.GetDataHunggiFace(token, "aceh", constans.DataKeywordAcehUrl, pathKeywordAceh) {
		log.Printf("[ERROR] Gagal mendapatkan data ke %s", pathKeywordAceh)
	} else {
		log.Printf("[SUCCESS] Berhasil mengunduh %s", pathKeywordAceh)
	}

	if !external.GetDataHunggiFace(token, "indo", constans.DataKeywordIndoUrl, pathKeywordIndo) {
		log.Printf("[ERROR] Gagal mendapatkan data ke %s", pathKeywordIndo)
	} else {
		log.Printf("[SUCCESS] Berhasil mengunduh %s", pathKeywordIndo)
	}

	if !external.GetDataHunggiFace(token, "aceh", constans.DataResponseAcehUrl, pathResponseAceh) {
		log.Printf("[ERROR] Gagal mendapatkan data ke %s", pathResponseAceh)
	} else {
		log.Printf("[SUCCESS] Berhasil mengunduh %s", pathResponseAceh)
	}

	if !external.GetDataHunggiFace(token, "indo", constans.DataResponseIndoUrl, pathResponseIndo) {
		log.Printf("[ERROR] Gagal mendapatkan data ke %s", pathResponseIndo)
	} else {
		log.Printf("[SUCCESS] Berhasil mengunduh %s", pathResponseIndo)
	}
}	
