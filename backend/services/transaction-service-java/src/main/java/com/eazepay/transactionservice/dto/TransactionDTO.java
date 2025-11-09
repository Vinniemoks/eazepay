package com.eazepay.transactionservice.dto;

public class TransactionDTO {
    private String id;
    private String from;
    private String to;
    private Double amount;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
}