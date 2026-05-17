package main

import (
	"fmt"
	ort "github.com/yalue/onnxruntime_go"
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
var YLabel = []string{
    "toxic",
    "severe_toxic",
    "obscene",
    "threat",
    "insult",
    "identity_hate",
}
const pathIndoOnxx = "./onxx/rant_model.onnx"
var ( 
	IndoSession *ort.DynamicAdvancedSession
	InputIndoNames []string
	OuputIndoNames []string
	ErrInfoIndo error
)


func InitIndo() error {
    var err error

    InputIndoNames, OuputIndoNames, err = ContextInputOuput(pathIndoOnxx)
    if err != nil {
        return fmt.Errorf("gagal mendapat input/output: %w", err)
    }

    IndoSession, err = ort.NewDynamicAdvancedSession(
        pathIndoOnxx,
        InputIndoNames,
        OuputIndoNames,
        nil,
    )
    if err != nil {
        return fmt.Errorf("gagal membuat session: %w", err)
    }

    // Destroy dipanggil di main() lewat: defer IndoSession.Destroy()
    return nil
}
