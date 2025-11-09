package com.eazepay.transactionservice.repository;

import com.eazepay.transactionservice.dto.TransactionDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class TransactionRepository {
    private final JdbcTemplate jdbcTemplate;

    public TransactionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<TransactionDTO> MAPPER = (rs, rowNum) -> {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(String.valueOf(rs.getInt("id")));
        dto.setFrom(rs.getString("sender"));
        dto.setTo(rs.getString("receiver"));
        dto.setAmount(rs.getBigDecimal("amount"));
        return dto;
    };

    public TransactionDTO insert(TransactionDTO tx) {
        jdbcTemplate.update(
                "INSERT INTO transactions(sender, receiver, amount) VALUES (?,?,?)",
                tx.getFrom(), tx.getTo(), tx.getAmount() != null ? tx.getAmount() : BigDecimal.ZERO
        );
        // Return last inserted row
        return jdbcTemplate.queryForObject(
                "SELECT id, sender, receiver, amount FROM transactions ORDER BY id DESC LIMIT 1",
                MAPPER
        );
    }

    public List<TransactionDTO> findAll() {
        return jdbcTemplate.query(
                "SELECT id, sender, receiver, amount FROM transactions ORDER BY id DESC",
                MAPPER
        );
    }
}