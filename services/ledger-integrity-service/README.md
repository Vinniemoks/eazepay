# Ledger Integrity Service

Verifies tamper-evident ledger chains and computes batch Merkle roots. Provides a stub endpoint to create anchor records for later public-chain anchoring.

## Endpoints
- `GET /health` — service status and anchoring metrics.
  - `status`: `ok` if the service is running.
  - `latestMerkleRoot`: The last Merkle root computed via the `/integrity/verify` endpoint.
  - `lastAnchorRun`: Status of the last-run hourly anchor job.
  - `lastSuccessfulAnchor`: Details of the last successful on-chain anchor.
  - `anchorLagMs`: The time difference in milliseconds between when the last successful anchor block was mined and the current time.
- `POST /integrity/verify` — body `{ entries: LedgerEntry[] }` returns `{ validChain, merkleRoot, lastHash }`
- `POST /integrity/anchor` — body `{ rootHash: string }`
  - Stub mode (default): returns anchor record with timestamp and `method=pending_external_anchor`
  - Ethereum mode (if env configured): submits a Sepolia transaction with `data=<rootHash>` and returns `{ txId, network, status }`

`LedgerEntry`:
```json
{
  "id": "tx-1",
  "prevHash": "<hex>",
  "data": { "amount": 100, "currency": "EUR" },
  "hash": "<optional expected hex>"
}
```

## Local Run
```bash
cd services/ledger-integrity-service
npm install
npm run dev
```

### Enable Ethereum Anchoring (Sepolia)

Set environment variables (in Docker or local `.env`):
```env
ANCHOR_PROVIDER=ethereum
ETH_NETWORK=sepolia
ETH_RPC_URL=https://sepolia.infura.io/v3/<project-id>
ETH_PRIVATE_KEY=0x<your-testnet-private-key>
```

When enabled, `POST /integrity/anchor` will send a transaction with the `rootHash` as UTF-8 `data` to your own address and return the `txId`. Ensure your wallet has test ETH.

### Automatic Anchoring (Cron Job)

When `ANCHOR_PROVIDER` is set to `ethereum`, a cron job runs hourly to automatically anchor the `latestMerkleRoot` (from the last `/integrity/verify` call) to the blockchain. This ensures that ledger integrity is periodically secured without manual intervention.

## Docker
```bash
docker build -t ledger-integrity-service .
docker run -p 8013:8013 ledger-integrity-service
```