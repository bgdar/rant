package core

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

// Dapatkan data json ke fotmat go struct
func GetDataJson(pathJjson string) ([]ResponseData, error) {

	var response []ResponseData
	var result []ResponseData

	jsonFile, err := os.Open(pathJjson)
	if err != nil {
		log.Println("err : ", err)
	}
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)
	// passing ke strcu dengan umbrela
	json.Unmarshal(byteValue, &response)

	for i := 0; i < len(response); i++ {

		lst := ResponseData{
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

// nantik gunakan algoritma searchData
// func searchEqualLabel(ouputToxic *OuputToxic)  bool {
//
// }

// cari kata kata yang cocok dari daftar kata kata kasar , untuk menjadi nilai tegah
// func  searchWordRant(word string) string  {

// }

// gabungkan data untuk menghasilkan response model
func MakeResponse(ouputToxic *OuputToxic, responseType string) (string, error) {

	jsonPath := ""

	switch responseType {
	case "indo":
		jsonPath = "../dataset/dataset.response.indo.json"

	case "aceh":
		jsonPath = "../dataset/dataset.response.aceh.json"
	}

	datas, err := GetDataJson(jsonPath)
	if err != nil {
		log.Println("data gagal di dapat : ", datas)
		return "", nil
	}

	// example result rawLabel :  // [0, 0, 1, 0, 0, 0]
	// rawLabel := ouputToxic.RawLabel
	// rencanya samaain dengan label yang di data dengan label hasil prediksi

	for _, data := range datas {
		labelData := data.Labels
		fmt.Println("label data : ", labelData)

		// ubah cara pengecekan anntik
		// if labelData == rawLabel {
		//
		// 	responseFront := data.ResponseFront
		// 	responseLast := data.ResponseLast
		//
		// 	// toxicText :=data.ToxicSpan
		// 	// toxicWord := searchWordRant(toxicText)
		//
		// 	// random niassis nantik
		// 	// return fmt.Sprintf("%s %s  %s", responseFront[0].toxicWord ,responseLast[0] ), nil
		// 	return fmt.Sprintf("%s  %s", responseFront[0], responseLast[0]), nil
		// }

	}

	return "", nil

}
