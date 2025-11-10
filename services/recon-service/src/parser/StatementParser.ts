export type StatementEntry = { reference: string; amount: number; currency: string };

// Simplified camt.053 parser (replace with real XML parsing in production)
export function parseCamt053(xml: string): StatementEntry[] {
  const entries: StatementEntry[] = [];
  const regex = /<Ntry>[\s\S]*?<Amt Ccy=\"(.*?)\">(.*?)<\/Amt>[\s\S]*?<AddtlNtryInf>(.*?)<\/AddtlNtryInf>[\s\S]*?<\/Ntry>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    const currency = match[1];
    const amount = parseFloat(match[2]);
    const reference = match[3];
    entries.push({ reference, amount, currency });
  }
  return entries;
}