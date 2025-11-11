# @eazepay/crypto-utils

A shared library for advanced cryptographic operations, including post-quantum hybrid encryption, to ensure the long-term security of Eazepay data.

## Purpose: Post-Quantum Readiness

As quantum computers become more powerful, they pose a threat to currently used classical cryptographic algorithms (like RSA and ECC). This library implements a **hybrid encryption** scheme to mitigate this risk.

It combines a well-established classical algorithm (X25519 for key exchange) with a post-quantum algorithm (Kyber-768, a NIST PQC standardization finalist). The final encryption key is derived from the secrets of **both** algorithms.

This means that to break the encryption, an attacker would need to defeat **both** the classical and the post-quantum schemes, making the system secure against both current and future threats.

## Features

- **Hybrid Key Exchange**: Combines X25519 and Kyber-768 for generating shared secrets.
- **Authenticated Encryption**: Uses AES-256-GCM for symmetric encryption, providing both confidentiality and integrity.
- **Simple API**: Easy-to-use `encrypt` and `decrypt` methods.
- **Zero Dependencies** (other than `node-kyber`): Uses Node.js's native `crypto` module for classical operations.

## Installation

First, build the shared library:
```bash
cd services/shared/crypto-utils
npm install
npm run build
```

Then, in the service where you want to use it:

```bash
npm install file:../shared/crypto-utils
npm install node-kyber crypto-js
```

## Quick Start Example

This example demonstrates two parties (Alice and Bob) establishing a secure channel and exchanging an encrypted message.

```typescript
import { HybridEncryptor } from '@eazepay/crypto-utils';

async function runDemo() {
  // 1. Both parties generate their long-term hybrid key pairs.
  const alice = new HybridEncryptor();
  const bob = new HybridEncryptor();

  // 2. They exchange public keys.
  const bobPublicKeys = bob.getPublicKeys();

  // 3. Alice encrypts a secret message for Bob using his public keys.
  const secretMessage = 'This is a top secret message for Bob.';
  const encryptedData = await alice.encrypt(secretMessage, bobPublicKeys);

  console.log('Encrypted ciphertext (hex):', encryptedData.encryptedData.toString('hex'));

  // 4. Bob receives the encrypted data and decrypts it with his private keys.
  const decryptedMessage = await bob.decrypt(encryptedData);

  console.log('Decrypted message:', decryptedMessage); // "This is a top secret message for Bob."
}

runDemo();
```