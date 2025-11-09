#!/bin/bash

# Eazepay Universal - Configuration Directory Creation Script
# This script creates all the necessary directories for configuration files

echo "🏗️  Creating Eazepay Universal configuration directories..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create directory and show status
create_dir() {
    local dir_path=$1
    if mkdir -p "$dir_path"; then
        echo -e "${GREEN}✅ Created: $dir_path${NC}"
    else
        echo -e "${RED}❌ Failed to create: $dir_path${NC}"
    fi
}

# Main infrastructure directories
echo -e "${YELLOW}Creating infrastructure directories...${NC}"
create_dir "infrastructure/docker/postgres"
create_dir "infrastructure/docker/nginx/conf.d"
create_dir "infrastructure/docker/nginx/ssl"
create_dir "infrastructure/docker/prometheus"
create_dir "infrastructure/docker/rabbitmq"
create_dir "infrastructure/docker/mongodb"
create_dir "infrastructure/docker/grafana/provisioning/datasources"
create_dir "infrastructure/docker/grafana/provisioning/dashboards"
create_dir "infrastructure/docker/grafana/provisioning/notifiers"
create_dir "infrastructure/docker/grafana/dashboards/system"
create_dir "infrastructure/docker/grafana/dashboards/application"
create_dir "infrastructure/docker/grafana/dashboards/business"
create_dir "infrastructure/docker/grafana/dashboards/security"

# Kubernetes configuration directories
echo -e "${YELLOW}Creating Kubernetes directories...${NC}"
create_dir "infrastructure/kubernetes/namespaces"
create_dir "infrastructure/kubernetes/configmaps"
create_dir "infrastructure/kubernetes/secrets"
create_dir "infrastructure/kubernetes/services"
create_dir "infrastructure/kubernetes/deployments"
create_dir "infrastructure/kubernetes/ingress"

# Terraform directories
echo -e "${YELLOW}Creating Terraform directories...${NC}"
create_dir "infrastructure/terraform/environments/development"
create_dir "infrastructure/terraform/environments/staging"
create_dir "infrastructure/terraform/environments/production"
create_dir "infrastructure/terraform/modules/database"
create_dir "infrastructure/terraform/modules/networking"
create_dir "infrastructure/terraform/modules/compute"
create_dir "infrastructure/terraform/modules/monitoring"

# Service directories (if not already created)
echo -e "${YELLOW}Creating service directories...${NC}"
create_dir "services/identity-service/src/config"
create_dir "services/identity-service/src/controllers"
create_dir "services/identity-service/src/entities"
create_dir "services/identity-service/src/services"
create_dir "services/identity-service/src/middleware"
create_dir "services/identity-service/src/routes"
create_dir "services/identity-service/src/utils"
create_dir "services/identity-service/src/types"
create_dir "services/identity-service/src/validators"
create_dir "services/identity-service/src/repositories"

create_dir "services/biometric-service/app/services"
create_dir "services/biometric-service/app/models"
create_dir "services/biometric-service/app/utils"

create_dir "services/transaction-service/src/main/java/com/eazepay/transaction"
create_dir "services/transaction-service/src/main/resources"
create_dir "services/transaction-service/src/test/java/com/eazepay/transaction"

create_dir "services/wallet-service/cmd"
create_dir "services/wallet-service/internal"
create_dir "services/wallet-service/pkg"

create_dir "services/ussd-gateway/src"
create_dir "services/agent-service/src"

# Mobile app directories
echo -e "${YELLOW}Creating mobile app directories...${NC}"
create_dir "mobile-app/android/app/src/main/java/com/eazepay"
create_dir "mobile-app/ios/Eazepay"
create_dir "mobile-app/src/components"
create_dir "mobile-app/src/screens"
create_dir "mobile-app/src/services"
create_dir "mobile-app/src/utils"
create_dir "mobile-app/src/assets"

# Hardware directories
echo -e "${YELLOW}Creating hardware directories...${NC}"
create_dir "hardware/terminal-software/src"
create_dir "hardware/schematics"
create_dir "hardware/firmware"
create_dir "hardware/3d-models"

# Documentation directories
echo -e "${YELLOW}Creating documentation directories...${NC}"
create_dir "docs/api/services"
create_dir "docs/architecture/diagrams"
create_dir "docs/deployment/environments"
create_dir "docs/user-guides"
create_dir "docs/developer-guides"

# Testing directories
echo -e "${YELLOW}Creating testing directories...${NC}"
create_dir "tests/unit/identity-service"
create_dir "tests/unit/biometric-service"
create_dir "tests/unit/transaction-service"
create_dir "tests/unit/wallet-service"
create_dir "tests/integration"
create_dir "tests/e2e"
create_dir "tests/performance"
create_dir "tests/security"

# Scripts directories
echo -e "${YELLOW}Creating scripts directories...${NC}"
create_dir "scripts/setup"
create_dir "scripts/deployment"
create_dir "scripts/testing"
create_dir "scripts/maintenance"
create_dir "scripts/monitoring"

# Logs and data directories (for development)
echo -e "${YELLOW}Creating development directories...${NC}"
create_dir "data/postgres"
create_dir "data/redis"
create_dir "data/mongodb"
create_dir "data/rabbitmq"
create_dir "logs/services"
create_dir "logs/nginx"
create_dir "backups"

echo ""
echo -e "${GREEN}🎉 All directories created successfully!${NC}"
echo ""
echo "📂 Directory structure overview:"
echo "├── infrastructure/docker/        # Docker configuration files"
echo "├── infrastructure/kubernetes/    # Kubernetes manifests"
echo "├── infrastructure/terraform/     # Infrastructure as code"
echo "├── services/                     # Microservices source code"
echo "├── mobile-app/                   # React Native mobile app"
echo "├── hardware/                     # Agent terminal hardware"
echo "├── docs/                         # Documentation"
echo "├── tests/                        # Test files"
echo "├── scripts/                      # Utility scripts"
echo "├── data/                         # Development data"
echo "└── logs/                         # Development logs"
echo ""
echo "📋 Next steps:"
echo "1. Copy the configuration files to their respective directories"
echo "2. Run: chmod +x scripts/setup/dev-setup.sh"
echo "3. Run: ./scripts/setup/dev-setup.sh"
echo "4. Run: docker-compose up -d"