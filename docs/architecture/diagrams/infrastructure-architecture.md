# Infrastructure Architecture

## Cloud Infrastructure Overview

```mermaid
graph TB
    subgraph Azure_Cloud["Azure Cloud Infrastructure"]
        subgraph Network["Virtual Network"]
            subgraph Public_Subnet["Public Subnet"]
                ALB[Application Load Balancer]
                BastionHost[Bastion Host]
            end
            
            subgraph Private_Subnet["Private Subnet"]
                AKS[Azure Kubernetes Service]
                AppService[App Service]
                Functions[Azure Functions]
            end
            
            subgraph Data_Subnet["Data Subnet"]
                PostgreSQL[Azure PostgreSQL]
                Redis[Azure Cache for Redis]
                MongoDB[Cosmos DB]
            end
        end
        
        subgraph Security["Security Components"]
            KeyVault[Key Vault]
            WAF[Web Application Firewall]
            NSG[Network Security Groups]
        end
        
        subgraph Monitoring["Monitoring & Logging"]
            AppInsights[Application Insights]
            LogAnalytics[Log Analytics]
            Monitor[Azure Monitor]
        end
    end
    
    Internet((Internet)) --> WAF
    WAF --> ALB
    ALB --> AKS
    ALB --> AppService
    ALB --> Functions
    
    AKS --> PostgreSQL
    AppService --> PostgreSQL
    Functions --> PostgreSQL
    
    AKS --> Redis
    AppService --> Redis
    
    AKS --> MongoDB
    
    AKS --> KeyVault
    AppService --> KeyVault
    Functions --> KeyVault
    
    AKS --> AppInsights
    AppService --> AppInsights
    Functions --> AppInsights
    
    AppInsights --> LogAnalytics
    LogAnalytics --> Monitor
    
    style Azure_Cloud fill:#e1f5fe,stroke:#0277bd
    style Network fill:#e8f5e9,stroke:#2e7d32
    style Security fill:#ffebee,stroke:#c62828
    style Monitoring fill:#fff3e0,stroke:#ff6f00
```

## Kubernetes Infrastructure

```mermaid
graph TB
    subgraph AKS_Cluster["AKS Cluster"]
        subgraph System_Node_Pool["System Node Pool"]
            direction LR
            SysNode1[System Node 1]
            SysNode2[System Node 2]
        end
        
        subgraph App_Node_Pool["Application Node Pool"]
            AppNode1[App Node 1]
            AppNode2[App Node 2]
            AppNode3[App Node 3]
        end
        
        subgraph Services["K8s Services"]
            ApiGW[API Gateway]
            Identity[Identity Service]
            Transaction[Transaction Service]
            Wallet[Wallet Service]
        end
        
        subgraph Config["Configuration"]
            Secrets[Secrets Store CSI]
            ConfigMaps[Config Maps]
        end
    end
    
    subgraph Storage["Persistent Storage"]
        AzureFiles[Azure Files]
        AzureDisks[Azure Managed Disks]
    end
    
    Services --> Config
    Services --> Storage
    
    style AKS_Cluster fill:#e1f5fe,stroke:#0277bd
    style System_Node_Pool fill:#e8f5e9,stroke:#2e7d32
    style App_Node_Pool fill:#fff3e0,stroke:#ff6f00
    style Storage fill:#f3e5f5,stroke:#7b1fa2
```

## Network Architecture

```mermaid
graph TB
    subgraph Internet_Zone["Internet Zone"]
        CDN[Azure CDN]
        FrontDoor[Azure Front Door]
    end
    
    subgraph DMZ["DMZ"]
        WAF[Web Application Firewall]
        ALB[Application Gateway]
        Bastion[Bastion Host]
    end
    
    subgraph App_Zone["Application Zone"]
        AKS[AKS Cluster]
        AppService[App Services]
        APIM[API Management]
    end
    
    subgraph Data_Zone["Data Zone"]
        Database[Azure Database]
        Cache[Azure Cache]
        Storage[Azure Storage]
    end
    
    Internet((Internet)) --> CDN
    CDN --> FrontDoor
    FrontDoor --> WAF
    WAF --> ALB
    
    ALB --> AKS
    ALB --> AppService
    ALB --> APIM
    
    AKS --> Database
    AppService --> Database
    APIM --> Database
    
    AKS --> Cache
    AppService --> Cache
    
    style Internet_Zone fill:#bbdefb,stroke:#1976d2
    style DMZ fill:#ffcdd2,stroke:#c62828
    style App_Zone fill:#c8e6c9,stroke:#388e3c
    style Data_Zone fill:#f8bbd0,stroke:#c2185b
```

## Disaster Recovery Setup

