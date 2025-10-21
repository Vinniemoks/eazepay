# Service Experience and System Visuals

This document illustrates how AfriPay's channels surface capabilities to end users and how each channel maps to the backend landscape. It focuses on the experience for the three primary personas:

- **Superuser** – A privileged operator who can reach every administrative surface and manage global policy.
- **Administrator** – Operations staff with scoped permissions that are granted and revoked by the superuser.
- **Agent** – Field personnel who interact with customers and have the narrowest set of privileges.

The diagrams combine user-facing flows (front-end) with the corresponding service components (back-end). All restricted paths explicitly show the superuser's ultimate control over administrator access.

## Role Control Overview

```mermaid
flowchart LR
    Superuser[(Superuser)]:::role -->|Grants roles, policies| RBAC[(Central RBAC Registry)]
    Administrator[(Administrator)]:::role -. Requests access .-> RBAC
    Agent[(Agent)]:::role -. Requests access .-> RBAC
    RBAC -->|Issues scoped tokens| Gateway[API Gateway]
    Gateway -->|Propagates claims| ServicesCluster{{Service Mesh}}

    classDef role fill:#1f77b4,stroke:#0f3b61,color:#fff;
    classDef infra fill:#f2f0ff,stroke:#6c63ff,color:#000;
```

The superuser alone can promote or demote other users. Administrators and agents operate strictly within scopes assigned in the RBAC registry.

---

## Web Portal Service (Front End)

```mermaid
flowchart TB
    entry["Login Screen"] --> dashboards{Select Dashboard}
    dashboards -->|Superuser| su["Superuser Control Center"]
    dashboards -->|Administrator| admin["Ops Administration"]
    dashboards -->|Agent| agent["Agent Workspace"]

    su --> suPolicies["Global Policy Editor"]
    su --> suAudit["Unified Audit Explorer"]

    admin --> adminCustomers["Customer Onboarding"]
    admin --> adminRisk["Risk & Compliance"]

    agent --> agentCashIn["Cash In"]
    agent --> agentCashOut["Cash Out"]
    agent --> agentSupport["Support Tickets"]
```

### Web Portal Backend Mapping

```mermaid
flowchart LR
    Browser --> Nginx[Nginx Static Host]
    Nginx --> Gateway[API Gateway]
    Gateway --> Identity
    Gateway --> Wallet
    Gateway --> Transaction
    Gateway --> AgentSvc
    Gateway --> Reporting[(Analytics Warehouse)]

    Superuser -. full scopes .-> Identity
    Superuser -. override .-> AgentSvc
    Administrator -. limited scopes .-> Wallet
    Administrator -. limited scopes .-> Transaction
    Agent -. transactional scopes .-> Transaction

    Identity[Identity Service]
    Wallet[Wallet Service]
    Transaction[Transaction Service]
    AgentSvc[Agent Service]
```

The front-end screens are filtered by the access token claims supplied by the identity service. Superusers see every dashboard, while administrators and agents see only tiles enabled for their scopes.

---

## Identity Service

### Front-End Touchpoints

```mermaid
flowchart TB
    login["Credential Login"] --> mfa{MFA Required?}
    mfa -->|Yes| biometric["Biometric Prompt"]
    mfa -->|No| session["Session Established"]
    biometric --> session
    session --> profile["Profile & KYC Status"]
    session --> delegation["Delegated Role Requests"]
```

### Back-End Components

```mermaid
flowchart LR
    Gateway --> AuthAPI[Auth API]
    AuthAPI --> RBACDB[(RBAC & Tenancy DB)]
    AuthAPI --> AuditQ[(Audit Event Queue)]
    AuthAPI --> BiometricService
    AuthAPI --> WalletService

    Superuser -. manages roles .-> RBACDB
    Administrator -. submit requests .-> Delegation[Delegation Workflow]
    Delegation -->|requires approval| Superuser

    BiometricService[Biometric Service]
    WalletService[Wallet Service]
```

The superuser approves all delegation workflows before new roles activate.

---

