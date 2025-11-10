import { StatementEntry } from '../parser/StatementParser';

export type LedgerEntry = { reference: string; amount: number; currency: string };

export function reconcile(statement: StatementEntry[], ledger: LedgerEntry[]) {
  const ledgerIndex = new Map<string, LedgerEntry>();
  for (const l of ledger) ledgerIndex.set(l.reference, l);

  const matches: Array<{ reference: string }> = [];
  const mismatches: Array<{ reference: string; reason: string; statement?: StatementEntry; ledger?: LedgerEntry }> = [];

  for (const s of statement) {
    const l = ledgerIndex.get(s.reference);
    if (!l) {
      mismatches.push({ reference: s.reference, reason: 'Missing in ledger', statement: s });
      continue;
    }
    if (l.amount !== s.amount || l.currency !== s.currency) {
      mismatches.push({ reference: s.reference, reason: 'Amount/currency mismatch', statement: s, ledger: l });
      continue;
    }
    matches.push({ reference: s.reference });
  }

  return {
    summary: {
      totalStatement: statement.length,
      totalLedger: ledger.length,
      matched: matches.length,
      mismatched: mismatches.length
    },
    matches,
    mismatches
  };
}