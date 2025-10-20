package main

import (
	"bufio"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"
)

func loadEnv(filename string) {
	f, err := os.Open(filename)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("wallet-service: unable to read %s: %v", filename, err)
		}
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		if key == "" || value == "" {
			continue
		}

		if _, exists := os.LookupEnv(key); !exists {
			if err := os.Setenv(key, value); err != nil {
				log.Printf("wallet-service: unable to set env %s: %v", key, err)
			}
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("wallet-service: error scanning %s: %v", filename, err)
	}
}

func main() {
	loadEnv(".env")

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8003"
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"status":  "healthy",
			"service": "wallet-service",
		})
	})

	mux.HandleFunc("/api/wallets", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		var wallet Wallet
		if err := readJSON(r, &wallet); err != nil {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}

		if strings.TrimSpace(wallet.ID) == "" {
			writeError(w, http.StatusBadRequest, "id is required")
			return
		}

		walletsMu.Lock()
		wallets[wallet.ID] = wallet
		walletsMu.Unlock()

		writeJSON(w, http.StatusCreated, wallet)
	})

	mux.HandleFunc("/api/wallets/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			writeError(w, http.StatusMethodNotAllowed, "method not allowed")
			return
		}

		id := strings.TrimPrefix(r.URL.Path, "/api/wallets/")
		if id == "" {
			writeError(w, http.StatusBadRequest, "wallet id is required")
			return
		}

		walletsMu.RLock()
		wallet, exists := wallets[id]
		walletsMu.RUnlock()

		if !exists {
			writeError(w, http.StatusNotFound, "Wallet not found")
			return
		}

		writeJSON(w, http.StatusOK, wallet)
	})

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	log.Printf("wallet-service: listening on port %s", port)

	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("wallet-service: failed to start server: %v", err)
	}
}
