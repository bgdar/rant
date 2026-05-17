package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)
func HandleIndoInfo(c *gin.Context)  {
	c.String(http.StatusOK,`
	route : 
	   - /p/ : prediction Modle 
		 - /p/get : dapatkan info ke prediction model model
	`)
}


func HandleGetIndoPrediction(c *gin.Context) {
	c.String(200,"model prediction")

}

func HandlePostIndoPrediction(c *gin.Context)  {
	
}



// Api handle untuk Indonesia 
