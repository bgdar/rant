package main

//
// Semau declarasi Function file di sini  dan main tinggal panggil
//


import (
	"fmt"
	"rant/service/model"

	ort "github.com/yalue/onnxruntime_go"
)

// inisialsias untuk model prediction indo
func InitIndo(pathModelTextIndoOnxx string) error {

	var err error

	InputIndoNames, OuputIndoNames, err = model.ContextInputOuput(pathModelTextIndoOnxx)
	if err != nil {
		return fmt.Errorf("gagal mendapat input/output: %w", err)
	}

	IndoSession, err = ort.NewDynamicAdvancedSession(
		pathModelTextIndoOnxx,
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

func InitAceh(pathModelTextAcehOnxx string) error {

	InputIndoNames, OuputIndoNames, err := model.ContextInputOuput(pathModelTextAcehOnxx)
	if err != nil {
		return fmt.Errorf("gagal mendapat input/output: %w", err)
	}

	IndoSession, err = ort.NewDynamicAdvancedSession(
		pathModelTextAcehOnxx,
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

// anntik aja 
func InitImgPrediction() {

}


