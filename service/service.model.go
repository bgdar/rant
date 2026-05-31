package service

import (
	"fmt"
	"log"
	"rant/core"
	"strings"

	ort "github.com/yalue/onnxruntime_go"
)

// dapatkan input dan ouput label , untuk project ini
func ContextInputOuput(pathModel string) (inputNames []string, ouputNames []string, err error) {
	inputs, outputs, err := ort.GetInputOutputInfo(pathModel)
	if err != nil {
		log.Fatal("Gagal membaca info model:", err)
	}
	fmt.Println("=== Input Model ===")
	for _, info := range inputs {
		inputNames = append(inputNames, info.Name)
	}
	fmt.Println("=== Output Model ===")
	for _, info := range outputs {
		ouputNames = append(ouputNames, info.Name)
	}

	return inputNames, ouputNames, nil
}

// prediksi text yang di berikan
// pastikan Ylabel berformat sama
func Predict(session *ort.DynamicAdvancedSession, text string) (*core.OuputToxic, error) {
	jumlahYlabel := int64(len(core.YLabels))
	// -- Input: StringTensor shape [batchSize, 1] --
	inputTensor, err := ort.NewStringTensor(ort.NewShape(1, 1))
	if err != nil {
		return nil, fmt.Errorf("gagal membuat input tensor: %w", err)
	}
	defer inputTensor.Destroy()

	//  1 fix — SetElement DULU, baru debug, baru Run()
	if err := inputTensor.SetElement(0, text); err != nil {
		return nil, fmt.Errorf("gagal set teks: %w", err)
	}
	// Tambahkan ini tepat SETELAH SetElement, SEBELUM Run()
	cek, _ := inputTensor.GetElement(0)
	fmt.Printf(">>> Teks di dalam tensor: %q\n", cek)

	labelTensor, err := ort.NewEmptyTensor[int64](ort.NewShape(1, jumlahYlabel))
	if err != nil {
		return nil, fmt.Errorf("gagal membuat label tensor: %w", err)
	}
	defer labelTensor.Destroy()

	ouputs := []ort.Value{labelTensor, nil}

	if err := session.Run([]ort.Value{inputTensor}, ouputs); err != nil {
		return nil, fmt.Errorf("inferensi gagal: %w", err)
	}
	if ouputs[1] != nil {
		defer ouputs[1].Destroy()
	}
	// Baca hasil label , misalnya :  [0, 0, 1, 0, 0, 0] , berdasarkan YLabel
	rawLabels := labelTensor.GetData()

	return &core.OuputToxic{
		Text:     text,
		RawLabel: append([]int64{}, rawLabels...),
		AdaToxic: rawLabels[0] == 1,
	}, nil

}

// tampilkanHasil mencetak hasil deteksi dengan format yang mudah dibaca
func DebugResult(h *core.OuputToxic) {
	fmt.Println(strings.Repeat("─", 55))
	fmt.Printf("📝 Teks    : %q\n", h.Text)
	fmt.Printf("🔢 Raw     : %v\n", h.RawLabel)
	fmt.Println(strings.Repeat("─", 55))
}



