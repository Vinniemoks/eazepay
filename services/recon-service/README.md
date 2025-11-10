# Reconciliation Service

Purpose: Reconcile internal ledger entries against external statements (e.g., ISO 20022 camt.053) and produce match/mismatch reports.

Endpoint:
- `POST /api/recon/run` → accepts `statementXml` and `ledger` entries, returns summary and mismatches.

This is a scaffold with simplified parsing. Replace regex-based parsing with a proper XML parser and schema validation for production.