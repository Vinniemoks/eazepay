export type Pain001Payload = {
  messageId: string;
  debtorName: string;
  debtorIban: string;
  creditorName: string;
  creditorIban: string;
  amount: number;
  currency: string; // e.g., EUR
  remittance?: string;
};

export function buildPain001Xml(p: Pain001Payload): string {
  const amt = p.amount.toFixed(2);
  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${p.messageId}</MsgId>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <PmtInf>
      <Dbtr>
        <Nm>${p.debtorName}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id><IBAN>${p.debtorIban}</IBAN></Id>
      </DbtrAcct>
      <CdtTrfTxInf>
        <Amt><InstdAmt Ccy="${p.currency}">${amt}</InstdAmt></Amt>
        <Cdtr>
          <Nm>${p.creditorName}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id><IBAN>${p.creditorIban}</IBAN></Id>
        </CdtrAcct>
        ${p.remittance ? `<RmtInf><Ustrd>${p.remittance}</Ustrd></RmtInf>` : ''}
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}