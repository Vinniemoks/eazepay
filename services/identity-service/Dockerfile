FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Configure npm for more reliable installs and install dependencies
# Use --build-from-source for bcrypt to avoid pre-built binary issues
RUN npm config set fetch-retries 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set maxsockets 1 \
    && npm install --legacy-peer-deps --build-from-source=bcrypt || \
       (echo "First install attempt failed, retrying..." && npm install --legacy-peer-deps)

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Note: Keeping all dependencies to avoid runtime issues
# RUN npm prune --production --legacy-peer-deps

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
