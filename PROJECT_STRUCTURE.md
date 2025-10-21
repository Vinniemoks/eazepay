# AfriPay Project Structure

## Complete Directory Layout

```
afripay-universal/
├── services/                          # All microservices
│   ├── customer-portal/              # ✨ NEW: Customer-facing React app
│   │   ├── src/
│   │   │   ├── components/           # React components
│   │   │   ├── pages/                # Dashboard, Wallet, Transactions, Profile
│   │   │   ├── store/                # Zustand state management
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── vite.config.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── agent-portal/                 # ✨ NEW: Agent-facing React app
│   │   ├── src/
│   │   │   ├── components/           # React components
│   │   │   ├── pages/                # Dashboard, Transactions, Customers
│   │   │   ├── store/                # Zustand state management
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   ├── vite.config.js
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── web-portal/                   # Admin portal (existing)
│   ├── identity-service/             # Node.js/TypeScript
│   ├── biometric-service/            # Python/FastAPI
│   ├── transaction-service/          # Java/Spring Boot
│   ├── wallet-service/               # Go
│   ├── ussd-service/                 # Node.js
│   └── agent-service/                # Node.js/TypeScript
│
├── infrastructure/                    # ✨ NEW: Cloud infrastructure
│   ├── terraform/
│   │   ├── aws/                      # AWS Terraform configs
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── modules/
│   │   │       ├── vpc/
│   │   │       ├── ecs/
│   │   │       ├── rds/
│   │   │       ├── elasticache/
│   │   │       ├── alb/
│   │   │       └── cloudfront/
│   │   │
│   │   └── gcp/                      # GCP Terraform configs
│   │       ├── main.tf
│   │       └── variables.tf
│   │
│   ├── kubernetes/                   # ✨ NEW: K8s manifests
│   │   ├── namespace.yaml
│   │   ├── customer-portal-deployment.yaml
│   │   ├── agent-portal-deployment.yaml
│   │   └── ingress.yaml
│   │
│   └── docker/                       # Docker configs (existing)
│       ├── nginx/
│       ├── postgres/
│       ├── mongodb/
│       ├── rabbitmq/
│       ├── prometheus/
│       └── grafana/
│
├── .github/                          # ✨ NEW: CI/CD pipelines
│   └── workflows/
│       ├── deploy-aws.yml            # AWS deployment automation
│       └── deploy-gcp.yml            # GCP deployment automation
│
├── scripts/                          # Deployment scripts
│   ├── deploy-local.sh               # ✨ NEW: Local deployment
│   ├── deploy-aws.sh                 # ✨ NEW: AWS deployment
│   ├── deploy-gcp.sh                 # ✨ NEW: GCP deployment
│   ├── docker-compose-up-retry.sh
│   ├── setup/
│   └── testing/
│
├── docs/                             # Documentation
│   ├── CLOUD_DEPLOYMENT_OVERVIEW.md  # ✨ NEW: Cloud overview
│   ├── deployment/
│   │   ├── AWS_DEPLOYMENT.md         # ✨ NEW: AWS guide
│   │   └── GCP_DEPLOYMENT.md         # ✨ NEW: GCP guide
│   ├── api/
│   └── architecture/
│
├── docker-compose.yml                # ✅ UPDATED: Added new portals
├── README.md                         # ✅ UPDATED: Cloud-ready info
├── GETTING_STARTED.md                # ✨ NEW: Quick start guide
├── DEPLOYMENT_GUIDE.md               # ✨ NEW: Deployment guide
├── CLOUD_READY_SUMMARY.md            # ✨ NEW: Summary of changes
└── PROJECT_STRUCTURE.md              # ✨ NEW: This file

```

## Key Files by Purpose

### Customer Interaction (Frontend)

**Customer Portal:**
- `services/customer-portal/src/pages/Login.jsx` - User authentication
- `services/customer-portal/src/pages/Dashboard.jsx` - User dashboard
- `services/customer-portal/src/pages/Wallet.jsx` - Wallet management
- `services/customer-portal/src/pages/Transactions.jsx` - Transaction history
- `services/customer-portal/src/pages/Profile.jsx` - User profile

