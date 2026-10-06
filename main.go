package main

import (
	"log"
	"os"
	"path/filepath"

	ort "github.com/yalue/onnxruntime_go"
)

// "log"
// "rant/core"

// ort "github.com/yalue/onnxruntime_go"



var (
	IndoSession    *ort.DynamicAdvancedSession
	InputIndoNames []string
	OuputIndoNames []string
	ErrInfoIndo    error
)

var (
	AcehSession    *ort.DynamicAdvancedSession
	InputAcehNames []string
	OuputAcehNames []string
	ErrInfoAceh    error
)


func main() {

	cwd, err := os.Getwd()
	if err != nil { 
		log.Fatalf("Gagal mendapatkan CWD: %v", err)
	}

	 pathModelTextIndoOnxx :=  filepath.Join(cwd,"onxx","text","rant-text-indo-svm.onnx")
	 // pathModelTextAcehOnxx := filepath.Join(cwd , "onxx","text","rant-text-aceh-svm.onnx")

	ort.SetSharedLibraryPath("./onnxruntime-linux-x64-1.26.0/lib/libonnxruntime.so")
	if err := ort.InitializeEnvironment(ort.WithLogLevelWarning()); err != nil {
		log.Print("gagagal inisialsis envarioment : ", err)
	}
	defer ort.DestroyEnvironment()

	if err := InitIndo(pathModelTextIndoOnxx); err != nil {
		log.Fatal(err)
	}
	defer IndoSession.Destroy()

	// Rabbit Tester
	// exampeRabbit(IndoSession)
	exampleModelIndo()

	// data , _ := GetData("./dataset/dataset.response.indo.json")

}
