FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

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