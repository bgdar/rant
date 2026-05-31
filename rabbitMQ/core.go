package rabbitmq

import (
	"context"
	"fmt"

	rmq "github.com/rabbitmq/rabbitmq-amqp-go-client/pkg/rabbitmqamqp"
)

// gunakan utuk

// -  beberpapa pengirim surat ata =u publisher
// -beberapa queuu atau kotak surat
// agar efesient

type RantMessage struct {
	env  *rmq.Environment
	conn *rmq.AmqpConnection

	// Penerima (Consumers)
	TelegramConsumer     *rmq.Consumer
	DiscordConsumer      *rmq.Consumer
	WebDashboardConsumer *rmq.Consumer

	// Pengirim (Publishers)
	TelegramResponsePublisher     *rmq.Publisher
	DiscordResponsePublisher      *rmq.Publisher
	WebDashboardResponsePublisher *rmq.Publisher
}

// gunakan untuk meng umbrela ke type Struc nantik
type TelegramPayload struct {
	ChatID   int64  `json:"chat_id"`
	Text     string `json:"text"`
	Platfrom string `json:"plafrom"`
}

// Konsistensi nama Queue
const (
	// untuk menerima text mentah yang akan di kelola
	queueTelegram  = "queue-telegram"
	queueDiscord   = "queue-discord"
	queueDashboard = "queue-dashboard"

	// untuk response nya , nantik untuk di kirim hasi modellnya
	queueTelegramResponse  = "queue-telegram-response"
	queueDiscordResponse   = "queue-discord-response"
	queueDashboardResponse = "queue-dashboard-response"
)

var queues = []string{
	queueTelegram, queueDiscord, queueDashboard,
	queueTelegramResponse, queueDiscordResponse, queueDashboardResponse,
}

// FUNGSI INISIALISASI
func InitGateway(ctx context.Context, brokerURI string) (*RantMessage, error) {
	env := rmq.NewEnvironment(brokerURI, nil)
	conn, err := env.NewConnection(ctx)
	if err != nil {
		return nil, err
	}

	// ---- Setup Queue & Publisher ----
	// Telegram

	// _, _ = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: queueDashboard})
	// tgResPub, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: queueTelegramResponse}, nil)
	// if err != nil {
	// 	return nil, err
	// }	// Discord
	// _, _ = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: queueDiscord})
	// disResPub, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: queueDiscord}, nil)
	// if err != nil {
	// 	return nil, err
	// }
	// // Dashboard
	// _, _ = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: queueDashboard})
	// wewResPub, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: queueDashboard}, nil)
	// if err != nil {
	// 	return nil, err
	// }

	for _, q := range queues {
		_, err = conn.Management().DeclareQueue(ctx, &rmq.QuorumQueueSpecification{Name: q})
		if err != nil {
			// Jika gagal declare salah satu queue, langsung return error
			_ = conn.Close(ctx)
			_ = env.CloseConnections(ctx)
			return nil, fmt.Errorf("gagal membuat queue %s: %w", q, err)
		}
	}

	// 2. INISIALISASI PUBLISHERS
	tgResPub, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: queueTelegramResponse}, nil)
	if err != nil {
		return nil, err
	}

	disResPub, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: queueDiscordResponse}, nil)
	if err != nil {
		return nil, err
	}

	dashResPub, err := conn.NewPublisher(ctx, &rmq.QueueAddress{Queue: queueDashboardResponse}, nil)
	if err != nil {
		return nil, err
	}

	// 3. INISIALISASI CONSUMERS
	tgCs, err := conn.NewConsumer(ctx, queueTelegram, nil)
	if err != nil {
		return nil, err
	}

	disCs, err := conn.NewConsumer(ctx, queueDiscord, nil)
	if err != nil {
		return nil, err
	}

	dashCs, err := conn.NewConsumer(ctx, queueDashboard, nil)
	if err != nil {
		return nil, err
	}

	return &RantMessage{
		env:  env,
		conn: conn,

		TelegramResponsePublisher:     tgResPub,
		DiscordResponsePublisher:      disResPub,
		WebDashboardResponsePublisher: dashResPub,

		TelegramConsumer:     tgCs,
		DiscordConsumer:      disCs,
		WebDashboardConsumer: dashCs,
	}, nil
}

// FUNGSI CLOSE UNTUK CLEANUP
func (g *RantMessage) Close(ctx context.Context) {
	if g.TelegramResponsePublisher != nil {
		_ = g.TelegramResponsePublisher.Close(ctx)
	}
	if g.DiscordResponsePublisher != nil {
		_ = g.DiscordResponsePublisher.Close(ctx)
	}
	if g.WebDashboardResponsePublisher != nil {
		_ = g.WebDashboardResponsePublisher.Close(ctx)
	}
	if g.env != nil {
		_ = g.env.CloseConnections(ctx)
	}
}
