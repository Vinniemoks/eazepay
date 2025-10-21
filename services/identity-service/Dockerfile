FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Configure npm for more reliable installs and install dependencies
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and keep only production dependencies
RUN npm prune --production

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
