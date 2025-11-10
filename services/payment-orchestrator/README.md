# Payment Orchestrator

Purpose: Central routing and retry logic across payment rails and partners. Provides a single API to initiate, track, and manage payments with failover and policy-driven selection.

Key responsibilities:
- Route payments to the best rail based on corridor, cost, SLA, and policy.
- Retry with fallback connectors when a rail is degraded.
- Maintain idempotency and correlation IDs across hops.
- Expose simple REST endpoints via `/api/orchestrate/*`.

This is a scaffold service. Implementations for specific rails live under `src/connectors/` and can be registered in `PaymentRouter`.