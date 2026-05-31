package core

import (
	// "fmt"

)

// ---------- Strcut decalraci ------------
type Labels struct {
	Toxic       int `json:"toxic"`
	SevereToxic int `json:"severe_toxic"`
	Obscene     int `json:"obscene"`
	Threat      int `json:"threat"`
	Insult      int `json:"insult"`
	IdentityHate int `json:"identity_hate"`
}

type OuputToxic struct {
	Text string  
    RawLabel    []int64  // [0, 0, 1, 0, 0, 0]
    AdaToxic    bool     // true jika minimal 1 label aktif

}
type ResponseData struct {
	Index        int      `json:"index"`
	ToxicSpan    string   `json:"toxic_span"`
	Category     string   `json:"category"`
	Labels       Labels   `json:"labels"`
	ResponseFront []string `json:"response_front"`
	ResponseLast  []string `json:"response_last"`
}


// --------------Global Variabel ---------------
var YLabels = []string{
    "toxic",
    "severe_toxic",
    "obscene",
    "threat",
    "insult",
    "identity_hate",
}


