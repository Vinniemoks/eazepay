# Eazepay Ledger Client

A client-side library to independently verify the integrity of your Eazepay transactions against the publicly anchored ledger.

This tool empowers customers and auditors to cryptographically prove that a transaction record has not been tampered with and is part of a specific, time-stamped Merkle root that has been anchored to a public blockchain.

## Features

- **Fetch Merkle Proofs**: Retrieve the necessary cryptographic proof for any transaction ID.
- **Client-Side Verification**: Perform verification entirely on the client-side, ensuring a trustless process.
- **Simple API**: A straightforward interface for fetching proofs and verifying transactions.
- **TypeScript Support**: Fully typed for a better developer experience.

## Installation

```bash
npm install @eazepay/ledger-client axios crypto-js merkletreejs
```

## How It Works

The verification process follows these steps:

1.  **You** provide your original transaction data and its `transactionId`.
2.  The `LedgerVerifier` library calls the Eazepay `ledger-integrity-service` to fetch a **Merkle Proof** for that transaction. This proof contains:
    *   The **Merkle Root** that was anchored to the blockchain.
    *   The **Proof Path** (a set of hashes) needed to connect your transaction to the root.
    *   The **hash of your transaction data** as recorded by Eazepay.
3.  The library **re-hashes your original transaction data** on your machine.
4.  It compares your local hash with the hash received from Eazepay to ensure the data matches.
5.  It uses your local hash, the proof path, and the Merkle root to mathematically reconstruct the root hash.
6.  If the reconstructed root matches the one provided by Eazepay, the verification is **successful**. This proves your transaction is an authentic part of the ledger batch.

## Quick Start Example

Here is a complete example of how to verify a transaction.

```typescript
import { LedgerVerifier, OriginalTransactionData } from '@eazepay/ledger-client';

async function main() {
  // --- Step 1: Setup ---
  // The URL of the Eazepay service that provides proofs.
  const LEDGER_SERVICE_URL = 'http://localhost:8050'; // Use the production URL in a real application.
  const verifier = new LedgerVerifier(LEDGER_SERVICE_URL);

  // --- Step 2: Your Transaction Details ---
  // This is the ID of the transaction you want to verify.
  const transactionIdToVerify = 'tx_1729661580000'; // Replace with a real transaction ID.

  // This is the original data of your transaction.
  // It MUST exactly match the data used when the transaction was created.
  const originalTransaction: OriginalTransactionData = {
    amount: 456.78, // Example amount
    currency: 'KES',
    userId: 'user_78',
  };

  console.log(`Attempting to verify transaction: ${transactionIdToVerify}`);

  try {
    // --- Step 3: Fetch the Merkle Proof ---
    console.log('Fetching Merkle proof from the ledger service...');
    const proofData = await verifier.getMerkleProof(transactionIdToVerify);
    console.log('Proof received. Merkle Root:', proofData.merkleRoot);

    // --- Step 4: Perform Client-Side Verification ---
    console.log('Performing client-side verification...');
    const isVerified = verifier.verifyTransaction(originalTransaction, proofData);

    // --- Step 5: Check the Result ---
    if (isVerified) {
      console.log('✅ SUCCESS: Transaction verification successful!');
      console.log(`This proves that your transaction is part of the ledger batch anchored in block ${proofData.anchoredBlockNumber}.`);
    } else {
      console.error('❌ FAILURE: Transaction verification failed. The record may have been altered or is not part of the ledger.');
    }
  } catch (error) {
    console.error('An error occurred during verification:', error.message);
  }
}

main();
```