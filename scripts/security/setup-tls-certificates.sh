#!/bin/bash

# ================================
# TLS Certificate Setup Script
# ================================
# Sets up TLS certificates for Eazepay services

set -e

echo "🔒 Setting up TLS certificates for Eazepay..."
echo ""

# Configuration
CERT_DIR=${CERT_DIR:-"./infrastructure/ssl"}
DOMAIN=${DOMAIN:-"eazepay.local"}
DAYS_VALID=${DAYS_VALID:-"365"}
KEY_SIZE=${KEY_SIZE:-"4096"}

# Create certificate directory
mkdir -p "$CERT_DIR"
cd "$CERT_DIR"

echo "Certificate directory: $CERT_DIR"
echo "Domain: $DOMAIN"
echo ""

# Generate CA private key
echo "📝 Generating CA private key..."
openssl genrsa -out ca-key.pem $KEY_SIZE

# Generate CA certificate
echo "📝 Generating CA certificate..."
openssl req -new -x509 -days $DAYS_VALID -key ca-key.pem -sha256 -out ca-cert.pem \
  -subj "/C=US/ST=State/L=City/O=Eazepay/OU=IT/CN=Eazepay CA"

echo "✅ CA certificate generated"
echo ""

# Generate server private key
echo "📝 Generating server private key..."
openssl genrsa -out server-key.pem $KEY_SIZE

# Generate server CSR
echo "📝 Generating server certificate signing request..."
openssl req -new -key server-key.pem -out server.csr \
  -subj "/C=US/ST=State/L=City/O=Eazepay/OU=IT/CN=$DOMAIN"

# Create extensions file
cat > server-ext.cnf <<EOF
subjectAltName = DNS:$DOMAIN,DNS:*.$DOMAIN,DNS:localhost,IP:127.0.0.1
extendedKeyUsage = serverAuth
EOF

# Sign server certificate
echo "📝 Signing server certificate..."
openssl x509 -req -days $DAYS_VALID -sha256 \
  -in server.csr \
  -CA ca-cert.pem \
  -CAkey ca-key.pem \
  -CAcreateserial \
  -out server-cert.pem \
  -extfile server-ext.cnf

echo "✅ Server certificate generated"
echo ""

# Generate client certificates (for mTLS)
echo "📝 Generating client certificates for mTLS..."

for service in identity-service transaction-service wallet-service payment-orchestrator; do
  echo "  Generating certificate for: $service"
  
  # Generate client private key
  openssl genrsa -out "${service}-key.pem" 2048
  
  # Generate client CSR
  openssl req -new -key "${service}-key.pem" -out "${service}.csr" \
    -subj "/C=US/ST=State/L=City/O=Eazepay/OU=Services/CN=${service}"
  
  # Sign client certificate
  openssl x509 -req -days $DAYS_VALID -sha256 \
    -in "${service}.csr" \
    -CA ca-cert.pem \
    -CAkey ca-key.pem \
    -CAcreateserial \
    -out "${service}-cert.pem" \
    -extfile <(echo "extendedKeyUsage = clientAuth")
  
  # Clean up CSR
  rm "${service}.csr"
done

echo "✅ Client certificates generated"
echo ""

# Set proper permissions
echo "🔒 Setting secure permissions..."
chmod 600 *-key.pem
chmod 644 *-cert.pem ca-cert.pem

echo "✅ Permissions set"
echo ""

# Verify certificates
echo "🔍 Verifying certificates..."
openssl verify -CAfile ca-cert.pem server-cert.pem

echo ""
echo "✅ TLS certificate setup complete!"
echo ""
echo "Certificate files:"
echo "  CA Certificate: $CERT_DIR/ca-cert.pem"
echo "  Server Certificate: $CERT_DIR/server-cert.pem"
echo "  Server Key: $CERT_DIR/server-key.pem"
echo ""
echo "Client certificates (for mTLS):"
for service in identity-service transaction-service wallet-service payment-orchestrator; do
  echo "  ${service}: $CERT_DIR/${service}-cert.pem"
done
echo ""
echo "⚠️  For production, use certificates from a trusted CA (Let's Encrypt, DigiCert, etc.)"
echo ""

# Generate Docker Compose volume mounts
cat > docker-compose-tls.yml <<EOF
# Add these volume mounts to your services in docker-compose.yml
volumes:
  - ./infrastructure/ssl/ca-cert.pem:/etc/ssl/certs/ca-cert.pem:ro
  - ./infrastructure/ssl/server-cert.pem:/etc/ssl/certs/server-cert.pem:ro
  - ./infrastructure/ssl/server-key.pem:/etc/ssl/private/server-key.pem:ro
EOF

echo "📝 Docker Compose TLS configuration saved to: docker-compose-tls.yml"
echo ""
