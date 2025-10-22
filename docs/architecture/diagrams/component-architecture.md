# Component Architecture

## Identity Service Architecture

```mermaid
graph TB
    subgraph Identity_Service["Identity Service"]
        direction TB
        Auth[Authentication Controller]
        Token[Token Manager]
        UserMgmt[User Management]
        RoleMgmt[Role Management]
        Bio[Biometric Integration]
        
        Auth --> Token
        Auth --> UserMgmt
        UserMgmt --> RoleMgmt
        UserMgmt --> Bio
    end
    
    subgraph Storage["Storage"]
        UserDB[(User Database)]
        TokenCache[(Token Cache)]
        BioDB[(Biometric Store)]
    end
    
    UserMgmt --> UserDB
    Token --> TokenCache
    Bio --> BioDB
    
    style Identity_Service fill:#e3f2fd,stroke:#1565c0
    style Storage fill:#fff3e0,stroke:#ff6f00
```

## Transaction Service Architecture

```mermaid
graph TB
    subgraph Transaction_Service["Transaction Service"]
        TxCtrl[Transaction Controller]
        TxProc[Transaction Processor]
        TxVal[Transaction Validator]
        Fee[Fee Calculator]
        
        TxCtrl --> TxVal
        TxVal --> TxProc
        TxProc --> Fee
    end
    
    subgraph Data_Stores["Data Stores"]
        TxDB[(Transaction DB)]
        Cache[(Redis Cache)]
    end
    
    subgraph External["External Systems"]
        Payment[Payment Gateway]
        Wallet[Wallet Service]
    end
    
    TxProc --> TxDB
    TxProc --> Cache
    TxProc --> Payment
    TxProc --> Wallet
    
    style Transaction_Service fill:#e8f5e9,stroke:#2e7d32
    style Data_Stores fill:#fce4ec,stroke:#c2185b
    style External fill:#f3e5f5,stroke:#7b1fa2
```

## Wallet Service Architecture

```mermaid
graph TB
    subgraph Wallet_Service["Wallet Service"]
        WalCtrl[Wallet Controller]
        BalMgmt[Balance Management]
        TxHist[Transaction History]
        Limit[Limit Manager]
        
        WalCtrl --> BalMgmt
        WalCtrl --> TxHist
        BalMgmt --> Limit
    end
    
    subgraph Storage["Storage Layer"]
        WalDB[(Wallet Database)]
        Cache[(Redis Cache)]
    end
    
    subgraph Integration["Integration Layer"]
        Bank[Bank Integration]
        Mobile[Mobile Money]
    end
    
    BalMgmt --> WalDB
    BalMgmt --> Cache
    WalCtrl --> Bank
    WalCtrl --> Mobile
    
    style Wallet_Service fill:#e1f5fe,stroke:#0277bd
    style Storage fill:#fff3e0,stroke:#ff6f00
    style Integration fill:#f3e5f5,stroke:#7b1fa2
```

## Agent Service Architecture

```mermaid
graph TB
    subgraph Agent_Service["Agent Service"]
        AgentCtrl[Agent Controller]
        CommCalc[Commission Calculator]
        Reporting[Reporting Module]
        Territory[Territory Manager]
        
        AgentCtrl --> CommCalc
        AgentCtrl --> Reporting
        AgentCtrl --> Territory
    end
    
    subgraph Data["Data Layer"]
        AgentDB[(Agent Database)]
        ReportDB[(Report Store)]
    end
    
    subgraph External["External Systems"]
        SMS[SMS Gateway]
        Notify[Notification Service]
    end
    
    AgentCtrl --> AgentDB
    Reporting --> ReportDB
    AgentCtrl --> SMS
    AgentCtrl --> Notify
    
    style Agent_Service fill:#e8f5e9,stroke:#2e7d32
    style Data fill:#fce4ec,stroke:#c2185b
    style External fill:#f3e5f5,stroke:#7b1fa2
```

## Mobile App Architecture

```mermaid
graph TB
    subgraph Mobile_App["Mobile App Architecture"]
        UI[UI Layer]
        State[State Management]
        Cache[Local Cache]
        Security[Security Layer]
        
        UI --> State
        State --> Cache
        State --> Security
    end
    
    subgraph Features["Core Features"]
        Auth[Authentication]
        Tx[Transactions]
        Wallet[Wallet]
        Profile[User Profile]
        
        UI --> Auth
        UI --> Tx
        UI --> Wallet
        UI --> Profile
    end
    
    subgraph Integration["Integration Layer"]
        API[API Client]
        Offline[Offline Storage]
        Push[Push Notifications]
        
        State --> API
        Cache --> Offline
        Security --> Push
    end
    
    style Mobile_App fill:#e1f5fe,stroke:#0277bd
    style Features fill:#e8f5e9,stroke:#2e7d32
    style Integration fill:#f3e5f5,stroke:#7b1fa2
```

## Web Portal Architecture

```mermaid
graph TB
    subgraph Web_Portal["Web Portal Architecture"]
        UI[UI Components]
        Router[Router]
        Store[State Store]
        Auth[Auth Module]
        
        UI --> Router
        Router --> Store
        Store --> Auth
    end
    
    subgraph Features["Portal Features"]
        Dashboard[Dashboard]
        Reports[Reports]
        Admin[Admin Panel]
        Settings[Settings]
        
        Router --> Dashboard
        Router --> Reports
        Router --> Admin
        Router --> Settings
    end
    
    subgraph Backend["Backend Integration"]
        API[API Layer]
        WS[WebSocket]
        Analytics[Analytics]
        
        Store --> API
        Store --> WS
        Dashboard --> Analytics
    end
    
    style Web_Portal fill:#e1f5fe,stroke:#0277bd
    style Features fill:#e8f5e9,stroke:#2e7d32
    style Backend fill:#f3e5f5,stroke:#7b1fa2
```