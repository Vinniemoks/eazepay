package main

import (
	"bufio"
<<<<<<< HEAD
	"encoding/json"
=======
>>>>>>> codex/identify-missing-files-tghd01
	"errors"
	"log"
	"net/http"
	"os"
<<<<<<< HEAD
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type Wallet struct {
	ID      string  `json:"id"`
	Balance float64 `json:"balance"`
	UserID  string  `json:"user_id"`
}

var (
	wallets   = make(map[string]Wallet)
	walletsMu sync.RWMutex
)

// loadEnv loads environment variables from a file
// Fixed G304: Added filepath.Clean to prevent directory traversal attacks
func loadEnv(filename string) {
	// Sanitize the filename to prevent path traversal
	cleanPath := filepath.Clean(filename)

	// Only allow .env files in the current directory
	if !strings.HasPrefix(cleanPath, ".env") {
		log.Printf("wallet-service: invalid env file name: %s", filename)
		return
	}

	// #nosec G304 - File path is sanitized above
	f, err := os.Open(cleanPath)
	if err != nil {
		if !os.IsNotExist(err) {
			log.Printf("wallet-service: unable to read %s: %v", filename, err)
		}
		return
	}
	defer f.Close()

=======
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

>>>>>>> codex/identify-missing-files-tghd01
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
<<<<<<< HEAD

// writeJSON writes JSON response
// Fixed G104: Now handles encoding errors
func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	// Handle encoding errors
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("wallet-service: error encoding JSON response: %v", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func readJSON(r *http.Request, v interface{}) error {
	return json.NewDecoder(r.Body).Decode(v)
}
=======
>>>>>>> codex/identify-missing-files-tghd01

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

<<<<<<< HEAD
	// Fixed G112: Added ReadHeaderTimeout to prevent Slowloris attacks
	server := &http.Server{
		Addr:              ":" + port,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1 MB
=======
	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
>>>>>>> codex/identify-missing-files-tghd01
	}

	log.Printf("wallet-service: listening on port %s", port)

	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("wallet-service: failed to start server: %v", err)
	}
}
