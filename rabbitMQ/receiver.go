package rabbitmq

import (
	"context"
	"errors"
	"log"

	rmq "github.com/rabbitmq/rabbitmq-amqp-go-client/pkg/rabbitmqamqp"
)

// yang mendegarkan pesan yang memintak untuk di jalakna model

// meneriman pesan dari telegram
// 4. FUNGSI PENERIMA PESAN (MENDENGARKAN)
// Menggunakan Callback agar fleksibel saat pesan masuk dan diproses oleh model AI/Predictor kamu
func (g *RantMessage) StartListening(ctx context.Context, callbackPredict func(platform string, body string)) {
	// Jalankan masing-masing consumer di dalam goroutine terpisah agar tidak saling blocking!

	// Consumer Telegram
	go g.listenLoop(ctx, g.TelegramConsumer, "telegram", callbackPredict)

	// Consumer Discord
	go g.listenLoop(ctx, g.DiscordConsumer, "discord", callbackPredict)

	// Consumer Web Dashboard
	go g.listenLoop(ctx, g.WebDashboardConsumer, "dashboard", callbackPredict)
}

// Helper loop agar tidak menulis kode yang sama berulang-ulang
func (g *RantMessage) listenLoop(ctx context.Context, consumer *rmq.Consumer, platform string, callback func(string, string)) {
	log.Printf("Starting consumer loop for %s...", platform)
	for {
		select {
		case <-ctx.Done():
			log.Printf("Stopping consumer for %s (Context Canceled)", platform)
			return
		default:
			delivery, err := consumer.Receive(ctx)
			if err != nil {
				if errors.Is(err, context.Canceled) {
					return
				}
				log.Printf("[%s] Error receiving message: %v", platform, err)
				continue
			}

			msg := delivery.Message()
			var body string
			if len(msg.Data) > 0 {
			
				for i , data := range msg.Data {
					log.Println("data ",i,":",data)
				}

				body = string(msg.Data[0]) 			}

			log.Printf("[%s] Received: %s", platform, body)

			// Jalankan fungsi model/predict via callback
			callback(platform, body)

			// Acknowledge bahwa pesan sukses diproses
			if err := delivery.Accept(ctx); err != nil {
				log.Printf("[%s] Failed to accept message: %v", platform, err)
			}
		}
	}
}
