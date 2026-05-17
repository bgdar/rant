package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
)

// Dapatkan data json
func GetDataJson(pathJjson string) ([]ResponseData ,error) {

	var response []ResponseData
	var result  []ResponseData

	jsonFile , err := os.Open(pathJjson)
	if err != nil {
		log.Println("err : ",err)
	}
	defer jsonFile.Close()

	byteValue,_ := io.ReadAll(jsonFile)
	// passing ke strcu dengan umbrela 
 json.Unmarshal(byteValue,&response)

for i:= 0; i < len(response); i++ {

	lst := ResponseData{
		Index: response[i].Index,
		ToxicSpan: response[i].ToxicSpan,
		Category: response[i].Category,
		Labels: response[i].Labels,
		ResponseFront: response[i].ResponseFront,
		ResponseLast: response[i].ResponseLast,
	}

	 result = append(result, lst)
}

return	result, nil
	
}

// nantik gunakan algoritma searchData
// func searchData(ouputToxic *OuputToxic) *OuputToxic {
//
//
//
//
// }

// gabungkan data untuk menghasilkan response model 
func makeResponse(ouputToxic  *OuputToxic , jsonPath string ) (string , error){

	datas ,err := GetDataJson(jsonPath)
	if err != nil {
		log.Println("data gagal di dapat : ",datas)
		return "" , nil 
	}

	// example :  // [0, 0, 1, 0, 0, 0]
	rawLabel := ouputToxic.RawLabel
	// rencanya samaain dengan label yang di data dengan label hasil prediksi

	for _ , data := range datas {
		labelData := data.Labels
		fmt.Println("label data : ",labelData)
		
	}


}
