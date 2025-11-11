import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import cron from 'node-cron';
import logger from './utils/logger';

import { authenticate, validateRequest } from 'afripay-shared/auth-middleware';
import { object, string, array } from 'joi';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(authenticate); // Apply authentication to all routes

// Correlation ID propagation and request logging
app.use((req, res, next) => {
  const cid = (req.headers['x-correlation-id'] as string) || uuidv4();
  res.setHeader('X-Correlation-ID', cid);
  (req as any).correlationId = cid;
  res.locals.correlationId = cid;
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('request_completed', {
      correlationId: cid,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });
  next();
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8013;

// Validation Schemas
const verifySchema = object({
  entries: array().items(object({
    id: string().required(),
    prevHash: string().allow('').required(),
    data: object().required(),
    hash: string().optional()
  })).min(1).required()
});

const anchorSchema = object({
  rootHash: string().hex().length(64).required()
});


// In-memory state for the latest root and anchoring stats
let latestMerkleRoot: string | null = null;
let lastAnchorRun: {
  timestamp: string;
  rootHash: string;
  txId?: string;
  status: 'pending' | 'success' | 'failed';
} | null = null;
let lastSuccessfulAnchor: {
  timestamp: string;
  rootHash: string;
  txId: string;
  blockNumber: number;
} | null = null;
let anchorLagMs = -1; // in milliseconds

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

type LedgerEntry = {
  id: string;
  prevHash: string; // hash of previous entry
  data: unknown; // transaction payload
  hash?: string; // expected hash (optional for client-provided verification)
};

// Build a Merkle root for a batch of hashes
function merkleRoot(hashes: string[]): string {
  if (hashes.length === 0) return '';
  let level = hashes.slice();
  while (level.length > 1) {
    const next: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? left; // duplicate last if odd
      next.push(sha256(left + right));
    }
    level = next;
  }
  return level[0];
}

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    latestMerkleRoot,
    lastAnchorRun,
    lastSuccessfulAnchor,
    anchorLagMs
  });
});

// Verify a batch of ledger entries are correctly chained and compute Merkle root
app.post('/integrity/verify', validateRequest(verifySchema), (req, res) => {
  const entries: LedgerEntry[] = req.body?.entries ?? [];
  if (!Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'entries array required' });
  }

  try {
    const computedHashes: string[] = [];
    let validChain = true;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const payload = typeof e.data === 'string' ? e.data : JSON.stringify(e.data);
      const computed = sha256((e.prevHash ?? '') + payload);
      computedHashes.push(computed);
      if (e.hash && e.hash !== computed) {
        validChain = false;
      }
      if (i > 0) {
        const prevComputed = computedHashes[i - 1];
        if (e.prevHash && e.prevHash !== prevComputed) {
          validChain = false;
        }
      }
    }

    const root = merkleRoot(computedHashes);
    latestMerkleRoot = root; // Store the latest root
    const lastHash = computedHashes[computedHashes.length - 1];
    return res.json({ validChain, merkleRoot: root, lastHash });
  } catch (err: any) {
    logger.error('verification_failed', { correlationId: (req as any).correlationId, error: err?.message });
    return res.status(500).json({ error: 'verification_failed', detail: err?.message });
  }
});

async function performAnchor(rootHash: string) {
  const providerType = process.env.ANCHOR_PROVIDER?.toLowerCase();
  if (providerType !== 'ethereum') {
    logger.info(`Skipping anchor: ANCHOR_PROVIDER is not 'ethereum'.`, { providerType });
    return {
      anchorId: uuidv4(),
      rootHash,
      timestamp: new Date().toISOString(),
      method: 'pending_external_anchor',
      note: 'Set ANCHOR_PROVIDER=ethereum with ETH_RPC_URL and ETH_PRIVATE_KEY to enable on-chain anchoring.'
    };
  }

  const rpcUrl = process.env.ETH_RPC_URL;
  const privateKey = process.env.ETH_PRIVATE_KEY;
  const network = process.env.ETH_NETWORK || 'sepolia';
  if (!rpcUrl || !privateKey) {
    throw new Error('ethereum_config_missing: ETH_RPC_URL and ETH_PRIVATE_KEY required');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const data = ethers.hexlify(ethers.toUtf8Bytes(rootHash));
  const tx = await wallet.sendTransaction({ to: wallet.address, value: 0n, data });
  const receipt = await tx.wait();

  if (receipt && receipt.status === 1) {
    const block = await provider.getBlock(receipt.blockNumber);
    if (block) {
      lastSuccessfulAnchor = {
        timestamp: new Date(block.timestamp * 1000).toISOString(),
        rootHash,
        txId: tx.hash,
        blockNumber: receipt.blockNumber,
      };
      anchorLagMs = Date.now() - (block.timestamp * 1000);
    }
  }

  return {
    anchorId: uuidv4(),
    rootHash,
    timestamp: new Date().toISOString(),
    method: 'ethereum_tx_data',
    network,
    txId: tx.hash,
    status: receipt?.status === 1 ? 'anchored' : 'unknown'
  };
}

// Prepare an anchor record or perform on-chain anchoring when configured
app.post('/integrity/anchor', validateRequest(anchorSchema), async (req, res) => {
  const rootHash: string = req.body?.rootHash;
  if (!rootHash || typeof rootHash !== 'string') {
    return res.status(400).json({ error: 'rootHash (string) required' });
  }
  
  try {
    const anchor = await performAnchor(rootHash);
    res.json(anchor);
  } catch (err: any) {
    return res.status(500).json({ error: 'anchor_failed', detail: err?.message });
  }
});

// Cron job to anchor the latest Merkle root; schedule configurable via env
const CRON_SCHEDULE = process.env.ANCHOR_CRON_SCHEDULE || '0 * * * *';
cron.schedule(CRON_SCHEDULE, async () => {
  logger.info('Running hourly anchor job...');
  if (!latestMerkleRoot) {
    logger.info('No Merkle root to anchor. Skipping.');
    return;
  }

  const rootToAnchor = latestMerkleRoot;
  lastAnchorRun = {
    timestamp: new Date().toISOString(),
    rootHash: rootToAnchor,
    status: 'pending',
  };

  try {
    const result = await performAnchor(rootToAnchor);
    lastAnchorRun.status = 'success';
    lastAnchorRun.txId = result.txId;
    logger.info('anchor_success', { rootHash: rootToAnchor, txId: result.txId });
  } catch (error: any) {
    lastAnchorRun.status = 'failed';
    logger.error('anchor_failed', { rootHash: rootToAnchor, error: error.message });
  }
});


app.listen(PORT, () => {
  logger.info('service_start', { port: PORT });
});