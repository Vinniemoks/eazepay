# Message Adapter (ISO 20022)

Purpose: Translate internal transaction objects to ISO 20022 messages (pain.001 and pacs.008) for bank and clearing rail integrations.

Endpoints:
- `POST /api/iso/pain001` → returns pain.001 XML string
- `POST /api/iso/pacs008` → returns pacs.008 XML string

This is a scaffold with simplified XML builders. Replace builders with schema-validated implementations for production.