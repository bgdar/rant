package main

import (
	"context"
	"log"
	rabbitmq "rant/rabbitMQ"
	"rant/service"
)

func exampleModel1() {

	text := []string{
		"anjing nya lucu sekali",          // konteks positif tapi ada kata kasar
		"hei kamu bodoh sekali",           // kemungkinan insult
		"hari ini cuaca sangat cerah",     // bersih
		"dasar sampah kamu tidak berguna", // kemungkinan toxic + insult}
	}

	for _, text := range text {
		result, err := service.Predict(IndoSession, text)
		if err != nil {

			log.Printf("gagal prediski [%q] : %v \n", text, err)
			continue
		}
		service.DebugResult(result)

	}

}

func exampeRabbit1() {

	ctx := context.Background()
	const brokerURI = "amqp://guest:guest@localhost:5672/"
	rantMessage, err := rabbitmq.InitGateway(ctx, brokerURI)
	if err != nil {
		log.Fatal("err", err)
	}
	defer rantMessage.Close(ctx)

	rantMessage.StartListening(ctx, func(platform, body string) {
		log.Println("data : ", platform, ":", body)

		switch platform {
		case "telegram":
			rantMessage.SendResponseTelegram(ctx, []byte("hasil prediksi untuk telegram "))

		case "dashboard" : 
			rantMessage.SendResponseDashboard(ctx , []byte("hasil prediksi untk dashboard "))

		case "discord" :
			rantMessage.SendResponseDiscord(ctx,[]byte("Data predict untuk discord"))



		}
	})
	// TAMBAHKAN BARIS INI DI PALING BAWAH
	select {} // Menahan aplikasi utama agar tidak exit selamanya
}
