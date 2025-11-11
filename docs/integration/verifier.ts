import axios, { AxiosInstance } from 'axios';
import { MerkleTree } from 'merkletreejs';
import SHA256 from 'crypto-js/sha256';

/**
 * The structure of the Merkle proof response from the ledger-integrity-service.
 */
export interface MerkleProofResponse {
  transactionId: string;
  merkleRoot: string;
  merkleProof: string[];
  transactionDataHash: string;
  anchoredBlockNumber: number;
}

/**
 * The structure of the original transaction data that needs to be verified.
 */
export interface OriginalTransactionData {
  amount: number;
  currency: string;
  userId: string;
  // Include all other fields that are part of the original transaction data hash
}

/**
 * LedgerVerifier provides methods to fetch cryptographic proofs for transactions
 * and verify their integrity against the public ledger's Merkle root.
 */
export class LedgerVerifier {
  private apiClient: AxiosInstance;

  /**
   * @param ledgerServiceBaseUrl The base URL of the Eazepay Ledger Integrity Service.
   * @param apiKey Optional API key for authentication with the service.
   */
  constructor(ledgerServiceBaseUrl: string, apiKey?: string) {
    this.apiClient = axios.create({
      baseURL: ledgerServiceBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
    });
  }

  /**
   * Fetches the Merkle proof for a given transaction ID from the ledger service.
   * @param transactionId The ID of the transaction to get the proof for.
   * @returns A promise that resolves with the Merkle proof data.
   */
  public async getMerkleProof(transactionId: string): Promise<MerkleProofResponse> {
    try {
      const response = await this.apiClient.get<MerkleProofResponse>(`/api/transactions/${transactionId}/merkle-proof`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Failed to fetch Merkle proof: ${error.response.status} ${error.response.data?.error || 'Unknown error'}`);
      }
      throw new Error(`Network error while fetching Merkle proof: ${error.message}`);
    }
  }

  /**
   * Verifies a transaction's integrity using the provided original data and its Merkle proof.
   * This is the core client-side verification logic.
   *
   * @param originalTransactionData The original, unmodified transaction data object.
   * @param proofData The Merkle proof data obtained from `getMerkleProof`.
   * @returns A boolean indicating whether the transaction is valid and included in the Merkle root.
   */
  public verifyTransaction(originalTransactionData: OriginalTransactionData, proofData: MerkleProofResponse): boolean {
    // 1. Re-hash the original transaction data to get the leaf hash.
    // The hashing algorithm here MUST match the one used in the ledger-integrity-service.
    const leaf = SHA256(JSON.stringify(originalTransactionData)).toString();

    // 2. Check if the re-calculated leaf hash matches the one provided in the proof.
    // This ensures the provided transaction data is what was originally hashed.
    if (leaf !== proofData.transactionDataHash) {
      console.error("Verification failed: The provided transaction data does not match the hash in the proof.");
      return false;
    }

    // 3. Use the leaf, the proof path, and the root to verify the Merkle tree.
    const tree = new MerkleTree([], SHA256); // An empty tree is used just to access the verify method.
    const isVerified = tree.verify(proofData.merkleProof, leaf, proofData.merkleRoot);

    return isVerified;
  }
}