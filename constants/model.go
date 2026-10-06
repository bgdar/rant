package constans

// ---------- Strcut decalraci ------------
type Labels struct {
	Toxic        int64 `json:"toxic"`
	SevereToxic  int64 `json:"severe_toxic"`
	Obscene      int64 `json:"obscene"`
	Threat       int64 `json:"threat"`
	Insult       int64 `json:"insult"`
	IdentityHate int64 `json:"identity_hate"`
}

// Model ------------
// akan di gunakan di Model , ini adalah
type OuputToxic struct {
	Text      string
	RawLabel  []int64 // [0, 0, 1, 0, 0, 0]
	AdaToxic  bool    // true jika minimal 1 label aktif
	InputText string  // text yang di input
}
type ResponseData struct {
	Index         int      `json:"index"`
	ToxicSpan     string   `json:"toxic_span"`
	Category      string   `json:"category"`
	Labels        Labels   `json:"labels"`
	ResponseFront []string `json:"response_front"`
	ResponseLast  []string `json:"response_last"`
}

type KeywordData struct {
	Name     string   `json:"name"`
	Level    string   `json:"level"`
	Severity float64  `json:"severity"`
	Value    []string `json:"value"`
}

type KeywordMatch struct {
	Word     string
	Severity float64
	Level    string
	Group    string
}
