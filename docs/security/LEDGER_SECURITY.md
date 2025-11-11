# Ledger Security Architecture

This document defines a comprehensive, defense-in-depth security architecture for protecting both internal account ledgers and customer-facing ledgers. It combines proven industry controls with advanced cryptography to achieve immutability, privacy, integrity, availability, and auditability at global best-practice levels.

## Objectives
- Ensure transactions are tamper-evident and tamper-resistant end to end.
- Minimize insider and external attack surface with strict governance and cryptography.
- Preserve confidentiality of customer and financial data during storage and computation.
- Enable robust, transparent audits aligned with global regulatory frameworks.
- Prepare for post-quantum threats and long-term cryptographic agility.

## Threat Model (High-Level)
- External attackers attempting data theft, ledger manipulation, or ransom/extortion.
- Insider threats abusing privileged access or altering history.
- Supply-chain risks via dependencies, CI/CD artifacts, or secret sprawl.
- Key compromise leading to unauthorized transaction signing or data decryption.
- Data corruption from software bugs or malicious inputs.
- Advanced adversaries (APT) with persistence and lateral movement.

## Architecture Overview

1. Tamper-evident ledger with hash chaining
   - Every entry (transaction, adjustment, event) includes a hash of the previous entry and a Merkle root of the batch. Alterations break the chain and are instantly detectable.
   - Periodic anchoring (e.g., hourly) of the latest root hash to a public blockchain (Bitcoin, Ethereum) creates an external timestamp and immutable checkpoint.

2. Permissioned DLT for critical ledger domains (optional, phased)
   - Private, permissioned blockchain segments for high-value ledgers provide consensus-backed immutability and multi-party verification.
   - Integrates with existing databases via append-only streams and reconciliation jobs.

3. Strong cryptographic key management
   - **Hardware Security Modules (HSMs)**: Mandate the use of cloud HSMs (AWS CloudHSM, Google Cloud HSM) for generating, storing, and using critical cryptographic keys.
   - **HSM-Protected Keys**: The private keys for signing JWTs (`identity-service`) and for signing blockchain anchoring transactions (`ledger-integrity-service`) MUST be stored and used only within an HSM. Keys are never exposed in application memory.
   - Threshold/multi-signature signing (e.g., 2-of-3) for high-value operations; no single key can authorize alone.
   - Automated key rotation, dual control for key ceremonies, and strict audit trails.

4. Confidential computation
   - Trusted Execution Environments (TEEs) like Nitro Enclaves, SGX, or SEV for sensitive functions (reconciliation, fraud models, settlement logic).
   - Secure Multi-Party Computation (sMPC) for cross-ledger reconciliation without exposing raw data.
   - Zero-Knowledge Proofs (ZKPs) to validate balances, signatures, and compliance constraints without revealing amounts or identities.

5. Data protection and access control
   - Envelope encryption with KMS; field-level encryption/tokenization for PII and sensitive fields.
   - Attribute-Based Access Control (ABAC) with Just-In-Time elevation and time-bound approvals.
   - Row-level security policies for data minimization and segregation.

6. Network security and service trust
   - Mutual TLS (mTLS) with certificate pinning for all service-to-service traffic.
   - WAF, rate limiting, and DDoS protections at the gateway; request signing for critical endpoints.
   - Segmentation via dedicated networks and least-privilege service accounts.

7. Monitoring, audit, and incident response
   - Append-only, tamper-evident audit logs (hash-chained and periodically anchored).
   - SIEM/SOAR integrations, anomaly detection, and real-time alerts.
   - Playbooks for key compromise, suspected tampering, and recovery.

8. Backup, restore, and immutability
   - Versioned, immutable (WORM) storage for ledger snapshots and audit logs.
   - Tested RPO/RTO objectives; regular drills for restore and data integrity validation.
   - Air-gapped/offline backups for disaster scenarios.

9. Post-quantum readiness
   - Hybrid cryptography (e.g., TLS with X25519 + Kyber) in pilot environments.
   - Cryptographic agility: ability to roll algorithms and parameters without downtime.

## Advanced Cryptography Use Cases

- ZKP balance proofs:
  Prove “inputs equal outputs”, “sufficient balance”, and “policy compliance” without revealing amounts or identities.