```mermaid
graph TB
    subgraph Primary_Region["Primary Region (East US)"]
        PrimaryApp[Primary Apps]
        PrimaryDB[(Primary Database)]
        PrimaryStorage[Primary Storage]
    end
    
    subgraph Secondary_Region["Secondary Region (West US)"]
        SecondaryApp[Secondary Apps]
        SecondaryDB[(Secondary Database)]
        SecondaryStorage[Secondary Storage]
    end
    
    subgraph Global["Global Services"]
        TrafficManager[Traffic Manager]
        FrontDoor[Front Door]
        CDN[CDN]
    end
    
    TrafficManager --> PrimaryApp
    TrafficManager --> SecondaryApp
    
    PrimaryDB -- Sync --> SecondaryDB
    PrimaryStorage -- Replication --> SecondaryStorage
    
    style Primary_Region fill:#c8e6c9,stroke:#388e3c
    style Secondary_Region fill:#fff9c4,stroke:#fbc02d
    style Global fill:#bbdefb,stroke:#1976d2
```

## Security Infrastructure

```mermaid
graph TB
    subgraph External["External Access"]
        Internet((Internet))
        VPN[VPN Gateway]
        ExpressRoute[Express Route]
    end
    
    subgraph Security_Layer["Security Layer"]
        WAF[Web Application Firewall]
        NSG[Network Security Groups]
        Firewall[Azure Firewall]
    end
    
    subgraph Identity_Security["Identity & Access"]
        AAD[Azure AD]
        KeyVault[Key Vault]
        MFA[Multi-Factor Auth]
    end
    
    subgraph Compliance["Security Compliance"]
        Policy[Azure Policy]
        Sentinel[Azure Sentinel]
        Security[Security Center]
    end
    
    Internet --> WAF
    VPN --> Firewall
    ExpressRoute --> Firewall
    
    WAF --> NSG
    Firewall --> NSG
    
    NSG --> AAD
    AAD --> KeyVault
    AAD --> MFA
    
    KeyVault --> Policy
    Policy --> Sentinel
    Sentinel --> Security
    
    style External fill:#bbdefb,stroke:#1976d2
    style Security_Layer fill:#ffcdd2,stroke:#c62828
    style Identity_Security fill:#fff9c4,stroke:#fbc02d
    style Compliance fill:#d1c4e9,stroke:#4527a0
```

## Monitoring Infrastructure

```mermaid
graph TB
    subgraph Data_Collection["Data Collection"]
        AppInsights[Application Insights]
        LogAnalytics[Log Analytics]
        VMInsights[VM Insights]
    end
    
    subgraph Processing["Data Processing"]
        Monitor[Azure Monitor]
        Metrics[Metrics Store]
        Logs[Log Store]
    end
    
    subgraph Visualization["Visualization"]
        Dashboard[Azure Dashboard]
        Grafana[Grafana]
        PowerBI[Power BI]
    end
    
    subgraph Alerting["Alerting & Response"]
        AlertRules[Alert Rules]
        ActionGroups[Action Groups]
        AutoResponse[Automated Response]
    end
    
    AppInsights --> Monitor
    LogAnalytics --> Monitor
    VMInsights --> Monitor
    
    Monitor --> Metrics
    Monitor --> Logs
    
    Metrics --> Dashboard
    Logs --> Grafana
    Metrics --> PowerBI
    
    Monitor --> AlertRules
    AlertRules --> ActionGroups
    ActionGroups --> AutoResponse
    
    style Data_Collection fill:#c8e6c9,stroke:#388e3c
    style Processing fill:#bbdefb,stroke:#1976d2
    style Visualization fill:#fff9c4,stroke:#fbc02d
    style Alerting fill:#ffcdd2,stroke:#c62828
```

## CI/CD Infrastructure

```mermaid
graph TB
    subgraph Source["Source Control"]
        GitHub[GitHub]
        GitLab[GitLab]
    end
    
    subgraph Build["Build Pipeline"]
        Actions[GitHub Actions]
        ACR[Azure Container Registry]
        Artifacts[Azure Artifacts]
    end
    
    subgraph Deploy["Deployment"]
        AKS[AKS]
        AppService[App Service]
        Functions[Azure Functions]
    end
    
    subgraph Validation["Testing & Validation"]
        Tests[Automated Tests]
        Security[Security Scan]
        Quality[Code Quality]
    end
    
    GitHub --> Actions
    GitLab --> Actions
    
    Actions --> Tests
    Actions --> Security
    Actions --> Quality
    
    Actions --> ACR
    Actions --> Artifacts
    
    ACR --> AKS
    Artifacts --> AppService
    Artifacts --> Functions
    
    style Source fill:#c8e6c9,stroke:#388e3c
    style Build fill:#bbdefb,stroke:#1976d2
    style Deploy fill:#fff9c4,stroke:#fbc02d
    style Validation fill:#ffcdd2,stroke:#c62828
```