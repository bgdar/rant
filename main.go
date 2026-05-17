package main

import (

"log"
"rant/controller"

"github.com/gin-gonic/gin"
ort "github.com/yalue/onnxruntime_go"

)

func main()  {

	route := gin.Default()
	ort.SetSharedLibraryPath("./onnxruntime-linux-x64-1.26.0/lib/libonnxruntime.so")
	if err := ort.InitializeEnvironment(ort.WithLogLevelWarning()); err != nil {
		log.Print("gagagal inisialsis envarioment : ",err)
	}
	defer ort.DestroyEnvironment()

	 if err := InitIndo(); err != nil {
	       log.Fatal(err)
	   }
	   defer IndoSession.Destroy() 
	example1()



	//---------------- Api Section ---------------
	indoApi := route.Group("/indo")
	{ 
		indoApi.GET("/info",controller.HandleIndoInfo)
		indoApi.POST("/predict",controller.HandlePostIndoPrediction)

	}


	// data , _ := GetData("./dataset/dataset.response.indo.json")

	
}






