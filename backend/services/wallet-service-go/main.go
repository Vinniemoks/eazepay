package main

import (
    "encoding/json"
    "log"
    "net/http"
)

type Wallet struct {
    ID     string  `json:"id"`
    UserID string  `json:"userId"`
    Balance float64 `json:"balance"`
}

var store = map[string]Wallet{}

func health(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status": "healthy",
        "service": "wallet-service",
    })
}

func createWallet(w http.ResponseWriter, r *http.Request) {
    var input Wallet
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "invalid payload", http.StatusBadRequest)
        return
    }
    store[input.ID] = input
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(input)
}

func listWallets(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    out := []Wallet{}
    for _, v := range store {
        out = append(out, v)
    }
    json.NewEncoder(w).Encode(out)
}

func main() {
    http.HandleFunc("/health", health)
    http.HandleFunc("/api/wallet", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodPost:
            createWallet(w, r)
        case http.MethodGet:
            listWallets(w, r)
        default:
            http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        }
    })

    log.Println("🚀 Wallet Service running on :8003")
    log.Fatal(http.ListenAndServe(":8003", nil))
}