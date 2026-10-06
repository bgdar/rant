package data

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"rant/constants"
)

// Dapatkan data json ke fotmat go struct
func GetDataResJson(pathJjson string) ([]constans.ResponseData, error) {

	var response []constans.ResponseData
	var result []constans.ResponseData

	jsonFile, err := os.Open(pathJjson)
	if err != nil {
		log.Println("err : ", err)
	}
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)
	// passing ke strcu dengan umbrela
	json.Unmarshal(byteValue, &response)

	for i := 0; i < len(response); i++ {

		lst := constans.ResponseData{
			Index:         response[i].Index,
			ToxicSpan:     response[i].ToxicSpan,
			Category:      response[i].Category,
			Labels:        response[i].Labels,
			ResponseFront: response[i].ResponseFront,
			ResponseLast:  response[i].ResponseLast,
		}

		result = append(result, lst)
	}

	return result, nil

}

// // Konversi rawLabel [6]int64 → Labels struct
func toVec(raw []int64) constans.Labels {
	return constans.Labels{
		Toxic:        raw[0],
		SevereToxic:  raw[1],
		Obscene:      raw[2],
		Threat:       raw[3],
		Insult:       raw[4],
		IdentityHate: raw[5],
	}
}

func GetDataKeyJson(path string) ([]constans.KeywordData, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var data []constans.KeywordData
	if err := json.Unmarshal(file, &data); err != nil {
		return nil, err
	}
	return data, nil
}

// Cari ResponseData yang labelnya paling dekat dengan prediksi SVM
// menggunakan Weighted Hamming Distance
func searchKeyword(inputText string, keywords []constans.KeywordData) (constans.KeywordMatch, bool) {
	lower := strings.ToLower(inputText)

	// Cari keyword terpanjang dulu (greedy match)
	// supaya "anjing banget" tidak hanya match "anjing"
	best := constans.KeywordMatch{}
	found := false

	for _, group := range keywords {
		for _, word := range group.Value {
			if strings.Contains(lower, strings.ToLower(word)) {
				// Pilih yang severity-nya lebih tinggi jika ada beberapa match
				if !found || group.Severity > best.Severity {
					best = constans.KeywordMatch{
						Word:     word,
						Severity: group.Severity,
						Level:    group.Level,
						Group:    group.Name,
					}
					found = true
				}
			}
		}
	}
	return best, found
}

// HYBRID ALGORIDMA
// Filter Tier 1 (label berbahaya wajib cocok)
func filterTier1(pred constans.Labels, dataset []constans.ResponseData) []constans.ResponseData {
	var pool []constans.ResponseData
	for _, d := range dataset {
		lbl := d.Labels
		// threat, severe_toxic, identity_hate HARUS cocok
		if lbl.Threat == pred.Threat &&
			lbl.SevereToxic == pred.SevereToxic &&
			lbl.IdentityHate == pred.IdentityHate {
			pool = append(pool, d)
		}
	}
	return pool
}

// Narrow dengan Tier 2 (sebaiknya cocok)
func filterTier2(pred constans.Labels, pool []constans.ResponseData) []constans.ResponseData {
	var narrow []constans.ResponseData
	for _, d := range pool {
		lbl := d.Labels
		if lbl.Obscene == pred.Obscene &&
			lbl.Insult == pred.Insult {
			narrow = append(narrow, d)
		}
	}
	return narrow
}

func findPool(pred constans.Labels, dataset []constans.ResponseData) []constans.ResponseData {

	// Coba paling spesifik dulu
	pool := filterTier1(pred, dataset)
	narrow := filterTier2(pred, pool)

	if len(narrow) > 0 {
		log.Printf("[findPool] Tier1+Tier2: %d entries", len(narrow))
		return narrow
	}

	if len(pool) > 0 {
		log.Printf("[findPool] Tier1 fallback: %d entries", len(pool))
		return pool
	}

	// Last resort — semua yang toxic=1
	var fallback []constans.ResponseData
	for _, d := range dataset {
		if d.Labels.Toxic == 1 {
			fallback = append(fallback, d)
		}
	}
	log.Printf("[findPool] last resort: %d entries", len(fallback))
	return fallback
}

// PICK RESPONSE BY SEVERITY
func pickBySeverity(options []string, severity float64) string {
	if len(options) == 0 {
		return ""
	}
	n := len(options)

	// severity rendah  → index awal  (soft)
	// severity tinggi  → index akhir (tegas)
	idx := int(severity * float64(n-1))
	// if idx < 0 {
	// 	idx = 0
	// }
	idx = int(math.Max(0, float64(idx))) // gnti in if

	if idx >= n {
		idx = n - 1
	}

	// randomness ±1
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	offset := rng.Intn(3) - 1
	idx = max(0, min(n-1, idx+offset))

	return options[idx]
}

// buat response ke string
// ouputToxic : data struct ouput
// responseType : mennentukan  jenis response apakah  : "indo" , "aceh"
func MakeResponse(outputToxic *constans.OuputToxic, responseType string) (string, error) {

	cwd, err := os.Getwd()
	if err != nil {
		log.Println("gagal mendapatakn cwd")
	}

	var pathRes string
	var pathkey string

	switch responseType {
	case "indo":
		// jsonResPath = "../dataset/dataset.response.indo.json"
		// jsonKeyPath = "../datakeyword/data_keyword_indo_updated.json"
		pathRes = filepath.Join(cwd, "dataset", "dataset.response.indo.json")
		pathkey = filepath.Join(cwd, "datakeyword", "data.keyword.indo.json")
		//
		// 	case "aceh":
		// 		jsonResPath = "../dataset/dataset.response.aceh.json"
		// jsonKeyPath = "../datakeyword/data_keyword_indo_updated.json"
	}

	dataRes, _ := GetDataResJson(pathRes)
	dataKey, _ := GetDataKeyJson(pathkey)

	pred := toVec(outputToxic.RawLabel)

	// Step 2cari keyword dari input
	keyMatch, keyFound := searchKeyword(outputToxic.InputText, dataKey)

	severity := 0.5
	if keyFound {
		severity = keyMatch.Severity
		log.Printf("[keyword] '%s' group=%s severity=%.2f",
			keyMatch.Word, keyMatch.Group, severity)
	}

	// cari pool response
	pool := findPool(pred, dataRes)
	if len(pool) == 0 {
		return "Mohon gunakan bahasa yang lebih sopan.", nil
	}

	//random pick dari pool
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	entry := pool[rng.Intn(len(pool))]

	//  pilih front + last berdasarkan severity
	front := pickBySeverity(entry.ResponseFront, severity)
	last := pickBySeverity(entry.ResponseLast, severity)

	//  keyword: dari input atau fallback ke toxic_span
	toxicWord := entry.ToxicSpan
	if keyFound {
		toxicWord = keyMatch.Word
	}

	// Step 7 — gabungkan
	return fmt.Sprintf("%s %s %s", front, toxicWord, last), nil
}

// nantik gunakan algoritma searchData
// func searchEqualLabel(ouputToxic *OuputToxic)  bool {
//
// }

// cari kata kata yang cocok dari daftar kata kata kasar , untuk menjadi nilai tegah
// func  searchWordRant(word string) string  {

// }
