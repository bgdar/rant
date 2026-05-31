package main

import (
	"fmt"
	"log"
	"rant/service"

	ort "github.com/yalue/onnxruntime_go"
)

// "log"
// "rant/core"

// ort "github.com/yalue/onnxruntime_go"

const pathIndoOnxx = "./onxx/rant_model.onnx"
var ( 
	IndoSession *ort.DynamicAdvancedSession
	InputIndoNames []string
	OuputIndoNames []string
	ErrInfoIndo error
)



// inisialsias untuk model prediction indo
func InitIndo() error {
    
	var err error

    InputIndoNames, OuputIndoNames, err = service.ContextInputOuput(pathIndoOnxx)
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

func InitAceh()  {
}


func main() {

	ort.SetSharedLibraryPath("./onnxruntime-linux-x64-1.26.0/lib/libonnxruntime.so")
	if err := ort.InitializeEnvironment(ort.WithLogLevelWarning()); err != nil {
		log.Print("gagagal inisialsis envarioment : ", err)
	}
	defer ort.DestroyEnvironment()

	if err := InitIndo(); err != nil {
		log.Fatal(err)
	}
	defer IndoSession.Destroy()

	// exampeRabbit1()


	// data , _ := GetData("./dataset/dataset.response.indo.json")

}
