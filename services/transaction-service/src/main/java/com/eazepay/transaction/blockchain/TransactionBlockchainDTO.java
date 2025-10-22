package com.eazepay.transaction.blockchain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for sending transaction data to blockchain
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionBlockchainDTO {
    
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("amount")
    private Double amount;
    
    @JsonProperty("currency")
    private String currency;
    
    @JsonProperty("fromAccount")
    private String fromAccount;
    
    @JsonProperty("toAccount")
    private String toAccount;
    
    @JsonProperty("timestamp")
    private String timestamp;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
}
