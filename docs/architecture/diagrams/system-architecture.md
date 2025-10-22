# System Architecture Overview

## High-Level Architecture

```mermaid
graph TB
    subgraph Client_Layer["Client Layer"]
        MA[Mobile App]
        WP[Web Portal]
        DA[Desktop App]
        USSD[USSD Interface]
    end

    subgraph API_Gateway["API Gateway Layer"]
        AG[API Gateway]
        LB[Load Balancer]
    end

    subgraph Service_Layer["Microservices Layer"]
        direction TB
        IS[Identity Service]
        TS[Transaction Service]
        WS[Wallet Service]
        AS[Agent Service]
        BS[Biometric Service]
        FS[Financial Service]
    end

    subgraph Data_Layer["Data Layer"]
        direction LR
        PG[(PostgreSQL)]
        RD[(Redis Cache)]
        MG[(MongoDB)]
    end

    subgraph External_Services["External Services"]
        PS[Payment Services]
        BK[Banks]
        MM[Mobile Money]
    end

    %% Client to Gateway Connections
    MA --> AG
    WP --> AG
    DA --> AG
    USSD --> AG

    %% Gateway to Services
    AG --> LB
    LB --> IS
    LB --> TS
    LB --> WS
    LB --> AS
    LB --> BS
    LB --> FS

    %% Service to Database Connections
    IS --> PG
    TS --> PG
    WS --> PG
    AS --> PG
    FS --> PG
    
    %% Cache Connections
    IS --> RD
    TS --> RD
    WS --> RD

    %% MongoDB Connections
    BS --> MG
    FS --> MG

    %% External Service Connections
    FS --> PS
    FS --> BK
    FS --> MM

    style Client_Layer fill:#e1f5fe,stroke:#01579b
    style API_Gateway fill:#fff3e0,stroke:#ff6f00
    style Service_Layer fill:#e8f5e9,stroke:#2e7d32
    style Data_Layer fill:#fce4ec,stroke:#c2185b
    style External_Services fill:#f3e5f5,stroke:#7b1fa2
```

## Service Communication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant AG as API Gateway
    participant IS as Identity Service
    participant TS as Transaction Service
    participant WS as Wallet Service
    participant DB as Database

    C->>AG: Request with JWT
    AG->>IS: Validate Token
    IS->>AG: Token Valid
    AG->>TS: Process Transaction
    TS->>WS: Check Balance
    WS->>DB: Get Wallet Data
    DB->>WS: Wallet Data
    WS->>TS: Balance Status
    TS->>DB: Save Transaction
    DB->>TS: Confirmation
    TS->>AG: Transaction Result
    AG->>C: Response
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph Input_Layer["Input Layer"]
        UI[User Interface]
        API[API Endpoints]
        SDK[SDK Integration]
    end

    subgraph Processing_Layer["Processing Layer"]
        Val[Validation]
        Auth[Authentication]
        Proc[Processing]
        Audit[Audit Logging]
    end

    subgraph Storage_Layer["Storage Layer"]
        Cache[Redis Cache]
        DB[(Main Database)]
        DWH[(Data Warehouse)]
    end

    UI --> Val
    API --> Val
    SDK --> Val
    
    Val --> Auth
    Auth --> Proc
    Proc --> Audit
    
    Proc --> Cache
    Proc --> DB
    Audit --> DWH

    style Input_Layer fill:#e3f2fd,stroke:#1565c0
    style Processing_Layer fill:#f1f8e9,stroke:#33691e
    style Storage_Layer fill:#fce4ec,stroke:#c2185b
```

## Security Architecture

```mermaid
graph TB
    subgraph Security_Perimeter["Security Perimeter"]
        FW[Firewall]
        WAF[Web Application Firewall]
        
        subgraph Security_Services["Security Services"]
            Auth[Authentication]
            RBAC[Role-Based Access]
            Enc[Encryption Service]
            Bio[Biometric Auth]
        end
        
        subgraph Monitoring["Security Monitoring"]
            IDS[Intrusion Detection]
            Log[Security Logging]
            Alert[Alert System]
        end
    end
    
    subgraph Protected_Resources["Protected Resources"]
        API[API Services]
        DB[(Databases)]
        Vault[Secret Vault]
    end
    
    Client --> FW
    FW --> WAF
    WAF --> Auth
    Auth --> RBAC
    RBAC --> API
    API --> Enc
    Enc --> DB
    Bio --> Auth
    
    IDS --> Alert
    Log --> Alert
    
    style Security_Perimeter fill:#ffebee,stroke:#c62828
    style Protected_Resources fill:#e8eaf6,stroke:#283593
    style Security_Services fill:#fff3e0,stroke:#f57f17
    style Monitoring fill:#e0f2f1,stroke:#004d40
```

## Deployment Architecture

```mermaid
graph TB
    subgraph Cloud_Infrastructure["Cloud Infrastructure"]
        direction TB
        subgraph Region_1["Primary Region"]
            LB1[Load Balancer]
            subgraph K8S_1["Kubernetes Cluster"]
                P1[Pod 1]
                P2[Pod 2]
                P3[Pod 3]
            end
            DB1[(Primary DB)]
        end
        
        subgraph Region_2["Backup Region"]
            LB2[Load Balancer]
            subgraph K8S_2["Kubernetes Cluster"]
                P4[Pod 1]
                P5[Pod 2]
            end
            DB2[(Replica DB)]
        end
    end
    
    subgraph Monitoring["Monitoring & Management"]
        Prometheus[Prometheus]
        Grafana[Grafana]
        Alert[Alert Manager]
    end
    
    Users --> LB1
    Users --> LB2
    
    LB1 --> K8S_1
    LB2 --> K8S_2
    
    K8S_1 --> DB1
    K8S_2 --> DB2
    
    DB1 --> DB2
    
    K8S_1 --> Prometheus
    K8S_2 --> Prometheus
    Prometheus --> Grafana
    Prometheus --> Alert
    
    style Cloud_Infrastructure fill:#e1f5fe,stroke:#0277bd
    style Region_1 fill:#e8f5e9,stroke:#2e7d32
    style Region_2 fill:#fff3e0,stroke:#ff6f00
    style Monitoring fill:#f3e5f5,stroke:#7b1fa2
```

## Event Flow Architecture

```mermaid
graph LR
    subgraph Events["Event Sources"]
        TX[Transactions]
        US[User Actions]
        SY[System Events]
    end
    
    subgraph Message_Bus["Message Bus"]
        KB[Kafka Broker]
    end
    
    subgraph Processors["Event Processors"]
        TP[Transaction Processor]
        NP[Notification Processor]
        AP[Analytics Processor]
    end
    
    subgraph Storage["Event Storage"]
        ES[Event Store]
        DL[Data Lake]
    end
    
    TX --> KB
    US --> KB
    SY --> KB
    
    KB --> TP
    KB --> NP
    KB --> AP
    
    TP --> ES
    NP --> ES
    AP --> DL
    
    style Events fill:#e8f5e9,stroke:#2e7d32
    style Message_Bus fill:#fff3e0,stroke:#ff6f00
    style Processors fill:#e1f5fe,stroke:#0277bd
    style Storage fill:#f3e5f5,stroke:#7b1fa2
```