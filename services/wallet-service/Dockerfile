# Stage 1: Build
FROM public.ecr.aws/docker/library/golang:1.19-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o wallet-service .

# Collect optional environment files for the runtime image
RUN mkdir -p /tmp/envfiles \
    && for file in .env .env.local; do \
        if [ -f "$file" ]; then cp "$file" /tmp/envfiles/; fi; \
    done

# Stage 2: Runtime
FROM public.ecr.aws/docker/library/alpine:3.19

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Create non-root user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=appuser:appuser /app/wallet-service .

# Copy optional environment files from the builder stage
COPY --from=builder --chown=appuser:appuser /tmp/envfiles/ ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8003

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8003/health || exit 1

# Run the application
CMD ["./wallet-service"]