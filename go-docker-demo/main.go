package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func home(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Hello from Docker!",
	})
}

func main() {

	http.HandleFunc("/", home)

	log.Println("Server running on :8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}