export type Pacs008Payload = {
  messageId: string;
  instructedAmount: number;
  currency: string; // EUR, etc.
  debtorAccount: string;
  creditorAccount: string;
  endToEndId?: string;
};

export function buildPacs008Xml(p: Pacs008Payload): string {
  const amt = p.instructedAmount.toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.02">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${p.messageId}</MsgId>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        ${p.endToEndId ? `<EndToEndId>${p.endToEndId}</EndToEndId>` : ''}
      </PmtId>
      <IntrBkSttlmAmt Ccy="${p.currency}">${amt}</IntrBkSttlmAmt>
      <DbtrAcct><Id><IBAN>${p.debtorAccount}</IBAN></Id></DbtrAcct>
      <CdtrAcct><Id><IBAN>${p.creditorAccount}</IBAN></Id></CdtrAcct>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
}