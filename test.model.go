package main

import "log"

func example1()  {

	text := []string{
		     "anjing nya lucu sekali",          // konteks positif tapi ada kata kasar
        "hei kamu bodoh sekali",           // kemungkinan insult
        "hari ini cuaca sangat cerah",     // bersih
        "dasar sampah kamu tidak berguna", // kemungkinan toxic + insult}
	}

	for _ , text := range text{
		result , err := Predict(IndoSession,text)
		if err != nil { 

			log.Printf("gagal prediski [%q] : %v \n",text , err)
		continue
		}
		TampilkanHasil(result)

	}


}
