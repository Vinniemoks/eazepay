import express from 'express';
import { parseCamt053 } from './parser/StatementParser';
import { reconcile } from './recon/Reconciler';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/recon/run', (req, res) => {
  const { statementXml, ledger } = req.body as { statementXml: string; ledger: Array<{ reference: string; amount: number; currency: string }> };
  if (!statementXml || !ledger) return res.status(400).json({ error: 'statementXml and ledger required' });
  const parsed = parseCamt053(statementXml);
  const result = reconcile(parsed, ledger);
  res.json(result);
});

const port = process.env.PORT || 8012;
app.listen(port, () => {
  console.log(`recon-service listening on http://localhost:${port}`);
});