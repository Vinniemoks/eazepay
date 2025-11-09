package com.eazepay.transactionservice.controller;

import com.eazepay.transactionservice.dto.TransactionDTO;
import com.eazepay.transactionservice.repository.TransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionRepository repository;

    public TransactionController(TransactionRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> create(@RequestBody TransactionDTO tx) {
        TransactionDTO saved = repository.insert(tx);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping
    public List<TransactionDTO> list() {
        return repository.findAll();
    }
}