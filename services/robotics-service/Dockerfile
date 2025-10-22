FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8040

# Start the service
CMD ["npm", "start"]
