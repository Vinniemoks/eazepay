package main

import (
	"encoding/json"
	"net/http"
	"sync"
)

type Wallet struct {
	ID      string  `json:"id"`
	Balance float64 `json:"balance"`
}

var (
	wallets   = make(map[string]Wallet)
	walletsMu sync.RWMutex
)

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func readJSON(r *http.Request, dest interface{}) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dest)
}
