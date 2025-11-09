Eazepay Universal - Deployment Guide
Prerequisites

Docker Desktop installed
Node.js 18+ installed
Python 3.11+ installed
Java 17+ installed
Go 1.21+ installed
Git installed

Development Setup
1. Clone Repository
bashgit clone https://github.com/YOUR_USERNAME/eazepay-universal.git
cd eazepay-universal
2. Run Setup Script
bash./scripts/setup/dev-setup.sh
3. Start Services
bash# Start infrastructure services
docker-compose up -d postgresql redis mongodb rabbitmq

# Start Identity Service
cd services/identity-service
npm install
npm run dev

# Start Biometric Service (new terminal)
cd services/biometric-service
pip install -r requirements.txt
python main.py
4. Verify Services
bash# Test endpoints
curl http://localhost:8000/health  # Identity Service
curl http://localhost:8001/health  # Biometric Service

# Run integration tests
./scripts/testing/integration-test.sh