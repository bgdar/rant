package main

import (
	"context"
	"encoding/json"
	"log"
	constans "rant/constants"
	rabbitmq "rant/rabbitMQ"
	serviceData "rant/service/data"
	serviceModel "rant/service/model"

	ort "github.com/yalue/onnxruntime_go"
)

func exampleModelIndo() {

	text := []string{
		"anjing nya lucu sekali",          // konteks positif tapi ada kata kasar
		"hei kamu bodoh sekali",           // kemungkinan insult
		"hari ini cuaca sangat cerah",     // bersih
		"dasar sampah kamu tidak berguna", // kemungkinan toxic + insult}
	}

	for _, text := range text {
		result, err := serviceModel.Predict(IndoSession, text)
		if err != nil {

			log.Printf("gagal prediski [%q] : %v \n", text, err)
			continue
		}
		serviceModel.DebugResult(result)

	}
}

// funciton untuk membuat reponse text
func exampleMakeResponseText() {

	// Simulasi output dari model SVM Python
	// RawLabel: [toxic, severe_toxic, obscene, threat, insult, identity_hate]

	// Contoh 1 — insult biasa
	output1 := &constans.OuputToxic{
		RawLabel:  []int64{1, 0, 0, 0, 1, 0},
		InputText: "kamu goblok banget sih",
		AdaToxic:  true,
	}

	// Contoh 2 — ancaman
	output2 := &constans.OuputToxic{
		RawLabel:  []int64{1, 1, 0, 1, 0, 0},
		InputText: "aku akan hajar kamu nanti",
		AdaToxic:  true,
	}

	// Contoh 3 — obscene + insult
	output3 := &constans.OuputToxic{
		RawLabel:  []int64{1, 0, 1, 0, 1, 0},
		InputText: "anjing lo bodoh banget",
		AdaToxic:  true,
	}

	testCases := []*constans.OuputToxic{output1, output2, output3}

	for i, tc := range testCases {
		resp, err := serviceData.MakeResponse(tc, "indo")
		if err != nil {
			log.Printf("error case %d: %v", i+1, err)
			continue
		}
		log.Printf("\n[Case %d]\n", i+1)
		log.Printf("  Input  : %s\n", tc.InputText)
		log.Printf("  Label  : %v\n", tc.RawLabel)
		log.Printf("  Output : %s\n", resp)
	}
}

// gabung : prediction + MakeResponse \n, untuk hasil akhir
func exampleHasilPredictionIndo() {
	text := []string{
		"anjing nya lucu sekali",          // konteks positif tapi ada kata kasar
		"hei kamu bodoh sekali",           // kemungkinan insult
		"hari ini cuaca sangat cerah",     // bersih
		"dasar sampah kamu tidak berguna", // kemungkinan toxic + insult}
	}

	for i, text := range text {
		resultPre, err := serviceModel.Predict(IndoSession, text)
		if err != nil {
			log.Printf("gagal prediski [%q] : %v \n", text, err)
			continue
		}
		serviceModel.DebugResult(resultPre)

		log.Panicln("Buat Response : ")

		lastResult, err := serviceData.MakeResponse(resultPre, "indo")
		if err != nil {
			log.Printf("error case %d: %v", i+1, err)
			continue
		}

		log.Println("Hasil akhir : ", lastResult)

	}

}

// terima dan kirim ulnag respponse
func exampeRabbit(session *ort.DynamicAdvancedSession) {

	ctx := context.Background()
	const brokerURI = "amqp://guest:guest@localhost:5672/"
	rantMessage, err := rabbitmq.InitGateway(ctx, brokerURI)
	if err != nil {
		log.Fatal("err", err)
	}
	defer rantMessage.Close(ctx)

	rantMessage.StartListening(ctx, func(platform, body string) {

		// kurasa ini bisa jadi poblem jiak hany di binding ke 1 fler aua
		var clientReceiver constans.PayloadRabbitReceiver

		err := json.Unmarshal([]byte(body), &clientReceiver)
		if err != nil {
			log.Println("gagal parsing data ")
		}

		log.Println("data : ", platform, ":", clientReceiver.Text, "plasfrom ", clientReceiver.Platfrom)

		switch platform {
		case "telegram":

			go func() {
				result, err := serviceModel.Predict(session, clientReceiver.Text)
				if err != nil {
				}
				responsetext, err := serviceData.MakeResponse(result, "indo") // semdtara
				if err != nil {
				}

				payload := constans.PayloadRabbitProducer{
					UserId:   clientReceiver.UserId,
					Response: responsetext,
				}

				rantMessage.SendResponseTelegram(ctx, &payload)

			}()

			// nantik aja di ubah
		case "dashboard":
			go func() {
				result, err := serviceModel.Predict(session, clientReceiver.Text)
				if err != nil {
				}
				responsetext, err := serviceData.MakeResponse(result, "indo") // semdtara
				if err != nil {
				}

				payload := constans.PayloadRabbitProducer{
					UserId:   clientReceiver.UserId,
					Response: responsetext,
				}

				rantMessage.SendResponseDashboard(ctx, &payload)

			}()
			// rantMessage.SendResponseDashboard(ctx, "hasil prediksi untk dashboard ")

		case "discord":
	go func() {
				result, err := serviceModel.Predict(session, clientReceiver.Text)
				if err != nil {
				}
				responsetext, err := serviceData.MakeResponse(result, "indo") // semdtara
				if err != nil {
				}

				payload := constans.PayloadRabbitProducer{
					UserId:   clientReceiver.UserId,
					Response: responsetext,
				}

				rantMessage.SendResponseDashboard(ctx, &payload)

			}()
		}
	})
	// TAMBAHKAN BARIS INI DI PALING BAWAH
	select {} // Menahan aplikasi utama agar tidak exit selamanya
}


