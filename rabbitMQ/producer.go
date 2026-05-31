package rabbitmq

import (
	"context"
	rmq "github.com/rabbitmq/rabbitmq-amqp-go-client/pkg/rabbitmqamqp"
)

// FUNGSI PENGIRIM PESAN (MENGEMBALIKAN RESPONSE)
// 1. Fungsi Kirim/Response Telegram
func (g *RantMessage) SendResponseTelegram(ctx context.Context, data []byte) error {
	// Membungkus []byte ke dalam objek amqp.Message
	msg := rmq.NewMessage(data)

	// Tangkap kedua return value-nya, lalu return error-nya saja
	_, err := g.TelegramResponsePublisher.Publish(ctx, msg)
	return err
}

// 2. Fungsi Kirim/Response Discord
func (g *RantMessage) SendResponseDiscord(ctx context.Context, data []byte) error {
	// Membungkus []byte ke dalam objek amqp.Message
	msg := rmq.NewMessage(data)

	_, err := g.DiscordResponsePublisher.Publish(ctx, msg)
	return err
}

// 3. Fungsi Kirim/Response Web Dashboard
func (g *RantMessage) SendResponseDashboard(ctx context.Context, data []byte) error {
	// Membungkus []byte ke dalam objek amqp.Message
	msg := rmq.NewMessage(data)

	_, err := g.WebDashboardResponsePublisher.Publish(ctx, msg)
	return err
}
