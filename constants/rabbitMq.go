package constans

// RAbbitMQ ------------
// strutc untuk mendpaatkan data dari queue ( clicent )
type PayloadRabbitReceiver struct {
	UserId   int    `json:"user_id"`
	Text     string `json:"text"`
	Platfrom string `json:"platfrom"`
}

// struct untuk mengirim data ke queue  ( clicent )
type PayloadRabbitProducer struct {
	UserId   int    `json:"user_id"`
	Response string `json:"response"`
	IsToxic  bool   `json:"is_toxic"`
	Platfrom string `json:"platfrom"`
}
