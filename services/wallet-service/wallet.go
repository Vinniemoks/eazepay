package main

type Wallet struct {
	ID      string  `json:"id"`
	Owner   string  `json:"owner"`
	Balance float64 `json:"balance"`
	Currency string `json:"currency"`
}