- sMPC reconciliation:
  Reconcile our ledger with partner/customer ledgers so neither party reveals raw transactions; only discrepancies and proofs are shared.

- Threshold signing for governance:
  Require multiple independent approvals for large transactions or policy changes.

## Control Mapping (Reference)
- PCI DSS: encryption at rest/in transit, key management, logging, access controls.
- ISO/IEC 27001: ISMS governance, risk management, continuous improvement.
- SOC 2: security, availability, processing integrity, confidentiality, privacy.
- NIST 800-53: comprehensive control catalog for federal-grade security.
- GDPR: data minimization, purpose limitation, access logging, encryption.

## Implementation Roadmap

Phase 0: Baseline hardening (now)
- Enforce mTLS between services; rotate and pin certificates.
- **Implement a Service Mesh (Istio/Linkerd)** to automate mTLS and enforce network policies.
- Enable envelope encryption (KMS) and field-level encryption/tokenization for PII.
- Implement ABAC with JIT elevation and audit.
- Centralized, structured logging with hash-chained audit streams.

Phase 1: Tamper-evident ledger and anchoring
- **Merkle Tree Anchoring**: Periodically (e.g., every 15 minutes), calculate the Merkle root of new transactions from the primary database.
- Add hash chaining and Merkle roots across ledger writes.
- Automate hourly anchoring of the latest root to a public blockchain; publish anchor IDs.
- Build a “Ledger Integrity Service” to verify chains and anchors daily.
 - Enable optional Ethereum Sepolia anchoring via `ANCHOR_PROVIDER=ethereum` with `ETH_RPC_URL` and `ETH_PRIVATE_KEY`.
- Add Agent Portal demo buttons for Verify and Anchor flows.

Phase 2: HSM + threshold signing
- **Migrate all critical signing operations to HSMs**. This includes JWT signing and blockchain transaction signing.
- Adopt threshold/multi-sig for high-value operations and policy changes.
- Automate key rotation and dual-control procedures.

Phase 3: Confidential compute and privacy proofs
- Pilot Nitro Enclaves/SGX for reconciliation and settlement logic.
- Introduce sMPC for cross-ledger reconciliation with partners.
- Implement ZKP-based validations for balance sufficiency and compliance.

Phase 4: Post-quantum hybrid crypto
- Pilot PQC-hybrid TLS for internal traffic.
- Prepare key and certificate rollout procedures for PQC transition.

Phase 5: External audit and red teaming
- Commission independent audits and cryptographic reviews.
- Continuous red-teaming and purple-teaming; refine controls based on findings.

## Secret Management for Production

**WARNING: CRITICAL SECURITY REQUIREMENT** Storing sensitive secrets like `ETH_PRIVATE_KEY` in plaintext environment variables is strictly forbidden in production environments.

For production deployments, you MUST use a dedicated secret management solution, such as:
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager

These tools provide secure storage, fine-grained access control, and audit trails. For the highest level of security, the `ledger-integrity-service` **MUST** be configured to perform signing operations within a cloud HSM, where the private key is non-exportable.

## Day-1 Checklist (Actionable)
- **Secure Ethereum Private Key**: Ensure `ETH_PRIVATE_KEY` is stored and retrieved from a secure secret management system in production environments.
- mTLS everywhere; verify cert pinning in gateways and clients.
- Enforce least privilege: service accounts, scoped tokens, short-lived creds.
- Hash-chain audit logs with scheduled integrity verification.
- Enable WORM and versioning on backup buckets; define RPO/RTO.
- HSM-backed keys for any signing or encryption used in ledger operations.
- Dual-control for policy changes and high-value transactions.
- SIEM alerts on anomalies and integrity check failures; test incident response.
- Alert if anchor requests spike anomalously or merkleRoot repeats.
 - Track on-chain anchor success and lag (tx mined vs created); alert if delayed > N minutes. Monitor the `anchorLagMs` metric from the `/health` endpoint.

## Notes
This architecture is modular. You can implement it incrementally without disrupting existing applications. The tamper-evident ledger and anchored audit trail deliver immediate gains, while sMPC, ZKPs, TEEs, and PQC readiness provide long-term resilience against evolving threats.