package rabbitmq

import (
	"context"
	"encoding/json"
	"log"
	constans "rant/constants"

	rmq "github.com/rabbitmq/rabbitmq-amqp-go-client/pkg/rabbitmqamqp"
)

// FUNGSI PENGIRIM PESAN (MENGEMBALIKAN RESPONSE)
// Fungsi Kirim/Response Telegram
func (g *RantMessage) SendResponseTelegram(ctx context.Context, data *constans.PayloadRabbitProducer) error {

	toByte, err := json.Marshal(data)
	if err != nil {
		log.Print("gagal merubah ke byte \n")
	}
	// Membungkus []byte ke dalam objek amqp.Message
	msg := rmq.NewMessage(toByte)

	// Tangkap kedua return value-nya, lalu return error-nya saja
	_, err = g.TelegramResponsePublisher.Publish(ctx, msg)
	return err
}

// Fungsi Kirim/Response Discord
func (g *RantMessage) SendResponseDiscord(ctx context.Context, data *constans.PayloadRabbitProducer) error {
	toByte, err := json.Marshal(data)
	if err != nil {
		log.Print("gagal merubah ke byte \n")
	}

	// Membungkus []byte ke dalam objek amqp.Message
	msg := rmq.NewMessage(toByte)

	_, err = g.DiscordResponsePublisher.Publish(ctx, msg)
	return err
}

// Fungsi Kirim/Response Web Dashboard
func (g *RantMessage) SendResponseDashboard(ctx context.Context, data *constans.PayloadRabbitProducer) error {
	// Membungkus []byte ke dalam objek amqp.Message
	// msg := rmq.NewMessage([]byte(data)) // string
	toByte, err := json.Marshal(data)
	if err != nil {
		log.Print("gagal merubah ke byte Dashboard \n")
	}
	msg := rmq.NewMessage(toByte)

	_, err = g.DiscordResponsePublisher.Publish(ctx, msg)
	return err
}

// Fungsi Kirim/Response WhatsApp
func (g *RantMessage) SendResponseWhatsApp(ctx context.Context, data *constans.PayloadRabbitProducer) error {
	toByte, err := json.Marshal(data)
	if err != nil {
		log.Print("gagal merubah ke byte \n")
	}

	// Membungkus []byte ke dalam objek amqp.Message
	msg := rmq.NewMessage(toByte)

	_, err = g.DiscordResponsePublisher.Publish(ctx, msg)
	return err
}
