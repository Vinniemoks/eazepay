import React, { useState } from 'react'
import axios from 'axios'

export default function GatewayDemo() {
  const [orchestrateResult, setOrchestrateResult] = useState(null)
  const [pain001Xml, setPain001Xml] = useState('')
  const [pacs008Xml, setPacs008Xml] = useState('')
  const [reconResult, setReconResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const samplePayment = {
    amount: 100.5,
    currency: 'EUR',
    sourceAccount: 'DE89370400440532013000',
    destinationAccount: 'FR7630006000011234567890189',
    beneficiary: { name: 'Alice', account: 'FR7630006000011234567890189' },
    corridor: 'NG->EU'
  }

  const samplePain001 = {
    messageId: 'msg-1',
    initiatingParty: 'Eazepay',
    payments: [
      {
        endToEndId: 'E2E-1',
        amount: 10.5,
        currency: 'EUR',
        debtorName: 'Alice',
        debtorIban: 'DE89370400440532013000',
        creditorName: 'Bob',
        creditorIban: 'FR7630006000011234567890189'
      }
    ]
  }

  const samplePacs008 = {
    messageId: 'msg-2',
    debtor: { name: 'Alice', iban: 'DE89370400440532013000' },
    creditor: { name: 'Bob', iban: 'FR7630006000011234567890189' },
    amount: 10.5,
    currency: 'EUR'
  }

  const sampleRecon = {
    statementXml: '<Document><Stmt><Ntry><Amt Ccy="EUR">100.50</Amt><NtryRef>SEPA-abc</NtryRef></Ntry></Stmt></Document>',
    ledger: [{ reference: 'SEPA-abc', amount: 100.5, currency: 'EUR' }]
  }

  const runOrchestrate = async () => {
    setError('');
    try {
      const res = await axios.post('/api/orchestrate/payment', samplePayment)
      setOrchestrateResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const buildPain001 = async () => {
    setError('');
    try {
      const res = await axios.post('/api/iso/pain001', samplePain001)
      setPain001Xml(res.data?.xml || JSON.stringify(res.data))
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const buildPacs008 = async () => {
    setError('');
    try {
      const res = await axios.post('/api/iso/pacs008', samplePacs008)
      setPacs008Xml(res.data?.xml || JSON.stringify(res.data))
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const runRecon = async () => {
    setError('');
    try {
      const res = await axios.post('/api/recon/run', sampleRecon)
      setReconResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    }
  }

  const runEndToEnd = async () => {
    setRunning(true)
    setError('')
    setOrchestrateResult(null)
    setPain001Xml('')
    setPacs008Xml('')
    setReconResult(null)
    try {
      // 1) Build ISO messages
      await buildPain001()
      await buildPacs008()
      // 2) Orchestrate payment
      await runOrchestrate()
      // 3) Reconciliation (using sample statement and ledger)
      await runRecon()
    } finally {
      setRunning(false)
    }
  }

  const section = {
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '16px',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    button: {
      padding: '10px 14px',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    pre: {
      background: '#f7f7f7',
      borderRadius: '8px',
      padding: '12px',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }
  }

  return (
    <div className="container">
      <h1>Gateway Demo</h1>
      <p>Sample client calls to Payment Orchestrator, ISO Message Adapter, and Reconciliation Service via the API Gateway.</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.12)', color: '#DC2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={section.card}>
        <div style={section.header}>
          <h3>1) Orchestrate Payment</h3>
          <button style={section.button} onClick={runOrchestrate}>Send</button>
        </div>
        <pre style={section.pre}>{JSON.stringify(samplePayment, null, 2)}</pre>
        {orchestrateResult && (
          <div>
            <h4>Response</h4>
            <pre style={section.pre}>{JSON.stringify(orchestrateResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={section.card}>
        <div style={section.header}>
          <h3>2) Build ISO Messages</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={section.button} onClick={buildPain001}>Build pain.001</button>
            <button style={section.button} onClick={buildPacs008}>Build pacs.008</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <h4>pain.001 Payload</h4>
            <pre style={section.pre}>{JSON.stringify(samplePain001, null, 2)}</pre>
            {pain001Xml && (
              <>
                <h4>pain.001 XML</h4>
                <pre style={section.pre}>{pain001Xml}</pre>
              </>
            )}
          </div>
          <div>
            <h4>pacs.008 Payload</h4>
            <pre style={section.pre}>{JSON.stringify(samplePacs008, null, 2)}</pre>
            {pacs008Xml && (
              <>
                <h4>pacs.008 XML</h4>
                <pre style={section.pre}>{pacs008Xml}</pre>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={section.card}>
        <div style={section.header}>
          <h3>3) Reconciliation</h3>
          <button style={section.button} onClick={runRecon}>Run</button>
        </div>
        <pre style={section.pre}>{JSON.stringify(sampleRecon, null, 2)}</pre>
        {reconResult && (
          <div>
            <h4>Response</h4>
            <pre style={section.pre}>{JSON.stringify(reconResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div style={section.card}>
        <div style={section.header}>
          <h3>End-to-End Flow</h3>
          <button style={{ ...section.button, opacity: running ? 0.7 : 1 }} disabled={running} onClick={runEndToEnd}>
            {running ? 'Running...' : 'Run Demo'}
          </button>
        </div>
        <p>This runs: build pain.001 → build pacs.008 → orchestrate payment → reconciliation.</p>
      </div>
    </div>
  )
}