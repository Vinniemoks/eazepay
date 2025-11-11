import { createECDH, createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { kem } from 'node-kyber';

const AES_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Represents the combined public keys for hybrid encryption.
 */
export interface HybridPublicKey {
  pqcPublicKey: Buffer; // Post-Quantum (Kyber) public key
  classicPublicKey: Buffer; // Classical (X25519) public key
}

/**
 * Represents the encrypted data and the necessary components for decryption.
 */
export interface HybridEncryptedData {
  pqcCiphertext: Buffer; // Kyber's encapsulated secret
  classicEphemeralPublicKey: Buffer; // Ephemeral classical public key from the sender
  iv: Buffer; // Initialization Vector for AES
  authTag: Buffer; // GCM authentication tag
  encryptedData: Buffer; // The actual AES-encrypted data
}

/**
 * Provides methods for hybrid (classical + post-quantum) encryption and decryption.
 * This combines the security of a classical algorithm (X25519) with a
 * post-quantum algorithm (Kyber-768) to protect against future quantum attacks.
 */
export class HybridEncryptor {
  private pqcKeyPair: { publicKey: Buffer; privateKey: Buffer; };
  private classicKeyPair: ReturnType<typeof createECDH>;

  constructor() {
    // 1. Generate a long-term Post-Quantum key pair (Kyber-768)
    this.pqcKeyPair = kem.keypair();

    // 2. Generate a long-term Classical key pair (X25519)
    this.classicKeyPair = createECDH('x25519');
    this.classicKeyPair.generateKeys();
  }

  /**
   * Returns the combined public keys for this encryptor instance.
   */
  public getPublicKeys(): HybridPublicKey {
    return {
      pqcPublicKey: this.pqcKeyPair.publicKey,
      classicPublicKey: this.classicKeyPair.getPublicKey(),
    };
  }

  /**
   * Encrypts data for a recipient using their hybrid public key.
   * @param data The data to encrypt (as a string).
   * @param recipientPublicKeys The recipient's combined public keys.
   * @returns An object containing the encrypted data and metadata.
   */
  public async encrypt(data: string, recipientPublicKeys: HybridPublicKey): Promise<HybridEncryptedData> {
    // 1. Generate an ephemeral classical key pair for this encryption session
    const ephemeralClassicKey = createECDH('x25519');
    ephemeralClassicKey.generateKeys();
    const ephemeralPublicKey = ephemeralClassicKey.getPublicKey();

    // 2. Derive the classical shared secret using ECDH
    const classicSharedSecret = ephemeralClassicKey.computeSecret(recipientPublicKeys.classicPublicKey);

    // 3. Encapsulate a secret using the recipient's post-quantum public key
    const { ciphertext: pqcCiphertext, sharedSecret: pqcSharedSecret } = await kem.encapsulate(recipientPublicKeys.pqcPublicKey);

    // 4. Combine both secrets to form a single, hybrid shared secret.
    // Hashing them together is a standard way to combine secrets.
    const hybridSharedSecret = createHash('sha256')
      .update(classicSharedSecret)
      .update(pqcSharedSecret)
      .digest();

    // 5. Encrypt the data using the hybrid secret with AES-256-GCM
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(AES_ALGORITHM, hybridSharedSecret, iv);
    const encryptedData = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      pqcCiphertext,
      classicEphemeralPublicKey: ephemeralPublicKey,
      iv,
      authTag,
      encryptedData,
    };
  }

  /**
   * Decrypts data that was encrypted using this instance's public keys.
   * @param encrypted The encrypted data object.
   * @returns The original decrypted data as a string.
   */
  public async decrypt(encrypted: HybridEncryptedData): Promise<string> {
    // 1. Derive the classical shared secret using our private key and the sender's ephemeral public key
    const classicSharedSecret = this.classicKeyPair.computeSecret(encrypted.classicEphemeralPublicKey);

    // 2. Decapsulate the post-quantum secret using our private key and the PQC ciphertext
    const pqcSharedSecret = await kem.decapsulate(encrypted.pqcCiphertext, this.pqcKeyPair.privateKey);

    // 3. Combine both secrets in the exact same way as during encryption to get the hybrid secret
    const hybridSharedSecret = createHash('sha256')
      .update(classicSharedSecret)
      .update(pqcSharedSecret)
      .digest();

    // 4. Decrypt the data using the hybrid secret
    const decipher = createDecipheriv(AES_ALGORITHM, hybridSharedSecret, encrypted.iv);
    decipher.setAuthTag(encrypted.authTag);
    const decryptedData = Buffer.concat([decipher.update(encrypted.encryptedData), decipher.final()]);

    return decryptedData.toString('utf8');
  }
}

/**
 * Example usage of the HybridEncryptor.
 */
export async function demoHybridEncryption() {
  console.log('--- Starting Hybrid Encryption Demo ---');

  // Create two parties, Alice and Bob
  const alice = new HybridEncryptor();
  const bob = new HybridEncryptor();

  const alicePublicKeys = alice.getPublicKeys();
  const bobPublicKeys = bob.getPublicKeys();

  console.log("Alice's PQC Public Key:", alicePublicKeys.pqcPublicKey.toString('hex').substring(0, 32) + '...');
  console.log("Bob's PQC Public Key:  ", bobPublicKeys.pqcPublicKey.toString('hex').substring(0, 32) + '...');

  // Alice encrypts a message for Bob
  const secretMessage = `Eazepay transaction # ${randomBytes(4).readUInt32BE(0)} is confirmed.`;
  console.log('\nOriginal Message:', secretMessage);

  const encryptedForBob = await alice.encrypt(secretMessage, bobPublicKeys);
  console.log('Encrypted Data (for Bob):', {
    ...encryptedForBob,
    encryptedData: encryptedForBob.encryptedData.toString('hex'),
  });

  // Bob decrypts the message from Alice
  const decryptedByBob = await bob.decrypt(encryptedForBob);
  console.log('\nDecrypted by Bob:', decryptedByBob);

  if (decryptedByBob === secretMessage) {
    console.log('✅ SUCCESS: Decryption successful and message matches!');
  } else {
    console.error('❌ FAILURE: Decryption failed or message mismatch!');
  }

  console.log('\n--- Hybrid Encryption Demo Complete ---');
}