**Agent Portal:**
- `services/agent-portal/src/pages/Login.jsx` - Agent authentication
- `services/agent-portal/src/pages/Dashboard.jsx` - Agent dashboard with analytics
- `services/agent-portal/src/pages/Transactions.jsx` - Agent transactions
- `services/agent-portal/src/pages/Customers.jsx` - Customer management

### Cloud Deployment

**AWS:**
- `infrastructure/terraform/aws/main.tf` - Main AWS infrastructure
- `scripts/deploy-aws.sh` - AWS deployment script
- `.github/workflows/deploy-aws.yml` - AWS CI/CD pipeline
- `docs/deployment/AWS_DEPLOYMENT.md` - AWS deployment guide

**GCP:**
- `infrastructure/terraform/gcp/main.tf` - Main GCP infrastructure
- `infrastructure/kubernetes/*.yaml` - Kubernetes manifests
- `scripts/deploy-gcp.sh` - GCP deployment script
- `.github/workflows/deploy-gcp.yml` - GCP CI/CD pipeline
- `docs/deployment/GCP_DEPLOYMENT.md` - GCP deployment guide

### Configuration

**Environment Files:**
- `services/customer-portal/.env` - Customer portal config
- `services/agent-portal/.env` - Agent portal config
- `services/*/. env` - Service-specific configs

**Docker:**
- `docker-compose.yml` - Local development orchestration
- `services/*/Dockerfile` - Service containerization

**Terraform:**
- `infrastructure/terraform/aws/variables.tf` - AWS variables
- `infrastructure/terraform/gcp/variables.tf` - GCP variables

## Port Mapping

| Service | Port | Purpose |
|---------|------|---------|
| Customer Portal | 3001 | Customer web interface |
| Agent Portal | 3002 | Agent web interface |
| Admin Portal | 8080 | Admin web interface |
| API Gateway | 80/443 | Main API entry point |
| Identity Service | 8000 | Authentication |
| Biometric Service | 8001 | Biometric auth |
| Transaction Service | 8002 | Payments |
| Wallet Service | 8003 | Wallet management |
| USSD Service | 8004 | USSD gateway |
| Agent Service | 8005 | Agent operations |
| PostgreSQL | 5433 | Primary database |
| Redis | 6379 | Cache |
| MongoDB | 27017 | Document store |
| RabbitMQ | 5673 | Message queue |
| RabbitMQ UI | 15673 | Management UI |
| Grafana | 3000 | Monitoring |
| Prometheus | 9090 | Metrics |

## Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts (Agent Portal)

### Backend
- **Identity Service**: Node.js + TypeScript + Express
- **Biometric Service**: Python + FastAPI
- **Transaction Service**: Java + Spring Boot
- **Wallet Service**: Go
- **USSD Service**: Node.js + Express
- **Agent Service**: Node.js + TypeScript + Express

### Infrastructure
- **Containers**: Docker
- **Orchestration**: Docker Compose (local), ECS (AWS), GKE (GCP)
- **Databases**: PostgreSQL, MongoDB
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **API Gateway**: Nginx
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

### Cloud
- **IaC**: Terraform
- **CI/CD**: GitHub Actions
- **AWS**: ECS, RDS, ElastiCache, ALB, CloudFront
- **GCP**: GKE, Cloud SQL, Memorystore, Load Balancing, CDN

## What's New (Cloud-Ready Features)

✨ **Customer Portal** - Complete React app for end users
✨ **Agent Portal** - Complete React app for agents
✨ **AWS Infrastructure** - Terraform configs for AWS deployment
✨ **GCP Infrastructure** - Terraform + Kubernetes for GCP
✨ **CI/CD Pipelines** - Automated deployment workflows
✨ **Deployment Scripts** - One-command deployment
✨ **Cloud Documentation** - Comprehensive deployment guides
✨ **Kubernetes Manifests** - Production-ready K8s configs

## Next Steps

1. Review `GETTING_STARTED.md` for deployment instructions
2. Test locally with `bash scripts/deploy-local.sh`
3. Choose your cloud provider (AWS or GCP)
4. Follow the respective deployment guide
5. Configure DNS and SSL
6. Set up monitoring and alerts
7. Go live! 🚀