## Agent Service

### Front-End Touchpoints

```mermaid
flowchart TB
    agentLogin[Agent Mobile App Login] --> queue[Customer Queue]
    queue --> onboard[Customer Onboarding]
    queue --> cashOps[Cash In/Out]
    queue --> support[Escalate Issues]
```

### Back-End Components

```mermaid
flowchart LR
    AgentApp --> AgentAPI[Agent Service API]
    AgentAPI --> IdentityService
    AgentAPI --> WalletService
    AgentAPI --> Ticketing[(Support Ticket Queue)]

    Superuser -. define territories .-> AgentAPI
    Administrator -. approve assignments .-> AgentAPI
```

Superusers can override administrator territory rules and revoke agent access instantly.

---

## Transaction Service

### Front-End Touchpoints

```mermaid
flowchart TB
    settle["Settlement Dashboard"] --> ledger["Ledger Explorer"]
    settle --> disputes["Dispute Resolution"]
    settle --> reports["Settlement Reports"]
```

### Back-End Components

```mermaid
flowchart LR
    Portal --> TxnAPI[Transaction Service]
    TxnAPI --> LedgerDB[(Ledger DB)]
    TxnAPI --> Rules[Fraud Rules Engine]
    TxnAPI --> WalletService
    TxnAPI --> Notification[(Notification Bus)]

    Superuser -. modify rules .-> Rules
    Administrator -. run reports .-> TxnAPI
    Agent -. submit disputes .-> TxnAPI
```

---

## Wallet Service

### Front-End Touchpoints

```mermaid
flowchart TB
    balance["Balance Overview"] --> limits["Limit Management"]
    balance --> statements["Statements"]
    limits -->|Superuser only| limitPolicy["Global Limit Policy"]
```

### Back-End Components

```mermaid
flowchart LR
    Portal --> WalletAPI[Wallet Service]
    WalletAPI --> WalletDB[(Wallet Ledger)]
    WalletAPI --> Limits[Limit Policy Store]

    Superuser -. adjust global limits .-> Limits
    Administrator -. adjust customer limits .-> WalletAPI
    Agent -. view balances .-> WalletAPI
```

---

## Biometric Service

### Front-End Touchpoints

```mermaid
flowchart TB
    capture["Biometric Capture"] --> validation["Live Liveness Check"]
    validation --> review["Review & Submit"]
```

### Back-End Components

```mermaid
flowchart LR
    Devices --> BioAPI[Biometric API]
    BioAPI --> IdentityService
    BioAPI --> Templates[(Secure Template Vault)]
    BioAPI --> Liveness[ML Liveness Engine]

    Superuser -. manage retention .-> Templates
    Administrator -. view status .-> BioAPI
    Agent -. capture only .-> BioAPI
```

---

## USSD Service

### Front-End Touchpoints

```mermaid
flowchart TB
    ussdMenu["*123# Menu"] --> choose{Select Action}
    choose -->|Agent| floatReq["Float Request"]
    choose -->|Customer| miniStmt["Mini Statement"]
    choose -->|Admin| alerts["Network Alerts"]
```

### Back-End Components

```mermaid
flowchart LR
    USSDGateway --> MenuEngine[Menu Orchestrator]
    MenuEngine --> IdentityService
    MenuEngine --> WalletService
    MenuEngine --> AgentService

    Superuser -. publish menus .-> MenuEngine
    Administrator -. request updates .-> MenuEngine
    Agent -. limited actions .-> MenuEngine
```

---

## Access Control Summary

| Persona | Typical Surfaces | Maximum Scope |
| --- | --- | --- |
| Superuser | All dashboards, policy editors, configuration consoles | Full platform control, can delegate or revoke any permission |
| Administrator | Operational dashboards, onboarding tools, reporting | Bound to business domains authorized by the superuser |
| Agent | Field tools (cash operations, USSD, ticketing) | Limited to transactions and tasks assigned to their branch |

All administrator and agent tokens are derived from superuser-approved scopes, ensuring centralized governance.
